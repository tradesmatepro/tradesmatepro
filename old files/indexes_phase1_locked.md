🚀 TradeMate Pro – Phase 1 Final Indexes (Core FSM)
🔐 Auth & Identity

Intent: Fast logins, admin dashboards, permission checks. Handle company isolation and session expiry efficiently.

CREATE INDEX idx_auth_users_email_active 
ON auth.users(email, status) 
WHERE status = 'active';

CREATE INDEX idx_users_company_status_created 
ON users(company_id, status, created_at DESC)
INCLUDE (email, full_name);

CREATE INDEX idx_user_sessions_user_expires 
ON user_sessions(user_id, expires_at) 
WHERE expires_at > NOW();

CREATE INDEX idx_user_permissions_user_resource 
ON user_permissions(user_id, resource_type, action)
WHERE is_active = true;

🏢 Company & Account

Intent: Multi-tenant SaaS performance, billing queries, and feature flag lookups.

CREATE INDEX idx_companies_name_status_plan 
ON companies(name, status, subscription_plan_id)
WHERE status = 'active';

CREATE INDEX idx_subscriptions_company_status_expires 
ON subscriptions(company_id, status, expires_at)
INCLUDE (plan_id, billing_cycle);

CREATE INDEX idx_company_settings_company_category 
ON company_settings(company_id, setting_category)
INCLUDE (setting_value);

CREATE INDEX idx_feature_flags_company_feature 
ON feature_flags(company_id, feature_name, is_enabled)
WHERE is_enabled = true;

👥 CRM

Intent: Fast customer search (name, phone, email), segmentation, and service history — addressing Jobber complaints.

CREATE INDEX idx_customers_search_composite 
ON customers(company_id, status, (LOWER(full_name)), (LOWER(email)))
WHERE status = 'active';

CREATE INDEX idx_customers_phone_normalized 
ON customers(company_id, REGEXP_REPLACE(phone, '[^0-9]', '', 'g'))
WHERE phone IS NOT NULL;

CREATE INDEX idx_customers_company_tier_created 
ON customers(company_id, customer_tier, created_at DESC)
INCLUDE (total_jobs, total_revenue);

CREATE INDEX idx_customer_addresses_location 
ON customer_addresses USING gist(company_id, location_point)
WHERE is_primary = true;

CREATE INDEX idx_customer_contacts_customer_type_date 
ON customer_contacts(customer_id, contact_type, created_at DESC)
INCLUDE (contact_value, is_primary);

CREATE INDEX idx_customer_tags_company_tag 
ON customer_tags(company_id, tag_name)
INCLUDE (customer_count);

🛠️ Work Orders

Intent: Scheduling, dashboards, profitability, and avoiding bottlenecks.

CREATE INDEX idx_work_orders_company_status_scheduled 
ON work_orders(company_id, status, scheduled_start)
WHERE status IN ('scheduled', 'in_progress', 'on_hold')
INCLUDE (work_order_number, customer_id, assigned_to, priority);

CREATE INDEX idx_work_orders_assigned_date_status 
ON work_orders(assigned_to, DATE(scheduled_start), status)
INCLUDE (scheduled_end, estimated_duration);

CREATE INDEX idx_work_orders_customer_date_status 
ON work_orders(customer_id, created_at DESC, status)
INCLUDE (work_order_number, total_amount, completion_date);

CREATE INDEX idx_work_orders_company_completed_revenue 
ON work_orders(company_id, completion_date, total_amount)
WHERE status = 'completed' AND total_amount > 0;

CREATE INDEX idx_work_orders_number_company 
ON work_orders(work_order_number, company_id)
INCLUDE (customer_id, status, created_at);

📅 Scheduling

Intent: Avoid double-booking, improve calendar queries.

CREATE INDEX idx_schedule_events_employee_time_overlap 
ON schedule_events(employee_id, start_time, end_time)
WHERE status NOT IN ('cancelled', 'completed')
INCLUDE (work_order_id, event_type);

