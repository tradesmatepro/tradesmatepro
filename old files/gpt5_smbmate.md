# SMBMate.com Strategic Audit & Market Research (GPT‑5)

A deep dive to adapt TradeMate Pro into a horizontal SMB platform while preserving a single shared backend.

---

## Executive Summary
- Decision: Expand from trades-only to horizontal SMB with smbmate.com front end.
- Feasibility: High. Current architecture (multi-tenant Postgres + React + permissions) generalizes well to SMB.
- Strategy: One backend, two branded frontends (domain/tenant-driven feature router). 85–90% shared code; 10–15% feature/terminology deltas.
- Outcome: Pursue domain-based routing + feature flags; launch SMBMate with “Projects-first” UX, keep trades optimizations on TradeMate Pro.

---

## Current App Deep Audit (What we have today)

### Architecture
- Frontend: React + Tailwind, modular pages, role-based navigation via `src/utils/simplePermissions.js` and context providers.
- Backend: Supabase/Postgres as primary DB (RLS ready, beta off), REST/RPC endpoints via `src/api/*` (Express-style routes), `supaFetch` utilities.
- Multi-tenant model: pervasive `company_id` scoping; audit logs; notification services present.
- Major domains implemented:
  - CRM: Customers, quotes, invoices, payments
  - Work/Jobs: Jobs, schedules, documents, attachments
  - Team/HR: Employees, PTO (ledger engine), timesheets, approvals
  - Finance: Invoices, aging reports, expenses, payroll (foundations)
  - Operations: Inventory, Tools (trade calculators), Messages (beta)
  - Settings: Company profile, business settings, integrations, service tags
  - Customer Portal: Quotes, new Service Requests flow
  - Service Matching: `service_tags`, `service_requests`, first-accept contractor logic

### Notable Strengths
- Clean multi-tenant schema; strong auditability and structured settings.
- Quote → Invoice → Payment flows exist and are extensible.
- PTO accrual engine and ledger approach are competitive for SMB HR.
- Inventory module UI and patterns are professional and reusable.
- Notification center foundations for cross-module alerts.
- New Service Requests system generalizes to “Project Requests.”

### Gaps/Risks (relevant to SMB)
- Trade-specific Tools page (4k+ LOC calculators) is verticalized; should be optional for SMB.
- Integrations catalog not yet broad (QB/Xero/Zapier breadth limited).
- Project management primitives (boards, sprints, dependencies) are light versus PM tools.
- BI dashboards are placeholder-level; SMB expects richer insights.

---

## What SMBs Need (Synthesis of market research)
- Core needs (horizontal):
  1) CRM + pipeline, 2) Projects/tasks, 3) Estimates/Invoices/Payments, 4) Calendar/scheduling,
  5) Time/expenses, 6) Documents/e-sign, 7) Reporting/BI, 8) Team/HR basics (PTO, timesheets),
  9) Notifications/automations, 10) Integrations (Accounting, Email, Calendar, Zapier).
- Pain points:
  - Fragmented stacks (multiple tools), high cost, data silos, slow setup, poor integrations.
- Differentiators we can lean on:
  - All-in-one suite with real-time backend, fast onboarding, strong auditability, modern UX.

---

## Keep vs. Filter vs. Add (Per module)
- Keep (universal for SMB + Trades):
  - Customers (CRM), Quotes/Invoices/Payments, Calendar, Documents, Notifications, PTO, Timesheets, Employees, Inventory (as optional), Customer Portal (rename flows), Settings, Service Requests (rename to Project Requests for SMB).
- Filter/rename for SMBMate:
  - Jobs → Projects; Work Orders → Tasks.
  - Service Requests → Project Requests; Contractor → Provider/Assignee.
  - Tools page → Business Tools (only universal calculators/converters; hide trade-specific).
  - GPS tracking & Mobile Field App → add-on only.
- Add for SMBMate (Phase 1–2):
  - Project Management views (Kanban/List/Calendar), task dependencies, assignees, checklists.
  - Simple marketing automation (emails, drip, lead capture forms).
  - Accounting integrations (QuickBooks/Xero) and bank feed sync via aggregator.
  - BI dashboards: Revenue, AR, Utilization, Project profitability, Sales funnel.
  - Templates library (proposals, SOW, contracts) with e-sign.

---

## Competitors & Positioning
- All-in-One Suites: Zoho One, Odoo, Bitrix24
  - Strengths: breadth, integrations. Weaknesses: complexity/UX overhead.
  - Our angle: cleaner UX, faster setup, opinionated defaults.
