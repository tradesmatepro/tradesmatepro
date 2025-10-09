7 – Full Architecture Check (No Bandaids)

This guide enforces a full-system review before touching code, schema, or queries.
Claude must always check end-to-end flows, schema alignment, and baseline references.
No bandaids, no partial fixes.

🚨 Golden Rule

Fix the root cause, not the symptom.
Never patch one component in isolation. Always understand the whole enchilada 🌯.

1. Map the User Journey

Ask: What is the full flow here?

Example:

Customer Portal Login → Submit Service Request → Contractor Responds → Work Order Created → Quote → Job → Invoice

Required Mapping:

TO: Inputs (forms, API calls, auth)

FROM: Where the data lands (tables, UI components)

Pipeline: End-to-end list of tables/components touched

2. Schema Alignment Check

Confirm each table exists with required columns.

Run schema verification in sandbox:

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'work_orders';


Verify for each table:

✅ id

✅ company_id

✅ created_at

✅ Foreign keys align with flow

Fix schema first if anything is missing — do not patch queries to match broken schema.

3. Data Access Layer Check

Compare actual queries in code against schema.

Example:
✅ Good: supaFetch('work_orders?order=created_at.desc')
❌ Bad: supaFetch('work_orders?order=updated_at.desc') (column doesn’t exist).

Verify joins/filters exist:

Customer ↔ Company via company_id

Work Orders ↔ Customer via customer_id

Messages ↔ Customer + Contractor via customer_id / contractor_id

4. App Logic Check

Trace components back to DB queries.

Confirm each UI component matches expected table/columns.

Check both forward and backward flows.

Examples:

Quote → Job → Invoice must flow correctly in both directions.

Contractor messages must also appear in customer portal.

5. Logs & Systemic Issues

Open /developer-tools and browser console.

Gather all errors before fixing anything.

Check if errors are caused by:

Schema mismatch

Wrong queries

Missing RLS

Broken component props

6. Apply Fixes (Sandbox Only)

Fix schema, query, or code only after confirming all of the above.

Sandbox only — never touch real project.

Save migration SQL in /migrations.

7. Verification

Refresh app.

Test forward + backward flows.

Confirm both roles (contractor + customer) work.

Logs must be clean.

Compare behavior against baseline app snapshot.

🚫 What Not to Do

❌ Don’t fix one query without checking full pipeline.

❌ Don’t create stray tables (quotes, jobs).

❌ Don’t patch contractor side only — must check customer side.

❌ Don’t silence errors instead of fixing root cause.

❌ Don’t skip schema verification.

🎯 Key Principles

Always map the flow before changing code.

Schema must align with pipeline.

Queries must match schema.

Components must match DB.

Logs must be clean before marking fixed.

Sandbox only — never real project.

👉 With this checklist, Claude can’t get away with bandaid fixes or isolated patches. He must walk the entire system before applying any changes.