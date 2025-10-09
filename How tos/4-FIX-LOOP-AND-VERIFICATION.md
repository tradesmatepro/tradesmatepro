4 – Fix Loop and Verification (Final Corrected Guide)

This guide enforces a strict loop for identifying, fixing, and verifying issues.
Claude must never skip steps, and must never apply bandaids.

🔄 Fix Loop Phases
Phase 1. Identify

Gather full error details from /developer-tools and browser console.

Record:

Error text + stack trace

Affected component/page

Expected vs actual behavior

Phase 2. Analyze

Trace error through entire pipeline.
Example:

Quote page issue → check Quotes → Jobs → Invoices flow (all work_orders).

Message issue → check both contractor and customer portals.

Confirm schema alignment before editing code:

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'work_orders';

Phase 3. Fix

Apply targeted fix in sandbox only.

Valid fixes:

Correct schema column

Add missing RLS policy

Fix query condition

Update component props

❌ Invalid fixes (bandaids):

Creating duplicate tables (quotes, jobs)

Silencing errors

Removing functionality

Phase 4. Verify

Refresh the app.

Check /developer-tools + console:

Error must be gone.

Pipeline must work end-to-end.

✅ Example success:

Quote created → converted to Job → invoiced without error.

Contractor sends message → customer sees message.

✅ Quick Checklist

 Gather full error details

 Trace error through entire pipeline

 Confirm schema alignment

 Apply root-cause fix in sandbox

 Refresh app + re-check logs

 Verify full workflow end-to-end

 Mark fixed only if logs clean + pipeline intact

🚫 What Not to Do

❌ Skip verification steps

❌ Patch single page without checking pipeline

❌ Create stray tables instead of fixing existing ones

❌ Use service key in real project (sandbox only!)

🎯 Key Principles

Logs first, fixes second.

Always trace the full pipeline.

Sandbox only — real project untouched.

Fix root causes, not symptoms.

👉 With this, Claude is forced into a disciplined loop: Error → Pipeline → Fix → Verify. No shortcuts, no bandaids.