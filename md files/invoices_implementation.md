# Internal Invoices Implementation (Supabase + Local UI)

This document contains schema SQL, service/API code, React UI, feature flags, and tests to implement internal invoicing with no external integrations.

---

## 1) Database schema additions (SQL to run in Supabase)

```sql
-- 1.1 Invoice status enum (use TEXT if enum creation is restricted)
DO $$ BEGIN
  CREATE TYPE invoice_status AS ENUM ('DRAFT','SENT','PAID','VOID');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 1.2 invoices
CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  customer_id uuid NULL,
  work_order_id uuid NULL,
  invoice_number text NOT NULL,
  status invoice_status NOT NULL DEFAULT 'DRAFT',
  issued_at timestamptz NULL,
  due_at timestamptz NULL,
  notes text NULL,
  subtotal numeric(12,2) NOT NULL DEFAULT 0,
  tax_rate numeric(5,2) NOT NULL DEFAULT 0,
  tax_amount numeric(12,2) NOT NULL DEFAULT 0,
  total_amount numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT invoices_company_fk FOREIGN KEY (company_id) REFERENCES public.companies (id) ON DELETE CASCADE,
  CONSTRAINT invoices_customer_fk FOREIGN KEY (customer_id) REFERENCES public.customers (id) ON DELETE SET NULL,
  CONSTRAINT invoices_work_order_fk FOREIGN KEY (work_order_id) REFERENCES public.work_orders (id) ON DELETE SET NULL
);

-- unique per company
CREATE UNIQUE INDEX IF NOT EXISTS invoices_company_number_uidx
  ON public.invoices (company_id, invoice_number);

CREATE INDEX IF NOT EXISTS invoices_company_status_idx
  ON public.invoices (company_id, status);

-- 1.3 invoice_items
CREATE TABLE IF NOT EXISTS public.invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  invoice_id uuid NOT NULL,
  item_name text NOT NULL,
  description text NULL,
  quantity numeric(12,2) NOT NULL DEFAULT 1,
  unit_price numeric(12,2) NOT NULL DEFAULT 0,
  total numeric(12,2) NOT NULL DEFAULT 0,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT invoice_items_company_fk FOREIGN KEY (company_id) REFERENCES public.companies (id) ON DELETE CASCADE,
  CONSTRAINT invoice_items_invoice_fk FOREIGN KEY (invoice_id) REFERENCES public.invoices (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS invoice_items_company_invoice_idx
  ON public.invoice_items (company_id, invoice_id);

-- 1.4 updated_at trigger (optional)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS t_upd_invoices ON public.invoices;
CREATE TRIGGER t_upd_invoices BEFORE UPDATE ON public.invoices
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS t_upd_invoice_items ON public.invoice_items;
CREATE TRIGGER t_upd_invoice_items BEFORE UPDATE ON public.invoice_items
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
```

---

## 2) Service/API code (Supabase REST via supaFetch)

Create/replace file: src/services/InvoicesService.js

