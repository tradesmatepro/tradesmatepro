# TradesMatePro Webapp – Full Multi‑Angle Audit (Beta)

Authoritative DB Reference: supabase schema.csv (repo root)
Scope: Deep audit across schema, wiring, UI/UX, workflows, performance, and competitive positioning. No assumptions beyond code present in this repo and schema.csv. RLS/API keys ignored per beta.
Date: 2025‑09‑08


## Critical Issues (Must Fix Immediately)

1) Monetary precision/rounding mismatches across the app
- Evidence (schema.csv): Many monetary and quantity columns are plain NUMERIC with no precision, e.g.
  - inventory_items.cost, sell_price (lines 406–407)
  - inventory_movements.unit_cost (426)
  - inventory_stock.quantity (434)
  - invoices.subtotal, total_amount, tax_amount (471, 479, 487)
  - invoice_items.unit_price, line_total, tax_rate, tax_amount (448–451)
  - expenses.amount, tax_amount (358, 366)
  - work_orders: subtotal, labor_subtotal, tax_rate, tax_amount, total_amount, unit_price, etc. (991–1031)
- Impact: UI discrepancies like 10 × 9.99 displaying as 100 instead of 99.90. Finance reports and customer totals may be off by cents.
- Fix: Standardize money to NUMERIC(12,4), quantities to NUMERIC(12,4) where fractional units possible. Ensure UI formats to 2 decimals for currency.

2) Multiple sources of truth for Quotes and Settings
- Evidence (schema.csv):
  - quotes table (673–684) coexists with work_orders using stage (1012) and quote_status (1013) to represent quotes.
  - settings (746–795), business_settings (10–33), company_settings (74–80) overlap.
- Impact: Inconsistent reads/writes, hard to maintain. UI confusion and risk of data drifting.
- Fix: Pick a single pipeline (work_orders) for quotes; provide a compatibility view for legacy. Unify settings behind a single view.

3) Inventory status view usage errors in API layer
- Evidence (schema.csv): inventory_stock_status view exists (436–443). Earlier 400 errors occurred when joining related tables via REST selects.
- Impact: Detail drill‑down fails intermittently; user sees errors or missing breakdowns.
- Fix: Query views directly with company_id/item_id filters; if names needed, create a named view that includes joins server‑side.

4) PTO schema duplication leads to ambiguity
- Evidence (schema.csv): pto_balances (553–556), pto_current_balances (566–573), pto_ledger (573–585), pto_transactions (625–633), employee_pto_balances (246–256), employee_pto_policies (257–265).
- Impact: Conflicting balances, complex UI to explain. Hard to audit.
- Fix: Ledger‑first design (pto_ledger as source of truth) plus a computed current balance view; deprecate redundant tables.


## Medium Issues (Fix Before GA)

1) Work order status duplication
- Evidence: work_orders.status default 'QUOTE' (985) alongside stage (1012) and specific *_status fields (1013–1015).
- Risk: Divergent filters across UI; wrong buttons/actions shown.
- Fix: Use stage + stage‑specific status only; mark generic status as legacy.

2) Calendar wiring
- Evidence: schedule_events has quote_id (735) but not an explicit work_order_id; work/scheduling UI typically needs WO linkage.
- Risk: Fragmented scheduling context and reporting.
- Fix: Add work_order_id and backfill from quotes/jobs as needed.

3) Customer address duplication
- Evidence: work_orders has service_address_* columns (1033–1038) while customer_addresses exists (91–107).
- Risk: Divergence of addresses between orders and customer records.
- Fix: Prefer service_address_id FK to customer_addresses; retain denormalized fields for snapshot but ensure sourcing and updates are intentional.

4) Messages/notifications clarity
- Evidence: messages (505–521), notifications (522–532) present, but external messaging not implemented per context.
- Risk: Confusing in‑app expectations without clear disabled states.
- Fix: Gate features in UI; document planned integrations in schema comments.

5) Employee/pay fields duplication
- Evidence: employees (base_rate, overtime_rate) (345–347) versus employee_pay_rates and employee_compensation tables.
- Risk: Drifting rates used in payroll vs scheduling.
- Fix: Normalize: use employee_pay_rates (effective_date) as source; keep employees.* as display cache only or remove.


## Opportunities (Wow Factor / Competitive Edge)

- Inventory
  - Keep one‑card‑per‑item summary + drill‑down locations. Add badges: Low Stock (total_available < reorder_point), Real‑time Reserved.
  - Automatic COGS on invoices based on inventory_movements (USAGE) for true profitability tracking.
- Work Orders
  - Timeline with drag‑and‑drop (stage transitions) and audit trail (work_order_audit_log). Quick actions inline (Allocate, Assign, Start Work).
