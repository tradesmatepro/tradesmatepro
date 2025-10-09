📚 README – START HERE (Baseline Edition)
🚨 Golden Rule

The app baseline is the source of truth.
No code, SQL, or schema changes may be made without checking the baseline first:
👉 app_baseline.md

📖 Workflow

Start at the baseline.

Confirm pipeline (work_orders, not quotes/jobs/invoices).

Confirm role-based flows (contractor ↔ customer).

Confirm schema + service layer matches baseline.

Logs before fixes.

Gather errors from /developer-tools and browser console.

Do not guess or assume.

Fix loop (sandbox only).

Identify → Analyze (baseline + logs) → Fix → Verify.

Never touch the real project directly.

Verify forward + backward flows.

Example: Quote → Job → Invoice works both directions.

Contractor message appears in customer portal, and vice versa.

Promote stable changes.

Human only: backup sandbox → restore to real project.

AI never touches real project.

📌 Reference Guides

1 – Authentication & Database Access

2 – Running SQL (Sandbox Only)

3 – Developer Tools & Logs

4 – Fix Loop & Verification

5 – Troubleshooting Common Issues

6 – Understanding the Architecture

7 – Full Architecture Check – No Bandaids

🚫 What Not to Do

❌ Don’t create duplicate tables (quotes, jobs).

❌ Don’t patch one role (contractor) without checking the other (customer).

❌ Don’t silence errors — fix root cause.

❌ Don’t skip schema or baseline verification.

👉 This README + baseline ensures Claude (or me) never loses sight of the big picture again.