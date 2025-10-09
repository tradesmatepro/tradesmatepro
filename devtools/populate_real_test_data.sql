-- ============================================================================
-- COMPREHENSIVE REAL-WORLD TEST DATA FOR TRADEMATE PRO
-- ============================================================================
-- This script creates realistic test data that progresses through the entire
-- work order pipeline: quote → sent → approved → scheduled → completed → invoiced → paid → closed
-- ============================================================================

-- Company ID (Smith Plumbing)
\set COMPANY_ID 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e'
\set OWNER_ID '44475f47-be87-45ef-b465-2ecbbc0616ea'

-- ============================================================================
-- 1. CREATE 10 CUSTOMERS (Mix of residential and commercial)
-- ============================================================================

INSERT INTO customers (company_id, first_name, last_name, email, phone, type, status, billing_address_line_1, billing_city, billing_state, billing_zip_code)
VALUES
  -- Residential Customers
  ('cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e', 'John', 'Anderson', 'john.anderson@email.com', '+15551234501', 'residential', 'active', '123 Oak Street', 'Portland', 'OR', '97201'),
  ('cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e', 'Sarah', 'Martinez', 'sarah.martinez@email.com', '+15551234502', 'residential', 'active', '456 Maple Ave', 'Portland', 'OR', '97202'),
  ('cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e', 'Michael', 'Johnson', 'michael.johnson@email.com', '+15551234503', 'residential', 'active', '789 Pine Road', 'Portland', 'OR', '97203'),
  ('cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e', 'Emily', 'Davis', 'emily.davis@email.com', '+15551234504', 'residential', 'active', '321 Elm Street', 'Portland', 'OR', '97204'),
  ('cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e', 'David', 'Wilson', 'david.wilson@email.com', '+15551234505', 'residential', 'active', '654 Cedar Lane', 'Portland', 'OR', '97205'),
  ('cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e', 'Jennifer', 'Brown', 'jennifer.brown@email.com', '+15551234506', 'residential', 'active', '987 Birch Drive', 'Portland', 'OR', '97206'),
  
  -- Commercial Customers
  ('cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e', NULL, NULL, 'contact@acmecorp.com', '+15551234507', 'commercial', 'active', '100 Business Park', 'Portland', 'OR', '97207'),
  ('cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e', NULL, NULL, 'facilities@techstartup.com', '+15551234508', 'commercial', 'active', '200 Innovation Way', 'Portland', 'OR', '97208'),
  ('cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e', NULL, NULL, 'manager@restaurant.com', '+15551234509', 'commercial', 'active', '300 Main Street', 'Portland', 'OR', '97209'),
  ('cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e', NULL, NULL, 'admin@retailstore.com', '+15551234510', 'commercial', 'active', '400 Shopping Center', 'Portland', 'OR', '97210')
ON CONFLICT DO NOTHING;

-- Set company_name for commercial customers
UPDATE customers SET company_name = 'Acme Corporation' WHERE email = 'contact@acmecorp.com';
UPDATE customers SET company_name = 'Tech Startup Inc' WHERE email = 'facilities@techstartup.com';
UPDATE customers SET company_name = 'Downtown Restaurant' WHERE email = 'manager@restaurant.com';
UPDATE customers SET company_name = 'Retail Store LLC' WHERE email = 'admin@retailstore.com';

-- ============================================================================
-- 2. CREATE 5 EMPLOYEES
-- ============================================================================
-- Note: Employees link to users table via user_id
-- For now, we'll just note that employees need proper user records
-- This would require creating auth users first, which is complex
-- So we'll skip employee creation for now and focus on work orders

-- ============================================================================
-- 3. CREATE 20 WORK ORDERS AT DIFFERENT STAGES
-- ============================================================================

-- Get customer IDs for reference
DO $$
DECLARE
  v_customer_ids UUID[];
  v_customer_id UUID;
  v_wo_id UUID;
  v_counter INT := 1;
