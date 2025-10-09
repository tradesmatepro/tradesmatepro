🚨 TradesMate – Quick Rules Cheat Sheet

These rules are non-negotiable. Follow them exactly.

1. Sandbox Only

All SQL and code changes happen in TradesMatePro (sandbox).

Real project is human-only, updated by backup/restore.

Credentials for sandbox only:

postgres://postgres:Alphaecho19!@db.tradesmatepro.supabase.co:5432/postgres

2. Logs First

Open /developer-tools and browser console (F12).

Gather all errors before fixing.

Do not guess. Do not assume.

3. Baseline First

Always check app_baseline.md
.

No duplicate tables (quotes/jobs = work_orders).

No isolated fixes — full pipeline must stay intact.

4. Fix Loop

Identify (logs + baseline)

Analyze (whole pipeline)

Fix (sandbox only)

Verify (logs clean + forward/backward flow intact)

5. Forward + Backward Required

Quote → Job → Invoice must work both ways.

Contractor ↔ Customer messages must sync both ways.

Role-based flows must be verified for all users.

🚫 Never Do This

❌ Touch the real project directly

❌ Create new quotes, jobs, or invoices tables

❌ Patch only one role (contractor/customer)

❌ Silence errors instead of fixing root cause

❌ Skip baseline or schema verification

👉 If any step is unclear: STOP. Re-read the baseline and guides.


No shortcuts. No bandaids. Sandbox only.

🚨 Quick Rules Cheat Sheet – Updated
🚦 Logs First

Run start-error-logger.bat before making changes.

Logs auto-save every 30 seconds into error_logs/.

Claude/GPT must always analyze exported logs, not guess.

🔄 Fix Loop (Updated)

Start error logger (start-error-logger.bat).

Gather logs (errors.json files).

Analyze logs + baseline.

Apply fix in sandbox.

Export logs again.

Verify pipeline end-to-end.

🚫 Never Do This

❌ Never fix without a current errors.json file.

❌ Never rely on memory of past errors.

❌ Never skip log export after a fix.