# TradesMatePro Webapp Audit (Beta)

Scope: Thorough, schema-grounded audit of current app versus Supabase schema (supabase schema.csv). No assumptions beyond code observed in this repo and the listed schema. Keys/RLS ignored per beta note.

Date: 2025-09-08

---

## Navigation & UX

Observed primary navigation buckets (by code and conventional structure):
- Work: Active/Closed Jobs, Calendar, Documents
- Sales: Customers, Quotes, Invoices
- Finance: Expenses, Reports, Payroll
- Team: Employees, Timesheets, Approvals, Time Off Admin
- Operations: Tools, Inventory, Messages (internal)
- Account: Settings, My Profile, Sign Out

Cross-nav UX conventions in app:
- Cards + tables blend. New enhanced Inventory includes card grid + table toggle.
- Modals used for add/edit (items, stock adjustments, transfers, allocations).
- Company isolation via company_id is present in schema and used in recent code updates; must be verified across older modules.

---

## System-by-System Audit

Each section ties findings to schema columns/tables in supabase schema.csv and current UI behavior.

### Work
Modules: Active Jobs, Closed Jobs, Calendar, Documents
Schema: work_orders, work_order_items, work_order_labor, work_order_milestones, work_order_versions, work_order_audit(_log), schedule_events, attachments, documents

- 🔴 Critical
  - Pipeline integrity vs schema: work_orders includes stage (USER-DEFINED), quote_status, job_status, work_status (lines 1012–1015). UI must consistently use stage to filter (QUOTE/JOB/WORK). Confirmed recent UI additions use job.stage for buttons; ensure everywhere else likewise.
  - Inventory coupling: inventory_movements has related_work_order_id (line 429). Ensure all allocations/usage write this field and company_id (line 420). Recent ItemAllocationModal writes related_work_order_id.
- 🟡 Medium
  - Duplicated status notions: work_orders.status (line 985 = 'QUOTE') and stage/status triplet. Recommend standardize on stage + specific *_status, deprecate generic status.
  - Calendar data lives in schedule_events (lines 720–736). Ensure bi-directional linking to work_orders via work_order_id or quote_id (only quote_id exists at 735). Lack of work_order_id link can limit rollups.
- 🟢 Opportunities
  - Work Order timeline view using work_order_audit_log (lines 910–923) for per-job audit.
  - Documents: unify attachments/documents presentation filtered by work_order_id.

### Sales
Modules: Customers, Quotes, Invoices
Schema: customers (+addresses), quotes, work_orders (quote pipeline), invoices, invoice_items, invoice_payments, payments

- 🔴 Critical
  - Dual quote sources: quotes table exists (lines 673–684) AND work_orders also represents quotes via stage='QUOTE'. This is a schema/product decision conflict. UI appears to lean on work_orders; ensure quotes table isn’t queried anywhere. Risk of divergent data if both used.
  - Tax rates duplicated: invoices.tax_rate (line 478), invoice_items.tax_rate (line 450), settings.default_tax_rate (758), rates_pricing_settings.default_tax_rate (719). Must define a single source of truth.
- 🟡 Medium
  - Invoice totals: invoices.subtotal, total_amount, tax_amount, discount_amount exist (lines 471, 479, 480, 487). Ensure line item sums reconcile consistently server-side (consider SQL view for computed totals).
- 🟢 Opportunities
  - Quote templates exist (quote_templates, quote_tools, quote_tool_usage). Surface a guided quote builder using these.

### Finance
Modules: Expenses, Reports, Payroll
Schema: expenses (355–369), expense_categories, vw_timesheet_reports (881–894), employee_pay_rates, employee_compensation

- 🔴 Critical
  - Monetary fields numeric without precision across many tables. Risk of rounding mismatches (reported: inventory value 100 vs 99.90). Standardize to NUMERIC(12,4) for monetary.
- 🟡 Medium
  - Expenses references vendor/project but no enforced foreign keys in schema.csv; acceptable for beta but add comments/constraints later.
- 🟢 Opportunities
  - Create views for P&L snapshots; use vw_timesheet_reports to feed payroll reports.

