-- =========================================
-- PHASE 1: CORE FSM SEED DATA
-- Default data and configurations for field service management
-- =========================================

-- Default Company (for demo/testing)
INSERT INTO companies (
    id,
    name,
    company_number,
    email,
    phone,
    address_line1,
    city,
    state_province,
    postal_code,
    country,
    time_zone,
    currency
) VALUES (
    'demo-company-123e4567-e89b-12d3-a456-426614174000',
    'Demo Field Service Company',
    'COMP-00001',
    'demo@tradesmatepro.com',
    '+1-555-123-4567',
    '123 Business Ave',
    'Demo City',
    'CA',
    '90210',
    'US',
    'America/Los_Angeles',
    'USD'
) ON CONFLICT (id) DO NOTHING;

-- Default Admin User
INSERT INTO users (
    id,
    auth_user_id,
    company_id,
    email,
    role,
    status
) VALUES (
    'demo-user-123e4567-e89b-12d3-a456-426614174001',
    'demo-auth-123e4567-e89b-12d3-a456-426614174001',
    'demo-company-123e4567-e89b-12d3-a456-426614174000',
    'admin@tradesmatepro.com',
    'owner',
    'active'
) ON CONFLICT (id) DO NOTHING;

-- Default Admin Profile
INSERT INTO profiles (
    id,
    user_id,
    first_name,
    last_name,
    phone,
    status
) VALUES (
    'demo-profile-123e4567-e89b-12d3-a456-426614174001',
    'demo-user-123e4567-e89b-12d3-a456-426614174001',
    'Demo',
    'Administrator',
    '+1-555-123-4567',
    'active'
) ON CONFLICT (id) DO NOTHING;

-- Default Dashboard Settings for Admin
INSERT INTO user_dashboard_settings (
    id,
    user_id,
    dashboard_config,
    widget_preferences,
    layout_settings,
    theme_settings,
    notification_preferences
) VALUES (
    'demo-dashboard-123e4567-e89b-12d3-a456-426614174001',
    'demo-user-123e4567-e89b-12d3-a456-426614174001',
    '{
        "layout": "default",
        "widgets": ["work_orders", "revenue", "schedule", "notifications"],
        "refresh_interval": 300,
        "default_view": "dashboard"
    }'::jsonb,
    '{
        "work_orders": {"visible": true, "position": 1, "size": "large"},
        "revenue": {"visible": true, "position": 2, "size": "medium"},
        "schedule": {"visible": true, "position": 3, "size": "medium"},
        "notifications": {"visible": true, "position": 4, "size": "small"}
    }'::jsonb,
    '{
        "sidebar_collapsed": false,
        "table_density": "comfortable",
        "items_per_page": 25
    }'::jsonb,
    '{
        "theme": "light",
        "primary_color": "#1976d2",
        "accent_color": "#ff4081"
    }'::jsonb,
    '{
        "email_notifications": true,
        "sms_notifications": false,
        "push_notifications": true,
        "in_app_notifications": true
    }'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Demo Customers
INSERT INTO customers (
    id,
    company_id,
    customer_number,
    customer_type,
    first_name,
    last_name,
    email,
    phone,
    mobile_phone
) VALUES 
(
    'demo-customer-123e4567-e89b-12d3-a456-426614174001',
    'demo-company-123e4567-e89b-12d3-a456-426614174000',
    'CUST-00001',
    'residential',
    'John',
    'Smith',
    'john.smith@email.com',
    '+1-555-234-5678',
    '+1-555-234-5679'
),
(
    'demo-customer-123e4567-e89b-12d3-a456-426614174002',
    'demo-company-123e4567-e89b-12d3-a456-426614174000',
    'CUST-00002',
    'commercial',
    NULL,
    NULL,
    'contact@acmecorp.com',
    '+1-555-345-6789',
    NULL
) ON CONFLICT (id) DO NOTHING;

-- Update the commercial customer with company name
UPDATE customers 
SET company_name = 'Acme Corporation'
WHERE id = 'demo-customer-123e4567-e89b-12d3-a456-426614174002';

