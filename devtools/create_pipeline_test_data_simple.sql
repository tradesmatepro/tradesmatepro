-- ============================================================================
-- SIMPLE COMPREHENSIVE PIPELINE TEST DATA
-- Creates data at every stage: draft → sent → approved → scheduled → in_progress → completed → invoiced → paid → closed
-- ============================================================================

BEGIN;

-- Clean up existing test data
DELETE FROM work_orders WHERE company_id = 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e' AND title LIKE '%TEST%';
DELETE FROM customers WHERE company_id = 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e' AND email LIKE '%testpipeline%';

-- Create 10 test customers (trigger will auto-generate customer_number)
INSERT INTO customers (company_id, first_name, last_name, email, phone, type, billing_city, billing_state, billing_zip_code, company_name)
VALUES
  ('cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e', 'Test', 'Customer1', 'test1@testpipeline.com', '+15551111001', 'residential', 'Portland', 'OR', '97201', NULL),
  ('cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e', 'Test', 'Customer2', 'test2@testpipeline.com', '+15551111002', 'residential', 'Portland', 'OR', '97202', NULL),
  ('cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e', 'Test', 'Customer3', 'test3@testpipeline.com', '+15551111003', 'residential', 'Portland', 'OR', '97203', NULL),
  ('cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e', 'Test', 'Customer4', 'test4@testpipeline.com', '+15551111004', 'residential', 'Portland', 'OR', '97204', NULL),
  ('cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e', 'Test', 'Customer5', 'test5@testpipeline.com', '+15551111005', 'residential', 'Portland', 'OR', '97205', NULL),
  ('cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e', NULL, NULL, 'commercial1@testpipeline.com', '+15551111006', 'commercial', 'Portland', 'OR', '97206', 'TEST Commercial 1'),
  ('cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e', NULL, NULL, 'commercial2@testpipeline.com', '+15551111007', 'commercial', 'Portland', 'OR', '97207', 'TEST Commercial 2'),
  ('cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e', 'Test', 'Customer8', 'test8@testpipeline.com', '+15551111008', 'residential', 'Portland', 'OR', '97208', NULL),
  ('cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e', 'Test', 'Customer9', 'test9@testpipeline.com', '+15551111009', 'residential', 'Portland', 'OR', '97209', NULL),
  ('cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e', 'Test', 'Customer10', 'test10@testpipeline.com', '+15551111010', 'residential', 'Portland', 'OR', '97210', NULL);

-- Create work orders at different stages
DO $$
DECLARE
  v_customer_ids UUID[];
  v_owner_id UUID := '44475f47-be87-45ef-b465-2ecbbc0616ea';
  v_company_id UUID := 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e';
  v_wo_num INT := 1;
