// Printable HTML export for Purchase Orders (brand-aware)
import settingsService from './SettingsService';
import { supaFetch } from '../utils/supaFetch';

const PoPDFService = {
  async get(companyId, poId){
    const [poRes, itemsRes] = await Promise.all([
      supaFetch(`purchase_orders?id=eq.${poId}&select=*`, { method:'GET' }, companyId),
      supaFetch(`po_items?purchase_order_id=eq.${poId}&select=*`, { method:'GET' }, companyId)
    ]);
    if (!poRes.ok) throw new Error('PO not found');
    const [po] = await poRes.json();
    const items = itemsRes.ok ? await itemsRes.json() : [];
    return { po, items };
  },

  exportHtml(company, po, items){
    const currency = company?.currency || 'USD';
    const fmt = (n) => new Intl.NumberFormat('en-US', { style:'currency', currency }).format(Number(n||0));

    // Format company address similar to invoice system
    const formatCompanyAddress = (c = {}) => {
      const s = (c.street_address || '').trim();
      const city = (c.city || '').trim();
      const state = (c.state || '').trim();
      const zip = (c.postal_code || c.zip_code || '').trim();
      const lower = s.toLowerCase();
      const parts = [];
      if (s) parts.push(s);
      if (city && !lower.includes(city.toLowerCase())) parts.push(city);
      if (state && !lower.includes(state.toLowerCase())) parts.push(state);
      if (zip && !s.includes(zip)) parts.push(zip);
      return parts.filter(Boolean).join(', ');
    };

    const companyAddr = formatCompanyAddress(company);
    const companyName = company?.name || company?.company_name || 'Your Company';

    // Professional logo handling like invoice system
    const logoHtml = company?.company_logo_url || company?.logo_url
      ? `<img src="${company.company_logo_url || company.logo_url}" alt="Logo" style="height:120px;object-fit:contain;max-width:560px" />`
      : `<div style="font-size:20px;font-weight:700">${companyName}</div>`;

    // Enhanced item rows with better formatting
    const rows = items.length ? items.map(it => `
      <tr>
        <td>${it.item_sku || ''}</td>
        <td>${it.item_name || ''}</td>
        <td>${it.description || ''}</td>
        <td style="text-align:right">${Number(it.quantity||0).toFixed(2)}</td>
        <td style="text-align:right">${fmt(it.unit_cost)}</td>
        <td style="text-align:right">${fmt((it.quantity||0)*(it.unit_cost||0))}</td>
      </tr>`).join('') : `<tr><td colspan="6" style="text-align:center;color:#6b7280;padding:16px">No items</td></tr>`;

    // Status badge with better styling
    const getStatusBadge = (status) => {
      const statusColors = {
        'DRAFT': 'background:#f3f4f6;color:#374151',
        'SENT': 'background:#dbeafe;color:#1e40af',
        'APPROVED': 'background:#dcfce7;color:#166534',
        'PARTIAL': 'background:#fef3c7;color:#92400e',
        'RECEIVED': 'background:#dcfce7;color:#166534',
        'CLOSED': 'background:#f3f4f6;color:#374151',
        'CANCELLED': 'background:#fee2e2;color:#dc2626'
      };
      const style = statusColors[status] || 'background:#f3f4f6;color:#374151';
      return `<span style="display:inline-block;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:500;${style}">${status}</span>`;
    };

    return `<!doctype html><html><head><meta charset="utf-8">
      <title>Purchase Order #${po.po_number}</title>
      <style>
        body{font-family:Inter,system-ui,Segoe UI,Roboto,Arial;color:#111827;padding:24px;line-height:1.6;background:#fff}
        .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:24px;border-bottom:2px solid #e5e7eb}
        .brand{display:flex;gap:16px;align-items:flex-start}
        .meta{font-size:14px;color:#6b7280;line-height:1.4}
        .section{margin:24px 0;padding:20px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px}
        .section h4{margin:0 0 16px 0;font-weight:600;color:#111827;font-size:18px;border-bottom:1px solid #d1d5db;padding-bottom:8px}
        .section-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:12px}
        .section-item{margin-bottom:12px}
        .section-label{color:#6b7280;font-size:13px;font-weight:500;margin-bottom:4px}
        .section-value{color:#111827;font-size:14px}
        table{width:100%;border-collapse:collapse;margin:24px 0;background:white;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden}
        th,td{padding:16px 12px;border-bottom:1px solid #e5e7eb;text-align:left;font-size:14px}
        th{background:#f3f4f6;font-weight:600;color:#374151}
        .totals{margin-top:32px;padding:20px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;max-width:400px;margin-left:auto}
        .totals div{margin:8px 0;display:flex;justify-content:space-between;font-size:16px}
        .totals div:last-child{border-top:2px solid #374151;font-weight:700;font-size:20px;padding-top:12px;margin-top:12px;color:#111827}
        .po-info{background:#f0f9ff;padding:16px;border-radius:6px;border:1px solid #e0f2fe;margin-top:12px;color:#1e40af;font-size:14px}
        @media print{body{padding:12px} .section{break-inside:avoid}}
      </style>
    </head><body>
        <div class="header">
          <div class="brand">
            ${logoHtml}
            <div>
              <div style="font-size:18px;font-weight:600">${companyName}</div>
              <div class="meta">${companyAddr}</div>
              <div class="meta">${company.phone || company.phone_number || ''}${company.email ? ` • ${company.email}` : ''}</div>
            </div>
          </div>
          <div class="meta" style="text-align:right">
            <div style="font-size:24px;font-weight:700;color:#111827;margin-bottom:8px">Purchase Order</div>
            <div style="font-size:16px;margin-bottom:4px">PO #: <strong>${po.po_number}</strong></div>
            <div style="margin-bottom:4px">Status: ${getStatusBadge(po.status)}</div>
            <div style="margin-bottom:4px">Date: ${po.created_at ? new Date(po.created_at).toLocaleDateString() : ''}</div>
            ${po.expected_date ? `<div>Expected: ${new Date(po.expected_date).toLocaleDateString()}</div>` : ''}
          </div>
        </div>

        <div class="section">
          <h4>Vendor Information</h4>
          <div class="section-grid">
            <div>
              <div class="section-item">
                <div class="section-label">Vendor Name</div>
                <div class="section-value">${po.vendor_name || 'Not specified'}</div>
              </div>
              <div class="section-item">
                <div class="section-label">Contact Person</div>
                <div class="section-value">${po.vendor_contact || 'Not specified'}</div>
              </div>
            </div>
            <div>
              <div class="section-item">
                <div class="section-label">Email</div>
                <div class="section-value">${po.vendor_email || 'Not specified'}</div>
              </div>
              <div class="section-item">
                <div class="section-label">Phone</div>
                <div class="section-value">${po.vendor_phone || 'Not specified'}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <h4>Shipping Information</h4>
          <div class="section-item">
            <div class="section-label">Ship To</div>
            <div class="section-value">${po.ship_to_name || companyName}</div>
          </div>
          <div class="section-item">
            <div class="section-label">Shipping Address</div>
            <div class="section-value">
              ${po.ship_to_address_line_1 || company?.street_address || 'Not specified'}<br/>
              ${po.ship_to_city || company?.city || ''} ${po.ship_to_state || company?.state || ''} ${po.ship_to_zip_code || company?.postal_code || ''}
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Item</th>
              <th>Description</th>
              <th style="text-align:right">Qty</th>
              <th style="text-align:right">Unit Cost</th>
              <th style="text-align:right">Line Total</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>

        <div class="totals">
          <div><span>Subtotal</span><span>${fmt(po.subtotal)}</span></div>
          ${po.tax_rate ? `<div><span>Tax (${Number(po.tax_rate).toFixed(2)}%)</span><span>${fmt(po.tax_amount)}</span></div>` : po.tax_amount ? `<div><span>Tax</span><span>${fmt(po.tax_amount)}</span></div>` : ''}
          ${po.shipping_amount ? `<div><span>Shipping</span><span>${fmt(po.shipping_amount)}</span></div>` : ''}
          <div style="font-weight:700"><span>Total Amount</span><span>${fmt(po.total_amount)}</span></div>
        </div>

        ${po.terms ? `<div class="section">
          <h4>Terms & Conditions</h4>
          <div>${po.terms}</div>
        </div>` : ''}

        ${po.notes ? `<div class="section">
          <h4>Additional Notes</h4>
          <div class="po-info">${po.notes}</div>
        </div>` : ''}

        ${po.related_work_order_id ? `<div class="section">
          <h4>Related Work Order</h4>
          <div class="section-item">
            <div class="section-label">Work Order ID</div>
            <div class="section-value">${po.related_work_order_id}</div>
          </div>
        </div>` : ''}

      </body></html>`
  },

  async openPrintable(companyId, poId, autoPrint = true){
    try {
      const { po, items } = await this.get(companyId, poId);
      const company = await settingsService.getCompanyProfile(companyId); // has logo/address
      const business = await settingsService.getBusinessSettings(companyId); // currency, etc.
      const merged = { ...(business||{}), ...(company||{}) };
      const html = this.exportHtml(merged, po, items);

      const w = window.open('', '_blank');
      if (w) {
        w.document.write(html);
        w.document.close();

        // Auto-print functionality like invoice system
        if (autoPrint) {
          w.onload = () => {
            try {
              w.focus();
              w.print();
            } catch (e) {
              console.warn('Auto-print failed:', e);
            }
            // Auto-close after print dialog (optional)
            setTimeout(() => {
              try {
                w.close();
              } catch (e) {
                console.warn('Auto-close failed:', e);
              }
            }, 800);
          };
        }
      }
    } catch (error) {
      console.error('Failed to generate PO PDF:', error);
      throw new Error('Failed to generate Purchase Order PDF');
    }
  },

  // New method for download without auto-print
  async openForDownload(companyId, poId) {
    return this.openPrintable(companyId, poId, false);
  }
};

export default PoPDFService;