-- Demo Customer Addresses
INSERT INTO customer_addresses (
    id,
    customer_id,
    address_line1,
    address_line2,
    city,
    state_province,
    postal_code,
    country,
    is_primary
) VALUES 
(
    'demo-address-123e4567-e89b-12d3-a456-426614174001',
    'demo-customer-123e4567-e89b-12d3-a456-426614174001',
    '456 Residential St',
    'Apt 2B',
    'Demo City',
    'CA',
    '90211',
    'US',
    TRUE
),
(
    'demo-address-123e4567-e89b-12d3-a456-426614174002',
    'demo-customer-123e4567-e89b-12d3-a456-426614174002',
    '789 Business Blvd',
    'Suite 100',
    'Demo City',
    'CA',
    '90212',
    'US',
    TRUE
) ON CONFLICT (id) DO NOTHING;

-- Demo Work Orders
INSERT INTO work_orders (
    id,
    company_id,
    work_order_number,
    customer_id,
    customer_address_id,
    status,
    priority,
    title,
    description,
    scheduled_start,
    scheduled_end,
    assigned_to,
    created_by,
    subtotal,
    tax_amount,
    total_amount
) VALUES 
(
    'demo-workorder-123e4567-e89b-12d3-a456-426614174001',
    'demo-company-123e4567-e89b-12d3-a456-426614174000',
    'WO-00001',
    'demo-customer-123e4567-e89b-12d3-a456-426614174001',
    'demo-address-123e4567-e89b-12d3-a456-426614174001',
    'scheduled',
    'normal',
    'Plumbing Repair - Kitchen Sink',
    'Customer reports leaky kitchen sink faucet. Need to replace washers and check for additional issues.',
    NOW() + INTERVAL '1 day',
    NOW() + INTERVAL '1 day' + INTERVAL '2 hours',
    'demo-user-123e4567-e89b-12d3-a456-426614174001',
    'demo-user-123e4567-e89b-12d3-a456-426614174001',
    150.00,
    13.13,
    163.13
),
(
    'demo-workorder-123e4567-e89b-12d3-a456-426614174002',
    'demo-company-123e4567-e89b-12d3-a456-426614174000',
    'WO-00002',
    'demo-customer-123e4567-e89b-12d3-a456-426614174002',
    'demo-address-123e4567-e89b-12d3-a456-426614174002',
    'completed',
    'high',
    'HVAC Maintenance - Office Building',
    'Quarterly HVAC system maintenance and filter replacement for office building.',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days' + INTERVAL '4 hours',
    'demo-user-123e4567-e89b-12d3-a456-426614174001',
    'demo-user-123e4567-e89b-12d3-a456-426614174001',
    450.00,
    39.38,
    489.38
) ON CONFLICT (id) DO NOTHING;

-- Update completed work order with actual times
UPDATE work_orders 
SET 
    actual_start = scheduled_start,
    actual_end = scheduled_start + INTERVAL '3 hours 30 minutes'
WHERE id = 'demo-workorder-123e4567-e89b-12d3-a456-426614174002';

