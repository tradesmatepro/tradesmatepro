# Database SQL: Run Order and Notes

Run these in order from the project root in Supabase SQL editor.

1) 01_create_core_views.sql
   - Creates quotes_v, jobs_v, work_orders_v as simple stage-filtered views over work_orders
   - Safe and idempotent; keeps list pages stable

2) 02_sync_schedule_events_trigger.sql
   - Adds trigger to mirror work_orders.start_time/end_time into schedule_events
   - The function updates by both quote_id and work_order_id if either column exists; keep whichever fits your schema

3) 03_lock_legacy_tables.sql (optional but recommended)
   - Renames quotes/quote_items/wo_master to *_legacy if they exist
   - Adds BEFORE triggers to block writes so the app can’t drift back to legacy tables

Notes:
- All scripts are safe to run multiple times
- If your schedule_events uses only work_order_id (not quote_id), the trigger still works; you can remove the unused WHERE block later
- No data is dropped; the legacy rename only changes names and blocks future writes

