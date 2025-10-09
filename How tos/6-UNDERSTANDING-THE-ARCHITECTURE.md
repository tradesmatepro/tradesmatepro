6 – Understanding the Architecture (Final Corrected Guide)

This guide provides the big-picture view of the TradesMate Pro app.
Claude must always reference this architecture and the baseline app snapshot before suggesting or applying any fixes.

🔑 Golden Rules

Architecture first, edits second.

Always trace the entire flow (auth → tables → components → UI).

Never assume from a table name alone.

Baseline = source of truth.

Check the baseline app snapshot before making schema or code changes.

Any fix must align with baseline unless deliberately extending functionality.

One pipeline, not many.

Quotes, Jobs, Invoices = stages of work_orders.

Do not create duplicate tables for the same pipeline.

🏗️ Core Architecture Overview
Authentication

Supabase Auth handles all users.

Roles: contractor, company owner, customer.

Every query must filter by company_id and respect RLS policies.

Main Pipelines
Work Orders (Quotes → Jobs → Invoices)

All stages stored in work_orders table.

stage column defines where it is:

"quote" → "job" → "invoice".

Forward check: Quote must flow into Job → Invoice.

Backward check: Invoice must trace back to Job and original Quote.

Service Requests

Customers create service_requests.

Contractors respond via service_request_responses.

Approved responses become work_orders.

Messages

customer_messages table links contractors ↔ customers.

Must always check both portals (contractor and customer).

Messages require: company_id, customer_id, contractor_id.

Other Tables

customers → all customer records.

companies → company accounts.

invoices → invoice records (also linked in work_orders).

expenses, purchase_orders → financial pipeline.

Error Capture & Logs

Global Error Capture (public/console-error-capture.js) runs inside the main React app (port 3000).

Captures console errors, API/network failures, and runtime exceptions.

Sends errors every 30s to the Error Server (port 4000).

Error Server saves logs into:

error_logs/errors_TIMESTAMP.json → historical snapshots

error_logs/latest.json → always up to date (use this first)

Logs first, fixes second → Claude/GPT must always analyze latest.json before proposing fixes.

🔄 Example Flow (Customer Dashboard)
User Login → CustomerDashboard.js → supaFetch queries → Database tables → UI components
├── customers → CustomerList
├── work_orders (quotes/jobs/invoices) → QuotesList / JobsList / InvoicesList
├── service_requests → ServiceRequestsList
├── customer_messages → CustomerMessages
├── error capture → console-error-capture.js → error server → error_logs/latest.json

📋 Verification Rules

Always confirm schema before editing queries:

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name='work_orders';


Always confirm UI component → DB mapping in code.

Always confirm forward + backward pipeline behavior in logs (latest.json).

Always compare against baseline snapshot before changes.

🚫 What Not to Do

❌ Don’t create new tables like quotes or jobs (they belong in work_orders) without explicit permission.

❌ Don’t fix contractor side without checking customer portal.

❌ Don’t assume schema — always check baseline + DB.

❌ Don’t patch queries in isolation — must verify pipeline end-to-end.

❌ Don’t fix without checking error_logs/latest.json.

🎯 Key Principles

Always start with the architecture map.

All changes must respect the pipeline (work_orders, not duplicates).

Messages must work both ways (contractor ↔ customer).

Baseline app is the single source of truth.

Sandbox only — no real project edits.

Error logs drive fixes — always analyze latest.json before touching code.

👉 With this, Claude can’t “forget the big picture.” He must always reference this architecture and check latest.json before touching SQL or code.

✅ This now places the error capture + error server system right inside the core architecture, so it’s treated as mandatory, not optional.