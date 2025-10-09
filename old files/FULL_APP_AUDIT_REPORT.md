# TradeMate Pro – Full App Schema & Integration Audit (Frontend vs Database)

Date: 2025-09-22
Scope: Entire repository (src/, Customer Portal/, services/, utils/, SQL and schema helpers)
Author: Augment Agent

---

## Executive Summary

- Root cause of persistent 400s/403s: mixed/legacy schema usage and unsafe frontend data access patterns.
- Canonical status model (from latest.json) to follow for work_orders: QUOTE, SENT, ACCEPTED, REJECTED, SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, INVOICED.
- Invoice statuses: UNPAID, PARTIALLY_PAID, PAID, OVERDUE, VOID.
- Critical inconsistencies remain across pages and utilities (enum values, column names, direct REST with service key, scheduling fields, legacy stage/job_status/quote_status usage).

Action: Adopt the recommendations below, then run the verification checklist.

---

## Canonical “Industry-Standard” Targets (based on latest.json and product design)

1) Work Orders (single source of truth)
- Table: work_orders
- Status enum values: QUOTE, SENT, ACCEPTED, REJECTED, SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, INVOICED
- Columns to prefer: id, company_id, customer_id, title, description, status, estimated_duration, total_amount, created_at, updated_at
- Quote fields (optional): quote_number, quote_sent_at, quote_expires_at
- Job fields (timing): scheduled_start, scheduled_end (NOT start_time/end_time on work_orders)

2) Invoices
- Table: invoices
- Status enum values: UNPAID, PARTIALLY_PAID, PAID, OVERDUE, VOID
- Amounts: subtotal, tax_amount, total_amount, amount_paid, due_date, paid_date

3) Authentication / Data Access
- Frontend must not use SUPABASE_SERVICE_KEY or hard-coded service keys
- Prefer: supaFetch (authenticated) or Supabase client (user session), company_id scoping

---

## Critical Findings and Recommended Fixes

A. Status and Enum Mismatches
- Wrong values found: DRAFT, EXPIRED, DECLINED, ASSIGNED
- Missing value in filters: INVOICED (jobs side)
- Wrong columns: quote_status, job_status, work_status, stage

Recommended Fix:
- Replace all filters with unified status on work_orders
  - Quotes: status in (QUOTE, SENT, ACCEPTED, REJECTED)
  - Jobs: status in (SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, INVOICED)
- Remove all usage of: quote_status, job_status, work_status, stage
- Remove EXPIRED, DECLINED, ASSIGNED from UI code unless DB truly has them (latest.json does not)

Files to change (examples and notes):
- src/pages/Quotes_clean.js – already fixed most; ensure no remaining quote_status/DRAFT/EXPIRED/DECLINED usage
- src/pages/Dashboard.js – fixed: removed payment_status; ensure INVOICED included and no DRAFT/EXPIRED/DECLINED
- src/components/QuotesUI.js – fixed labels to QUOTE; removed EXPIRED default
- src/pages/QuotesPro.js – PATCH uses status (not quote_status)
- src/pages/PortalQuote.js – PATCH uses status; display uses status
- Customer Portal/src/pages/Quotes.js – select status; .in(['SENT','ACCEPTED','REJECTED'])
- Customer Portal/src/pages/Jobs.js – add INVOICED in filter
- src/components/JobsDatabasePanel.js – use status only
- src/components/CustomerDashboard/CustomerJobs.js – standardized to status-only rendering
- src/pages/JobsHistory.js – still uses wo.job_status; change to wo.status

B. Authentication & Data Access (Security/403 risk)
- Direct REST with anon/service key from frontend is unsafe and causes 403/RLS confusion
- Hard-coded service keys found in multiple files

Recommended Fix:
- Replace all direct fetches with supaFetch or Supabase client using user session
- Remove any SUPABASE_SERVICE_KEY usage from frontend code

Files requiring change:
- src/pages/Timesheets.js – has local supaFetch using SERVICE_KEY; replace with global supaFetch or Supabase client
- src/components/CustomerDatabasePanel.js – uses fetch with SERVICE_KEY to customers table and even creates tables; move to backend/admin tool; use supaFetch for read
- src/components/IntegrationDrawer.js – hard-coded SUPABASE_URL and SERVICE_KEY (critical) – remove, use env + client
- src/components/QuotesDatabasePanel.js – imports SERVICE_KEY; remove and use supaFetch exclusively
- src/services/DatabaseSetupService.js – exec_sql RPC via SERVICE_KEY from frontend – move to server-side/admin-only
- src/services/MessagingService.js – uses SERVICE_KEY in fetch; replace with supaFetch or Supabase client
- src/components/JobsDatabasePanel.js – imports SERVICE_KEY; remove if unused

C. Scheduling Fields (work_orders)
- Code references start_time/end_time on work_orders; the standardized fields are scheduled_start/scheduled_end

Recommended Fix:
- Replace work_orders.start_time/end_time → scheduled_start/scheduled_end throughout
- schedule_events (separate table) rightly uses start_time/end_time; do not change those

Files to review/fix:
- src/components/JobBuilder.js – uses start_time/end_time; adjust to scheduled_start/scheduled_end on work_orders
- src/pages/Dashboard.js (metrics/filters) – ensure date filters use created_at/updated_at or scheduled_* as appropriate
- Any page filtering on work_orders.start_time/end_time – migrate to scheduled_* (confirm against latest.json)

D. Invoice Status Usage
- Ensure code uses invoices.status with allowed values {UNPAID, PARTIALLY_PAID, PAID, OVERDUE, VOID}
- Remove invoice_status fields on work_orders in UI logic; payments aggregate should derive invoice view