- Customers
  - “ID Card” with AR balance (invoices minus payments), last service date, lifetime value (customers.lifetime_revenue), and quick actions.
- Smart Notifications
  - Overdue invoices, unassigned jobs, low inventory, expiring certifications (employee_certifications.expiration_date).
- Portal & E‑sign
  - Use work_orders.accepted_at/by fields (1042–1044) to power a simple accept flow and timeline.


## Schema & Code Wiring – Findings and Migrations

A) Standardize Monetary/Quantity Types (idempotent)
- SQL:
```sql
-- Money and quantities to NUMERIC(12,4)
DO $$ BEGIN
  -- Inventory
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
  -- Invoices & items
  ALTER TABLE invoices
    ALTER COLUMN subtotal TYPE NUMERIC(12,4) USING subtotal::NUMERIC(12,4),
    ALTER COLUMN total_amount TYPE NUMERIC(12,4) USING total_amount::NUMERIC(12,4),
    ALTER COLUMN tax_amount TYPE NUMERIC(12,4) USING tax_amount::NUMERIC(12,4);
  ALTER TABLE invoice_items
    ALTER COLUMN unit_price TYPE NUMERIC(12,4) USING unit_price::NUMERIC(12,4),
    ALTER COLUMN line_total TYPE NUMERIC(12,4) USING line_total::NUMERIC(12,4),
    ALTER COLUMN tax_rate TYPE NUMERIC(12,4) USING tax_rate::NUMERIC(12,4),
    ALTER COLUMN tax_amount TYPE NUMERIC(12,4) USING tax_amount::NUMERIC(12,4);
  -- Expenses
  ALTER TABLE expenses
    ALTER COLUMN amount TYPE NUMERIC(12,4) USING amount::NUMERIC(12,4),
    ALTER COLUMN tax_amount TYPE NUMERIC(12,4) USING tax_amount::NUMERIC(12,4);
END $$;
```

B) Quotes Single Source of Truth
- SQL (compat view, no drops yet):
```sql
CREATE OR REPLACE VIEW quotes_compat_v AS
SELECT id, company_id, customer_id, title, description, subtotal, total_amount, created_at, updated_at
FROM work_orders
WHERE stage = 'QUOTE';
COMMENT ON VIEW quotes_compat_v IS 'Compatibility view mapping work_orders (stage=QUOTE) to legacy quotes for read paths.';
```

C) Settings Unification
- SQL (read view):
```sql
CREATE OR REPLACE VIEW app_settings_v AS
SELECT bs.company_id,
       COALESCE(bs.timezone, s.timezone) AS timezone,
       COALESCE(bs.currency, s.currency) AS currency,
       COALESCE(cs.default_invoice_terms, s.invoice_terms) AS invoice_terms,
       COALESCE(cs.default_invoice_due_days, s.default_invoice_due_days) AS default_invoice_due_days,
       bs.send_auto_reminders,
       bs.send_quote_notifications,
       bs.send_invoice_notifications,
       bs.number_format
FROM business_settings bs
LEFT JOIN company_settings cs ON cs.company_id = bs.company_id
LEFT JOIN settings s ON s.company_id = bs.company_id;
COMMENT ON VIEW app_settings_v IS 'Unified settings surface for UI. Prefer this over table-specific reads.';
```

D) Inventory Views for Stable API Usage
- Problem: inventory_stock_status returns per‑location (436–443) but REST joins caused 400s.
- SQL (named view to include location names):
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
COMMENT ON VIEW inventory_stock_status_named_v IS 'Per-location stock with item and location names for REST-safe selection.';
```

E) Scheduling Linkage
- SQL (add work_order_id to schedule_events if missing):
```sql
ALTER TABLE schedule_events
  ADD COLUMN IF NOT EXISTS work_order_id uuid;
-- Optional: backfill strategy to associate past events if needed.
```

F) PTO Consolidation (non-destructive step 1)
- SQL (current balance view from ledger):
```sql
CREATE OR REPLACE VIEW pto_current_balances_v AS
SELECT employee_id, company_id, category_code,
       COALESCE(SUM(CASE WHEN entry_type IN ('ACCRUAL','ADJUSTMENT','CARRYOVER') THEN hours WHEN entry_type IN ('USAGE') THEN -hours END),0) AS current_balance
