# Schema Findings Audit (against Supabase Schema/supabase schema/latest.json)

This audit lists database tables/views referenced by the app that are present vs missing from the latest schema dump.

## Referenced by app AND present in latest.json
- customers
- work_orders
- invoices
- invoice_line_items
- payments
- notifications
- quotes / quote_follow_ups (where implemented)
- jobs_with_payment_status (present in latest.json)
- business_settings (present; used for settings)
- integration_settings (present; used for integrations)

## Referenced by app but NOT found in latest.json

Scheduling
- schedule_events
- work_orders_v (view)

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
- messages (generic app messages; schema has customer_messages instead)
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

Company/Settings Naming
- company_profiles (referenced in code SCOPE list; not in latest.json)
- integrations (code sometimes references; latest.json has integration_settings instead)

## Evidence: code references

Scheduling
- src/services/CalendarService.js → `supaFetch('schedule_events?select=* ...')`
- src/pages/Scheduling.js → `supaFetch('work_orders_v?select=* ...')`
- src/utils/smartScheduling.js → REST to `schedule_events`, `employee_time_off`
- src/pages/CustomerScheduling.js → uses smartScheduling (depends on `schedule_events`)

Purchase Orders / Vendors
- src/services/PurchaseOrdersService.js → `supaFetch('po_items'...)`, `supaFetch('vendors?select=* ...')`
- src/pages/PurchaseOrders.js → imports PurchaseOrdersService and VendorsService

HR / PTO
- src/utils/smartScheduling.js → REST to `employee_time_off`
- src/pages/MyDashboard.js → references `employee_timesheets`, `pto_current_balances` (via supaFetch patterns)

Work Order sub-entities
- src/utils/supaFetch.js → SCOPE_TABLES includes: `work_order_items`, `work_order_milestones`, `work_order_labor`, `work_order_audit`, `work_order_versions`, `work_order_messages`
- Various panels/components reference line items/labor/milestones through these tables

Messaging / Docs / Templates / Inventory
- src/utils/supaFetch.js → SCOPE_TABLES includes: `attachments`, `job_photos`, `document_templates`, `company_document_templates`, `shared_document_templates`, `items_catalog`, `quote_templates`

Marketplace
- src/utils/supaFetch.js → SCOPE_TABLES includes: `marketplace_requests`, `marketplace_responses`, `marketplace_messages`, `request_tags`

Company/Settings Naming
- src/utils/supaFetch.js → SCOPE_TABLES includes: `company_profiles`, `integrations` (but latest.json has `business_settings`, `integration_settings`)

## Notes
- Confirmed present in latest.json via search: `business_settings`, `integration_settings`, `jobs_with_payment_status`.
- Not found in latest.json via search: all items listed under "NOT found" above.
- `customer_messages` exists in latest.json; the app sometimes expects a generic `messages` table.

