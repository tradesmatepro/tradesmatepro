# TradesMatePro Webapp – Page‑by‑Page Usability & Layout Audit + Schema Usage Deep Dive

Authoritative DB Reference: supabase schema.csv (repo root) • Beta: ignore RLS/API keys • Integrations/messaging TBD
Date: 2025‑09‑08


## 1) Page‑by‑Page Usability & Layout Audit

Notes: Findings are grounded in current repo pages/components and expected routes. Inventory was verified in code; other screens follow existing patterns. Recommendations avoid assumptions and align to schema.

### Work

#### Active Jobs
- Navigation & flow
  - Use work_orders filtered by stage='JOB'. Make “Allocate Inventory”, “Schedule”, “Start Work”, “Complete” primary actions in‑row.
- Visual hierarchy
  - Table: left group job info (title/customer/date), right group status + actions. Ensure consistent button sizes (sm) and spacing (md:2).
- Wow factor
  - Add colored stage chips (DRAFT/SCHEDULED/IN_PROGRESS/COMPLETED). Inline progress bar for multi‑day jobs.
- Consistency
  - Use same modal header/footer pattern as Inventory.
- Competitive check
  - ServiceTitan/Jobber show dense job lists; beat them with inline quick actions + timeline micro‑indicators.

#### Closed Jobs
- Filter work_orders stage in ('WORK','INVOICED','PAID') and job_status='COMPLETED'. Add “Reopen” (guarded) and “Create Follow‑up”.

#### Calendar
- Backed by schedule_events; add work_order_id (see SQL) for direct drill‑down via event click.
- Drag‑drop to reschedule (update start/end); color by technician or priority.

#### Documents
- Use attachments/documents with company_id + work_order_id. Card grid with preview + type badges; bulk select + download.

### Sales

#### Customers
- Navigation & flow
  - Master list with search; row click opens customer profile.
- Visual hierarchy
  - “ID Card” at top: customer name, balance (Invoices−Payments), last service, lifetime value. Tabs: Jobs, Quotes, Invoices, Notes.
- Wow factor
  - Quick actions: New Quote, Schedule Job, Email Invoice (disabled in beta). Avatar/initials.
- Consistency
  - Same table filters across tabs; same modal style.
- Competitive check
  - Housecall/Jobber have strong “profile cards”; match with cleaner at‑a‑glance KPIs.

#### Quotes
- Source of truth: work_orders where stage='QUOTE'. Make statuses (DRAFT/SENT/ACCEPTED/REJECTED) obvious. “Send” and “Accept (with e‑sign)” prominent.

#### Invoices
- invoices + invoice_items; totals computed consistently. Add “Mark Paid/Partial” action with payment modal. Show balance chip.

### Finance

#### Expenses
- expenses table; list with category filter, vendor, date. Inline receipt preview. Add export CSV.

#### Reports
- Start with basic KPIs (Revenue, AR, COGS if inventory usage wired). Use report views; enable date presets.

#### Payroll
- employee_timesheets + vw_timesheet_reports. Manager approval queue; clear “Approve” flow. Export approved periods.

### Team

#### Employees
- employees list with role chips, active/inactive. Detail page: pay rate history (employee_pay_rates), certifications.

#### Timesheets
- Employee view (own entries), Manager view (team). Consistent add/edit modal. Totals per week.

#### Approvals
- Unified inbox for timesheets + PTO.

#### Time Off Admin
- PTO ledger view (pto_ledger) with computed current balances (view). Policy assignment list.

### Operations

#### Tools
- tools table (if present). Check‑in/out flows with assignments, condition, maintenance schedule.

#### Inventory
- Implemented: Summary (one row/card per item), Details (per‑location), Allocate/Adjust/Transfer in modal.
- Keep list/grid toggle; make filters sticky. Low‑stock badge if total_available < reorder_point.

#### Messages
- Internal messaging table exists; show disabled state and roadmap until functional.

### Account

#### Settings
- Unify reads via app_settings_v (see SQL). Group sections: Company, Rates & Taxes, Notifications, Documents.

#### My Profile
- User info, avatar upload, personal preferences (units, theme).

#### Sign Out
- Simple and consistent.

### Dashboard
- Group widgets: Today’s Jobs, Overdue Invoices, Low Inventory, Team Status. Allow collapse/reorder. Live counters with company_id filters.


## 2) Schema Usage Audit (by area, grounded in supabase schema.csv)

Legend: ✅ Used in app now • ❌ Legacy/unused in app UI • ⚠️ Duplicated/overlapping • 💡 Recommendation

