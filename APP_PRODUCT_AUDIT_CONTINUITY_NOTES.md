# TradeMate Pro — Continuity Notes and APP_PRODUCT_AUDIT To‑Do

This document captures where we left off, what’s next, how to run AI DevTools, and how to interact with Supabase (including where credentials live). Use this as the handoff when starting a fresh chat on a new machine.

---

## 1) Product summary and positioning

TradeMate Pro is an industry‑standard FSM platform targeting SMBs and trades, designed to be better and more affordable than Jobber, Housecall Pro, and ServiceTitan.

What “better” means here:
- Reduce real‑world pain points customers complain about with competitors: inconsistent invoicing/AR workflows, poor customer portal UX, rigid scheduling, and slow, bandaid‑style fixes.
- Respect industry standards (auth.users → profiles → companies; normalized schema; separate quote/job/invoice statuses) while delivering a polished, fast UI.
- No bandaids. Build it right the first time: unified flows, shared components, idempotent schema deploys, and proper verification.
- Same backend will power SMBMate with persona‑based routing.

Principles:
- Fix pain points seen in public reviews of Jobber/HCP/ServiceTitan.
- Centralize business logic (services), avoid duplication across pages.
- Skip fragile DB triggers for business rules; keep logic in frontend/services unless unavoidable.
- Gate data behind auth; initialize in order: auth → create company → create profile → load settings.

---

## 2) Where we left off (status as of now)

Recently shipped highlights:
- Invoices
  - Centralized progress/partial invoice creation in `InvoicesService.createProgressInvoice` (Jobs.js now calls the service).
  - “Mark as Sent” UX with send hooks (EmailService stubs); UI chip shows `Sent · <date>` if `sent_at` exists.
  - Payment receipts generation + email hook (stubbed provider).
  - Customer statements PDF (alongside CSV); print‑friendly multi‑customer view.
  - Invoice aging badges on list; analytics: Aging + Days‑to‑Invoice in Reports → Executive Overview.
- Customer Portal
  - Payments flow implemented with deposit UX: defaults to deposit when invoice is a deposit or has `deposit_amount` > 0; toggle to pay full balance; helper text shows deposit remaining.
  - Reschedule request flow via service requests.
- Reports → Financial
  - Added “Accounts Receivable” widgets: Aging buckets and Paid vs Outstanding bar.

Build status last checked: production build succeeded; only warnings elsewhere.

DB migrations: none applied for “sent_at/sent_by”; UI best‑effort PATCH is no‑op if columns don’t exist.

---

## 3) Next full‑auto To‑Do (no DB migrations without explicit approval)

- Customer Portal polish
  - [ ] Show “Deposit” badge on invoice tiles when applicable; keep “Pay Deposit” CTA.
  - [ ] Add “Send receipt” action in payment history rows (reuses EmailService receipt stub).
  - [ ] Statements PDF: brand styling (logo/settings) and totals line.
- Invoices list + detail
  - [ ] Ensure aging chips and status chips consistent; add filters for aging buckets.
  - [ ] After creating a progress invoice, show toast with deep‑link to the new invoice.
  - [ ] Optional migration (on approval): add `sent_at`, `sent_by` with final UI badge + filters.
- Email provider integration
  - [ ] Swap EmailService stubs to provider (settings page toggles, templates, error handling/toasts).
  - [ ] Add “Send invoice” from detail + batch send with queued status.
- Scheduling improvements
  - [ ] Travel‑time aware suggestions + route hints in scheduler.
- Reports/Finance
  - [ ] Trend of A/R by bucket over time and Cash Receipts report (by payment method, date).
- Testing
  - [ ] Unit tests for `InvoicesService.createProgressInvoice` and Portal payment flows.

Reference of added fields that may exist (pending approved migration paths): `invoices.kind`, `parent_invoice_id`, `deposit_amount`, etc. UI remains defensive if absent.

---

## 4) How to use AI DevTools (local repo)

Quick starts in root:
- `START_AI_DEVTOOLS.bat` — launches the AI dev tools environment
- `🚀_START_HERE_AI_DEVTOOLS.md` — overview and links
- Folder: `AIDevTools/` (READMEs, quick reference, architecture)
- Extra guides: `HOW_TO_USE_DEVTOOLS_AND_DEPLOY.md`, `QUICK_START_GUIDE.md`, `devtools/README.md`