```javascript
// src/services/InvoicesService.js
import { supaFetch } from '../utils/supaFetch';

export function generateInvoiceNumber() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  const t = String(d.getTime()).slice(-5);
  return `INV-${y}${m}${day}-${t}`; // time tail reduces collision risk
}

export function computeInvoiceTotals(items = [], taxRate = 0) {
  const subtotal = items.reduce((s, it) => s + Number(it.total ?? (Number(it.unit_price||0)*Number(it.quantity||0))), 0);
  const tax_amount = +(subtotal * (Number(taxRate)/100)).toFixed(2);
  const total = +(subtotal + tax_amount).toFixed(2);
  return { subtotal, tax_amount, total };
}

export const INVOICE_STATUS = { DRAFT:'DRAFT', SENT:'SENT', PAID:'PAID', VOID:'VOID' };
export const ALLOWED_TRANSITIONS = {
  DRAFT: ['SENT','VOID'],
  SENT: ['PAID','VOID'],
  PAID: [],
  VOID: []
};
export function canTransition(from, to){ return (ALLOWED_TRANSITIONS[from]||[]).includes(to); }

async function upsertItems(companyId, invoiceId, items){
  if (!Array.isArray(items) || items.length === 0) return;
  const payload = items.map((it, idx) => ({
    company_id: companyId,
    invoice_id: invoiceId,
    item_name: it.item_name || it.name || 'Item',
    description: it.description || '',
    quantity: Number(it.quantity||1),
    unit_price: Number(it.unit_price||it.rate||0),
    total: Number(it.total ?? (Number(it.unit_price||it.rate||0)*Number(it.quantity||1))),
    position: Number(it.position ?? idx)
  }));
  await supaFetch('invoice_items', { method:'POST', body: payload }, companyId);
}

export const InvoicesService = {
  async list(companyId, { status } = {}){
    let q = 'invoices?select=*,customers(name),work_orders(title)&order=created_at.desc';
    if (status) q += `&status=eq.${status}`;
    const res = await supaFetch(q, { method:'GET' }, companyId);
    const data = res.ok ? await res.json() : [];
    return data;
  },

  async get(companyId, invoiceId){
    const invRes = await supaFetch(`invoices?id=eq.${invoiceId}&select=*`, { method:'GET' }, companyId);
    const [invoice] = invRes.ok ? await invRes.json() : [];
    if (!invoice) return null;
    const itemsRes = await supaFetch(`invoice_items?invoice_id=eq.${invoiceId}&order=position.asc`, { method:'GET' }, companyId);
    const items = itemsRes.ok ? await itemsRes.json() : [];
    return { invoice, items };
  },

  async create(companyId, data){
    const number = data.invoice_number || generateInvoiceNumber();
    const items = data.items || [];
    const { subtotal, tax_amount, total } = computeInvoiceTotals(items, data.tax_rate||0);
    const body = {
      company_id: companyId,
      customer_id: data.customer_id || null,
      work_order_id: data.work_order_id || null,
      invoice_number: number,
      status: data.status || INVOICE_STATUS.DRAFT,
      issued_at: data.issued_at || new Date().toISOString(),
      due_at: data.due_at || null,
      notes: data.notes || '',
      subtotal, tax_rate: Number(data.tax_rate||0), tax_amount, total_amount: total
    };
    const res = await supaFetch('invoices', { method:'POST', body, headers:{ Prefer:'return=representation' } }, companyId);
    if (!res.ok) throw new Error('Failed to create invoice');
    const [created] = await res.json();
    await upsertItems(companyId, created.id, items);
    return created;
  },

  async update(companyId, invoiceId, patch){
    if (patch.items) {
      // replace items: delete then recreate
      await supaFetch(`invoice_items?invoice_id=eq.${invoiceId}`, { method:'DELETE' }, companyId);
      const totals = computeInvoiceTotals(patch.items, patch.tax_rate ?? patch.taxRate ?? 0);
      patch.subtotal = totals.subtotal; patch.tax_amount = totals.tax_amount; patch.total_amount = totals.total;
    }
    const res = await supaFetch(`invoices?id=eq.${invoiceId}`, { method:'PATCH', body: patch, headers:{ Prefer:'return=representation' } }, companyId);
    if (!res.ok) throw new Error('Failed to update invoice');
    const [updated] = await res.json();
    if (patch.items) await upsertItems(companyId, invoiceId, patch.items);
    return updated;
  },

  async setStatus(companyId, invoiceId, nextStatus){
    const current = await this.get(companyId, invoiceId);
    if (!current) throw new Error('Invoice not found');
    if (!canTransition(current.invoice.status, nextStatus)) throw new Error('Invalid status transition');
    return this.update(companyId, invoiceId, { status: nextStatus });
  },

  async createFromWorkOrder(companyId, workOrderId){
    // fetch work order and items
    const woRes = await supaFetch(`work_orders?id=eq.${workOrderId}&select=id,customer_id,total_amount,tax_rate`, { method:'GET' }, companyId);
    const [wo] = woRes.ok ? await woRes.json() : [];
    if (!wo) throw new Error('Work order not found');
    const itemsRes = await supaFetch(`work_order_items?work_order_id=eq.${workOrderId}&order=created_at.asc`, { method:'GET' }, companyId);
    const items = (itemsRes.ok ? await itemsRes.json() : []).map((it, idx) => ({
      item_name: it.item_name || 'Line Item', description: it.description || '',
      quantity: Number(it.quantity||1), unit_price: Number(it.rate||0), position: idx
    }));
    return this.create(companyId, { customer_id: wo.customer_id, work_order_id: wo.id, tax_rate: wo.tax_rate || 0, items });
  },

  exportHtml(invoice, items){
    const styles = `body{font-family:system-ui,Segoe UI,Arial;margin:24px;} .row{display:flex;justify-content:space-between}
      table{width:100%;border-collapse:collapse;margin-top:16px} th,td{border:1px solid #e5e7eb;padding:8px;font-size:12px}
      .right{text-align:right}.muted{color:#6b7280}`;
    const rows = items.map(it => `<tr><td>${it.item_name}</td><td>${it.description||''}</td><td class="right">${Number(it.quantity).toFixed(2)}</td><td class="right">$${Number(it.unit_price).toFixed(2)}</td><td class="right">$${Number(it.total||it.unit_price*it.quantity).toFixed(2)}</td></tr>`).join('');
    return `<!doctype html><html><head><meta charset="utf-8"><title>${invoice.invoice_number}</title><style>${styles}</style></head><body>
      <div class="row"><h1>Invoice ${invoice.invoice_number}</h1><div class="muted">Status: ${invoice.status}</div></div>
      <div class="muted">Issued: ${invoice.issued_at ? new Date(invoice.issued_at).toLocaleDateString() : ''}</div>
      <table><thead><tr><th>Item</th><th>Description</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table>
      <div style="margin-top:16px" class="right">
        <div>Subtotal: $${Number(invoice.subtotal).toFixed(2)}</div>
        <div>Tax (${Number(invoice.tax_rate).toFixed(2)}%): $${Number(invoice.tax_amount).toFixed(2)}</div>
        <div><strong>Grand Total: $${Number(invoice.total_amount).toFixed(2)}</strong></div>
      </div>
      <script>window.onload=()=>window.print&&window.print();</script>
    </body></html>`;
  },

  async openPrintable(companyId, invoiceId){
    const data = await this.get(companyId, invoiceId);
    if (!data) throw new Error('Invoice not found');
    const html = this.exportHtml(data.invoice, data.items);
    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); }
  }
};
```

---

## 3) React components/pages

Create/replace: src/pages/Invoices.js (list + create from WO + open/mark status)

```javascript
// src/pages/Invoices.js
import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { InvoicesService, INVOICE_STATUS } from '../services/InvoicesService';
import { FEATURES } from '../utils/features';