-- Demo Work Order Line Items
INSERT INTO work_order_line_items (
    id,
    work_order_id,
    item_type,
    description,
    quantity,
    unit_price,
    total_price
) VALUES 
-- Items for first work order
(
    'demo-lineitem-123e4567-e89b-12d3-a456-426614174001',
    'demo-workorder-123e4567-e89b-12d3-a456-426614174001',
    'labor',
    'Plumbing repair labor',
    2.0,
    50.00,
    100.00
),
(
    'demo-lineitem-123e4567-e89b-12d3-a456-426614174002',
    'demo-workorder-123e4567-e89b-12d3-a456-426614174001',
    'material',
    'Faucet washers and gaskets',
    1.0,
    25.00,
    25.00
),
(
    'demo-lineitem-123e4567-e89b-12d3-a456-426614174003',
    'demo-workorder-123e4567-e89b-12d3-a456-426614174001',
    'service',
    'Service call fee',
    1.0,
    25.00,
    25.00
),
-- Items for second work order
(
    'demo-lineitem-123e4567-e89b-12d3-a456-426614174004',
    'demo-workorder-123e4567-e89b-12d3-a456-426614174002',
    'labor',
    'HVAC maintenance labor',
    4.0,
    75.00,
    300.00
),
(
    'demo-lineitem-123e4567-e89b-12d3-a456-426614174005',
    'demo-workorder-123e4567-e89b-12d3-a456-426614174002',
    'material',
    'HVAC filters (premium)',
    6.0,
    15.00,
    90.00
),
(
    'demo-lineitem-123e4567-e89b-12d3-a456-426614174006',
    'demo-workorder-123e4567-e89b-12d3-a456-426614174002',
    'service',
    'Quarterly maintenance fee',
    1.0,
    60.00,
    60.00
) ON CONFLICT (id) DO NOTHING;

-- Demo Invoice
INSERT INTO invoices (
    id,
    company_id,
    work_order_id,
    customer_id,
    invoice_number,
    status,
    issue_date,
    due_date,
    subtotal,
    tax_amount,
    total_amount,
    amount_paid,
    balance_due,
    terms,
    notes
) VALUES (
    'demo-invoice-123e4567-e89b-12d3-a456-426614174001',
    'demo-company-123e4567-e89b-12d3-a456-426614174000',
    'demo-workorder-123e4567-e89b-12d3-a456-426614174002',
    'demo-customer-123e4567-e89b-12d3-a456-426614174002',
    'INV-00001',
    'paid',
    CURRENT_DATE - INTERVAL '1 day',
    CURRENT_DATE + INTERVAL '29 days',
    450.00,
    39.38,
    489.38,
    489.38,
    0.00,
    'Net 30',
    'Thank you for your business!'
) ON CONFLICT (id) DO NOTHING;

-- Demo Payment
INSERT INTO payments (
    id,
    company_id,
    invoice_id,
    customer_id,
    amount,
    payment_method,
    status,
    reference_number,
    payment_date,
    received_at,
    notes
) VALUES (
    'demo-payment-123e4567-e89b-12d3-a456-426614174001',
    'demo-company-123e4567-e89b-12d3-a456-426614174000',
    'demo-invoice-123e4567-e89b-12d3-a456-426614174001',
    'demo-customer-123e4567-e89b-12d3-a456-426614174002',
    489.38,
    'check',
    'completed',
    'CHK-2024-001',
    CURRENT_DATE,
    NOW(),
    'Payment received via check'
) ON CONFLICT (id) DO NOTHING;

-- Demo Notifications
INSERT INTO notifications (
    id,
    company_id,
    user_id,
    type,
    title,
    message,
    data,
    status,
    scheduled_for,
    sent_at
) VALUES 
(
    'demo-notification-123e4567-e89b-12d3-a456-426614174001',
    'demo-company-123e4567-e89b-12d3-a456-426614174000',
    'demo-user-123e4567-e89b-12d3-a456-426614174001',
    'in_app',
    'Welcome to TradeMate Pro!',
    'Your field service management system is ready to use. Start by creating your first work order.',
    '{"welcome": true, "first_login": true}'::jsonb,
    'sent',
    NOW() - INTERVAL '1 hour',
    NOW() - INTERVAL '1 hour'
),
(
    'demo-notification-123e4567-e89b-12d3-a456-426614174002',
    'demo-company-123e4567-e89b-12d3-a456-426614174000',
    'demo-user-123e4567-e89b-12d3-a456-426614174001',
    'in_app',
    'Work Order Completed',
    'Work Order WO-00002 has been completed successfully.',
    '{"work_order_id": "demo-workorder-123e4567-e89b-12d3-a456-426614174002", "total_amount": 489.38}'::jsonb,
    'sent',
    NOW() - INTERVAL '30 minutes',
    NOW() - INTERVAL '30 minutes'
) ON CONFLICT (id) DO NOTHING;
