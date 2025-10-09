# TradeMate Pro Full Audit

Author: Independent SaaS Auditor (Trades/Construction)
Date: 2025-09-09
Scope: Database & Schema, Code Architecture, Feature Coverage vs Competitors, UX & Dashboard, Performance & Scalability, Security, Usability, and 90‑day Roadmap.

---

## 1) Database & Schema

- What’s wrong / risks
  - Company scoping and RLS: Some tables show company_id columns but repo lacks a verified, centralized RLS policy set in migrations. Risk of inconsistent tenant isolation across new tables (e.g., notifications, inventory_x tables). No clear, enforced “SCOPE_TABLES” parity at DB policy level.
  - Numeric precision: Monetary and quantity fields historically mixed (ints, floats). A cleanup migration exists to standardize many columns to NUMERIC(12,4), but this is partial and may not cover all finance-impacted columns (payments, purchase_orders, labor rates, taxes).
  - Index coverage: Recent migration adds several helpful indexes, but gaps likely remain (e.g., notifications(user_id, is_read), purchase_orders(company_id, status, created_at), timesheets(company_id, status, work_date)).
  - Naming clarity & legacy duplication: “settings”, “business_settings”, “company_settings”, plus a view (app_settings_v). Without authoritative ownership, drift and duplication will reappear. Same risk for “quotes” vs “work_orders (stage=QUOTE)” mapping.
  - Schema for planned features only partially present: PTO accrual ledger exists conceptually, but no fully specified accrual policies (anniversary vs monthly), carryover rules, or caps. Quotes Pricing module not fully normalized (tiers, bundles, rule engine). Tools/calculators are app-level only (no schema for saved presets/history/usage analytics).

- What could be improved
  - Make RLS/policies first-class: codify tenant isolation and per-role access across every table; include testable policy fixtures.
  - Finish finance normalization: Ensure all totals/taxes/discounts are NUMERIC(12,4), indexed, and computed consistently via triggers or server-side functions.
  - Authoritative settings surface: Move to a single canonical table or keep multiple but define a read-only materialized view and write-path rules; document precedence.
  - Add missing relations and FKs: e.g., notifications.related_id should reference specific entities where applicable; purchase_orders.vendor_id FK; schedule_events.work_order_id FK (migration adds column but likely missing FK).
  - Prepare for analytics: Add lightweight history tables (e.g., status_history per entity) or event tables for timelines.

- Competitor comparison
  - ServiceTitan/Jobber/Housecall Pro excel at multi-tenant safety, consistent financial precision, and robust reporting (indexes, history). They provide clean “settings” ownership and predictable read surfaces.

- Specific fixes (SQL)
```sql
-- Enforce RLS pattern (example for notifications)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY p_notifs_tenant ON notifications
  USING (company_id = auth.uid()::uuid) WITH CHECK (company_id = auth.uid()::uuid);

-- Core indexes (illustrative)
CREATE INDEX IF NOT EXISTS idx_notifications_company_user_read
  ON notifications(company_id, user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_po_company_status ON purchase_orders(company_id, status, created_at DESC);

-- Finance numeric consistency (ensure payments too)
ALTER TABLE payments ALTER COLUMN amount TYPE NUMERIC(12,4) USING amount::NUMERIC(12,4);

-- Purchase Orders: ensure FKs
ALTER TABLE purchase_orders
  ADD CONSTRAINT fk_po_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL;

-- PTO: accrual parameters table
CREATE TABLE IF NOT EXISTS pto_accrual_policies (
  id uuid default gen_random_uuid() primary key,
  company_id uuid not null,
  category_code text not null,
  accrual_frequency text not null, -- monthly|per_pay_period|anniversary
  hours_per_period numeric(6,2) not null,
  cap_hours numeric(6,2), carryover_hours numeric(6,2)
);
```

---

## 2) Code Architecture

- What’s wrong / risks
  - Technical debt surfaced by build: numerous unused imports/variables; many React hooks with missing dependencies; duplicate case label (IntegrationDrawer); brittle error parsing (e.g., parsing empty 204 JSON); newly added files increase bundle (+6.9 kB) without code-splitting.
  - Services drift: Notifications, Settings, and Purchase Orders services evolved rapidly; some deprecated methods still referenced (e.g., updateSettings fallback), creating hidden coupling.
  - Offline-first gaps: Android/web sync likely bypassed in places (direct fetch calls, no queued writes or conflict resolution strategy); caching patterns are ad-hoc (some in-memory caches, no shared cache abstraction).
  - Testing coverage: No visible unit/integration tests for critical calculators (quotes/pricing, PO totals, PTO accrual), nor for services (supaFetch adapters, policy checks) and error boundaries.

- What could be improved
  - Enforce ESLint rules and fix warnings systematically; adopt React Query (or equivalent) for caching, retries, and data consistency.
  - Introduce a domain service layer with strict DTOs and input validators (zod/yup) between UI and APIs.
  - Add code-splitting for large pages (Tools, QuotesPro, Invoices) and dynamic imports for heavy components.
  - Add error boundaries and a unified error envelope in services (normalize Supabase errors, include context and remediation).
  - Establish offline strategy: queue writes, conflict resolution policy (server-wins or merge), background sync, and local storage schema.