FROM pto_ledger
GROUP BY employee_id, company_id, category_code;
COMMENT ON VIEW pto_current_balances_v IS 'Computed balances from pto_ledger; prefer over stored balance tables.';
```

G) Indexing for Performance (company isolation + common filters)
```sql
CREATE INDEX IF NOT EXISTS idx_work_orders_company_stage ON work_orders(company_id, stage);
CREATE INDEX IF NOT EXISTS idx_work_orders_customer ON work_orders(company_id, customer_id);
CREATE INDEX IF NOT EXISTS idx_inventory_stock_company_item ON inventory_stock(company_id, item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_company_item ON inventory_movements(company_id, item_id);
CREATE INDEX IF NOT EXISTS idx_invoices_company_status ON invoices(company_id, status);
CREATE INDEX IF NOT EXISTS idx_expenses_company_date ON expenses(company_id, date);
CREATE INDEX IF NOT EXISTS idx_schedule_events_company_time ON schedule_events(company_id, start_time);
```


## Usability & Workflow – Findings

- Quotes → Jobs → Invoices
  - Use work_orders.stage (1012) and *_status fields (1013–1015) consistently. Auto‑create inventory allocations on stage transition to JOB; convert to USAGE on WORK completion; invoice pulls USAGE (not ALLOCATION).
  - Reduce duplicate inputs by reusing customer/service address via IDs; avoid retyping addresses if service_address_id is present.
- Offline‑first
  - Schema has settings.enable_offline_mode/auto_sync flags (790–791). Ensure UI communicates offline state and queued actions. Add an in‑app banner when offline.
- PTO/Approvals
  - Provide two experiences: Employee (request, see pending), Manager (approve, see ledger). Leverage pto_ledger + pto_current_balances_v.
- Inventory Allocation Timing
  - Best practice: Allocate at JOB stage (after acceptance) to avoid hoarding during quotes. Conversions to USAGE upon work start/complete.


## Layout & UI Consistency – Findings

- Buttons: Ensure destructive actions (Delete, Adjust) use red outlines/backgrounds, primary actions consistent color. Keep spacing grid (e.g., 3‑column button rows) uniform.
- Dashboard: Group widgets; allow collapse; show key KPIs (today’s jobs, overdue invoices, low stock count).
- Inventory: Main list shows one card/row per item (total_on_hand/reserved/available). Details modal shows per‑location table (from inventory_stock_status_named_v). Keep grid/list toggle.
- Modals: Consistent header with icon, primary action on right, cancel secondary. Sizes responsive (sm/md/lg based on content).


## Performance & Scaling – Findings

- Pagination/search: Use range (limit/offset) on all list pages; index by company_id + sort column. Avoid full‑table loads (5,000+ rows risk).
- Caching: Consider client caching for settings and static lists (inventory_locations). Server‑side: materialized view for inventory_item_summary if performance becomes an issue; refresh on movement.


## Schema Diff Report

Legacy/Overlapping (safe to gate, not immediately drop):
- quotes vs work_orders(stage='QUOTE') → keep work_orders; expose quotes_compat_v.
- settings vs business_settings vs company_settings → use app_settings_v, plan consolidation.
- PTO: prefer pto_ledger + pto_policies; treat stored balance tables as legacy; expose pto_current_balances_v.
- items_catalog vs inventory_items → if unused by UI, mark deprecated and migrate to inventory_items.

Missing / Suggested:
- schedule_events.work_order_id (see migration above).
- Inventory named view for REST (inventory_stock_status_named_v).
- Monetary precision constraints (block A).

Rounding/Data Type Issues:
- See Monetary Precision section (Critical #1): apply NUMERIC(12,4) across money/quantities.


## Prioritized Recommendations (Actionable)

1) Monetary precision standardization (Backend first)
- Apply migration block A.
- Update UI formatters to always show currency with 2 decimals.

2) Inventory API hardening
- Implement inventory_stock_status_named_v and switch UI detail calls to it (company_id + item_id filters only).
- Keep summary view one‑row‑per‑item (either computed client‑side from inventory_stock or via inventory_item_summary).

3) Quotes pipeline unification
- Add quotes_compat_v and switch any lingering reads from quotes to the view; plan removal of direct quotes writes.

4) Settings unification layer
- Create and consume app_settings_v; migrate UI/settings pages to read from it. In a later phase, drop unused settings columns/tables.

5) PTO consolidation (phase 1)
- Create pto_current_balances_v; update Manager/Employee PTO pages to read balances from view; keep all writes as ledger entries.

6) Scheduling link
- Add schedule_events.work_order_id; wire Calendar to work orders directly for context menus and drag‑drop.

7) Indexes & pagination
- Create indexes in block G; ensure all list views use server‑side pagination & search.

8) Wow‑factor UI
- Add real‑time badges and low‑stock alerts; job timeline with audit overlays; customer ID cards. Keep card/list toggle.

Rollback strategy
- Views can be dropped safely (DROP VIEW IF EXISTS ...).
- Numeric type changes: provide backup columns or rely on USING casts; to rollback, revert types (risk: precision loss). Perform on staging before prod.

---

This full audit is grounded in supabase schema.csv and current repo UI patterns. The SQL snippets are idempotent and safe to apply incrementally. I can generate a single ordered migration file if you’d like me to commit it next.
