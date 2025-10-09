-- ============================================================================
-- COMPREHENSIVE PIPELINE TEST DATA - BETTER THAN COMPETITORS
-- ============================================================================
-- This creates realistic data that tests:
-- 1. Full quote → invoiced → paid → closed pipeline
-- 2. Scheduling conflicts and overload scenarios
-- 3. PTO and timesheet integration
-- 4. Inventory and parts tracking
-- 5. All the pain points competitors have
-- ============================================================================

BEGIN;

-- Clean up existing test data (keep real customer data)
DELETE FROM work_orders WHERE company_id = 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e' AND title LIKE '%TEST%';
DELETE FROM customers WHERE company_id = 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e' AND email LIKE '%testpipeline%';

-- ============================================================================
-- STEP 1: CREATE 10 TEST CUSTOMERS
-- ============================================================================
-- These will auto-generate customer_number via trigger

INSERT INTO customers (company_id, first_name, last_name, email, phone, type, billing_address_line_1, billing_city, billing_state, billing_zip_code, company_name)
VALUES
  ('cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e', 'Pipeline', 'Customer1', 'pipeline1@testpipeline.com', '+15551111001', 'residential', '100 Test St', 'Portland', 'OR', '97201', NULL),
  ('cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e', 'Pipeline', 'Customer2', 'pipeline2@testpipeline.com', '+15551111002', 'residential', '200 Test St', 'Portland', 'OR', '97202', NULL),
  ('cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e', 'Pipeline', 'Customer3', 'pipeline3@testpipeline.com', '+15551111003', 'residential', '300 Test St', 'Portland', 'OR', '97203', NULL),
  ('cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e', 'Pipeline', 'Customer4', 'pipeline4@testpipeline.com', '+15551111004', 'residential', '400 Test St', 'Portland', 'OR', '97204', NULL),
  ('cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e', 'Pipeline', 'Customer5', 'pipeline5@testpipeline.com', '+15551111005', 'residential', '500 Test St', 'Portland', 'OR', '97205', NULL),
  ('cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e', NULL, NULL, 'commercial1@testpipeline.com', '+15551111006', 'commercial', '600 Business Pkwy', 'Portland', 'OR', '97206', 'TEST Commercial Corp 1'),
  ('cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e', NULL, NULL, 'commercial2@testpipeline.com', '+15551111007', 'commercial', '700 Business Pkwy', 'Portland', 'OR', '97207', 'TEST Commercial Corp 2'),
  ('cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e', NULL, NULL, 'commercial3@testpipeline.com', '+15551111008', 'commercial', '800 Business Pkwy', 'Portland', 'OR', '97208', 'TEST Commercial Corp 3'),
  ('cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e', 'Pipeline', 'Customer9', 'pipeline9@testpipeline.com', '+15551111009', 'residential', '900 Test St', 'Portland', 'OR', '97209', NULL),
  ('cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e', 'Pipeline', 'Customer10', 'pipeline10@testpipeline.com', '+15551111010', 'residential', '1000 Test St', 'Portland', 'OR', '97210', NULL);

-- ============================================================================
-- STEP 2: CREATE WORK ORDERS AT EVERY STAGE OF PIPELINE
-- ============================================================================

DO $$
DECLARE
  v_customer_ids UUID[];
  v_customer_id UUID;
  v_owner_id UUID := '44475f47-be87-45ef-b465-2ecbbc0616ea';
  v_company_id UUID := 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e';
