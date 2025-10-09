# TradeMate Pro — Missed Opportunities Deep Dive & Action Plan

Last updated: 2025-09-10

## Executive summary
TradeMate Pro is positioned to be the contractor platform that’s fast, affordable, and complete. We already lead in several areas (inventory, purchase orders, trade tools) but competitors still beat us on a few core workflows (customer portal, mobile field app, GPS/routing, marketing automation). Below is a comprehensive deep dive you can use as a checklist: what we have, where we fall short, what competitors offer, what the market actually wants, and a concrete plan to close every gap.

---

## What we currently have (from codebase review)

Core platform:
- Companies, Users (roles: admin/tech/dispatcher/client), Authentication
- Customers (enhanced addresses & profile), CRM pages
- Unified Work Orders (quotes → scheduled work → invoicing) paradigm
- Quotes (QuotesPro), Quote Builder, Item library (optional), Document templates
- Invoices, Payments (tracking), Aging report
- Calendar & Scheduling (basic), Jobs pages (UI around work orders)
- Inventory (items, locations, movements, transfers, alerts, diagnostics)
- Purchase Orders (creation, items, receiving, vendor integration)
- Vendors (stats, performance scaffolding), Spend analytics
- PTO & Timesheets, Payroll pages, Admin approvals
- Documents/Cloud storage, File manager
- Messaging (internal), Notifications center
- Reports (basic/aging/advanced), Dashboard tiles
- Settings (business/company, invoicing, rates/pricing, scheduling/security)
- Tools page with many trade calculators (HVAC/electrical/plumbing etc.)
- Integrations scaffolding (Google Calendar, QuickBooks hooks), Automation page (early)

Recent improvements (in repo):
- Advanced PO workflow: approval thresholds, notifications (service), budget indicators, vendor catalog view
- Inventory UI/UX cleanups, receiving interface, add-from-inventory

---

## Market expectations vs competitors (what pros compare us against)

Competitor reference set: ServiceTitan, Jobber, FieldEdge, Housecall Pro, Simpro/BuildOps (commercial), Procore (construction, less SMB-trades focused).

Common strengths they market:
- Customer portal (approve/accept, payments, history, scheduling)
- Mobile field app (offline, photos, signatures, forms, parts lookup)
- GPS/route optimization & live ETAs to customers
- Automated communications and marketing (review requests, reminders)
- Estimates with dynamic catalogs and pricing updates
- Integrations to accounting (QuickBooks), payments, phone/SMS

Common contractor pain points from forums/interviews:
- Too expensive (ServiceTitan $300+/user/mo), long contracts
- Complexity and training overhead for office and techs
- Weak offline support and slow mobile experience
- Disconnected customer experience (approve/pay/schedule not seamless)
- Inventory and PO features are often shallow for real-world parts flows

---

## Opportunity checklist (Have / Partial / Missing)

Customer experience:
- Customer portal (approve quotes, sign, pay, see history, request service) — Missing
- Online scheduling (customer-facing) — Partial (CustomerScheduling page exists; needs integration + portal UX)
- Payment links & saved cards in portal — Missing

Field operations (mobile-first):
- Native mobile field app (offline-first jobs/quotes/photos/signatures) — Missing
- GPS tracking, route optimization, live ETAs to customer — Missing
- Job forms/Checklists (safety, QA, custom forms) — Partial (templates exist, needs mobile + completion tracking)

Sales & estimating:
- AI-assisted estimating (photo-to-scope, smart parts lookup, assemblies) — Missing
- Dynamic pricing from vendor catalogs; price intelligence — Partial (vendor items/pricing history views started)
- Proposal templates with options/financing upsells — Partial

Scheduling & dispatch:
- Drag & drop dispatch board with capacity planning — Partial
- Auto-assign by skills, territory, parts availability — Missing
- Real-time traffic-aware routing — Missing

Inventory & purchasing:
- Multi-location, reorder points, transfers, receiving — Have (strong)
- Job/site allocation & returns (truck/van stock accuracy) — Partial
- Supplier integrations (live price/availability, e-ordering) — Missing
- PO approvals & budgets — Have (strong, recent work)

Financials:
- Invoicing (templates, taxes, deposits, partials) — Partial/Having
- Payments (cards/ACH in-app, surcharges) — Partial (tracking yes; processing integration TBD)
- Profitability by work order/tech/customer (live P&L) — Partial

Communications & marketing:
- Automated SMS/Email (appt reminders, on-my-way, follow-ups) — Partial
- Review generation & referral engine — Missing
- Campaigns (seasonal tune-ups, membership renewal, estimates not sold) — Missing

Contracts & compliance:
- Service contracts/memberships (tiers, benefits, renewals) — Partial
- Warranty management (equipment/component warranty tracking) — Missing
- Photo/Signature capture (legal) — Partial (web), Missing (mobile offline)

Analytics & BI:
- Executive dashboard (booked vs capacity, AR, close rate) — Partial
- Inventory & vendor spend analytics — Partial/Have
- Technician productivity & first-time-fix rate — Missing
- Marketing ROI analytics — Missing

Integrations:
- QuickBooks Online (bi-directional, items, taxes) — Partial (stubs)
- Payments (Stripe/Square) — Missing
- Phone/SMS (Twilio), GPS (Samsara, Fleet) — Missing
- Manufacturer/equipment data, warranty APIs — Missing

Security, performance, admin:
- Role-based permissions/granular module access — Partial/Have
- Audit trails (quotes, POs, inventory, PTO ledger) — Partial/Have
- Offline resilience (mobile) — Missing

