# Elara – Full Audit and Gap Report (Prep for Part 10: Swarm)

Author: AI System Auditor/Architect
Date: Current

---

## Executive Summary
Elara has strong foundations: Electron + React UI, offline-first with LM Studio, unified logging, file IO, error capture, indexing, and model routing with offline/online toggle and fallback. To reach parity with top AI dev tools (Cursor, Claude Desktop, Studio AI) and to lead in multi-agent orchestration, Elara should: tighten wiring in a few places, add first-class repo-native workflows (Git-aware edits, tests/linters, code review UX), deepen context and visualization (schema/dep graphs), and formalize a swarm role framework with guardrails and observability.

---

## Wiring / Integration Audit Snapshot
Status of critical IPC channels and UI bindings based on code review:
- LLM IPC (ok): llm:test-connection, llm:send-message, llm:send-streaming-message, llm:send-streaming-with-files, llm:get-models, llm:set-model; Router enforces mode and fallback.
- Settings IPC (ok): settings:get, settings:update, settings:set-mode, settings:get-status, settings:set-supabase, settings:set-safe-mode.
- Preload exposure (ok): settings.*, security.*, analytics:get-stats, errors.*, execution.*, files.*, etc. Security IPC present (store/get secret).
- SQL execution (ok): supabase:run-sql respects Safe Mode (returns dry_run), sql file runner channels exist.
- Error capture (good): structured capture with logs/errors JSONL + UI stream; OCR toggle present (optional dep).
- Indexing/context (present): indexer + context_resolver services, ContextPanel UI, dependency extraction, intent resolution stubs.
- Analytics (present): analytics:get-stats IPC and preload exposed; SettingsPanel queries it.

Minor wiring/UX issues discovered:
- SettingsPanel JSX has a slightly awkward Supabase header section order (icon div separated from title). Cosmetic only; no runtime impact.
- SettingsPanel uses analytics.getStats (wired) and security.storeSecret (wired). OK.
- Developer Mode toggle exists, but LogsPanel/ChatPanel don’t yet conditionally reveal raw prompts/diffs. Action item below.
- Chat flow attachment metadata line ("Attached files") not yet surfaced in UI. Action item below.

Action items:
- [P1] Tidy SettingsPanel Supabase header block (move title into the header div for consistency).
- [P1] Wire Developer Mode to expose raw prompts, router decisions, and applied diffs in LogsPanel/ChatPanel.
- [P1] Show “Attached context” inline chip in Chat when context_resolver attaches files.

---

## 1) Core Capabilities vs Missing Pieces
What Elara does well now:
- Offline-first LLM via LM Studio; Online mode with auto-fallback to offline.
- Unified LLM router abstraction for sync + streaming.
- File scanning, read/write, and project indexing with dependency extraction and table discovery.
- Structured logging pipeline (logger + log_manager) and error capture (JSONL + UI).
- SQL execution with Safe Mode (dry-run guards) + per-run logs.
- Execution runner with real-time event relays.
- Context panel to visualize index and decisions; intent resolution stubs.
- Settings persistence (encrypted secrets via SecurityManager) and IPC surfaces.

Missing for parity with leading tools (Cursor, Claude Desktop, Studio AI):
- Git-native workflows: stage/preview patch, commit message generation, branch/PR helper, inline diff review.
- Test runner and linter integration: minimal commands per language, quick-fail loop and surfacing failures with stack trace to context resolver.
- Deep code navigation: symbol index, references, rename, and inline code actions.
- Prompt engineering workspace: system prompt templates per role/task, prompt versioning, quick A/B.
- Inline editing UX in editor surface with AI code actions (apply part of patch, reject, comment).
- Semantic search embeddings for repo-scale recall (offline option preferred).
- Model/tool selection policy per task type (e.g., small model for lint-fixes, larger for design/migrations).
- Structured runbook for “Fix Loop”: checklist of phases with timeouts, retries, backoff, and rollback plan surfaced in UI.

Nice-to-have (accelerators):
- Partial AST-aware edits (minimize diff blast radius).
- Ephemeral sandbox runs (temp worktree, selective apply to main tree on acceptance).
- Prompt/run cost insights and token health (even for offline usage, useful heuristics).

---

## 2) Competitor Comparison
High-level features (✓ present, — missing, ★ Elara advantage opportunity)

| Feature | Elara | Cursor | Claude Desktop | Studio AI | Notes |
|---|---|---|---|---|---|
| Offline LLM | ✓ | — (cloud-first) | — | — | Strong differentiator today |
| Online fallback/auto-switch | ✓ | ✓ | ✓ | ✓ | Elara’s router has auto-fallback; extend policies |
| Repo indexing | ✓ (imports, SQL tables) | ✓ (rich) | ✓ (smart) | ✓ | Add symbols/embeddings for parity |
| Context resolver | Partial | ✓ | ✓ | ✓ | Add multi-signal ranking, auto-attach preview |
| Error capture/OCR | Partial | — | — | — | ★ OCR pipeline can be an edge |
| SQL runner / hybrid fixes | ✓ | — | — | — | ★ Deep hybrid code+DB ops niche |
| Git-native flow (diff/PR) | — | ✓ | ✓ | ✓ | Add stage/commit/PR |
| Test/Lint integration | — | ✓ | ✓ | ✓ | Add minimal harness per language |
| Inline edit UX | Partial | ✓ | ✓ | ✓ | Add editor-level apply/reject UI |
| Multi-agent orchestration | Planned | Partial | Partial | Partial | ★ Lead with Swarm framework |
| Visual graphing (schema/dep) | Partial | Partial | Partial | Partial | ★ First-class visualizations |

