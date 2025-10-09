# TradeMate Pro – Product & UX Audit (2025-10-06)

Author: Augment Agent (GPT-5)
Scope: Functional completeness, UX consistency, automations, competitive gaps vs Jobber, Housecall Pro, ServiceTitan. Security topics intentionally deferred per request.

---

## Executive Summary
TradeMate Pro has strong breadth (quotes, jobs, invoices, inventory, messaging, portal, PTO, marketplace) and a unified work_orders pipeline. Recent improvements tightened Active vs Closed jobs and introduced deposit enforcement and auto-invoice toggle. The core flow is close to industry standard but several mid/high-impact gaps remain around scheduling intelligence, progress billing, field execution (checklists/time/photos/signatures), and polished customer-facing experiences.

Top recommended next steps:
1) Scheduling intelligence v1: skills/capacity, travel-time aware routing, and overbooking prevention.
2) Field execution pack: per-job checklists, photos, time tracking, customer sign-off on completion, warranty capture.
3) Billing completeness: progress/partial invoices, deposits-to-balance automation, quick payment links, reminders sequences.
4) Quote excellence: price books, optional upsells, multi-version revisions, assemblies/kits, approvals with e-sign and deposit in one flow.
5) Customer portal polish: reschedule/confirm, pay deposits and invoices, request changes, ETA tracking.
6) Reporting & KPIs: closeout dashboards, labor/material margin, aging, conversion funnel, technician performance.

---