- Competitor comparison
  - ServiceTitan/Jobber run mature frontend architecture patterns: typed DTOs, query caching, code-splitting, and robust test harnesses. They ship fewer runtime warnings and rely on consistent error envelopes.

- Specific fixes (code)
```js
// Example: parse text safely from Supabase
const text = await resp.text();
const data = text ? JSON.parse(text) : null; // guard 204
return data;
```
```js
// React hooks: fix deps or use useCallback/useMemo
const load = useCallback(() => { /* ... */ }, [user?.company_id]);
useEffect(() => { load(); }, [load]);
```
```js
// Add code-splitting
const QuotesPro = React.lazy(() => import('../pages/QuotesPro'));
```

---

## 3) Feature Coverage vs Competitors

- What’s wrong / gaps
  - PTO Accrual: Request/approval exists; true policy-based accrual (frequency, caps, carryover) missing.
  - Quotes Pricing: Powerful UI but lacks a normalized rules engine (tiers, bundles, conditions, cost+markup, regional pricing).
  - Financial Integrations: No end-to-end QuickBooks/Xero sync flows (customers, invoices, payments, expenses). No posting state or sync audit.
  - Customer Portal: Basic portal/approvals not clearly present (payments, scheduling, document sharing, chat).
  - Mobile & Field Tools: Calculators exist but not tied to saved presets per company/tech; no field checklist/QA forms library.

- What could be improved
  - Ship an accrual engine with a ledger-based source of truth and scheduled accrual jobs.
  - Introduce a Quotes Pricing module with reusable components, assemblies, and rules (if/then, quantity steps, waste factors).
  - Add QB/Xero bi-directional sync, conflict strategy, and a Sync Center UI.
  - Build a modern Customer Portal (approve quotes, pay invoices, view schedule, upload photos, chat).
  - Make Tools first-class: store presets, attach to quotes/jobs, collect productivity analytics.

- Competitor comparison
  - ServiceTitan/Jobber/HCP offer customer portals, strong accounting integrations, and robust scheduling/dispatch.
  - Differentiators to pursue: superior quote calculators, configurable pricing rules, true PTO accrual engine, on-device offline tools with presets.

- Specific fixes
```sql
-- Quotes Pricing: core tables (sketch)
CREATE TABLE IF NOT EXISTS price_components (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null, name text not null,
  base_cost numeric(12,4) not null, markup_pct numeric(6,3) default 0
);
CREATE TABLE IF NOT EXISTS price_rules (
  id uuid primary key default gen_random_uuid(), company_id uuid not null,
  component_id uuid references price_components(id) on delete cascade,
  rule_expr jsonb not null -- e.g., {"if": {"sqft_gt": 500}, "then": {"markup_pct": 0.15}}
);
```

---

## 4) UX & Dashboard Layout

- What’s wrong / opportunities
  - Navigation is comprehensive but dense; module pages have varying visual polish and tile styles (some superb, others basic).
  - Role-based clarity: Admin vs employee views are not clearly separated (many pages import admin-only components by default).
  - KPIs: Dashboard KPIs exist but could be more actionable (e.g., AR aging tiles, job profitability, schedule utilization, low stock alerts, overdue approvals).

- What could be improved
  - Consistent “bold, colorful” tile design across all pages (as per product vision) with compact summaries and drill-down actions.
  - Role-based dashboards: Admin (financials, pipeline, staffing), Dispatcher (schedule load, SLAs), Tech (today’s jobs, parts, PTO status), Sales (quotes pipeline, win rate).
  - Global command palette improvements for quick actions (create quote/job/PO, log expense, request PTO).

- Competitor comparison
  - Competitors lead with highly curated role dashboards and visual status tiles. HCP excels at clear, friendly visuals.

- Specific fixes
```js
// Example KPI tile contract (unify shape across pages)
{
  id: 'ar_overdue', title: 'Overdue AR', value: '$24,300', trend: -8.3,
  color: 'red', onClick: () => navigate('/invoices?status=overdue')
}
```

---

## 5) Performance & Scalability

- What’s wrong / risks
  - Several read paths likely unindexed (notifications, timesheets, POs) under load.
  - No explicit caching layer or background jobs for heavy calculations (inventory rollups, PTO accrual, quote pricing scenarios).
  - Some views added (quotes_compat_v, inventory_stock_status_named_v), but no materialized views for heavy dashboards.

- What could be improved
  - Add targeted indexes for top queries; add composite indexes for company_id + status/date.
  - Background jobs via Supabase Edge Functions/cron for: overdue invoice scanner, inventory threshold alerts, PTO accrual, digest emails.
  - Materialized views for dashboard summaries; refresh on schedule.

- Competitor comparison
  - Competitors precompute heavy dashboards and send digests; they avoid slow list pages by indexing and caching.

