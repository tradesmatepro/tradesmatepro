# 📚 TradesMate Pro Developer Guide – START HERE

## 🎉 **BREAKTHROUGH: AI CAN NOW SEE REAL ERRORS AUTOMATICALLY!**

## 🔑 Why This Exists

These guides exist because AI teammates (Claude, GPT) kept forgetting the fundamentals:

- Fixing symptoms instead of root causes
- Ignoring the full pipeline (quotes → jobs → invoices, contractor ↔ customer messages)
- Creating stray tables or scripts instead of using existing tools
- **Most importantly: Guessing errors instead of reading real runtime data**

**This README is the entry point. If you forget, STOP and re-read before making changes.**

## 🚀 **NEW: Automated Error Detection System**

**AI can now see real runtime errors automatically via `error_logs/latest.json`!**

### **Quick Start for AI:**
1. **Always check `error_logs/latest.json` FIRST** before making any fixes
2. **Start both servers**: `npm run dev-main` and `npm run dev-error-server`
3. **Wait 30+ seconds** for errors to auto-capture
4. **Read real error data** - no more guessing!
5. **Apply targeted fixes** based on actual error messages
6. **Verify by checking `latest.json` again** after fixes

### **Success Indicators:**
✅ Error server running: `📡 Error logging server running at http://localhost:4000`
✅ Auto-send working: Browser shows `✅ Sent N errors to error server`
✅ Files being created: New files in `error_logs/` every 30 seconds
✅ AI can read real errors: HTTP 400s, database errors, JavaScript errors visible

## 📖 Guide Index (Updated)

### **🔟 NEW: Automated Error Detection** ⭐ **START HERE**
✅ AI can read `error_logs/latest.json` automatically
✅ No manual exports needed - fully automated
✅ Real HTTP 400s, database errors, JavaScript errors visible
❌ Never guess errors - always check latest.json first

### **1. Authentication and Database Access**
✅ Use existing Supabase auth system
✅ Use supaFetch or Supabase client
❌ Never hardcode keys (sandbox only can use service key)

### **2. Running SQL Commands**
✅ All SQL runs in sandbox project only
✅ Schema changes tested in sandbox before promotion
✅ Migrations saved to /migrations
❌ Never touch real project directly

### **3. Developer Tools and Logs** (UPDATED)
✅ **NEW: Global error capture** - works on every page
✅ **NEW: Auto-save every 30 seconds** to error_logs/
✅ Always check `error_logs/latest.json` first before fixing
❌ Never invent new logging scripts

Fix Loop and Verification

✅ Strict loop: Identify → Analyze → Fix → Verify

✅ End-to-end workflow must succeed before marking fixed

❌ Never skip verification

Troubleshooting Common Issues

✅ Always check forward + backward flows

✅ Cross-check baseline app snapshot before changes

✅ Verify both contractor + customer roles

❌ Never patch in isolation

Understanding the Architecture

✅ Quotes/Jobs/Invoices = stages of work_orders

✅ Messages = customer_messages (contractor ↔ customer)

✅ Baseline = source of truth before edits

❌ Never create duplicate tables

Full Architecture Check – No Bandaids

✅ Map the “enchilada” (whole flow)

✅ Confirm schema alignment

✅ Confirm queries match schema

✅ Confirm app logic across roles

✅ Only fix after full-system check

🚨 CRITICAL RULES
Always:

Sandbox first → Real later.

Real project never touched by AI.

Promotion happens via human backup/restore only.

Logs before fixes.

Gather errors from /developer-tools + browser console.

Don’t guess. Don’t assume.

Architecture first.

Always check baseline + architecture docs before editing.

Never assume pipeline from table names.

Root cause only.

No bandaids.

No skipping forward/backward verification.

🎯 Quick References

**🔥 NEW: Can't see errors?** → **Guide #10 - Automated Error Detection** ⭐

**Database errors?** → Guides #1 + #2 + #4 + #10

**UI/Component errors?** → Guides #3 + #5 + #6 + #10

**Complex/systemic issues?** → Guide #7 (The Enchilada 🌯) + #10

**AI forgot how to see logs?** → **Guide #10** (Always check error_logs/latest.json first!)

📝 Final Note

These guides exist because the same mistakes kept happening:

