-- ========================================
-- INDUSTRY STANDARD SAMPLE DATA FOR TRADEMATE PRO
-- Based on ServiceTitan, Jobber, Housecall Pro patterns
-- ========================================

-- Get the company ID to use for sample data
DO $$
DECLARE
    company_uuid UUID;
    profile_uuid UUID;
    customer1_uuid UUID;
    customer2_uuid UUID;
    customer3_uuid UUID;
    tag1_uuid UUID;
    tag2_uuid UUID;
    tag3_uuid UUID;
    work_order1_uuid UUID;
    work_order2_uuid UUID;
BEGIN
    -- Get first company and profile
    SELECT id INTO company_uuid FROM companies LIMIT 1;
    SELECT id INTO profile_uuid FROM profiles WHERE company_id = company_uuid LIMIT 1;
    
    IF company_uuid IS NULL THEN
        RAISE EXCEPTION 'No company found. Please create a company first.';
    END IF;
    
    IF profile_uuid IS NULL THEN
        RAISE EXCEPTION 'No profile found. Please create a user profile first.';
    END IF;
    
    RAISE NOTICE 'Using company: % and profile: %', company_uuid, profile_uuid;
    
    -- 1. CREATE SAMPLE CUSTOMERS (Industry Standard Types)
    
    -- Residential Customer
    INSERT INTO customers (
        id, company_id, customer_number, type, first_name, last_name, 
        email, phone, preferred_contact, source, notes, is_active
    ) VALUES (
        gen_random_uuid(), company_uuid, 'CUST-000001', 'residential',
        'John', 'Smith', 'john.smith@email.com', '+15551234567',
        'phone', 'Google Ads', 'Preferred customer - always pays on time', true
    ) RETURNING id INTO customer1_uuid;
    
    -- Commercial Customer
    INSERT INTO customers (
        id, company_id, customer_number, type, company_name,
        email, phone, preferred_contact, source, notes, credit_limit, is_active
    ) VALUES (
        gen_random_uuid(), company_uuid, 'CUST-000002', 'commercial',
        'ABC Manufacturing Inc', 'facilities@abcmfg.com', '+15559876543',
        'email', 'Referral', 'Large commercial account - monthly service contract', 5000.00, true
    ) RETURNING id INTO customer2_uuid;
    
    -- Industrial Customer
    INSERT INTO customers (
        id, company_id, customer_number, type, company_name,
        email, phone, preferred_contact, source, notes, credit_limit, payment_terms, is_active
    ) VALUES (
        gen_random_uuid(), company_uuid, 'CUST-000003', 'industrial',
        'Metro Industrial Complex', 'maintenance@metroindustrial.com', '+15555551234',
        'email', 'Cold Call', 'Industrial facility - emergency service priority', 10000.00, 'NET15', true
    ) RETURNING id INTO customer3_uuid;
    
    -- 2. CREATE CUSTOMER TAGS (Industry Standard Categories)
    
    INSERT INTO customer_tags (id, company_id, name, description, color, priority)
    VALUES 
        (gen_random_uuid(), company_uuid, 'VIP', 'High-value customer requiring priority service', '#FFD700', 10),
        (gen_random_uuid(), company_uuid, 'Emergency Service', 'Customer with emergency service contract', '#FF4444', 20),
        (gen_random_uuid(), company_uuid, 'Monthly Contract', 'Customer on monthly maintenance contract', '#4CAF50', 30)
    RETURNING id INTO tag1_uuid;
    
    -- Get the tag IDs for assignments
    SELECT id INTO tag1_uuid FROM customer_tags WHERE name = 'VIP' AND company_id = company_uuid;
    SELECT id INTO tag2_uuid FROM customer_tags WHERE name = 'Emergency Service' AND company_id = company_uuid;
    SELECT id INTO tag3_uuid FROM customer_tags WHERE name = 'Monthly Contract' AND company_id = company_uuid;
    
    -- 3. ASSIGN TAGS TO CUSTOMERS
    
    -- John Smith is VIP
    INSERT INTO customer_tag_assignments (customer_id, tag_id, assigned_by)
    VALUES (customer1_uuid, tag1_uuid, profile_uuid);
    
    -- ABC Manufacturing has Emergency Service and Monthly Contract
    INSERT INTO customer_tag_assignments (customer_id, tag_id, assigned_by)
    VALUES 
        (customer2_uuid, tag2_uuid, profile_uuid),
        (customer2_uuid, tag3_uuid, profile_uuid);
    
    -- Metro Industrial has Emergency Service
    INSERT INTO customer_tag_assignments (customer_id, tag_id, assigned_by)
    VALUES (customer3_uuid, tag2_uuid, profile_uuid);
    
    -- 4. CREATE SAMPLE WORK ORDERS (Industry Standard Statuses)
    
    -- Quote for Residential Customer
    INSERT INTO work_orders (
        id, company_id, customer_id, title, description, status,
        priority, estimated_duration, estimated_cost, created_by
    ) VALUES (
        gen_random_uuid(), company_uuid, customer1_uuid,
        'HVAC System Maintenance Quote', 
        'Annual HVAC system inspection and maintenance for residential property',
        'quote', 'medium', 240, 350.00, profile_uuid
    ) RETURNING id INTO work_order1_uuid;
    
    -- Approved Job for Commercial Customer
    INSERT INTO work_orders (
        id, company_id, customer_id, title, description, status,
        priority, estimated_duration, estimated_cost, created_by
    ) VALUES (
        gen_random_uuid(), company_uuid, customer2_uuid,
        'Emergency Electrical Repair',
        'Emergency electrical panel repair for manufacturing facility',
        'approved', 'high', 480, 1250.00, profile_uuid
    ) RETURNING id INTO work_order2_uuid;
    
    -- 5. CREATE QUOTE ANALYTICS RECORDS
    
    INSERT INTO quote_analytics (
        id, work_order_id, quote_sent_date, quote_value, response_time_hours,
        conversion_probability, follow_up_count, last_customer_interaction
    ) VALUES 
        (gen_random_uuid(), work_order1_uuid, CURRENT_DATE - INTERVAL '2 days', 
         350.00, 24, 0.75, 1, CURRENT_TIMESTAMP - INTERVAL '1 day'),
        (gen_random_uuid(), work_order2_uuid, CURRENT_DATE - INTERVAL '5 days',
         1250.00, 2, 0.95, 2, CURRENT_TIMESTAMP - INTERVAL '3 hours');
    
    -- 6. CREATE QUOTE FOLLOW-UPS
    
    INSERT INTO quote_follow_ups (
        id, work_order_id, follow_up_type, scheduled_at, follow_up_date,
        notes, status, assigned_to
    ) VALUES 
        (gen_random_uuid(), work_order1_uuid, 'phone_call', 
         CURRENT_TIMESTAMP + INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '1 day',
         'Follow up on HVAC maintenance quote - customer seemed interested', 'pending', profile_uuid),
        (gen_random_uuid(), work_order2_uuid, 'email',
         CURRENT_TIMESTAMP + INTERVAL '3 days', CURRENT_TIMESTAMP + INTERVAL '3 days',
         'Send detailed proposal for emergency electrical work', 'pending', profile_uuid);
    
    -- 7. CREATE QUOTE APPROVAL WORKFLOWS
    
    INSERT INTO quote_approval_workflows (
        id, work_order_id, approval_required_amount, current_status,
        requested_by, approver_user_id, company_id
    ) VALUES 
        (gen_random_uuid(), work_order2_uuid, 1000.00, 'approved',
         profile_uuid, profile_uuid, company_uuid);
    
    RAISE NOTICE 'Sample data created successfully!';
    RAISE NOTICE 'Created % customers with tags', 3;
    RAISE NOTICE 'Created % work orders with analytics', 2;
    RAISE NOTICE 'Created % follow-ups and % approval workflows', 2, 1;
    
END $$;