- Specific fixes (SQL)
```sql
-- Timesheets and POs indexes
CREATE INDEX IF NOT EXISTS idx_timesheets_company_status_date ON timesheets(company_id, status, work_date);
CREATE INDEX IF NOT EXISTS idx_po_company_vendor ON purchase_orders(company_id, vendor_id);

-- Materialized view example
CREATE MATERIALIZED VIEW IF NOT EXISTS ar_aging_mv AS
SELECT company_id, customer_id, bucket, SUM(amount_due) total
FROM ar_aging_v GROUP BY 1,2,3;
```

---

## 6) Security

- What’s wrong / risks
  - Policies not clearly codified in repo for all tables; some new tables may lack RLS.
  - No visible audit log table or triggers for critical changes (status changes, amounts, approvals).
  - No explicit encrypted columns for sensitive PII or payment tokens stored server-side.

- What could be improved
  - Add baseline RLS policies and test fixtures; central policy patterns for company_id scoping and per-role overrides.
  - Add audit_log table + triggers for key entities; include user_id, before/after, reason.
  - Add support for MFA/SSO readiness (UI toggles, metadata in users table).

- Competitor comparison
  - Enterprise-focused tools (ServiceTitan) emphasize audit trails, SSO/MFA, and rigorous tenant isolation.

- Specific fixes (SQL)
```sql
-- Audit log
CREATE TABLE IF NOT EXISTS audit_log (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null, user_id uuid, entity text, entity_id uuid,
  action text not null, before jsonb, after jsonb,
  created_at timestamptz default now()
);
CREATE INDEX IF NOT EXISTS idx_audit_company_time ON audit_log(company_id, created_at DESC);
```

---

## 7) Usability

- What’s wrong / opportunities
  - Inconsistent tile visuals and form patterns across pages; some critical forms lack progressive disclosure or inline validation.
  - Bulk operations UX could be more prominent (timesheets, invoices, inventory moves).
  - Notification center was just upgraded; ensure consistency of icons, severity, and filters across the app.

- What could be improved
  - System-wide UI kit: standardized ModernCard/ModernStatCard/Toggle styles and spacing. Adopt compact table density with row hover actions.
  - “Smart Export”: everywhere list views export exactly what’s filtered/sorted.
  - Quick date filters (Today/This Week/This Month) everywhere.

- Competitor comparison
  - Jobber/HCP excel at approachable, consistent visuals; FieldPulse offers clean bulk actions and exports.

- Specific fixes (code/UX)
```js
// Smart export skeleton
const exportWhatYouSee = (rows, columns, sort, filters) => {
  /* apply same sort/filters as UI, then export CSV */
};
```

---

## 8) Suggested Fixes & 90‑Day Roadmap

- Prioritized fixes
  - ✅ Must-fix
    - Enforce RLS on every tenant table; ship audit_log + triggers.
    - Standardize monetary/quantity fields to NUMERIC(12,4) across payments/expenses/POs; add missing FKs.
    - Fix ESLint warnings and hook dependencies across core pages; add error boundaries and unify response parsing.
  - 🔧 Should-improve
    - Introduce React Query (or RTK Query) + code-splitting across heavy routes; implement a service DTO layer with zod validation.
    - Add targeted indexes for notifications, timesheets, POs; add materialized views for dashboard KPIs.
    - Establish offline-first abstraction: request queue, conflict policy, background sync.
  - 🚀 Nice-to-have differentiators
    - Quotes Pricing rules engine; saved Tools presets bound to quotes/jobs.
    - True PTO accrual engine with policies, caps, carryover and scheduled jobs.
    - Customer Portal v1 (approve/pay/schedule/chat/upload) and QB/Xero Sync Center.

- 90‑Day roadmap (Stabilize → Improve → Differentiate)
  - Phase 1: Stabilize (Weeks 1–4)
    - RLS policies + audit_log; backfill NUMERIC precision; add missing FKs.
    - Fix ESLint warnings, hook deps; add error boundaries; parse text safely for 204s.
    - Indexes for notifications/timesheets/POs; add schedule_events FK to work_orders.
  - Phase 2: Improve (Weeks 5–8)
    - Adopt React Query; code-splitting heavy routes; shared DTO + zod validators.
    - Background jobs (overdue invoice scanner, inventory threshold, PTO accrual, digests).
    - Materialized views for KPIs; unify settings via app_settings_v as canonical read surface.
  - Phase 3: Differentiate (Weeks 9–12)
    - Quotes Pricing rules engine v1 with components/bundles.
    - PTO accrual engine (policies UI, scheduled accruals, balance view).
    - Customer Portal v1 and QB/Xero Sync Center v1 (customers, invoices, payments).

---

## Appendix: Quick Snippets

```sql
-- Example RLS pattern for any table with company_id
ALTER TABLE some_table ENABLE ROW LEVEL SECURITY;
CREATE POLICY p_tenant ON some_table
  USING (company_id = auth.jwt() ->> 'company_id')
  WITH CHECK (company_id = auth.jwt() ->> 'company_id');
```
```js
// Service error envelope
function normalizeError(resp, context){
  return { ok: resp.ok, status: resp.status, context, message: resp.statusText };
}
```