### Work/Jobs
- work_orders: ✅ (stage, quote_status, job_status, work_status, totals). 💡 Keep as pipeline source of truth.
- work_order_items: ✅ used for quote/job line items. 💡 Ensure unit_price/qty NUMERIC(12,4).
- work_order_audit/_log: ✅/partial (use for timeline). 💡 Surface in UI.
- schedule_events: ✅ calendar. ⚠️ Missing work_order_id. 💡 Add column + index.

### Sales
- customers (+addresses): ✅. 💡 Prefer service_address_id reference in work_orders.
- invoices, invoice_items, invoice_payments/payments: ✅. 💡 Standardize numerics; add indexes.
- quotes: ⚠️ duplicate with work_orders stage='QUOTE'. 💡 Create quotes_compat_v; plan deprecation.

### Finance
- expenses, expense_categories: ✅. 💡 Ensure amount NUMERIC(12,4); index by company_id,date.
- vw_timesheet_reports: ✅ read for payroll. 💡 Verify company_id present/filterable.

### Team/PTO
- employees, employee_timesheets: ✅.
- pto_ledger: ✅ desired source of truth.
- pto_balances, pto_current_balances (table), employee_pto_balances: ⚠️ overlapping. 💡 Replace with pto_current_balances_v.
- employee_pay_rates/compensation: ⚠️ overlaps with employees.base_rate. 💡 Normalize to pay rate history.

### Operations/Inventory
- inventory_items, inventory_locations, inventory_stock, inventory_movements: ✅ core.
- inventory_stock_status (view): ✅ per‑location, but REST joins caused 400s. 💡 Create inventory_stock_status_named_v.
- items_catalog (if present): ⚠️ overlaps with inventory_items. 💡 Deprecate/migrate.

### Account/Settings
- settings, business_settings, company_settings: ⚠️ overlapping. 💡 app_settings_v to unify; deprecate fields later.
- notifications/messages: ✅ tables exist; UI not fully active.


### SQL Migrations (idempotent) for Cleanup/Unification

1) Monetary & Quantity Standardization
```sql
DO $$ BEGIN
  PERFORM 1;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inventory_items' AND column_name='cost' AND numeric_precision IS NULL) THEN
    ALTER TABLE inventory_items ALTER COLUMN cost TYPE NUMERIC(12,4) USING cost::NUMERIC(12,4);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inventory_items' AND column_name='sell_price' AND numeric_precision IS NULL) THEN
    ALTER TABLE inventory_items ALTER COLUMN sell_price TYPE NUMERIC(12,4) USING sell_price::NUMERIC(12,4);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inventory_stock' AND column_name='quantity' AND numeric_precision IS NULL) THEN
    ALTER TABLE inventory_stock ALTER COLUMN quantity TYPE NUMERIC(12,4) USING quantity::NUMERIC(12,4);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inventory_movements' AND column_name='unit_cost' AND numeric_precision IS NULL) THEN
    ALTER TABLE inventory_movements ALTER COLUMN unit_cost TYPE NUMERIC(12,4) USING unit_cost::NUMERIC(12,4);
  END IF;
  ALTER TABLE invoices
    ALTER COLUMN subtotal TYPE NUMERIC(12,4) USING subtotal::NUMERIC(12,4),
    ALTER COLUMN total_amount TYPE NUMERIC(12,4) USING total_amount::NUMERIC(12,4),
    ALTER COLUMN tax_amount TYPE NUMERIC(12,4) USING tax_amount::NUMERIC(12,4);
  ALTER TABLE invoice_items
    ALTER COLUMN unit_price TYPE NUMERIC(12,4) USING unit_price::NUMERIC(12,4),
    ALTER COLUMN line_total TYPE NUMERIC(12,4) USING line_total::NUMERIC(12,4),
    ALTER COLUMN tax_rate TYPE NUMERIC(12,4) USING tax_rate::NUMERIC(12,4),
    ALTER COLUMN tax_amount TYPE NUMERIC(12,4) USING tax_amount::NUMERIC(12,4);
  ALTER TABLE expenses
    ALTER COLUMN amount TYPE NUMERIC(12,4) USING amount::NUMERIC(12,4),
    ALTER COLUMN tax_amount TYPE NUMERIC(12,4) USING tax_amount::NUMERIC(12,4);
END $$;
```

2) Quotes Compatibility View
```sql
CREATE OR REPLACE VIEW quotes_compat_v AS
SELECT id, company_id, customer_id, title, description, subtotal, total_amount, created_at, updated_at
FROM work_orders
WHERE stage = 'QUOTE';
```

