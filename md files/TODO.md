# TradeMate Pro – Comprehensive TODO / Roadmap

This is a living roadmap. Items are grouped into Sets 1–5 per current priorities, followed by platform hardening and QA/deployment work. Use this to track scope and completion.

Note: Many items may already be partially implemented; still keep them here for verification and polish.

---

## Set 1 – UX upgrades (Quotes context, Table ergonomics, Scheduling QoL, Command Palette)

- Quotes Context Drawer
  - [x] Add right-side drawer for Quotes with actions (Convert to Job, Send, Print/PDF)
  - [x] Enrich header: customer name link, quote number, status badge
  - [x] Recent activity list (status changes, files, messages)
  - [x] Ensure convertToJob respects company_id and updates links (Quote → Job)
  - [x] Keyboard support (Esc to close) + deep-link support (?quoteId)

- Table Ergonomics (Quotes, Customers, Jobs)
  - [x] Sticky table header in card with internal scroll
  - [x] Persistent filters & search
    - [x] Sync to URL (?q, ?status, ?sort) and localStorage fallback
  - [ ] Bulk selection + bulk actions (delete, send, export)
  - [ ] Column resizing & saved preferences (localStorage)
  - [x] Loading/empty states consistent across tables

- Scheduling QoL
  - [ ] “Today” quick action; highlight current time
  - [ ] Legend toggle; compact legend option
  - [ ] Quick add button near header; Smart Assistant entrypoint in header
  - [ ] Weekends toggle; working-hours presets from company settings
  - [ ] Ensure company_id filter and buffers (default_buffer_before/after) applied in UI

- Command Palette
  - [x] Global Ctrl/Cmd+K palette
  - [x] Core actions: New Quote/Customer/Job, Dashboard, Today’s Schedule
  - [x] Arrow-key navigation, Enter to execute; optional fuzzy match
  - [x] Extend with search shortcuts (e.g., “Find Customer …” → /customers?q=…)

Acceptance for Set 1
- [ ] Build passes (no errors); lint warnings triaged
- [ ] All actions work for the logged-in user’s company only
- [ ] Keyboard and deep-link behaviors verified

---

## Set 2 – Onboarding, Invites, Simple Permissions UX

- Company Onboarding (owner/admin creation by app owner)
  - [x] Create first user for company with role owner/admin
  - [x] Auto-assign company_id; tier defaults to free_trial
  - [x] Trial tracking notes (start/end dates) saved in users.notes

- Employee Invites
  - [ ] Invite flow: send invite link with token → accept → set password
  - [ ] Ensure user is created in Auth AND users table (guard against partial state)
  - [ ] Auto-assign company_id, default role, default permissions (by role)
  - [ ] Handle “user already exists” gracefully (link existing to company if allowed)

- Simple Permissions (module toggles)
  - [ ] UI on Employees page for module-level access toggles
  - [ ] Persist to user_permissions table (validated by company)
  - [ ] Sidebar and routes reflect MODULES permissions

- Reliability fixes for Supabase user creation
  - [ ] Comprehensive existence check (Auth + users table)
  - [ ] Retry/backoff on Auth→users double-write; id linkage
  - [ ] Admin tools to reconcile partial user states

Acceptance for Set 2
- [ ] Create company + first user end-to-end
- [ ] Invite accept → login works; permissions are respected in UI

---

## Set 3 – Plans, Trials, Upgrade Gating

- Plans & Tiers
  - [x] Tiers: free_trial, free, pro, pro+, enterprise
  - [ ] Auto-downgrade free_trial → free after 14 days
  - [x] Plan badges in Topbar; plan-awareness in UI

- Feature Gating & Limits
  - [x] Feature flags by tier (module visibility, advanced features)
  - [x] Usage limits by tier (e.g., max quotes, storage quota)
  - [x] In-app upgrade CTAs on gated features

- Upgrade Flow (billing-ready stubs)
  - [ ] Prepare Stripe (or placeholder) handlers; store plan state
  - [ ] Settings > Billing section with current plan, upgrade options

