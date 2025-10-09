-- =========================================
-- PHASE 1: CORE FSM VIEWS
-- Dashboard and reporting views for field service management
-- =========================================

-- Work Orders Dashboard View
CREATE OR REPLACE VIEW work_orders_dashboard AS
SELECT 
    wo.id,
    wo.work_order_number,
    wo.title,
    wo.status,
    wo.priority,
    wo.total_amount,
    wo.created_at,
    wo.updated_at,
    wo.scheduled_start,
    wo.scheduled_end,
    wo.actual_start,
    wo.actual_end,
    wo.assigned_to,
    
    -- Customer info
    c.customer_number,
    CASE 
        WHEN c.company_name IS NOT NULL THEN c.company_name
        ELSE c.first_name || ' ' || c.last_name
    END AS customer_name,
    c.email AS customer_email,
    c.phone AS customer_phone,
    
    -- Customer address
    ca.address_line1,
    ca.city,
    ca.state_province,
    ca.postal_code,
    
    -- Assigned technician
    p.first_name || ' ' || p.last_name AS assigned_technician_name,
    u.email AS assigned_technician_email,
    
    -- Company info
    comp.name AS company_name

FROM work_orders wo
LEFT JOIN customers c ON wo.customer_id = c.id
LEFT JOIN customer_addresses ca ON wo.customer_address_id = ca.id
LEFT JOIN users u ON wo.assigned_to = u.id
LEFT JOIN profiles p ON u.id = p.user_id
LEFT JOIN companies comp ON wo.company_id = comp.id;

-- Customer Financial Summary View
CREATE OR REPLACE VIEW customers_financial_summary AS
SELECT 
    c.id AS customer_id,
    c.customer_number,
    CASE 
        WHEN c.company_name IS NOT NULL THEN c.company_name
        ELSE c.first_name || ' ' || c.last_name
    END AS customer_name,
    c.email,
    c.phone,
    
    -- Work order stats
    COUNT(DISTINCT wo.id) AS total_work_orders,
    COUNT(DISTINCT CASE WHEN wo.status = 'completed' THEN wo.id END) AS completed_work_orders,
    COALESCE(SUM(CASE WHEN wo.status = 'completed' THEN wo.total_amount END), 0) AS total_revenue,
    
    -- Invoice stats
    COUNT(DISTINCT i.id) AS total_invoices,
    COALESCE(SUM(i.total_amount), 0) AS total_invoiced,
    COALESCE(SUM(i.amount_paid), 0) AS total_paid,
    COALESCE(SUM(i.balance_due), 0) AS total_outstanding,
    
    -- Payment stats
    COUNT(DISTINCT p.id) AS total_payments,
    COALESCE(SUM(p.amount), 0) AS total_payment_amount,
    
    -- Dates
    MIN(wo.created_at) AS first_work_order_date,
    MAX(wo.created_at) AS last_work_order_date,
    MAX(p.payment_date) AS last_payment_date

FROM customers c
LEFT JOIN work_orders wo ON c.id = wo.customer_id
LEFT JOIN invoices i ON c.id = i.customer_id
LEFT JOIN payments p ON c.id = p.customer_id
GROUP BY c.id, c.customer_number, c.company_name, c.first_name, c.last_name, c.email, c.phone;

-- Invoice Summary View
CREATE OR REPLACE VIEW invoices_summary AS
SELECT 
    i.id,
    i.invoice_number,
    i.status,
    i.issue_date,
    i.due_date,
    i.total_amount,
    i.amount_paid,
    i.balance_due,
    
    -- Customer info
    c.customer_number,
    CASE 
        WHEN c.company_name IS NOT NULL THEN c.company_name
        ELSE c.first_name || ' ' || c.last_name
    END AS customer_name,
    c.email AS customer_email,
    
    -- Work order info
    wo.work_order_number,
    wo.title AS work_order_title,
    
    -- Aging calculation
    CASE 
        WHEN i.status = 'paid' THEN 0
        WHEN i.due_date IS NULL THEN 0
        ELSE GREATEST(0, CURRENT_DATE - i.due_date)
    END AS days_overdue,
    
    -- Status indicators
    CASE 
        WHEN i.status = 'paid' THEN 'Paid'
        WHEN i.due_date IS NULL THEN 'No Due Date'
        WHEN CURRENT_DATE <= i.due_date THEN 'Current'
        WHEN CURRENT_DATE - i.due_date <= 30 THEN '1-30 Days'
        WHEN CURRENT_DATE - i.due_date <= 60 THEN '31-60 Days'
        WHEN CURRENT_DATE - i.due_date <= 90 THEN '61-90 Days'
        ELSE '90+ Days'
    END AS aging_bucket,
    
    -- Company info
    comp.name AS company_name