CREATE INDEX idx_schedule_events_company_date_employee 
ON schedule_events(company_id, DATE(start_time), employee_id)
INCLUDE (start_time, end_time, title, status);

CREATE INDEX idx_schedule_events_resource_availability 
ON schedule_events(resource_id, start_time, end_time)
WHERE resource_id IS NOT NULL AND status = 'confirmed';

💰 Finance

Intent: Real-time invoicing, payments, fraud prevention.

CREATE INDEX idx_invoices_company_status_date_amount 
ON invoices(company_id, status, invoice_date DESC, total_amount)
INCLUDE (invoice_number, customer_id, due_date);

CREATE INDEX idx_payments_invoice_date_amount 
ON payments(invoice_id, payment_date DESC, amount)
INCLUDE (payment_method, transaction_id, status);

CREATE INDEX idx_invoices_company_due_status 
ON invoices(company_id, due_date, status)
WHERE status IN ('sent', 'overdue', 'partially_paid');

CREATE INDEX idx_invoices_company_period_revenue 
ON invoices(company_id, DATE_TRUNC('month', invoice_date), total_amount)
WHERE status IN ('paid', 'partially_paid');

👥 Team

Intent: Payroll, timesheets, employee lifecycle.

CREATE INDEX idx_employees_company_status_role
ON employees(company_id, status, role)
INCLUDE (user_id, full_name, hire_date);

CREATE INDEX idx_employee_timesheets_employee_period
ON employee_timesheets(employee_id, DATE_TRUNC('week', work_date))
INCLUDE (hours_worked, overtime_hours, hourly_rate);

CREATE INDEX idx_payroll_runs_company_period_status
ON payroll_runs(company_id, period_start, period_end, status)
INCLUDE (total_amount, employee_count);

📦 Inventory

Intent: Stock visibility, purchase orders, vendor lookups.

CREATE INDEX idx_inventory_items_company_category_active
ON inventory_items(company_id, item_category, is_active)
INCLUDE (item_name, sku, unit_cost, unit_price);

CREATE INDEX idx_inventory_stock_item_location_quantity
ON inventory_stock(item_id, location_id, quantity_on_hand)
WHERE quantity_on_hand >= 0
INCLUDE (reorder_point, max_quantity);

CREATE INDEX idx_purchase_orders_company_status_date
ON purchase_orders(company_id, status, order_date DESC)
INCLUDE (vendor_id, total_amount, expected_delivery);

🔧 Tools

Intent: Track tool usage and assignments.

CREATE INDEX idx_tools_company_category_status
ON tools(company_id, tool_category, status)
WHERE status IN ('available', 'assigned')
INCLUDE (tool_name, serial_number, assigned_to);

💬 Messages & Notifications

Intent: Internal chat, fast notifications.

CREATE INDEX idx_messages_company_thread_date
ON messages(company_id, thread_id, created_at DESC)
INCLUDE (sender_id, message_text);

CREATE INDEX idx_notifications_user_status_priority
ON notifications(user_id, status, priority, created_at DESC)
WHERE status = 'unread'
INCLUDE (title, message, notification_type);

🌐 Customer Portal

Intent: Login, service requests, portal sessions.

CREATE INDEX idx_customer_portal_accounts_email_active
ON customer_portal_accounts(email, is_active)
WHERE is_active = true
INCLUDE (customer_id, last_login);

CREATE INDEX idx_customer_service_requests_customer_status
ON customer_service_requests(customer_id, status, created_at DESC)
INCLUDE (request_type, priority, assigned_to);

📊 System & Audit

Intent: Keep logs queryable without killing performance.

CREATE INDEX idx_audit_logs_company_table_date
ON audit_logs(company_id, table_name, created_at DESC)
INCLUDE (record_id, operation, changed_by);

✅ Key Wins

Composite indexes + covering indexes = faster dashboards.

Partial indexes = smaller + smarter.

UUID optimization for multi-tenant scaling.

Solves real contractor complaints (slow search, double booking, laggy reports).

Keeps schema lean → no redundant indexes.