BEGIN
  -- Get customer IDs
  SELECT ARRAY_AGG(id ORDER BY email) INTO v_customer_ids
  FROM customers
  WHERE company_id = v_company_id AND email LIKE '%testpipeline%';

  -- 3 DRAFT quotes
  INSERT INTO work_orders (company_id, customer_id, status, title, description, subtotal, tax_amount, total_amount, created_by, work_order_number)
  VALUES
    (v_company_id, v_customer_ids[1], 'draft', 'TEST DRAFT 1 - Kitchen Sink Repair', 'Draft quote not yet sent', 500.00, 41.25, 541.25, v_owner_id, 'WO-TEST-' || LPAD(v_wo_num::TEXT, 3, '0')),
    (v_company_id, v_customer_ids[2], 'draft', 'TEST DRAFT 2 - Bathroom Remodel', 'Draft quote not yet sent', 800.00, 66.00, 866.00, v_owner_id, 'WO-TEST-' || LPAD((v_wo_num+1)::TEXT, 3, '0')),
    (v_company_id, v_customer_ids[3], 'draft', 'TEST DRAFT 3 - Water Heater Install', 'Draft quote not yet sent', 1200.00, 99.00, 1299.00, v_owner_id, 'WO-TEST-' || LPAD((v_wo_num+2)::TEXT, 3, '0'));
  v_wo_num := v_wo_num + 3;
  
  -- 2 SENT quotes
  INSERT INTO work_orders (company_id, customer_id, status, title, description, subtotal, tax_amount, total_amount, created_by, work_order_number)
  VALUES
    (v_company_id, v_customer_ids[4], 'sent', 'TEST SENT 1 - Pipe Repair', 'Sent to customer, awaiting response', 600.00, 49.50, 649.50, v_owner_id, 'WO-TEST-' || LPAD(v_wo_num::TEXT, 3, '0')),
    (v_company_id, v_customer_ids[5], 'sent', 'TEST SENT 2 - Drain Cleaning', 'Sent to customer, awaiting response', 350.00, 28.88, 378.88, v_owner_id, 'WO-TEST-' || LPAD((v_wo_num+1)::TEXT, 3, '0'));
  v_wo_num := v_wo_num + 2;

  -- 2 APPROVED quotes
  INSERT INTO work_orders (company_id, customer_id, status, title, description, subtotal, tax_amount, total_amount, created_by, work_order_number)
  VALUES
    (v_company_id, v_customer_ids[6], 'approved', 'TEST APPROVED 1 - Commercial HVAC', 'Customer approved, ready to schedule', 2500.00, 206.25, 2706.25, v_owner_id, 'WO-TEST-' || LPAD(v_wo_num::TEXT, 3, '0')),
    (v_company_id, v_customer_ids[7], 'approved', 'TEST APPROVED 2 - Plumbing Upgrade', 'Customer approved, ready to schedule', 1800.00, 148.50, 1948.50, v_owner_id, 'WO-TEST-' || LPAD((v_wo_num+1)::TEXT, 3, '0'));
  v_wo_num := v_wo_num + 2;

  -- 2 SCHEDULED jobs
  INSERT INTO work_orders (company_id, customer_id, status, title, description, subtotal, tax_amount, total_amount, created_by, scheduled_start, scheduled_end, work_order_number)
  VALUES
    (v_company_id, v_customer_ids[8], 'scheduled', 'TEST SCHEDULED 1 - Emergency Repair', 'Scheduled for tomorrow', 900.00, 74.25, 974.25, v_owner_id, NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day' + INTERVAL '4 hours', 'WO-TEST-' || LPAD(v_wo_num::TEXT, 3, '0')),
    (v_company_id, v_customer_ids[9], 'scheduled', 'TEST SCHEDULED 2 - Maintenance', 'Scheduled for next week', 450.00, 37.13, 487.13, v_owner_id, NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days' + INTERVAL '2 hours', 'WO-TEST-' || LPAD((v_wo_num+1)::TEXT, 3, '0'));
  v_wo_num := v_wo_num + 2;

  -- 1 IN_PROGRESS job
  INSERT INTO work_orders (company_id, customer_id, status, title, description, subtotal, tax_amount, total_amount, created_by, scheduled_start, scheduled_end, work_order_number)
  VALUES
    (v_company_id, v_customer_ids[10], 'in_progress', 'TEST IN PROGRESS - Active Job', 'Currently being worked on', 1500.00, 123.75, 1623.75, v_owner_id, NOW() - INTERVAL '1 hour', NOW() + INTERVAL '3 hours', 'WO-TEST-' || LPAD(v_wo_num::TEXT, 3, '0'));
  v_wo_num := v_wo_num + 1;

  -- 2 COMPLETED jobs
  INSERT INTO work_orders (company_id, customer_id, status, title, description, subtotal, tax_amount, total_amount, created_by, scheduled_start, scheduled_end, work_order_number)
  VALUES
    (v_company_id, v_customer_ids[1], 'completed', 'TEST COMPLETED 1 - Ready to Invoice', 'Work done, needs invoice', 750.00, 61.88, 811.88, v_owner_id, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '5 hours', 'WO-TEST-' || LPAD(v_wo_num::TEXT, 3, '0')),
    (v_company_id, v_customer_ids[2], 'completed', 'TEST COMPLETED 2 - Ready to Invoice', 'Work done, needs invoice', 1100.00, 90.75, 1190.75, v_owner_id, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '6 hours', 'WO-TEST-' || LPAD((v_wo_num+1)::TEXT, 3, '0'));
  v_wo_num := v_wo_num + 2;

  -- 2 INVOICED jobs
  INSERT INTO work_orders (company_id, customer_id, status, title, description, subtotal, tax_amount, total_amount, created_by, scheduled_start, scheduled_end, work_order_number)
  VALUES
    (v_company_id, v_customer_ids[3], 'invoiced', 'TEST INVOICED 1 - Awaiting Payment', 'Invoice sent, waiting for payment', 2000.00, 165.00, 2165.00, v_owner_id, NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days' + INTERVAL '7 hours', 'WO-TEST-' || LPAD(v_wo_num::TEXT, 3, '0')),
    (v_company_id, v_customer_ids[4], 'invoiced', 'TEST INVOICED 2 - Awaiting Payment', 'Invoice sent, waiting for payment', 1650.00, 136.13, 1786.13, v_owner_id, NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days' + INTERVAL '4 hours', 'WO-TEST-' || LPAD((v_wo_num+1)::TEXT, 3, '0'));
  v_wo_num := v_wo_num + 2;

  -- 1 PAID job
  INSERT INTO work_orders (company_id, customer_id, status, title, description, subtotal, tax_amount, total_amount, created_by, scheduled_start, scheduled_end, work_order_number)
  VALUES
    (v_company_id, v_customer_ids[5], 'paid', 'TEST PAID - Ready to Close', 'Payment received, can be closed', 2800.00, 231.00, 3031.00, v_owner_id, NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days' + INTERVAL '8 hours', 'WO-TEST-' || LPAD(v_wo_num::TEXT, 3, '0'));
  v_wo_num := v_wo_num + 1;

  -- 1 CLOSED job
  INSERT INTO work_orders (company_id, customer_id, status, title, description, subtotal, tax_amount, total_amount, created_by, scheduled_start, scheduled_end, work_order_number)
  VALUES
    (v_company_id, v_customer_ids[6], 'closed', 'TEST CLOSED - Complete', 'Fully completed through entire pipeline', 3500.00, 288.75, 3788.75, v_owner_id, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days' + INTERVAL '10 hours', 'WO-TEST-' || LPAD(v_wo_num::TEXT, 3, '0'));
  
END $$;

COMMIT;

-- Verification
SELECT '=== CUSTOMERS ===' AS section;
SELECT customer_number, first_name, last_name, company_name, email
FROM customers 
WHERE company_id = 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e' AND email LIKE '%testpipeline%'
ORDER BY email;

SELECT '=== WORK ORDERS BY STATUS ===' AS section;
SELECT status, COUNT(*) as count, SUM(total_amount) as total_revenue
FROM work_orders
WHERE company_id = 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e' AND title LIKE 'TEST%'
GROUP BY status
ORDER BY 
  CASE status
    WHEN 'draft' THEN 1
    WHEN 'sent' THEN 2
    WHEN 'approved' THEN 3
    WHEN 'scheduled' THEN 4
    WHEN 'in_progress' THEN 5
    WHEN 'completed' THEN 6
    WHEN 'invoiced' THEN 7
    WHEN 'paid' THEN 8
    WHEN 'closed' THEN 9
  END;

SELECT '=== ALL WORK ORDERS ===' AS section;
SELECT work_order_number, status, title, total_amount
FROM work_orders
WHERE company_id = 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e' AND title LIKE 'TEST%'
ORDER BY 
  CASE status
    WHEN 'draft' THEN 1
    WHEN 'sent' THEN 2
    WHEN 'approved' THEN 3
    WHEN 'scheduled' THEN 4
    WHEN 'in_progress' THEN 5
    WHEN 'completed' THEN 6
    WHEN 'invoiced' THEN 7
    WHEN 'paid' THEN 8
    WHEN 'closed' THEN 9
  END;