FROM invoices i
LEFT JOIN customers c ON i.customer_id = c.id
LEFT JOIN work_orders wo ON i.work_order_id = wo.id
LEFT JOIN companies comp ON i.company_id = comp.id;

-- User Profile View (for frontend compatibility)
CREATE OR REPLACE VIEW user_profiles AS
SELECT 
    p.id,
    p.user_id,
    p.first_name,
    p.last_name,
    p.first_name || ' ' || p.last_name AS full_name,
    p.phone,
    p.avatar_url,
    p.status,
    p.preferences,
    p.created_at,
    p.updated_at,
    
    -- User info
    u.auth_user_id,
    u.email,
    u.role,
    u.company_id,
    
    -- Company info
    c.name AS company_name

FROM profiles p
JOIN users u ON p.user_id = u.id
JOIN companies c ON u.company_id = c.id;

-- Daily Revenue Summary View
CREATE OR REPLACE VIEW daily_revenue_summary AS
SELECT 
    DATE(wo.actual_end) AS revenue_date,
    wo.company_id,
    comp.name AS company_name,
    
    -- Work order metrics
    COUNT(wo.id) AS completed_work_orders,
    COALESCE(SUM(wo.total_amount), 0) AS total_revenue,
    COALESCE(AVG(wo.total_amount), 0) AS average_work_order_value,
    
    -- Payment metrics
    COUNT(DISTINCT p.id) AS payments_received,
    COALESCE(SUM(p.amount), 0) AS total_payments,
    
    -- Technician metrics
    COUNT(DISTINCT wo.assigned_to) AS active_technicians

FROM work_orders wo
LEFT JOIN payments p ON DATE(p.payment_date) = DATE(wo.actual_end) AND p.customer_id = wo.customer_id
LEFT JOIN companies comp ON wo.company_id = comp.id
WHERE wo.status = 'completed' 
  AND wo.actual_end IS NOT NULL
GROUP BY DATE(wo.actual_end), wo.company_id, comp.name
ORDER BY revenue_date DESC;

-- Technician Performance View
CREATE OR REPLACE VIEW technician_performance AS
SELECT 
    u.id AS user_id,
    p.first_name || ' ' || p.last_name AS technician_name,
    u.email,
    u.company_id,
    comp.name AS company_name,
    
    -- Work order metrics
    COUNT(wo.id) AS total_work_orders,
    COUNT(CASE WHEN wo.status = 'completed' THEN 1 END) AS completed_work_orders,
    COUNT(CASE WHEN wo.status = 'cancelled' THEN 1 END) AS cancelled_work_orders,
    
    -- Revenue metrics
    COALESCE(SUM(CASE WHEN wo.status = 'completed' THEN wo.total_amount END), 0) AS total_revenue,
    COALESCE(AVG(CASE WHEN wo.status = 'completed' THEN wo.total_amount END), 0) AS avg_work_order_value,
    
    -- Time metrics
    AVG(CASE 
        WHEN wo.actual_start IS NOT NULL AND wo.actual_end IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (wo.actual_end - wo.actual_start)) / 3600.0 
    END) AS avg_hours_per_job,
    
    -- Performance metrics
    CASE 
        WHEN COUNT(wo.id) > 0 
        THEN ROUND((COUNT(CASE WHEN wo.status = 'completed' THEN 1 END)::DECIMAL / COUNT(wo.id)) * 100, 2)
        ELSE 0 
    END AS completion_rate,
    
    -- Date ranges
    MIN(wo.created_at) AS first_work_order,
    MAX(wo.updated_at) AS last_activity

FROM users u
JOIN profiles p ON u.id = p.user_id
LEFT JOIN work_orders wo ON u.id = wo.assigned_to
LEFT JOIN companies comp ON u.company_id = comp.id
WHERE u.role IN ('technician', 'manager')
GROUP BY u.id, p.first_name, p.last_name, u.email, u.company_id, comp.name;