Recommended workflow:
1) Read the quick start: `🚀_START_HERE_AI_DEVTOOLS.md` and `AIDevTools/README.md`.
2) Start the main app for dev: `npm start` (or `rebuild-and-start.bat`) from repo root.
3) Use AI DevTools:
   - For deep system checks and test data generation: see `devtools/comprehensiveTest.js` and scripts in `devtools/` with their READMEs.
   - For action outcome monitoring and logs: see `devtools/actionOutcomeMonitor.js` and `error_logs/`.
4) Safe verifications:
   - Build: `npm run build`
   - Tests: `npm test` or targeted tests in `src/__tests__` and `tests/`

Notes:
- Prefer centralized services under `src/services` and API routes in `src/api`.
- Customer Portal server routes live in `src/api/portalRoutes.js`.
- Avoid introducing duplicate logic in pages; call services instead.

---

## 5) Supabase — how to interact (and where credentials live)

Preferred patterns:
- App reads/writes via REST wrappers (`supaFetch`) and server routes for portal.
- Schema‑level work uses direct PostgreSQL (pg driver) or migration scripts; avoid REST for DDL.

Credentials and environment variables:
- Frontend `.env.local` (do not commit):
  - `REACT_APP_SUPABASE_URL=https://<your-project>.supabase.co`
  - `REACT_APP_SUPABASE_ANON_KEY=...`
- Server/secure contexts (do not expose to client):
  - `SUPABASE_SERVICE_ROLE_KEY=...` (service role, back‑end only)
  - Any DB connection string used by scripts (PG connection)

Where to find/update creds in this repo:
- Check `docs/supabasecreds.txt` if present (treat as sensitive; rotate if necessary).
- Centralize environment usage in `.env.local` (frontend) and `.env` for server/scripts.
- Never hardcode secrets in source files; use environment variables.

Connecting to Supabase (schema GUI and dumps):
- Folder: `Supabase Schema/`
  - GUI: run `Supabase Schema/start-schema-gui.bat` (opens Python GUI `db-schema-gui.py`)
  - Dumps: `pg-dump-schema.bat`, `roles-grants-dump.js`, `list-tables.js`
  - Latest JSON dumps: `Supabase Schema/latest.json` and dated `schema_*.json`

Running migrations (only with explicit approval):
- Option A: Idempotent deploy phases under `deploy/phase1/*.sql`
- Option B: Specific migrations under `migrations/*.sql`
- Option C: Scripts in `scripts/` (e.g., `scripts/run-sql.js`, `scripts/execute-sql.js`)

Example local run (PS/Node):
- `node scripts/run-sql.js ./migrations/2025-10-06_deposit_policy.sql`
- Ensure `PG*` env vars or connection string are configured securely before running.

Safety rules:
- No migrations applied without explicit approval.
- Use transaction‑safe scripts; make operations idempotent; log before/after.
- Validate against current schema dump in `schema_dumps/SCHEMA_CURRENT.md`.

---

## 6) Architecture pointers and conventions

- Auth/users → Profiles → Companies “holy trinity”
- Work Orders are the source of truth for quotes/invoices pipeline
- Three separate status enums: quote_status_enum, job_status_enum, invoice_status_enum
- UI/UX: industry‑standard button layouts, professional styling; no raw UUIDs; responsive; correct number inputs
- Avoid duplicate components; prefer shared, context‑aware components

---

## 7) Competitive stance (for new assistants)

- Goal: Out‑execute Jobber, Housecall Pro, and ServiceTitan on real user complaints.
- Focus areas: 
  - Robust, intuitive invoicing/AR (progress billing, deposits, receipts, statements).
  - Customer Portal that truly works (self‑service pay, reschedule, messaging, portal invite).
  - Scheduling that respects travel and realistic constraints.
- Strategy: Ship end‑to‑end, production‑grade features; avoid temporary hacks; keep schema and frontend fully aligned.

---

## 8) Quick commands

- Start dev: `npm start`
- Build: `npm run build`
- Run portal server (if applicable): `node server/portalServer.js` (check scripts)
- Run tests: `npm test`
- Start schema GUI: `Supabase Schema/start-schema-gui.bat`

---

## 9) Hand‑off for a fresh chat

When opening a new chat/session on another machine:
1) Share this file’s context with the assistant.
2) Confirm environment variables are set (`.env.local`, `.env`).
3) Run `npm start` and verify login → company → profile → settings load in order.
4) If anything breaks, start with Reports/Invoices/Portal flows above; use logs and DevTools guides.

No bandaids. Fix it right the first time.