- CRM/Marketing: HubSpot, Pipedrive
  - Strengths: CRM depth, automations. Weaknesses: costly at scale, limited ops.
  - Our angle: full ops (projects, HR, invoicing) included at lower cost.
- PM Tools: Monday.com, Asana, ClickUp, Notion
  - Strengths: team collaboration, PM features. Weaknesses: lack billing/CRM/HR.
  - Our angle: full business suite, not just PM.
- Accounting-first: QuickBooks, FreshBooks, Wave
  - Strengths: accounting/billing. Weaknesses: weak CRM/PM/HR.
  - Our angle: single pane of glass with CRM/PM/HR natively integrated.

---

## Where competitors beat us (gaps to close)
- Integrations marketplace breadth and polished public API docs.
- Advanced PM features (dependencies, workload, Gantt).
- Out-of-the-box BI depth and embeddable dashboards.
- Polished marketing automation (journeys, attribution).

## Where we already win (today)
- Multi-tenant, audit-logged, real-time backend (Supabase) across CRM/PM/HR/Finance.
- Quote→Invoice workflows, PTO ledger engine, Inventory UX, Notification framework.
- Modern, consistent React/Tailwind UI and settings architecture.

---

## Routing Strategy: One Backend, Two Frontends
- Domain-driven branding + feature router; preserves one codebase.
- Inputs:
  - Domain (smbmate.com vs tradesmatepro.com)
  - Company flags (e.g., company.industry, plan tier)
  - User role/permissions (existing framework)
- Outputs:
  - Navigation shape, feature toggles, terminology map, theming.

### Proposed configuration primitives
- Brand context: { brand: 'TRADE' | 'SMB', theme, logo, copy }
- Feature flags: { projects, workOrders, tools.trade, tools.universal, gps, marketing, ecommerce }
- Terminology map: { jobs→projects, work_order→task, customer→client, contractor→provider }

### Minimal code sketch (concept)
```js
// pseudo: brand selection by host
const host = window.location.hostname;
const brand = host.includes('smbmate') ? 'SMB' : 'TRADE';
const flags = brand === 'SMB' ? smbFlags : tradeFlags;
```

---

## SMBMate IA (Information Architecture)
- Navigation (SMB default):
  - Dashboard
  - Projects (Kanban, List, Calendar)
  - Sales (Leads, Deals, Quotes, Invoices)
  - Finance (Aging, Expenses, Payments)
  - Team (Employees, Time, PTO)
  - Operations (Documents, Inventory [opt], Automations)
  - Marketing (Campaigns, Forms, Contacts)
  - Settings (Company, Integrations, Templates)

---

## Phased Rollout Plan
- Phase 1 (0–6 weeks): Routing + IA + terminology; hide trade tools; Projects basic board; SMB theming; QB/Xero read-only sync; core BI tiles.
- Phase 2 (6–12 weeks): Marketing basics (emails, forms), PM depth (dependencies, workload), BI dashboards, e-sign templates, Zapier.
- Phase 3 (12–24 weeks): Marketplace integrations, ecommerce connectors, advanced analytics, mobile polish.

---

## Pricing (initial hypothesis)
- Starter: $49/mo (up to 5 users) – CRM, Projects, Quotes/Invoices, Docs, Time, Basic BI.
- Pro: $99/mo (up to 15 users) – +Marketing, Integrations, Advanced BI, Inventory.
- Business: $199/mo (up to 50 users) – +Multi-location, SSO, Priority Support.

---

## Concrete Next Steps (low lift, high impact)
1) Add BrandRouter and FeatureFlags contexts; domain-based brand selection.
2) Terminology map utility; wrap UI labels through mapper.
3) Split Tools into universal vs trade-only; show universal in SMB.
4) Add Projects board page (reuse Scheduling/Jobs primitives for MVP).
5) Create SMB theme (logo/colors) and landing content.
6) Draft integrations plan (QB/Xero, Google/Microsoft Calendar, Zapier).

---

## Risks & Mitigations
- Scope creep → Phased delivery with strict acceptance criteria.
- Integration effort → Start with read-only, expand to writes.
- Performance at scale → Monitor Postgres indexes; add queues for heavy jobs.
- Positioning confusion → Clear brand messaging per domain; onboarding wizard chooses industry.

---

## KPIs to Track
- Activation (first project, first invoice), time-to-value (<1 day), weekly active users, feature adoption by module, NPS, churn, ARPU, integration attach rate.

---

## Conclusion
We can ship SMBMate rapidly with minimal code churn by leveraging domain-driven routing, feature flags, and terminology mapping. The backend already exceeds many horizontal competitors. Focus the first release on Projects+CRM+Billing with clean UX and a strong pricing story, then iterate on marketing, BI, and integrations.

