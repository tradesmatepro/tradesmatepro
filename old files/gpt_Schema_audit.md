# Claude Schema Audit

Audit sources: latest schema dump (Supabase Schema/supabase schema/latest.json), logs.md, and code references (supaFetch/supabase-js usage across src/).

## Top findings

- 403 Forbidden across customers, work_orders, notifications, invoices (logs.md). Root causes:
  - Residual REST calls in the frontend (PostgREST) without a valid user JWT or lacking grants to the role hitting PostgREST.
  - Direct use of SUPABASE_SERVICE_KEY in browser code (critical) in src/utils/smartScheduling.js.
  - Mixed data access patterns (supabase-js + raw fetch) leading to inconsistent auth behavior.
- Significant set of tables/views referenced by the app are missing from latest.json (details below). These must be created or code must be adjusted to use existing standardized tables.
- Naming consistency: prefer snake_case columns with foreign keys as table_name_id, enforce company_id scoping, add created_at/updated_at and created_by/updated_by where appropriate.

## Present in latest.json and actively used
- customers, work_orders, invoices, invoice_line_items, payments, notifications
- jobs_with_payment_status (present and referenced)
- business_settings (for org-level settings)
- integration_settings (for third-party configs)
- customer_messages (exists; see Messaging section)

## Referenced by app but NOT found in latest.json (create or refactor code)

Scheduling
- schedule_events (widely used)
- work_orders_v (view used in Scheduling page)

Purchase Orders / Vendors
- vendors
- purchase_orders
- po_items

HR / PTO
- employee_time_off
- employee_timesheets
- pto_current_balances

Work Order sub-entities
- work_order_items
- work_order_labor
- work_order_milestones
- work_order_versions
- work_order_messages

Messaging / Docs / Templates / Inventory
- messages (generic app table)
- attachments
- job_photos
- document_templates
- company_document_templates
- shared_document_templates
- quote_templates
- items_catalog
- inventory_items
- inventory_stock
- inventory_batches
- inventory_serial_numbers

Marketplace
- marketplace_requests
- marketplace_responses
- marketplace_messages
- request_tags
- marketplace_reviews

Company/Settings naming
- company_profiles (referenced in code SCOPE; not in latest.json)
- integrations (legacy naming in code; schema uses integration_settings)

## Evidence (code references)
- Scheduling
  - src/services/CalendarService.js → supaFetch('schedule_events?select=* ...')
  - src/pages/Scheduling.js → supaFetch('work_orders_v?select=* ...')
  - src/utils/smartScheduling.js → direct REST to schedule_events, employee_time_off; uses SUPABASE_SERVICE_KEY
- Purchase Orders / Vendors
  - src/services/PurchaseOrdersService.js → supaFetch('po_items' ...), supaFetch('vendors?...')
  - src/pages/PurchaseOrders.js → uses PurchaseOrdersService/VendorsService
- HR / PTO
  - src/utils/smartScheduling.js → employee_time_off
  - src/pages/MyDashboard.js → employee_timesheets, pto_current_balances (patterns)
- Work Order sub-entities
  - src/utils/supaFetch.js → SCOPE_TABLES includes many work_order_* tables
- Messaging / Docs / Templates / Inventory
  - src/utils/supaFetch.js → SCOPE_TABLES lists attachments, job_photos, document_templates, company_document_templates, shared_document_templates, items_catalog, quote_templates
- Marketplace
  - src/utils/supaFetch.js → SCOPE_TABLES lists marketplace_* and request_tags
- Logs (Auth/permissions)
  - logs.md shows repeated 403 from PostgREST endpoints for customers, work_orders, notifications, invoices

## Standardization recommendations (non-pipeline)

Authentication & Data Access
- Remove any use of SUPABASE_SERVICE_KEY from the frontend (src/utils/smartScheduling.js and anywhere else). Never ship service keys to browsers.
- Standardize on supabase-js client everywhere or a single supaFetch wrapper that sends the user JWT Authorization: Bearer <access_token> consistently.
- Eliminate raw fetch to PostgREST in UI code. If PostgREST is required, ensure Authorization is user JWT and apikey is anon key (never service key).