### Team
Modules: Employees, Timesheets, Approvals, Time Off Admin
Schema: employees, users, employee_timesheets (+vw_timesheet_reports), employee_time_off, pto_* tables

- 🔴 Critical
  - PTO duplication: pto_balances, pto_current_balances, pto_ledger, pto_transactions, employee_pto_balances/policies. Multiple overlapping representations. Align to ledger-first (pto_ledger) plus current balance view.
- 🟡 Medium
  - timesheets: employee_timesheets has multiple total_hours fields (337, 340) and status. Avoid ambiguity; rely on one computed total.
- 🟢 Opportunities
  - Role-based dashboards per memory preference; leverage user_permissions (829–847) to filter.

### Operations
Modules: Tools, Inventory, Messages (internal)
Schema: inventory_items, inventory_locations, inventory_stock, inventory_movements, inventory_stock_status (view), inventory_item_summary (view), tool_* tables, messages

- 🔴 Critical
  - inventory_stock_status exists in schema (436–443); earlier API errors indicate REST query format or RLS/permissions on joins. Ensure REST queries don’t over-select with joins not defined by foreign keys in the view.
  - Movements must set company_id, item_id, location_id or reserved math is wrong.
- 🟡 Medium
  - UI initially showed duplicates per location in main list. Now corrected to summary per item with a details modal. Maintain list/grid toggle for ergonomics.
- 🟢 Opportunities
  - Add (material) cost-of-goods sync to invoices using inventory_movements where movement_type='USAGE' and related_work_order_id.

### Account
Modules: Settings, My Profile, Sign Out
Schema: settings, business_settings, company_settings, integration_settings, ui_preferences

- 🔴 Critical
  - Duplicate settings containers (settings vs business_settings vs company_settings). The app needs a single authoritative source with a compatibility view for legacy code.
- 🟡 Medium
  - Integration keys present but not wired (per beta). Add clear disabled states in UI.
- 🟢 Opportunities
  - Create app_settings_v view that coalesces settings from new-to-legacy order.

---

## Cross-Cutting Issues
- Consistency: company_id filters must be applied for every query (schema supports this in nearly all tables/views).
- Monetary precision: numeric fields without precision lead to rounding issues in UI totals (e.g., inventory value). Standardize to NUMERIC(12,4) and always format to 2 decimals in UI.
- Modals consistency: Action buttons (Edit, Delete, Details) standardized and aligned; place per-location actions in the details modal.
- Duplication: multiple settings tables, multiple PTO tables; quotes duplication.

---

## Competitive Benchmarking (Jobber, ServiceTitan, Housecall Pro)
- Inventory: Per-item summary with drill-down per location is on par; adding “Reserved” vs “Available” badges and low-stock alerts moves toward parity. To leapfrog, add allocation/usage workflow tied to jobs and automatic COGS on invoices.
- Work Orders: Unified pipeline is competitive; ensure e-sign + portal (not audited here) to catch up.
- PTO/Timesheets: Ledger-based PTO with policy engine is industry norm; consolidate now.
- Settings: Single coherent settings experience with feature flags; competitors often have clutter—opportunity to be clearer.

---

## Schema Audit (Grounded in supabase schema.csv)

A. Likely Duplicates / Overlaps
- Settings: settings (746–795), business_settings (10–33), company_settings (74–80). Action: unify via view; migrate gradually.
- Quotes: quotes (673–684) and work_orders with stage='QUOTE' (1012). Action: decide single source. Given app already uses work_orders, mark quotes as legacy.
- PTO: pto_balances (553–556), pto_current_balances (566–573), pto_ledger (573–585), pto_transactions (625–633), employee_pto_balances/policies (246–265, 257–265). Action: keep pto_ledger + pto_policies; expose a computed current balances view; deprecate others.

B. Views Present
- inventory_stock_status (436–443) columns: item_id, item_name, location_id, company_id, on_hand, reserved, available, updated_at
- inventory_item_summary (391–398) columns: item_id, item_name, sku, cost, sell_price, total_on_hand, total_reserved, total_available