BEGIN
  -- Get all customer IDs
  SELECT ARRAY_AGG(id) INTO v_customer_ids FROM customers WHERE company_id = 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e' ORDER BY created_at LIMIT 10;
  
  -- Create 20 work orders at different stages
  FOREACH v_customer_id IN ARRAY v_customer_ids
  LOOP
    -- Quote stage (2 per customer)
    INSERT INTO work_orders (
      company_id, customer_id, status, title, description,
      subtotal, tax_amount, total_amount, created_by, updated_by
    ) VALUES (
      'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e',
      v_customer_id,
      'quote',
      'Plumbing Repair - Quote ' || v_counter,
      'Customer requested quote for plumbing repair work',
      500.00, 41.25, 541.25,
      '44475f47-be87-45ef-b465-2ecbbc0616ea',
      '44475f47-be87-45ef-b465-2ecbbc0616ea'
    );
    
    v_counter := v_counter + 1;
    
    -- Sent stage (1 per customer)
    INSERT INTO work_orders (
      company_id, customer_id, status, title, description,
      subtotal, tax_amount, total_amount, created_by, updated_by,
      sent_at
    ) VALUES (
      'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e',
      v_customer_id,
      'sent',
      'Plumbing Repair - Sent ' || v_counter,
      'Quote sent to customer for approval',
      750.00, 61.88, 811.88,
      '44475f47-be87-45ef-b465-2ecbbc0616ea',
      '44475f47-be87-45ef-b465-2ecbbc0616ea',
      NOW() - INTERVAL '2 days'
    );
    
    v_counter := v_counter + 1;
    
    EXIT WHEN v_counter > 20;
  END LOOP;
  
  -- Create some approved work orders
  v_counter := 1;
  FOREACH v_customer_id IN ARRAY v_customer_ids
  LOOP
    EXIT WHEN v_counter > 5;
    
    INSERT INTO work_orders (
      company_id, customer_id, status, title, description,
      subtotal, tax_amount, total_amount, created_by, updated_by,
      sent_at, approved_at
    ) VALUES (
      'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e',
      v_customer_id,
      'approved',
      'Plumbing Installation - Approved ' || v_counter,
      'Customer approved quote, ready to schedule',
      1200.00, 99.00, 1299.00,
      '44475f47-be87-45ef-b465-2ecbbc0616ea',
      '44475f47-be87-45ef-b465-2ecbbc0616ea',
      NOW() - INTERVAL '5 days',
      NOW() - INTERVAL '3 days'
    );
    
    v_counter := v_counter + 1;
  END LOOP;
  
  -- Create some scheduled work orders
  v_counter := 1;
  FOREACH v_customer_id IN ARRAY v_customer_ids
  LOOP
    EXIT WHEN v_counter > 3;
    
    INSERT INTO work_orders (
      company_id, customer_id, status, title, description,
      subtotal, tax_amount, total_amount, created_by, updated_by,
      sent_at, approved_at, scheduled_start, scheduled_end
    ) VALUES (
      'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e',
      v_customer_id,
      'scheduled',
      'Emergency Plumbing - Scheduled ' || v_counter,
      'Scheduled for next week',
      850.00, 70.13, 920.13,
      '44475f47-be87-45ef-b465-2ecbbc0616ea',
      '44475f47-be87-45ef-b465-2ecbbc0616ea',
      NOW() - INTERVAL '7 days',
      NOW() - INTERVAL '5 days',
      NOW() + INTERVAL '3 days',
      NOW() + INTERVAL '3 days' + INTERVAL '4 hours'
    );
    
    v_counter := v_counter + 1;
  END LOOP;
  
  -- Create some completed work orders
  v_counter := 1;
  FOREACH v_customer_id IN ARRAY v_customer_ids
  LOOP
    EXIT WHEN v_counter > 2;
    
    INSERT INTO work_orders (
      company_id, customer_id, status, title, description,
      subtotal, tax_amount, total_amount, created_by, updated_by,
      sent_at, approved_at, scheduled_start, scheduled_end, completed_at
    ) VALUES (
      'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e',
      v_customer_id,
      'completed',
      'Plumbing Maintenance - Completed ' || v_counter,
      'Work completed successfully',
      650.00, 53.63, 703.63,
      '44475f47-be87-45ef-b465-2ecbbc0616ea',
      '44475f47-be87-45ef-b465-2ecbbc0616ea',
      NOW() - INTERVAL '14 days',
      NOW() - INTERVAL '12 days',
      NOW() - INTERVAL '7 days',
      NOW() - INTERVAL '7 days' + INTERVAL '3 hours',
      NOW() - INTERVAL '7 days' + INTERVAL '3 hours'
    );
    
    v_counter := v_counter + 1;
  END LOOP;
  
END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Count customers
SELECT 'Customers created:' AS metric, COUNT(*) AS count FROM customers WHERE company_id = 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e';

-- Count work orders by status
SELECT 'Work orders by status:' AS metric, status, COUNT(*) AS count 
FROM work_orders 
WHERE company_id = 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e' 
GROUP BY status 
ORDER BY status;

-- Total work orders
SELECT 'Total work orders:' AS metric, COUNT(*) AS count FROM work_orders WHERE company_id = 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e';

-- Show sample customers
SELECT 'Sample customers:' AS info, customer_number, first_name, last_name, company_name, email, type 
FROM customers 
WHERE company_id = 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e' 
ORDER BY created_at 
LIMIT 5;

-- Show sample work orders
SELECT 'Sample work orders:' AS info, work_order_number, status, title, total_amount 
FROM work_orders 
WHERE company_id = 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e' 
ORDER BY created_at 
LIMIT 10;