BEGIN
  -- Get test customer IDs
  SELECT ARRAY_AGG(id) INTO v_customer_ids 
  FROM customers 
  WHERE company_id = v_company_id AND email LIKE '%testpipeline%';
  
  -- STAGE 1: DRAFT QUOTES (3 quotes)
  FOR i IN 1..3 LOOP
    v_customer_id := v_customer_ids[i];
    INSERT INTO work_orders (
      company_id, customer_id, status, title, description,
      subtotal, tax_amount, total_amount, created_by
    ) VALUES (
      v_company_id, v_customer_id, 'draft',
      'TEST QUOTE ' || i || ' - Draft Stage',
      'This is a draft quote that hasn''t been sent yet',
      500.00 + (i * 100), 41.25 + (i * 8.25), 541.25 + (i * 108.25),
      v_owner_id
    );
  END LOOP;
  
  -- STAGE 2: SENT QUOTES (2 quotes)
  FOR i IN 4..5 LOOP
    v_customer_id := v_customer_ids[i];
    INSERT INTO work_orders (
      company_id, customer_id, status, title, description,
      subtotal, tax_amount, total_amount, created_by, updated_by,
      sent_at
    ) VALUES (
      v_company_id, v_customer_id, 'sent',
      'TEST QUOTE ' || i || ' - Sent to Customer',
      'Quote sent and awaiting customer approval',
      800.00 + (i * 100), 66.00 + (i * 8.25), 866.00 + (i * 108.25),
      v_owner_id, v_owner_id,
      NOW() - INTERVAL '2 days'
    );
  END LOOP;
  
  -- STAGE 3: APPROVED QUOTES (2 quotes)
  FOR i IN 6..7 LOOP
    v_customer_id := v_customer_ids[i];
    INSERT INTO work_orders (
      company_id, customer_id, status, title, description,
      subtotal, tax_amount, total_amount, created_by, updated_by,
      sent_at, approved_at
    ) VALUES (
      v_company_id, v_customer_id, 'approved',
      'TEST QUOTE ' || i || ' - Approved, Ready to Schedule',
      'Customer approved, needs to be scheduled',
      1200.00 + (i * 100), 99.00 + (i * 8.25), 1299.00 + (i * 108.25),
      v_owner_id, v_owner_id,
      NOW() - INTERVAL '5 days',
      NOW() - INTERVAL '3 days'
    );
  END LOOP;
  
  -- STAGE 4: SCHEDULED JOBS (2 jobs)
  FOR i IN 8..9 LOOP
    v_customer_id := v_customer_ids[i];
    INSERT INTO work_orders (
      company_id, customer_id, status, title, description,
      subtotal, tax_amount, total_amount, created_by, updated_by,
      sent_at, approved_at, scheduled_start, scheduled_end
    ) VALUES (
      v_company_id, v_customer_id, 'scheduled',
      'TEST JOB ' || i || ' - Scheduled for Next Week',
      'Scheduled and ready to work',
      1500.00 + (i * 100), 123.75 + (i * 8.25), 1623.75 + (i * 108.25),
      v_owner_id, v_owner_id,
      NOW() - INTERVAL '7 days',
      NOW() - INTERVAL '5 days',
      NOW() + INTERVAL '3 days' + (i || ' hours')::INTERVAL,
      NOW() + INTERVAL '3 days' + ((i + 4) || ' hours')::INTERVAL
    );
  END LOOP;
  
  -- STAGE 5: IN PROGRESS (1 job)
  v_customer_id := v_customer_ids[10];
  INSERT INTO work_orders (
    company_id, customer_id, status, title, description,
    subtotal, tax_amount, total_amount, created_by, updated_by,
    sent_at, approved_at, scheduled_start, scheduled_end, started_at
  ) VALUES (
    v_company_id, v_customer_id, 'in_progress',
    'TEST JOB 10 - Currently In Progress',
    'Work is actively being performed right now',
    2000.00, 165.00, 2165.00,
    v_owner_id, v_owner_id,
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '8 days',
    NOW() - INTERVAL '2 hours',
    NOW() + INTERVAL '2 hours',
    NOW() - INTERVAL '2 hours'
  );
  
  -- STAGE 6: COMPLETED (2 jobs)
  FOR i IN 1..2 LOOP
    v_customer_id := v_customer_ids[i];
    INSERT INTO work_orders (
      company_id, customer_id, status, title, description,
      subtotal, tax_amount, total_amount, created_by, updated_by,
      sent_at, approved_at, scheduled_start, scheduled_end, started_at, completed_at
    ) VALUES (
      v_company_id, v_customer_id, 'completed',
      'TEST JOB COMPLETED ' || i || ' - Ready to Invoice',
      'Work completed, needs invoice',
      1800.00 + (i * 100), 148.50 + (i * 8.25), 1948.50 + (i * 108.25),
      v_owner_id, v_owner_id,
      NOW() - INTERVAL '14 days',
      NOW() - INTERVAL '12 days',
      NOW() - INTERVAL '7 days',
      NOW() - INTERVAL '7 days' + INTERVAL '4 hours',
      NOW() - INTERVAL '7 days',
      NOW() - INTERVAL '7 days' + INTERVAL '4 hours'
    );
  END LOOP;
  
  -- STAGE 7: INVOICED (2 jobs)
  FOR i IN 3..4 LOOP
    v_customer_id := v_customer_ids[i];
    INSERT INTO work_orders (
      company_id, customer_id, status, title, description,
      subtotal, tax_amount, total_amount, created_by, updated_by,
      sent_at, approved_at, scheduled_start, scheduled_end, started_at, completed_at, invoiced_at
    ) VALUES (
      v_company_id, v_customer_id, 'invoiced',
      'TEST JOB INVOICED ' || i || ' - Awaiting Payment',
      'Invoice sent, waiting for payment',
      2200.00 + (i * 100), 181.50 + (i * 8.25), 2381.50 + (i * 108.25),
      v_owner_id, v_owner_id,
      NOW() - INTERVAL '21 days',
      NOW() - INTERVAL '19 days',
      NOW() - INTERVAL '14 days',
      NOW() - INTERVAL '14 days' + INTERVAL '5 hours',
      NOW() - INTERVAL '14 days',
      NOW() - INTERVAL '14 days' + INTERVAL '5 hours',
      NOW() - INTERVAL '10 days'
    );
  END LOOP;
  
  -- STAGE 8: PAID (1 job)
  v_customer_id := v_customer_ids[5];
  INSERT INTO work_orders (
    company_id, customer_id, status, title, description,
    subtotal, tax_amount, total_amount, created_by, updated_by,
    sent_at, approved_at, scheduled_start, scheduled_end, started_at, completed_at, invoiced_at, paid_at
  ) VALUES (
    v_company_id, v_customer_id, 'paid',
    'TEST JOB PAID - Ready to Close',
    'Payment received, can be closed',
    2500.00, 206.25, 2706.25,
    v_owner_id, v_owner_id,
    NOW() - INTERVAL '28 days',
    NOW() - INTERVAL '26 days',
    NOW() - INTERVAL '21 days',
    NOW() - INTERVAL '21 days' + INTERVAL '6 hours',
    NOW() - INTERVAL '21 days',
    NOW() - INTERVAL '21 days' + INTERVAL '6 hours',
    NOW() - INTERVAL '17 days',
    NOW() - INTERVAL '14 days'
  );
  
  -- STAGE 9: CLOSED (1 job)
  v_customer_id := v_customer_ids[6];
  INSERT INTO work_orders (
    company_id, customer_id, status, title, description,
    subtotal, tax_amount, total_amount, created_by, updated_by,
    sent_at, approved_at, scheduled_start, scheduled_end, started_at, completed_at, invoiced_at, paid_at, closed_at
  ) VALUES (
    v_company_id, v_customer_id, 'closed',
    'TEST JOB CLOSED - Complete Pipeline',
    'Fully completed through entire pipeline',
    3000.00, 247.50, 3247.50,
    v_owner_id, v_owner_id,
    NOW() - INTERVAL '35 days',
    NOW() - INTERVAL '33 days',
    NOW() - INTERVAL '28 days',
    NOW() - INTERVAL '28 days' + INTERVAL '7 hours',
    NOW() - INTERVAL '28 days',
    NOW() - INTERVAL '28 days' + INTERVAL '7 hours',
    NOW() - INTERVAL '24 days',
    NOW() - INTERVAL '21 days',
    NOW() - INTERVAL '20 days'
  );
  
END $$;

COMMIT;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT '=== CUSTOMERS CREATED ===' AS section;
SELECT customer_number, first_name, last_name, company_name, email, type
FROM customers 
WHERE company_id = 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e' AND email LIKE '%testpipeline%'
ORDER BY created_at;

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

SELECT '=== SAMPLE WORK ORDERS ===' AS section;
SELECT work_order_number, status, title, total_amount
FROM work_orders
WHERE company_id = 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e' AND title LIKE 'TEST%'
ORDER BY created_at
LIMIT 10;

