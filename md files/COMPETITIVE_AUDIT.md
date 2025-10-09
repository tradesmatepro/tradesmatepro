# Competitive Audit and Roadmap: How We Beat the Market

This document lists concrete, high‑impact upgrades to outperform competitor field‑service/contractor CRMs across UX, speed, automation, and trust. It’s organized by product areas with quick wins (2–4 weeks) and differentiated bets.

## Executive Summary (What Will Make Us Win)
- Instant clarity: consistent, fast list views with “export what you’re viewing” everywhere
- Superior quoting: CPQ-like quote builder, upsells, e‑sign, and conversion tracking
- Smart scheduling: crew sizing defaults from job requirements, automatic hour-splitting, travel-time aware planning
- Unified work order lifecycle: one form from quote → work order → invoice; status via safe RPCs
- Honest, powerful expenses: receipts, OCR, rules, budgets, approvals, and true reporting
- Timesheets at scale: bulk ops, quick filters (Today/This Week), kiosk/geo-fence options
- First‑class reporting: saved views → dashboards; profitability per job/project/customer
- Operational trust: strict RLS, audit logs, safe mutations (no PATCH-with-status), retries
- Speed: virtualized lists, background prefetch, tight indexes, cached settings
- Admin excellence: granular roles, feature flags, per‑company settings with sensible defaults

---

## Expenses (Beat Small Biz Accounting + Field Apps) ✅ COMPLETE
Quick wins ✅ IMPLEMENTED
- ✅ Receipt upload to Supabase Storage, public URL saved to receipt_url
- ✅ CSV import with mapping preview; de-duplication by amount/date/hash
- ✅ Category selector from expense_categories (done); Project linking (done)
- ✅ Filters that match export and summaries; totals bar for filtered set
- “Missing receipt” smart list + reminder nudges

Differentiators
- Receipt OCR: auto‑fill date, vendor, total, tax; confidence flags
- Rules engine: auto‑classify category/vendor/project; optional approval routing
- Budgets: per project/category monthly caps; burn‑down chart; alerts
- Billable/non‑billable workflows; convert selected expenses → invoice items
- Mileage tracker: rate tables, automatic trip detection (mobile)
- Multi‑currency + tax codes per company; export mappings to popular ledgers

Tech/DB
- Indexes: expenses(company_id, date), (company_id, project_id), (company_id, category)
- Storage folders: files/company-{id}/expenses/{expense_id}/{filename}

---

## Quotes (Must Beat Competitors)
Quick wins
- Template library with placeholders; per‑industry presets
- Versioning: track revisions with deltas; customer‑facing acceptance timeline
- E‑sign acceptance + audit trail; link to quote-to-work‑order conversion
- “Price book” inline search; margin guardrails and warnings

Differentiators
- CPQ light: options/alternates, good/better/best; dynamic bundles
- Upsell prompts from template analytics (what converts)
- Auto‑schedule suggestion on acceptance based on crew/skills availability

---

## Scheduling / Smart Assistant
Quick wins
- Default crew size based on job metadata; split total hours across crew
- Travel‑time hints from last/next job; simple route clustering by zip/geo
- Board views: Day/Week/Month with technician filters; capacity bars

Differentiators
- Skills/permit matching; overtime avoidance; commute‑aware assignments
- Auto‑rebalancing when jobs slip; “what‑if” simulation pane

---

## Work Orders (Unified Lifecycle)
Quick wins
- One form through the entire lifecycle (quote → work order → invoice)
- All status changes via dedicated RPCs (not PATCH fields) to satisfy DB triggers
- Checklists, parts, photos, notes; printable work order

Differentiators
- Mobile offline mode: capture labor/materials/photos; sync queue
- Safety/compliance templates; signatures from customer/tech

---

## Invoicing
Quick wins
- Respect invoice terms from settings/public_settings; dedicated Invoicing section in Settings
- Partial payments; automated reminders; payment links w/ status

Differentiators
- Deposits/retainage; progressive billing tied to milestones
- Batch invoicing from selected work orders/expenses; itemized mapping

---

## Timesheets (At-Scale Usability)
Quick wins
- Bulk approve/edit/delete; status chips; avatars
- Quick ranges: Today, This Week, Last Week, Custom
- Export exactly what’s filtered/sorted (match UI)

Differentiators
- Overtime rules per company; policy simulations
- Geo‑fence and kiosk mode; shift attestations

---

## Documents, Templates, and Messaging
Quick wins
- Central template manager; preview + variables; set defaults
- Message threads per entity; read receipts; attachments

Differentiators
- Omnichannel (SMS/Email) with verified sender; bounce tracking
- Document packets (quote+contract+safety sheet) in one send

---

## Reporting & Analytics
Quick wins
- Save filters as shared views; export matching those views
- Category & monthly expense reports (done); add customer/project profitability

Differentiators
- Dashboard builder from saved views; widgets (KPIs, tables, charts)
- Cohort reporting (acceptance time, collection time, rework rates)

---

## Settings, Roles, and Admin
Quick wins
- Role matrix: quotes/jobs/schedule/expenses/invoices/reports; read/create/edit/approve
- Feature flags per company; seed sensible defaults in public_settings

Differentiators
- Field‑level permissions; approval chains; audit log viewer

---

## Performance & Reliability
Quick wins
- Supabase queries: minimal select=, stable ordering, pagination; Prefer: count=exact when needed
- Virtualized tables for 1k+ rows; debounce inputs; cache settings
- Retries with backoff in supaFetch; central error boundary + toasts

DB
- Add missing composite indexes (noted above) and RLS tests for each table

---

## Developer Experience & Quality
Quick wins
- Unit tests for services (CRUD, RPCs) and reducers; smoke e2e for main flows
- Lint/type check in CI; pre‑commit hooks; error boundary snapshots

Differentiators
- Storybook for forms and tables; visual regression on key components
- Load testing on hot RPCs and heavy list pages

---

## Ten High‑ROI Quick Wins (2–4 weeks)
1) Expenses: Storage uploads + receipt_url (Phase 2.5)
2) Expenses: CSV import with mapping + dedupe
3) Quotes: template library, e‑sign audit trail, versioning
4) Scheduling: crew defaults + hour splitting (done in logic; expose UI)
5) Work Orders: RPC status changes; hide status fields from generic PATCH
6) Timesheets: bulk ops + export‑what‑you‑see
7) Reports: project profitability and expense budgets
8) Settings: dedicated Invoicing section, terms from settings/public_settings
9) Virtualized tables on large lists; query pagination + select hygiene
10) Error boundary + centralized supaFetch retry/backoff

## Big Differentiators (Bets)
- CPQ with option sets and upsell analytics
- Smart scheduling with skills, travel, and overtime avoidance
- Expense intelligence: OCR + rules + budgets + approvals
- Offline mobile work orders + sync queue
- Dashboard builder from saved views

## Guardrails (Trust > Features)
- Status mutations via RPCs; leverage DB triggers/validation
- Strict RLS reviewed per table; least‑privilege policies
- Derive all displayed counts from the same filtered arrays that render rows
- Safe defaults: no destructive actions without explicit confirmation modals
- Keep exports aligned with filter/sort state always

## Suggested Order of Execution
- P2.5: Expense uploads; Timesheets bulk/export; Invoicing settings; Virtualize big lists
- P3: Quotes CPQ, Reports profitability, Work Order RPCs
- P4: Smart Scheduling v2, Expense rules/budgets, Mobile offline

---

If you want, I can start implementing the “Ten High‑ROI Quick Wins” in sequence with PR‑sized commits and basic tests.