export default function Invoices(){
  const { user } = useUser();
  const [invoices,setInvoices]=useState([]); const [loading,setLoading]=useState(true);
  useEffect(()=>{ if(!user?.company_id) return; (async()=>{
    setLoading(true); const data=await InvoicesService.list(user.company_id); setInvoices(data); setLoading(false);
  })(); },[user?.company_id]);

  if (!FEATURES.invoicing) return <div className="p-6 text-gray-600">Invoices disabled.</div>;
  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="card p-4">
      <h1 className="text-xl font-semibold mb-3">Invoices</h1>
      <table className="min-w-full border">
        <thead><tr className="bg-gray-50 text-sm">
          <th className="p-2 text-left">Number</th><th className="p-2 text-left">Status</th><th className="p-2 text-right">Total</th><th className="p-2">Actions</th>
        </tr></thead>
        <tbody>
          {invoices.map(inv=> (
            <tr key={inv.id} className="border-t text-sm">
              <td className="p-2">{inv.invoice_number}</td>
              <td className="p-2">{inv.status}</td>
              <td className="p-2 text-right">${Number(inv.total_amount).toFixed(2)}</td>
              <td className="p-2 space-x-2">
                <button className="btn-secondary" onClick={async()=>InvoicesService.openPrintable(user.company_id, inv.id)}>Print</button>
                {inv.status==='DRAFT' && (
                  <button className="btn-primary" onClick={async()=>{await InvoicesService.setStatus(user.company_id, inv.id, INVOICE_STATUS.SENT); setInvoices(await InvoicesService.list(user.company_id));}}>Send</button>
                )}
                {inv.status!=='PAID' && inv.status!=='VOID' && (
                  <button className="btn-primary" onClick={async()=>{await InvoicesService.setStatus(user.company_id, inv.id, INVOICE_STATUS.PAID); setInvoices(await InvoicesService.list(user.company_id));}}>Mark Paid</button>
                )}
                {inv.status!=='VOID' && (
                  <button className="btn-danger" onClick={async()=>{await InvoicesService.setStatus(user.company_id, inv.id, INVOICE_STATUS.VOID); setInvoices(await InvoicesService.list(user.company_id));}}>Void</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

Add minimal detail page (optional): src/pages/InvoiceDetail.js can reuse InvoicesService.get and show items; omitted for brevity.

Add button to Work Orders page to create from completed WOs (insert where Actions are rendered):

```javascript
// snippet for src/pages/WorkOrders.js inside Actions cell
{currentStatus==='COMPLETED' && (
  <button
    onClick={async()=>{
      const created = await InvoicesService.createFromWorkOrder(user.company_id, workOrder.id);
      window.location.href = '/invoices';
    }}
    className="text-purple-600 hover:text-purple-800"
  >Create Invoice</button>
)}
```

---

## 4) Feature flag (features.invoicing)

Create: src/utils/features.js

```javascript
// src/utils/features.js
const flag = (k, d=false) => (String(process.env[`REACT_APP_${k}`]||'').toLowerCase()==='true') || d;
export const FEATURES = {
  invoicing: flag('FEATURE_INVOICING', true), // enable by default for internal testing
  messaging: flag('FEATURE_MESSAGING', false),
  integrations: flag('FEATURE_INTEGRATIONS', false)
};
```

Usage: gate routes/pages (e.g., in App.js) — show Invoices route only if FEATURES.invoicing is true.

```javascript
// snippet in App.js
import { FEATURES } from './utils/features';
{FEATURES.invoicing && (<Route path="/invoices" element={<Invoices />} />)}
```

Env example:
```
REACT_APP_FEATURE_INVOICING=true
```

---

## 5) Tests (vitest/jest)

Create tests under src/__tests__/

```javascript
// src/__tests__/invoices.number.test.js
import { generateInvoiceNumber } from '../services/InvoicesService';

test('invoice number format', () => {
  const n = generateInvoiceNumber();
  expect(n).toMatch(/^INV-\d{8}-\d{5}$/);
});
```

```javascript
// src/__tests__/invoices.totals.test.js
import { computeInvoiceTotals } from '../services/InvoicesService';

test('compute totals with tax', () => {
  const items = [ { quantity:2, unit_price:100 }, { quantity:1, unit_price:50 } ];
  const res = computeInvoiceTotals(items, 10);
  expect(res.subtotal).toBe(250);
  expect(res.tax_amount).toBe(25);
  expect(res.total).toBe(275);
});
```

```javascript
// src/__tests__/invoices.status.test.js
import { canTransition } from '../services/InvoicesService';

test('valid transitions', () => {
  expect(canTransition('DRAFT','SENT')).toBe(true);
  expect(canTransition('SENT','PAID')).toBe(true);
  expect(canTransition('SENT','VOID')).toBe(true);
});

test('invalid transitions', () => {
  expect(canTransition('PAID','VOID')).toBe(false);
  expect(canTransition('VOID','PAID')).toBe(false);
  expect(canTransition('DRAFT','PAID')).toBe(false);
});
```

