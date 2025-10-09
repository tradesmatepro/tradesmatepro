3 – Developer Tools and Logs (Final Corrected Guide)

This guide explains exactly how to capture, analyze, and verify errors in the TradesMate Pro app.
No guessing, no over-engineering — everything is driven by real runtime logs.

🔑 Tools You Must Use
Global Error Capture (React app, port 3000)

Errors are captured globally by public/console-error-capture.js.

Captures:

Console logs

API/network errors

Uncaught runtime errors

Automatically sends errors every 30 seconds to the Error Server (port 4000).

Error Server (port 4000)

Saves errors into:

error_logs/errors_TIMESTAMP.json → historical snapshots

error_logs/latest.json → always the freshest log

Always use latest.json first.

Timestamped files are for before/after comparisons.

Browser Console (Chrome/Edge DevTools)

Open with F12 → Console tab.

Shows live runtime errors as they happen.

Use this for quick verification while reproducing issues.

🚦 Debugging Workflow
Step 1. Gather Errors

Make sure both servers are running:

npm run dev-main
npm run dev-error-server


Navigate in the app to reproduce issues.

Within 30 seconds, check error_logs/latest.json.

This is your source of truth.

Step 2. Map Error to Pipeline

Identify which pipeline stage is failing.

Examples:

Quote page error → may affect Quotes → Jobs → Invoices (all inside work_orders).

Messages error → must check both contractor and customer portals.

Step 3. Analyze Cause

Use error text + schema knowledge to locate the real problem.

Always confirm against schema + code before suggesting fixes.

Never assume based on table names alone.

Step 4. Apply Fix

Modify code or SQL in the sandbox project only.

Fix must address the root cause:

Schema alignment

Missing joins

Wrong columns

Never bandaid by:

Creating new tables unnecessarily

Silencing errors

Breaking cross-portal functionality

Step 5. Verify

Restart servers if needed.

Navigate the same workflow.

Confirm:

error_logs/latest.json is clean.

The full pipeline works end-to-end.

Examples:

Quote → Job → Invoice flow completes with no errors.

Contractor message appears correctly in customer portal.

📌 Big Picture Reminder

Always check the whole enchilada:

Auth → customers → service_requests → work_orders → invoices → messages


A fix in one stage (e.g., Quotes) must be verified across the entire flow.

Do not stop at “error disappeared” — confirm the workflow is intact.

🚫 What Not to Do

❌ Don’t invent new logging scripts (no auto-fixer.js, no fake API routes).

❌ Don’t create duplicate tables (Quotes + Jobs already exist under work_orders).

❌ Don’t fix contractor-side messages without checking the customer portal.

❌ Don’t silence errors — fix the real cause.

🎯 Key Principles

Logs first, fixes second.

Whole pipeline, not just one page.

Always verify in both latest.json + browser console.

Never bandaid or over-engineer.

👉 With this guide, Claude has zero excuses:
He must always use error_logs/latest.json + console, follow the full pipeline, and verify before moving on.

✅ This makes it crystal clear: logs are automatic, latest.json is always the first stop, and fixes must always be pipeline-aware.