C. Monetary Fields (examples to standardize to NUMERIC(12,4))
- inventory_items.cost, sell_price (406–407)
- inventory_movements.unit_cost (426)
- inventory_stock.quantity (434) – quantity can be NUMERIC(12,4) for fractional
- invoices.total_amount, subtotal, tax_amount, discount_amount (471, 479, 487)
- invoice_items.unit_price, line_total, tax_rate, tax_amount (448–451)
- expenses.amount, tax_amount (358, 366)
- work_orders.labor_subtotal, subtotal, tax_amount, total_amount, flat_rate_amount, unit_price, percentage_base_amount, recurring_rate, milestone_base_amount (991–1031)

D. Potentially Legacy / Low-Use (flagged for review, not dropped in this audit)
- items_catalog (488–496) vs inventory_items. If app no longer uses items_catalog, consider deprecation.
- quotes_v (685–697): unclear usage.

---

## Prioritized Recommendations & Fixes

### 1) Monetary Precision & Inventory Value (Fix Now)
Issue: UI shows inventory value rounding (e.g., 10 × 9.99 = 100 instead of 99.90).

Fix:
- Backend: Introduce computed views for totals to avoid client rounding drift.
- Frontend: Format using 2-decimal currency consistently.

SQL (idempotent):
- See migration file: migrations/2025-09-08_schema_cleanup.sql (created in repo) for CREATE OR REPLACE VIEW inventory_item_summary_v2 including item_value and total value view.

Frontend code change (InventoryStats): calculate from view totals or ensure 2-decimal format using toFixed(2) when displaying.

### 2) Settings Consolidation (Fix Soon)
Issue: Multiple settings tables.

Fix:
- Create app_settings_v view coalescing business_settings → company_settings → settings.
- Gradually migrate UI to read from app_settings_v.

### 3) Quotes Single Source of Truth (Plan)
Issue: quotes table vs work_orders stage='QUOTE'.

Fix Options:
- Preferred: Keep work_orders as the sole pipeline. Create compatibility view quotes_compat_v that selects work_orders where stage='QUOTE' for any old queries.
- Defer dropping physical quotes table until code search confirms unused.

### 4) PTO Consolidation (Plan)
Issue: Multiple overlapping PTO tables.

Fix:
- Keep pto_ledger (audit trail) and pto_policies.
- Create pto_current_balances_v computed from ledger.
- Mark pto_balances, pto_current_balances, employee_pto_balances as deprecated.

### 5) Inventory Status View Permissions & Usage (Fix Now)
Issue: 400 errors when querying inventory_stock_status with REST over-select.

Fix:
- Query the view directly without embedding related selects unless the view defines those relations. Filter by company_id and item_id.
- If joining to names is needed, create a separate view inventory_stock_status_named_v that includes location/item names.

---

## Exact SQL Migration (see file migrations/2025-09-08_schema_cleanup.sql)

Highlights included in migration:
1) Create or replace inventory_item_summary_v2 with item_value and optional company_id column for filtering.
2) Create inventory_total_value_v per company.
3) Create app_settings_v unified view.
4) Create inventory_stock_status_named_v including inventory_locations.name via join (read-only view) for safe REST selection.
5) Standardize key monetary field types to NUMERIC(12,4) via conditional ALTERs in plpgsql blocks.
6) Add comments to legacy/duplicate tables, do not drop (safe phase).

Rollback: DROP created views; revert numeric types (provided template).

---

## Concrete Frontend Fixes

1) Inventory: List/Grid Toggle
- EnhancedItemsTab retains viewMode ('cards'|'table'); toggle rendered in filters.

2) Inventory Value Formatting
- Ensure formatting uses 2 decimals. In InventoryStats formatCurrency ensures cents display.

3) Details Icon & Allocate
- Details icon changed to InformationCircleIcon.
- Allocation implemented via ItemAllocationModal writing inventory_movements (movement_type='ALLOCATION', related_work_order_id, company_id).

4) Company Isolation
- Ensure every fetch includes company_id filter (already applied in new services/components touched).

---

## Final Notes
- This audit focused on what exists: schema.csv and the app code touched (Inventory, Jobs). Broader code-wide reference checks are recommended before any destructive schema changes (drops). The provided migration is non-destructive and idempotent, enabling safe progress now.