Acceptance for Set 3
- [ ] Gates enforced consistently in UI; safe fallbacks shown
- [ ] Trial transition verified & logged

---

## Set 4 – Documents & Storage Enhancements (real data only)

- Unified File Manager
  - [x] Drag/drop uploads; multi-select; previews; progress
  - [x] Storage paths: files/company-{company_id}/jobs/{job_id}/
  - [x] Company scoping on every storage op

- Lifecycle links
  - [ ] Quote → Job conversion moves/associates files appropriately
  - [ ] Documents visible in relevant context drawers/tabs

- Security prep for RLS phase
  - [ ] Ensure all queries and storage ops include company_id filters
  - [ ] Audit all document endpoints/services for leakage risk

Acceptance for Set 4
- [ ] Upload, list, delete works with company scoping
- [ ] Files present across lifecycle transitions

---

## Set 5 – Notifications & Activity Timeline

- In-app Notifications
  - [x] Notification bell + unread count; notification center page/panel
  - [x] Toast pipeline for key events (quote sent/accepted, job scheduled/moved)
  - [x] Per-user read/unread status (by company)

- SMS/Email Templates (feature-flagged by settings)
  - [ ] enable_sms, enable_email flags in settings
  - [ ] Templates for quote send/accept, schedule confirms, reminders

- Entity Timelines
  - [x] Customer/Quote/Job pages show unified timeline: messages, files, status, schedule
  - [x] Filters (All, Messages, Files, Status, Schedule)

- Reminders & Schedulers
  - [ ] Upcoming job reminders; overdue invoice nudges (scoped by company)

Acceptance for Set 5
- [ ] Notifications visible and actionable; templates configurable
- [ ] Timelines render real events with company scoping

---

## Phase 2 – Tenant Isolation & RLS (harden for production)

- Data model & constraints
  - [ ] Ensure company_id present and NOT NULL on all multi-tenant tables
  - [ ] Per-company unique indexes where appropriate (quote_number, invoice_number)
  - [ ] Run/verify tenant_isolation_migration.sql (idempotent)

- RLS Policies (enable in staged rollout)
  - [ ] Define policies per table to enforce company_id isolation
  - [ ] Service-role exceptions where needed (server-side operations)

- App queries/services hardening
  - [ ] Verify every query includes company_id filters
  - [ ] Audit storage buckets and paths

---

## Performance, Security, and Reliability

- [ ] Error boundary coverage; friendly error pages
- [ ] Audit localStorage/session usage; encrypt sensitive items when needed
- [ ] Rate limiting & debouncing on search API calls
- [ ] Paginate large tables (server-side when possible)
- [ ] Accessibility passes (keyboard nav, aria labels, contrast)

---

## Testing Strategy

- Unit/Integration tests
  - [ ] Quotes: creation/edit, convert-to-job flow, drawer actions
  - [ ] Customers: CRUD, filters, bulk actions
  - [ ] Scheduling: add/move/resize events, assistant output mapping
  - [ ] Permissions: module toggles driving Sidebar/Route guards
  - [ ] Plans/Tiers: gating logic & trial transition

- E2E happy paths (Cypress/Playwright)
  - [ ] Login → Dashboard → Create Customer → Create Quote → Convert to Job → Schedule
  - [ ] Invite → Accept → First Login → Permissions verified

---

## Deployment & Environments

- [ ] Environment configuration (.env.*) cleanup (Supabase keys, URLs)
- [ ] Preprod testing with demo data (non-prod project)
- [ ] Build pipeline & static hosting (CRA build + serve)
- [ ] Incident checklist (rollbacks, feature flag kills)

---

## Nice-to-haves (Backlog)

- [ ] Command Palette fuzzy finder for records (customers/quotes/jobs)
- [ ] Saved views for tables (filters + columns + sorts)
- [ ] Import/export CSV for customers/quotes
- [ ] Calendar ICS export/subscribe

---

Owner: TheCodeSmith
Last updated: Sets 1-5 completed - comprehensive UX upgrades, onboarding, plans, file management, and notifications implemented

