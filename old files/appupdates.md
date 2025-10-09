💯 You’re exactly right — this is how you avoid the “schema drift” and “frontend vs backend mismatch” problems later. The big players (Jobber, ServiceTitan, Housecall Pro) all had to go back and refactor this after launch because they didn’t lock rules in early. You’ve got the chance to set the standard now.

Here’s the master checklist broken into categories with examples, and where each rule should live (Frontend, Backend, or Both).

✅ TradesmatePro Offline/Online Rule Checklist
1. Core Data Integrity

These must always live in DB (final authority), but frontend should mirror for UX.

Primary Keys: UUIDs → DB only

Foreign Keys: company_id → companies(id) → DB only

Not Null: quote_id, customer_id, etc. → DB only

Uniqueness: email UNIQUE, company_name UNIQUE → DB only

Checks: subtotal >= 0, rate >= 0 → DB + frontend mirror

2. Enums (Statuses, Categories)

DB = source of truth, frontend = dynamic fetch.

Work Order Status: QUOTE, SENT, APPROVED, REJECTED, SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, INVOICED → Both

Invoice Status: DRAFT, SENT, PAID, OVERDUE → Both

Payment Method: CARD, CASH, CHECK, ACH → Both

Service Categories: PLUMBING, HVAC, ELECTRICAL, … → Both

⚡ Fix for Offline: frontend pulls enum_range() at login and caches locally.

3. Triggers

Use validation and audit only, no auto-calculation.

Validation:

subtotal + tax_amount = total → Both

Cannot delete customer with active jobs → Both

Quote must have ≥ 1 line item → Both

Audit:

log_work_order_change() (history table) → DB only

update_updated_at_column() → DB only

❌ Don’t recalc totals, tax, or discounts in DB → keep in frontend.

4. Business Rules

Here’s where “drift” happens if you’re not careful. These should live in both places.

Quotes

Require at least 1 service item → Both

Auto-set status = QUOTE on creation → DB default + frontend mirror

Can’t approve quote without at least one line item → Both

Work Orders

Status transitions must be valid (QUOTE → SENT → APPROVED) → Both

Can’t mark COMPLETED without all line items done → Both

Invoices

Tax auto-applied if company is in taxable state → Both

Invoice cannot be PAID without payment_id → DB check + frontend warning

Payments

Payment amount must equal or be ≤ invoice balance → Both

Overpayments must create a credit record → DB + frontend logic

5. Seed / Defaults

Set once in DB, editable in frontend.

Rate cards: Default HVAC/Plumbing/etc services → DB seed, frontend editable

Invoice template: Default “Net 30” → DB default, editable

Business hours: Default 9–5 Mon–Fri → DB default, editable

6. Regional / Compliance Rules

These are the “auto tax” type you mentioned. Must be handled both places so offline users don’t get bitten later.

Sales tax by state/province → Both

Labor laws (OT after 40 hrs/week) → Both

Required disclosures (license # on invoice in some states) → Both

📋 How to Use This Checklist

Schema Audit → map every table/column to this checklist.

Frontend Audit → confirm all “Both” rules are enforced interactively.

Claude Guidance → give him this checklist so he never “assumes” again — he knows which side owns which rule.

Docs → publish in /docs/rules.md so future devs follow the standard.

👉 Do you want me to expand this into a full matrix (tables × rules) so it’s literally:

| Table | Rule | Location (Frontend/Backend/Both) | Notes |

That way you can lock it into your schema repo as a permanent standard?

You said:
okay so this is where we need to have sepeartion on your checklist? we have online only app at the moment. but we will be adding an offline app, plus andorid app, plus iphone app. so we need web only but with offline in mind for the future. how do we setup the webapp to do this now? 
ChatGPT said:

Perfect timing to think about this now 🚀 — this is exactly where most SaaS in your space (Jobber, Housecall, ServiceTitan) got stuck later, because they built web-only logic and had to retrofit offline/mobile sync years down the road.

Here’s how you can set up your web app now so it works fine online-only but won’t break later when you add offline-first (desktop + iOS/Android).

✅ Web App with Future Offline in Mind
1. Data Ownership Philosophy

DB = final authority → constraints, enums, validation triggers.

Frontend = business logic engine → math, workflows, UX.

Both = business rules → so offline users can catch errors early, and DB enforces them on sync.

This means today’s web app looks like online-first but your code structure is already offline-ready.

2. Checklist Separation (Two Columns)
Rule Type	Web-Only (Today)	Future Offline (Web + Mobile)
Constraints	DB only	DB only (frontend mirror optional for UX)
Enums	Hardcoded in frontend	Pulled dynamically from DB on login & cached
Triggers	Validation + audit	Validation + audit (frontend mirrors rules for offline)
Business Rules	DB only (fewer checks in frontend)	Both (frontend enforces, DB validates)
Totals / Pricing	DB optional, frontend calculates too	Frontend = source of truth, DB validates only
Seed Data	DB inserts, frontend editable	Same, but cached locally for offline use
3. How to Build the Web App Now

Step 1: Layer your logic
Put all business rules in one place (e.g., /services/validation.js).

Today: call DB first.

Future: call validation.js before syncing.

Step 2: Abstract persistence

Today: supaFetch() → direct to Supabase.

Future: supaFetch() → offline storage (IndexedDB/SQLite) → sync to Supabase when online.

Step 3: Make enums dynamic NOW
Even though you could hardcode, better to fetch enums from DB once per session:

SELECT unnest(enum_range(NULL::work_order_status_enum));


That way when you add mobile, it already expects DB → cache.

Step 4: Put validation in DB now
Even if web-only, keep “belt and suspenders” DB checks:

Example: subtotal + tax_amount = total.

That ensures web app can’t drift from schema.

4. Future-Proofing Triggers vs Frontend

✅ Keep triggers today for validation (so web-only app doesn’t insert bad rows).

✅ Write the same rules in JS service functions (even if redundant).

Later: offline/mobile will just use those same JS functions to pre-check before sync.

Example:

Now: DB rejects invalid quote with no line items.

Future: frontend shows “Add at least one item” before sync, DB still validates on save.

5. Storage & Sync Planning

Even if you don’t build it now, lay groundwork:

Use UUIDs everywhere → prevents conflicts when offline inserts rows.

Add created_at + updated_at to all tables → needed for sync diffs.

Add deleted_at (soft deletes) → avoids “record not found” drift.

🚀 Action Plan for You

Keep DB as strict now → constraints, enums, validation triggers.

Start writing business rules twice → once in DB, once in JS (frontend service layer).

Today: feels redundant.

Tomorrow: saves your offline/mobile build.

Fetch enums dynamically (not hardcoded).

Ensure all tables have timestamps + soft delete now.

Abstract supaFetch so swapping DB <-> offline storage later is seamless.