Files to check/fix:
- src/pages/Invoices.js – formData has invoice_status: 'DRAFT' (not in enum) → use status: 'UNPAID' or draft-only UI flag (not DB)
- src/components/InvoiceDetailModal.js – cleaned; ensure no DRAFT branch assumed from DB
- Customer Portal/src/pages/Invoices.js – OK: UNPAID, PARTIALLY_PAID, OVERDUE, PAID, VOID
- src/services/InvoicesService.js – ensure calculations and transitions map to DB enums; remove stray 'PARTIAL' naming in favor of PARTIALLY_PAID

E. Legacy Views/Fields
- jobs_with_payment_status view referenced; make sure it exists in DB (latest.json contains version(s)); UI should prefer invoices.status rather than synthetic work order payment_status fields
- Remove references to: stage, work_status, job_status, quote_status

Files to update:
- src/components/CustomerDashboard/CustomerJobs.js – completed (status only)
- src/pages/JobsHistory.js – replace wo.job_status → wo.status
- Any view-based assumptions should be optional; prefer direct table queries

F. Marketplace Enums (OK)
- src/constants/marketplaceEnums.js matches marketplace_response_status_enum; keep
- Verify all marketplace filters use DB_RESPONSE_STATUS constants

G. Type Safety
- src/types/supabase.types.ts defines WorkOrderStatus arrays and helper – use these everywhere for status filters/builders
- Avoid string literals in filters; import WORK_ORDER_* constants to prevent drift

H. Customer Portal PublicQuote
- Customer Portal/src/pages/PublicQuote.js uses fetch to work_orders with work_order_id and quote_status – replace with supaFetch/Supabase client; use id/status

---

## High-Risk Items (Security/Availability)

- Hard-coded SUPABASE_SERVICE_KEY in:
  - src/components/IntegrationDrawer.js
  - src/components/CustomerDatabasePanel.js
  - src/pages/Timesheets.js (embedded helper)
  - src/services/MessagingService.js
  - src/services/DatabaseSetupService.js (exec_sql)

Remediation: Remove from frontend; if admin ops are required, implement backend service or dev-only CLI.

---

## Concrete Change List (by file)

- src/pages/JobsHistory.js: Replace job_status checks with status; update filters accordingly
- src/pages/Invoices.js: formData.invoice_status → remove/rename to status when persisting; map to valid enums
- src/pages/Timesheets.js: Replace local SERVICE_KEY fetch helper with global supaFetch or Supabase client
- src/components/CustomerDatabasePanel.js: Replace SERVICE_KEY fetch with supaFetch; remove table-creation from frontend
- src/components/IntegrationDrawer.js: Remove hard-coded service key/URL; use env + Supabase client
- src/services/MessagingService.js: Replace SERVICE_KEY fetch with supaFetch client calls
- src/services/DatabaseSetupService.js: Move exec_sql to backend admin; frontend should not execute arbitrary SQL
- src/components/JobBuilder.js: Replace start_time/end_time on work_orders with scheduled_start/scheduled_end
- src/constants/statusEnums.js and src/utils/workOrderStatus.js: Remove ASSIGNED if not in DB; align to latest.json; ensure transitions include INVOICED
- Customer Portal/src/pages/PublicQuote.js: Use id/status, not work_order_id/quote_status; use Supabase client

Note: Several of these have been partially fixed during prior passes. The above list reflects all remaining references found in the codebase retrieval.

---

## Standardization Policy (to prevent regressions)

- Always verify table/column/enum existence in latest.json before coding.
- Use supaFetch or Supabase client (never SERVICE_KEY) on frontend.
- Import status constants from src/types/supabase.types.ts or src/constants/enums.ts.
- Do not re-add legacy fields for cached errors. If 400 persists after code change: clear cache / incognito test.

---

## Verification Checklist

After applying fixes:
- All pages load without 400/403.
- Quotes: filters use QUOTE,SENT,ACCEPTED,REJECTED.
- Jobs: filters include INVOICED where appropriate.
- No references remain to quote_status/job_status/work_status/stage/payment_status on work_orders.
- No frontend file uses SUPABASE_SERVICE_KEY or hard-coded keys.
- Scheduling: work_orders use scheduled_start/scheduled_end (not start_time/end_time).
- Invoices: statuses restricted to UNPAID, PARTIALLY_PAID, PAID, OVERDUE, VOID.
- TypeScript/JS imports of status constants used where available.

---

## Open Questions / Decisions Needed

1) Should we keep ASSIGNED in work_order_status_enum? latest.json does not include it; if business requires an assignment state, either:
   - Add ASSIGNED to DB enum, or
   - Represent assignment via assigned_to + SCHEDULED status.

2) Invoice “DRAFT/SENT” as workflow states – current DB enum omits them. If needed for UX, store as boolean flags (is_draft, sent_at), not as status.

3) Public/Unauthenticated flows (PublicQuote): confirm allowed scope and required auth; avoid SERVICE_KEY.

---

## Implementation Plan (incremental)

1) Security pass (1 hour): remove SERVICE_KEY usage; migrate to supaFetch/clients; stub admin ops.
2) Status/enum pass (1.5 hours): replace legacy fields and values; update JobsHistory, PublicQuote, forms.
3) Scheduling pass (0.5 hour): switch start_time/end_time → scheduled_start/scheduled_end where needed.
4) Invoice pass (0.5 hour): normalize invoice status usage and transitions.
5) Final verification (0.5 hour): run app, smoke tests on Quotes/Jobs/Invoices/Portal.

This report reflects the latest repository state and your latest.json. I will proceed with changes upon approval or execute selectively per priority.