---

## Where we already win (our differentiators)
- Inventory depth and ergonomics (multi-location, diagnostics, transfers)
- Purchase Orders with budget checks and approval workflows
- Trade Tools/Calculators breadth right inside the app
- Price/value ratio — powerful system at SMB-friendly cost
- Simpler, faster UI than big legacy tools (once modules are unified)

---

## High-impact gaps to close (ranked)
1) Customer portal (approval, e-sign, pay, schedule)
2) Mobile field app (offline-first, quotes/jobs/photos/signatures)
3) GPS + route optimization + live ETA sharing
4) Payments integration (cards/ACH; links in quotes/invoices/portal)
5) Automated comms & marketing (review requests, reminders, unsold estimates)
6) AI estimating (assemblies, photo-to-scope, catalog lookup)
7) QuickBooks bi-directional sync (items, taxes, customers, invoices, payments)
8) Job allocation to inventory with truck/van stock & returns
9) Supplier price/availability + e-ordering (via vendor APIs or EDI)
10) Profitability dashboards (by work order/tech/customer; live P&L)

---

## Action plan (phased roadmap)

Phase 1 (0–90 days): Fundamentals & revenue wins
- Customer Portal v1: quote accept/e-sign/pay, appointment request, history
- Payments: Stripe (cards/ACH), payment links on quotes/invoices/portal
- Mobile Web Enhancements: PWA shell, offline cache for work orders + photos (stepping stone to native)
- Automated Comms v1: appointment reminders, on-my-way, review requests
- Dispatch UI upgrade: better board, filters, capacity snapshots

Phase 2 (90–180 days): Operational excellence
- Native Mobile App v1 (React Native): jobs, photos, signatures, parts lookup; offline sync
- GPS & Routing: tech location feed + Google Directions API, basic optimization, live ETA SMS
- QuickBooks Online: robust bi-directional sync (customers, items, invoices, payments)
- Inventory allocations: job/site allocations, van stock minimums, returns to stock

Phase 3 (6–12 months): Competitive moats
- AI Estimator: image-based takeoffs, assemblies, suggested upsells, quote options
- Supplier integrations: live pricing/availability; 1-click reorders; map to inventory SKUs
- Profitability & BI: live P&L, technician productivity, first-time-fix, marketing ROI
- Contracts/Memberships: tiers, auto-renewals, benefits application on quotes/jobs

Phase 4 (12–18 months): Category leadership
- Route optimization v2 (skills, parts, time windows, learned durations)
- Warranty management (equipment-level), manufacturer API integrations
- Phone/SMS integration (Twilio) + call tracking attribution
- IoT/Telematics pilots (refrigeration/HVAC sensors; fleet GPS)

---

## Engineering plan of record (EPOR)

Architecture directives:
- Keep unified data model around work_orders for pipeline; avoid duplicate legacy tables
- No hardcoded values — pull from DB; maintain RLS-off beta simplicity
- Prefer serverless functions for payroll/approvals/integrations with audit trails
- Package manager installs only; avoid manual edits to lockfiles

Technical epics (linked to phases):
- Portal v1: portal_auth, portal_sessions, portal_activity; public views + tokenized links
- Payments: payments_providers, payment_intents, webhooks; link to invoices/quotes
- Mobile v1: RN app, offline store, background sync, photo queue, signature pad
- GPS/Routing: device location ingestion, directions matrix, ETA messaging
- QBO: sync jobs with conflict resolution + logs; scheduler + replay
- AI Estimating: image upload pipeline, model integration, assembly library, price rules
- Supplier Connect: vendor_items normalization, price cache, e-order API adapters
- BI: summary views (material margin, labor margin), data mart, dashboard APIs

---

## Success metrics
- Portal adoption: >80% of quotes accepted via portal by month 3
- Payments time-to-cash: reduce DSO by 30%
- Technician drive time: -25% by month 6
- Quote cycle time: -70% with AI Estimator by month 12
- First-time-fix rate: +15% with parts allocation + checklists
- ARPU: grow from ~$50 → $90 (Phase 2) → $120 (Phase 3)

---

## Immediate backlog (first 6 sprints)

Sprint 1–2
- Portal v1 (accept/e-sign/pay + service history)
- Stripe integration (quotes/invoices/portal)
- Dispatch board QoL (filters, bulk actions, quick reassign)

Sprint 3–4
- PWA offline cache for work order details + photo queue
- Automated comms v1 (reminders, on-my-way, reviews)
- QBO sync baseline (customers, invoices → payments)

Sprint 5–6
- RN app shell + auth + offline store
- GPS ingest + basic ETA SMS
- Job inventory allocations + returns

---

## Why we win
- We’re building the missing 20% contractors actually feel every day (portal, mobile, routing, marketing) while keeping our 60% price advantage.
- We already excel where others are weak (inventory + POs + tools). Combining both = category leadership.

---

## Callouts (accuracy & schema notes)
- Our work pipeline is centered on `work_orders` (not `jobs`); maintain consistency end-to-end.
- Keep PTO ledger/audit never-deletes policy.
- Avoid JSON fallbacks for core model fields; keep relational schema clear and queryable.

---

## Owner’s short list (do these first)
1) Ship Customer Portal v1 with payments
2) Spin up React Native app; deliver offline jobs + photos + signatures
3) Deliver basic GPS + ETA + route batch
4) Turn on automated comms (reminders, reviews)
5) Harden QBO sync; then start AI Estimator groundwork