Fixes without verification

Breaking pipelines

Creating duplicate tables

Forgetting RLS/auth

Read these first. Follow them exactly. Sandbox only. No shortcuts.

👉 This version makes it crystal clear: sandbox-only, logs-first, no bandaids, and always reference the baseline + architecture.

📚 README – Updated Section
🛠 Error Logging (Mandatory)

Before starting any fixes, you must run the Rolling Error Logger.
This ensures all errors are exported to files AI can read.

Steps:

Start your dev servers (npm run dev-main, dev-customer, dev-devtools).

Double-click start-error-logger.bat.

Captures /developer-tools logs every 30 seconds.

Saves them into error_logs/errors_YYYY-MM-DD-HH-MM.json.

Upload the latest file(s) to AI for analysis.

After fixes, repeat export and verify logs are clean.

Do not fix without logs.
If there’s no exported error file, no fix is valid.

Updated 0-README-START-HERE.md
# 🚀 TradesMate Pro Developer Rules

## 🔑 Core Principle
**No fixes without logs.**  
Claude/GPT must always work from **real runtime errors** captured automatically in `error_logs/latest.json`.

---

## 🛠 Workflow Overview
1. Start servers:
   ```bash
   npm run dev-main
   npm run dev-error-server


Port 3000 → Main React app

Port 3001 → Customer Portal

Port 4000 → Error Logging Server

Navigate in the app (reproduce issues).

Within 30 seconds, error logs are auto-saved:

error_logs/latest.json → always up to date

error_logs/errors_YYYY-MM-DD-HH-MM-SS.json → historical snapshots

AI must always read latest.json before proposing fixes.

Apply fix in sandbox.

Rerun → regenerate logs → verify latest.json is clean.

🚫 Never Do

❌ Never guess errors from memory.

❌ Never fix without checking error_logs/latest.json.

❌ Never create redundant APIs or fake routes for error export.

❌ Never touch the production Supabase project directly.

✅ Always Do

✅ Always start from sandbox project.

✅ Always check error_logs/latest.json.

✅ Always verify fixes by comparing before/after logs.

✅ Always consider full pipeline impact (quotes → jobs → invoices, messages contractor ↔ customer).


---

# 📚 Updated `4-FIX-LOOP-AND-VERIFICATION.md`

```markdown
# 🔄 Fix Loop & Verification Guide

## Core Rule
**Logs drive fixes.**  
Claude/GPT must always pull from `error_logs/latest.json` → no exceptions.

---

## Step-by-Step Fix Loop

1. **Start Environment**
   ```bash
   npm run dev-main
   npm run dev-error-server


Port 3000 → Main app (with global error capture)

Port 4000 → Error server (saves logs to disk)

Reproduce Issue

Navigate to the failing page(s) in the app.

Wait at least 30 seconds.

Gather Logs

Error server auto-saves to:

error_logs/latest.json (always freshest)

error_logs/errors_TIMESTAMP.json (history)

Analyze

Claude/GPT must open latest.json.

Identify root cause → full pipeline, not just local bandaid.

Apply Fix (Sandbox Only)

Patch sandbox project, not production.

Ensure database/schema changes match app pipelines.

Verify

Restart environment.

Reproduce same workflow.

Check error_logs/latest.json again.

✅ Fix confirmed if no new errors appear.

❌ If errors persist, loop back to step 4.

Example Verification Flow

Error found: customer_communications?select=*,users(...) - HTTP 400

Root cause: missing FK relationship in sandbox DB.

Fix applied: correct relationship + migration.

Logs regenerated.

latest.json clean → fix confirmed.

Rules for Claude

Always read latest.json first.

Use timestamped files only for before/after comparison.

Never fix without verifying logs after.

Always consider full pipeline (quotes → jobs → invoices, messages cross-portals).


---

## 🎯 Result
- **README** now makes error logging + latest.json the central rule.  
- **Fix Loop Guide (#4)** is fully rewritten to include automation + verification cycle.  
- No more “hours of guessing.” Claude/GPT must always ground fixes in real, auto-exported logs.  

---

👉 Do you also want me to patch **3-DEVELOPER-TOOLS-AND-AUTOMATION.md** so it points to the new global logger instead of the old `/developer-tools` manual export workflow?