Where Elara can leapfrog:
- Swarm orchestration with explicit roles and supervisor.
- Hybrid “code + SQL” transformation workflows with guards, migration plans, and rollback.
- OCR-assisted runtime error parsing and auto-heal.
- Offline semantic search (local embeddings) for privacy-first shops.

---

## 3) High-Value Opportunities
1) Swarm Orchestration (best-in-class target)
- Roles: Builder, Critic, Supervisor, Toolsmith, Schema Specialist, Runtime Watcher.
- Supervisor policies: route tasks by type, retry logic, escalation (online model if offline fails), cost/time caps.
- Shared memory: structured case file (problem, context slices, decisions, patches, SQLs, validations).

2) Hybrid Code+SQL Fixing
- Schema-aware prompts (pull live schema via pg/introspection), generate migrations with pre-checks and post-verify queries.
- Auto-rollback plans and "safe mode gate" interactions before execution.

3) OCR/Error-Driven Auto-Heal
- OCR text → error normalization → stack-frame mapping → targeted patch proposals.
- Loop telemetry: where discovery failed, attach logs+context slices to subsequent attempts.

4) Context Intelligence
- Offline embeddings & symbol index; fusion of signals: stack traces, deps, recency, file size, git blame.
- Tight token budgeting: prioritize small diffs/snippets + expandable on demand.

5) Observability & Reproducibility
- Dev Mode view: raw prompts, diffs, router decisions, cost/time per phase.
- Replay exact runs (frozen prompts + artifacts + environment summary).

---

## 4) Big Picture Gaps
- Visual schema diagrams (SQL):
  - Generate ERDs from live DB introspection; SVG/mermaid with drill-through to DDL.
- Dependency graphs (code):
  - Module graph with hotspots; impact estimates for patches.
- Smart context routing:
  - Policy: small model for local refactors; larger model for architectural changes/migrations.
- Supervisor agent for multi-LLM control:
  - Central planner with role assignments, SLAs, fallback tiers (offline → online), and guardrails.
- Git-aware lifecycle:
  - Stage/commit/branch/PR; AI-authored commit messages; safety checks before merge.
- Test/Lint harness:
  - Minimal adapters per ecosystem; surface failures to context resolver automatically.

---

## 5) Deliverables for Part 10 Prep
A) Swarm Role Map (initial)
- Supervisor: Plans, assigns roles, sets policies, enforces safe mode gates.
- Builder: Proposes code/SQL patches with minimal diffs.
- Critic: Reviews patches, requests context, proposes tests/safety checks.
- Toolsmith: Handles file ops, git ops, test/lint runs; returns artifacts/logs.
- Schema Specialist: Introspects DB, proposes migrations, verification queries, rollback.
- Runtime Watcher: Monitors execution, parses errors (incl. OCR), feeds structured errors.

B) Integration Targets
- OCR: tesseract.js (optional, ask before install). Hook into error_handler pipeline.
- DB Introspection: pg_dump / pg_catalog / pg_graphql (no external deps required to start). Generate ERD via Mermaid.
- Schema Visualizer: Mermaid ERD; render in a new SchemaPanel.
- Code Graph: existing dependency_graph + module graph visual; integrate in ContextPanel.
- Embeddings: local CPU embedding model (optional install) with a pluggable provider.
- Git: simple wrappers for status/diff/add/commit/branch/PR (use CLI; guard with dry-run preview).
- Test/Lint: language detection → standard commands (e.g., npm test, pytest -q); dry-run preview + logs to UI.

C) Execution Plan (phased, 1–2 day slices)
1. Wiring polish + Dev Mode surfacing (P1)
   - Add Dev Mode views (prompts, diffs, router decisions) to LogsPanel/Chat.
   - Show “Attached files” chips in Chat; link to ContextPanel slices.
2. Git-aware patch lifecycle (P0)
   - Implement stage/diff/commit with preview UI; add commit message generator.
3. Test/Lint harness (P0)
   - Minimal adapters per language with quick feedback; wire failures to context resolver.
4. Schema & Dep Visualizations (P1)
   - Mermaid ERD from live introspection; module dependency graph visualization.
5. Offline embeddings (P2)
   - Pluggable local embeddings; add simple semantic search UI.
6. Swarm Orchestration v1 (P0)
   - Implement Supervisor + roles; policy-based routing and retries; artifacts panel.
7. Hybrid Code+SQL guardrails (P0)
   - Migration plan templates, verification queries, rollback gate before apply.

D) Quick Wins (low-risk, high-signal)
- SettingsPanel header tidy and status chips.
- Add inline mode/model badge in header (done); add tooltip with router status and last error.
- Add “dry-run” banner when Safe Mode is on.

E) Risks / Mitigations
- Online provider rate limits → router fallback (already present), queueing.
- Token/latency bloat → strict context budgeting + on-demand file expansion.
- Destructive changes → Safe Mode gates + rollback plans + tests before apply.

F) KPIs to track
- Fix loop success rate and mean time to fix.
- % patches accepted vs rejected.
- Test pass rate deltas per run.
- Context attachment precision/recall (files selected vs files needed).
- Offline vs online usage ratio and fallback frequency.

---

## Summary
Elara is close to parity on several core experiences and already ahead in offline capability and SQL integration. By adding Git-native workflows, test/lint harnesses, richer context/visualization, and a principled Swarm orchestration layer with strong guardrails and observability, Elara can leapfrog competitors in reliability, transparency, and hybrid code+DB automation while preserving offline-first advantages.

