📊 Phase 1 — Core Views & Materialized Views (Revised)
👷 Work Management (Unified Pipeline)
🔎 active_jobs_view

Why: Contractors complain about filtering “what’s actually open” (Jobber issue). This unifies quotes → active → invoiced.

CREATE VIEW active_jobs_view AS
SELECT w.id AS work_order_id,
       w.work_order_number,
       w.status,
       w.priority,
       c.full_name AS customer_name,
       w.scheduled_start,
       w.scheduled_end,
       SUM(li.unit_price * li.quantity) AS estimated_total
FROM work_orders w
JOIN customers c ON w.customer_id = c.id
LEFT JOIN work_order_line_items li ON li.work_order_id = w.id
WHERE w.status IN ('quote', 'scheduled', 'in_progress', 'on_hold')
GROUP BY w.id, c.full_name;

📜 completed_jobs_view

Why: Quick reporting on finished work for payroll/revenue.

CREATE VIEW completed_jobs_view AS
SELECT w.id AS work_order_id,
       w.work_order_number,
       c.full_name AS customer_name,
       w.completion_date,
       SUM(li.unit_price * li.quantity) AS final_total
FROM work_orders w
JOIN customers c ON w.customer_id = c.id
LEFT JOIN work_order_line_items li ON li.work_order_id = w.id
WHERE w.status = 'completed'
GROUP BY w.id, c.full_name, w.completion_date;

💰 Finance
🧾 customer_balance_view

Why: Contractors hate slow payment tracking (ServiceTitan complaint). This shows balances at a glance.

CREATE VIEW customer_balance_view AS
SELECT c.id AS customer_id,
       c.full_name,
       SUM(CASE WHEN i.status IN ('sent','overdue') THEN i.total_amount ELSE 0 END) -
       SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END) AS balance_due
FROM customers c
LEFT JOIN invoices i ON i.customer_id = c.id
LEFT JOIN payments p ON p.invoice_id = i.id
GROUP BY c.id, c.full_name;

💳 overdue_invoices_view

Why: Top pain point = chasing overdue invoices.

CREATE VIEW overdue_invoices_view AS
SELECT i.id AS invoice_id,
       i.invoice_number,
       c.full_name AS customer_name,
       i.total_amount,
       i.due_date,
       CURRENT_DATE - i.due_date AS days_overdue
FROM invoices i
JOIN customers c ON i.customer_id = c.id
WHERE i.status = 'overdue';

🏢 Company/Account
📦 subscription_status_view

Why: Transparency in billing (easy cancel, no hidden fees).

CREATE VIEW subscription_status_view AS
SELECT s.company_id,
       c.name AS company_name,
       s.plan_id,
       s.status,
       s.expires_at,
       (s.expires_at - CURRENT_DATE) AS days_remaining
FROM subscriptions s
JOIN companies c ON s.company_id = c.id;

👥 Team
⏱ employee_timesheet_summary

Why: Payroll efficiency — see overtime quickly.

CREATE VIEW employee_timesheet_summary AS
SELECT e.id AS employee_id,
       e.full_name,
       DATE_TRUNC('week', t.work_date) AS week_start,
       SUM(t.hours_worked) AS total_hours,
       SUM(t.overtime_hours) AS overtime_hours
FROM employees e
JOIN employee_timesheets t ON t.employee_id = e.id
GROUP BY e.id, e.full_name, DATE_TRUNC('week', t.work_date);

📦 Inventory
🛒 inventory_reorder_view

Why: Contractors complain about “stockouts.” This flags low stock instantly.

CREATE VIEW inventory_reorder_view AS
SELECT i.id AS item_id,
       i.item_name,
       l.location_name,
       s.quantity_on_hand,
       i.reorder_point
FROM inventory_items i
JOIN inventory_stock s ON s.item_id = i.id
JOIN inventory_locations l ON l.id = s.location_id
WHERE s.quantity_on_hand <= i.reorder_point;

📊 Materialized Views (Performance Heavy)
💹 monthly_revenue_mv

Why: Dashboards get slow at scale (ServiceTitan complaint). Use pre-computed monthly totals.

CREATE MATERIALIZED VIEW monthly_revenue_mv AS
SELECT DATE_TRUNC('month', i.invoice_date) AS month,
       SUM(i.total_amount) AS total_revenue,
       COUNT(i.id) AS invoice_count
FROM invoices i
WHERE i.status IN ('paid','partially_paid')
GROUP BY DATE_TRUNC('month', i.invoice_date);

-- Refresh nightly
CREATE INDEX idx_monthly_revenue_month ON monthly_revenue_mv(month);

🧮 job_profitability_mv

Why: Contractors need fast profitability insight.

CREATE MATERIALIZED VIEW job_profitability_mv AS
SELECT w.id AS work_order_id,
       w.work_order_number,
       c.full_name AS customer_name,
       SUM(li.unit_price * li.quantity) AS revenue,
       COALESCE(jc.labor_cost,0) + COALESCE(jc.material_cost,0) AS cost,
       (SUM(li.unit_price * li.quantity) -
        (COALESCE(jc.labor_cost,0) + COALESCE(jc.material_cost,0))) AS profit
FROM work_orders w
JOIN customers c ON w.customer_id = c.id
LEFT JOIN work_order_line_items li ON li.work_order_id = w.id
LEFT JOIN job_costing jc ON jc.work_order_id = w.id
WHERE w.status = 'completed'
GROUP BY w.id, w.work_order_number, c.full_name, jc.labor_cost, jc.material_cost;

-- Index for faster lookups
CREATE INDEX idx_job_profitability_work_order_id
  ON job_profitability_mv(work_order_id);

✅ Phase 1 Views Summary

Views = fast dashboards (jobs, overdue invoices, balances).

Materialized views = performance at scale (monthly revenue, profitability).

Fixes real complaints:

“Why is my system slow with many jobs?” → materialized views.

“I don’t know who owes me money.” → balances/overdue views.

“I can’t catch stockouts.” → reorder view.

👉 AI/predictive intelligence stays Phase 4+ (optional cost).
Phase 1 is lean, fast, contractor-friendly.