Postgres permissions (with RLS disabled for beta)
- Ensure anon/authenticated roles have required privileges; otherwise PostgREST returns 403 even with RLS off.
  - GRANT USAGE ON SCHEMA public TO anon, authenticated;
  - GRANT SELECT/INSERT/UPDATE/DELETE ON relevant tables to authenticated;
  - GRANT SELECT (read-only) where needed to anon only if public endpoints are intended (likely no for this app).

Schema normalization & naming
- For all new tables, standardize common columns: id uuid PK default gen_random_uuid(), company_id uuid NOT NULL, created_at/updated_at timestamptz, created_by/updated_by uuid, status enums where applicable.
- Foreign keys: use ON DELETE CASCADE for company_id-scoped entities and child entities (work_order_*).
- Indexes: (company_id), (company_id, created_at desc), and any common filters (status, start_time).

Messaging unification
- Either:
  1) Create messages (generic) and keep customer_messages as a specialized table or view; or
  2) Replace app references to messages with customer_messages if scope is only customer-facing.

Scheduling
- Create schedule_events with FK to work_orders, users (employee_id), customers; include start_time/end_time, event_type, status.
- Create work_orders_v view for scheduled items or adjust code to query work_orders directly with appropriate filters and joins.
- Optional triggers/functions (present in repo SQL) to sync schedule_events from work_orders.

POs & Vendors
- Create vendors, purchase_orders, po_items (and optionally approvals). There is an existing sql files/setup_purchase_orders.sql in the repo to use as a baseline.

HR/PTO
- Create employee_time_off (PTO requests), employee_timesheets (time entries/summary), pto_current_balances (materialized or view).

Work order sub-entities
- Create work_order_items, work_order_labor, work_order_milestones; add work_order_versions and work_order_messages if versioning/auditing and comms are required immediately.

Docs/Templates/Inventory
- Create attachments, job_photos; document_templates, company_document_templates, shared_document_templates, quote_templates.
- Phase inventory in with items_catalog and inventory_* tables if the Inventory UI is enabled.

Marketplace
- If Marketplace/Customer Portal are in scope now, create marketplace_requests, marketplace_responses, marketplace_messages, request_tags, marketplace_reviews.

Views & enums
- Ensure expected views referenced by code exist: work_orders_v; keep jobs_with_payment_status (present) if used.
- Maintain separate enums where used (quote_status_enum, job_status_enum, invoice_status_enum) or map to unified status fields consistently in code.

## Immediate unblock plan (suggested order)
1) Fix data access/auth:
   - Remove service key usage in frontend; standardize supabase-js/supaFetch with user JWT.
   - Apply GRANTs for authenticated to tables the app reads/writes.
2) Create minimal missing core objects:
   - schedule_events, work_order_items, work_order_labor, work_order_milestones
   - vendors, purchase_orders, po_items
   - employee_time_off (for scheduling blockers)
3) Add work_orders_v (or update code to query work_orders with filters directly) and basic indexes.
4) Address messaging/docs/templates alignment.
5) Phase in marketplace and inventory if needed now.

## Trace of present/missing checks
- Confirmed present via latest.json search: business_settings, integration_settings, jobs_with_payment_status, customer_messages.
- Not found via latest.json search: schedule_events, work_orders_v, vendors, purchase_orders, po_items, employee_time_off, employee_timesheets, pto_current_balances, work_order_items, work_order_labor, work_order_milestones, work_order_versions, work_order_messages, attachments, job_photos, document_templates, company_document_templates, shared_document_templates, quote_templates, items_catalog, inventory_items, inventory_stock, inventory_batches, inventory_serial_numbers, messages, marketplace_requests, marketplace_responses, marketplace_messages, request_tags, marketplace_reviews, company_profiles, integrations.

