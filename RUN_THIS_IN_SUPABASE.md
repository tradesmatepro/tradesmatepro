# Fix Invoice RPC Functions - QUICK FIX

The Invoices page error: "structure of query does not match function result type"

## Steps to Fix:

1. Go to Supabase Dashboard → Your project
2. Go to SQL Editor
3. Create a new query
4. Copy and paste the contents of: `database/migrations/QUICK_FIX_RPC.sql`
5. Click "Run" button
6. Wait for success message
7. Refresh the app in your browser (Ctrl+Shift+R)

## What This Does:

- Drops any conflicting old RPC functions
- Creates 4 new RPC functions with correct signatures:
  1. `upsert_invoice_for_work_order` - Create or update invoices
  2. `get_filtered_invoices` - Filter invoices by status, search, date range (returns only IDs)
  3. `update_invoice_status` - Update invoice status
  4. `get_invoice_analytics` - Calculate invoice KPIs

## Key Fix:

The `get_filtered_invoices` function now returns ONLY invoice IDs (not full invoice data). The frontend then fetches full invoice details separately. This matches the actual database schema and prevents type mismatch errors.

## After Running:

The Invoices page should now work. If there are no invoices, you'll see "No invoices found" with a "Create Invoice" button.