## Current Coverage (observed)
- Quotes: CPQ/QuoteBuilder, templates, PDF. Approval modal with deposit defaults. (src/components/QuoteBuilder.js, ApprovalModal)
- Jobs/Work Orders: statuses unified on work_orders; Active/Closed separation; auto-complete past-due; manual/assisted status transitions. (JobsDatabasePanel, JobsHistory)
- Scheduling: Smart Scheduling Assistant exists, deposit gating, scheduling pages. (SmartSchedulingAssistant, SchedulingSettingsTab)
- Invoices: numbering, terms, footer/content, reminders/late fee toggles, invoice items creation from work orders. (InvoicesService, InvoicingSettingsTab)
- Inventory: robust structure, barcode/QR, movements, locations, allocations. (src/components/Inventory/*)
- Messaging: internal messaging components present. (src/components/Messages/*)
- Customer Portal: jobs, quotes, invoices views; login and dashboard. (src/pages/CustomerPortal/*)
- PTO/Team: PTO dashboards/policies, employees, timesheets. (src/components/PTO/*, src/pages/Employees.js, Timesheets.js)
- Marketplace: request pipeline UI exists. (src/components/Marketplace/*)
- Settings: business and invoicing settings, developer tools, scheduling, marketplace settings. (SettingsService, SettingsUI)

---

## Gaps vs Competitors (priority-ordered)
1) Scheduling & Dispatch
   - Missing skills matrix and capacity planning per tech/crew.
   - No travel-time/cadence optimization or daily route planning.
   - No overbooking/blackout guardrails, limited multi-visit job modeling.
   - Limited customer scheduling windows (no SLA windows, buffer rules per job type).

2) Field Execution (Technician App behaviors)
   - No structured job checklists/QA steps tied to job types.
   - Limited time tracking per tech/job; no start/pause/stop timers with costing.
   - Photo capture before/after, annotated images, and parts usage confirmations are not prominent.
   - Customer signature at completion and automatic delivery of closeout package.

3) Billing Depth
   - Progress/partial invoicing (draw schedules), retainage, and change-order billing not fully integrated.
   - Deposit-to-balance automation (apply deposit, carry remaining to invoice) could be streamlined.
   - One-click payment links, embedded pay (ACH/card), auto-reminders sequences (D+3, D+7, D+14).

4) Quotes Excellence
   - Price books/tiers and assemblies/kits for fast CPQ.
   - Optional upsells and alternates; accept one of several options.
   - Revision history with compare and customer-visible change log.
   - Frictionless approval+deposit in one flow; dynamic terms based on project size.

5) Customer Experience (Portal)
   - Self-service reschedule/cancel within policy; confirm appointments.
   - Deposit and invoice payments in portal; saved payment methods.
   - Real-time ETA with technician tracking; proactive comms ("On our way", delays).
   - Multi-property accounts and approval chains for commercial.

6) Reporting & Analytics
   - Technician productivity (hours, first-time fix, revisits).
   - Job costing with labor/material/equipment rollups and margin.
   - Pipeline conversion (lead → quote → approved → scheduled → invoiced → paid).
   - A/R aging with cohort trends and promises-to-pay.

---

## Recommendations by Area

### Scheduling & Dispatch
- Implement skills matrix and job requirements mapping. Add capacity per tech/day.
- Integrate map/travel-time (Google Distance Matrix) for suggested schedule slots and route packs.
- Add overbooking guards; enforce working-hours, blackout days, and prep windows per job type.
- Model multi-visit jobs (visit count with dependencies) and recurring schedules.
- Expose customer windows (AM/PM/Exact), SLA targets, and automated “running late” notifications.

### Field Execution
- Add Checklists per job type: required steps, photos, and signatures. Store results on work_orders.
- Time tracking: technician timer per work order with role-based rates → auto cost.
- Materials usage: confirm pick/consume from inventory (commit → consume); offline scan support.
- Completion capture: photos, customer signature, warranty selection; generate closeout PDF and send.

### Billing & Payments
- Progress/partial invoicing and retainage; link each invoice to specific job phases/COs.
- Deposit automation: allocate deposit to final invoice; show customer the balance math.
- Payment links + hosted checkout (Stripe/PayPal/ACH). Auto-reminder sequences with templates.
- Add surcharges/tips options; apply convenience fees if enabled.

### Quotes & CPQ
- Price books with customer/segment-specific pricing; assemblies/kits.
- Option sets: Good/Better/Best with upsells. Customer selects in portal → auto-updates job scope.
- Revisions with diff; keep a clean approval trail. Embed e-sign + deposit in approval step.
- Approval rules: above threshold requires manager approval.

### Customer Portal
- Rescheduling flow with guardrails (min notice, blackout dates); show earliest available.
- Payments: deposit and invoice payments (cards/ACH), save cards, refund flow.
- ETA tracking: “Tech is on the way” with map and accurate window; delay updates.
- Multi-property management: property contact vs payer; approval chains.

### Inventory & Procurement
- Reorder thresholds → suggest POs; vendor lead times and preferred vendors.
- Committed vs available stock; backorders; automatic allocations for scheduled jobs.
- Costing method (avg cost); landing costs for POs; price variances.

### Reporting & BI
- Closeout dashboard: jobs completed, avg days to invoice, margin, warranty exposure.
- Technician scorecard: revenue/hour, callbacks, ratings, on-time arrival.
- Sales funnel: approvals %, win rate by service, avg deposit %, time-to-schedule.
- Finance: A/R aging pivots, DSO trend, write-offs.

### Developer UX & Consistency
- Shared components unify patterns (alerts, toggles, tables). Continue consolidating duplicates.
- Status enums usage consistency (lowercase job_status_enum etc.). Normalize filters and badges.
- Guard clause UX: consistent modals for cancel/reschedule/on-hold; one error style language.
- Add smoke tests for core flows and pin RLS behaviors where applicable.

---

## Automations (Rules Engine Roadmap)
- Job auto-complete sweep: end-of-day and hourly, with grace period. Already started; expand triggers.
- Auto-invoice on completion: implemented behind company setting; add reminder sequences.
- Auto-deposit requests on approval; auto-block scheduling until deposit paid (done).
- Customer comms: auto “appointment tomorrow”, “on our way”, “running late”, “thanks for your business”.
- SLA tracking: alert on breach risk; prioritize rescheduling.

---

## Data Model & Workflow Notes
- Work_orders as single source of truth: good. Ensure all transitions update timestamps (started_at, completed_at, invoiced_at).
- Deposits captured either at quote approval or pre-scheduling; reflect on work_orders for gating and invoice balance logic.
- Company_settings should hold operational toggles (require_deposit_before_scheduling, auto_invoice_on_completion, etc.).
- Minimize DB triggers; keep business logic in app; retain auditing timestamps in DB for integrity.

---

## UX & UI Consistency
- Status chips: active vs closed palettes consistent across Jobs/Invoices.
- Button hierarchy: Transfer/Edit secondary; Delete destructive; align with user’s prefs.
- Number inputs: avoid leading zeros; enforce overwrite-friendly behavior.
- Inventory action buttons: keep within item cards (user preference) across all tabs.

---

## Testing & Quality
- Add unit tests for scheduling guardrails (deposit-required, auto-invoice toggle on/off).
- Add integration tests: quote→approve(+deposit)→schedule→complete→invoice→pay.
- Snapshot tests for status chips and cards to prevent regressions.
- Lightweight Playwright journeys for portal: approve with upsell, pay deposit, reschedule.

---

## Prioritized Roadmap

### Quick Wins (1–2 weeks)
- Add skills/capacity fields to employees and job requirements on work_orders.
- Implement overbooking guards and blackout handling in SmartSchedulingAssistant.
- Add job completion pack: photos, signature, notes; generate closeout PDF.
- Portal: deposit payment, pay invoice link, basic reschedule flow.
- Reporting: Closed Jobs KPIs surfaced (already started), add aging and days-to-invoice chart.

### Near-Term (1–2 sprints)
- Travel-time aware scheduling and daily route suggestions.
- Technician timers and job costing rollups.
- Price books + assemblies/kits; optional upsells in quotes.
- Progress/partial invoicing with retainage and deposit-to-balance automation.

### Major (Quarter)
- Recurring jobs and multi-visit jobs with dependencies and routing.
- Full omnichannel messaging with templates and sequences.
- Advanced BI: labor utilization, margin analytics, cohort A/R trends.
- Mobile-first tech experience including offline capture for photos, notes, and timers.

---

## Implementation Pointers (file-level breadcrumbs)
- Scheduling intelligence: src/components/SmartSchedulingAssistant.js; src/components/SchedulingSettingsTab.js
- Field execution: add checklist/signature components and wire to JobsDatabasePanel and CompletionModal
- Billing: src/services/InvoicesService.js and creation flows in JobsDatabasePanel
- Portal: src/pages/CustomerPortal/*; wire deposit/invoice payment modals
- Reporting: src/pages/JobsHistory.js; create new src/pages/Reports/* widgets

---

## Final Notes
- The new auto-invoice toggle requires DB column `company_settings.auto_invoice_on_completion`. Migration file is prepared. Until applied, the UI save will show an error when toggling.
- Focus on customer-visible wins (scheduling, field execution, billing polish) to leapfrog common complaints with Jobber/Housecall/ServiceTitan while keeping schema stable.