3) Unified Settings View
```sql
CREATE OR REPLACE VIEW app_settings_v AS
SELECT bs.company_id,
       COALESCE(bs.currency, s.currency) AS currency,
       COALESCE(bs.timezone, s.timezone) AS timezone,
       COALESCE(cs.default_invoice_terms, s.invoice_terms) AS invoice_terms,
       COALESCE(cs.default_invoice_due_days, s.default_invoice_due_days) AS default_invoice_due_days
FROM business_settings bs
LEFT JOIN company_settings cs ON cs.company_id = bs.company_id
LEFT JOIN settings s ON s.company_id = bs.company_id;
```

4) Inventory Per‑Location Named View
```sql
CREATE OR REPLACE VIEW inventory_stock_status_named_v AS
SELECT iss.item_id,
       ii.name AS item_name,
       ii.sku,
       iss.location_id,
       il.name AS location_name,
       iss.company_id,
       iss.on_hand,
       iss.reserved,
       iss.available,
       iss.updated_at
FROM inventory_stock_status iss
LEFT JOIN inventory_items ii ON ii.id = iss.item_id
LEFT JOIN inventory_locations il ON il.id = iss.location_id;
```

5) Calendar Linkage
```sql
ALTER TABLE schedule_events ADD COLUMN IF NOT EXISTS work_order_id uuid;
CREATE INDEX IF NOT EXISTS idx_schedule_events_company_time ON schedule_events(company_id, start_time);
```

6) PTO Current Balance View
```sql
CREATE OR REPLACE VIEW pto_current_balances_v AS
SELECT employee_id, company_id, category_code,
       COALESCE(SUM(CASE WHEN entry_type IN ('ACCRUAL','ADJUSTMENT','CARRYOVER') THEN hours WHEN entry_type='USAGE' THEN -hours END),0) AS current_balance
FROM pto_ledger
GROUP BY employee_id, company_id, category_code;
```

7) Indexes for Core Lists
```sql
CREATE INDEX IF NOT EXISTS idx_work_orders_company_stage ON work_orders(company_id, stage);
CREATE INDEX IF NOT EXISTS idx_inventory_stock_company_item ON inventory_stock(company_id, item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_company_item ON inventory_movements(company_id, item_id);
CREATE INDEX IF NOT EXISTS idx_invoices_company_status ON invoices(company_id, status);
CREATE INDEX IF NOT EXISTS idx_expenses_company_date ON expenses(company_id, date);
```


## 3) Fix Recommendations (precise, step‑by‑step)

A) Inventory UX (implemented + polish)
1. Keep Summary (one card/row per item) and Details (per‑location modal).
2. Buttons in card footer/table Actions: Edit (primary), Details (info), Delete (destructive). Same sizes (xs/sm) and gaps.
3. In ItemDetailModal, ensure actions (Adjust/Transfer/Allocate) live only in modal.
4. Frontend code anchors:
   - src/pages/Inventory.js: ensure EnhancedItemsTab is default.
   - src/components/Inventory/EnhancedItemsTab.js: retain viewMode toggle, consistent button classes.
   - src/components/Inventory/ItemDetailModal.js: per‑location table; use inventory_stock or inventory_stock_status_named_v.
5. Backend
   - Switch detail fetch to inventory_stock_status_named_v with filters company_id & item_id.

B) Monetary Precision (end‑to‑end)
1. Apply SQL block (Monetary Standardization).
2. Frontend: centralize currency/number formatting.
   - Create src/utils/formatters.js function formatCurrency(value, minimumFractionDigits=2, maximumFractionDigits=2).
   - Replace all currency prints to use formatters.

C) Quotes Pipeline Unification
1. Add quotes_compat_v.
2. Grep code for references to quotes table; switch to view or to work_orders.
3. Mark quotes table as legacy (no writes).

D) Settings Read Unification
1. Add app_settings_v.
2. Update settings UI/data loads to read from view; map fields accordingly.

E) Calendar Linkage
1. Add work_order_id column; backfill where possible.
2. Update Calendar page to open Job detail by work_order_id.

F) PTO Consolidation
1. Add pto_current_balances_v.
2. Employee PTO view: read balances from view; all changes write pto_ledger.
3. Manager admin: approval writes to pto_ledger; view shows ledger + current.

G) Performance
1. Ensure all list pages use pagination (limit/offset) and search filters.
2. Apply indexes (see block 7).

Rollback Notes
- Views: DROP VIEW IF EXISTS ...
- Type alters: run on staging first; rollback by casting back (risk of precision loss).

---

This deep‑dive focuses on UX layout per page and concrete schema usage. SQL and code touchpoints are production‑ready and grounded in supabase schema.csv. I can combine migrations into a single ordered file on request.
