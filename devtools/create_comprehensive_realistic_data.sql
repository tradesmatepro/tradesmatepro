-- ============================================================================
-- COMPREHENSIVE REALISTIC TEST DATA
-- Creates employees, assigns them to jobs, adds timesheets, parts, and invoices
-- ============================================================================

BEGIN;

-- Get company and owner info
DO $$
DECLARE
  v_company_id UUID := 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e';
  v_owner_profile_id UUID := '3c0f7003-c4f9-4ea8-9b32-c1076800203f';
  v_owner_user_id UUID := '44475f47-be87-45ef-b465-2ecbbc0616ea';

  -- Employee IDs
  v_tech1_id UUID;
  v_tech2_id UUID;
  v_tech3_id UUID;
  v_office1_id UUID;
  v_manager_id UUID;
  
  -- Work order IDs
  v_wo_ids UUID[];
  
  -- Customer IDs
  v_customer_ids UUID[];
  
BEGIN
  RAISE NOTICE 'Creating employees...';
  
  -- Create 5 employees: 3 techs, 1 office admin, 1 manager
  INSERT INTO employees (
    company_id, user_id, employee_number, hire_date, job_title, department,
    hourly_rate, overtime_rate, employee_type, pay_type, is_schedulable
  ) VALUES
    (v_company_id, v_owner_user_id, 'EMP-TEST-001', CURRENT_DATE - INTERVAL '2 years', 'Senior Technician', 'Field Operations', 35.00, 52.50, 'full_time', 'hourly', true),
    (v_company_id, v_owner_user_id, 'EMP-TEST-002', CURRENT_DATE - INTERVAL '1 year', 'Technician', 'Field Operations', 28.00, 42.00, 'full_time', 'hourly', true),
    (v_company_id, v_owner_user_id, 'EMP-TEST-003', CURRENT_DATE - INTERVAL '6 months', 'Junior Technician', 'Field Operations', 22.00, 33.00, 'full_time', 'hourly', true),
    (v_company_id, v_owner_user_id, 'EMP-TEST-004', CURRENT_DATE - INTERVAL '3 years', 'Office Administrator', 'Administration', 25.00, 37.50, 'full_time', 'hourly', false),
    (v_company_id, v_owner_user_id, 'EMP-TEST-005', CURRENT_DATE - INTERVAL '5 years', 'Operations Manager', 'Management', 45.00, 67.50, 'full_time', 'salary', false);

  -- Get the employee IDs in order
  SELECT id INTO v_tech1_id FROM employees WHERE employee_number = 'EMP-TEST-001' AND company_id = v_company_id;
  SELECT id INTO v_tech2_id FROM employees WHERE employee_number = 'EMP-TEST-002' AND company_id = v_company_id;
  SELECT id INTO v_tech3_id FROM employees WHERE employee_number = 'EMP-TEST-003' AND company_id = v_company_id;
  
  RAISE NOTICE 'Tech 1 ID: %', v_tech1_id;
  RAISE NOTICE 'Tech 2 ID: %', v_tech2_id;
  RAISE NOTICE 'Tech 3 ID: %', v_tech3_id;
  
  -- Get work order IDs
  SELECT ARRAY_AGG(id ORDER BY work_order_number) INTO v_wo_ids
  FROM work_orders
  WHERE company_id = v_company_id AND title LIKE 'TEST%';
  
  RAISE NOTICE 'Found % work orders', array_length(v_wo_ids, 1);
  
  -- Get customer IDs
  SELECT ARRAY_AGG(id ORDER BY email) INTO v_customer_ids
  FROM customers
  WHERE company_id = v_company_id AND email LIKE '%testpipeline%';
  
  -- Assign employees to work orders
  RAISE NOTICE 'Assigning employees to work orders...';

  -- Scheduled jobs get assigned (use owner profile for assigned_technician_id, employee_id for employee)
  UPDATE work_orders SET
    employee_id = v_tech1_id,
    assigned_technician_id = v_owner_profile_id,
    assigned_to = v_owner_user_id
  WHERE id = v_wo_ids[8]; -- WO-TEST-008 (scheduled tomorrow)

  UPDATE work_orders SET
    employee_id = v_tech2_id,
    assigned_technician_id = v_owner_profile_id,
    assigned_to = v_owner_user_id
  WHERE id = v_wo_ids[9]; -- WO-TEST-009 (scheduled next week)

  -- In progress job
  UPDATE work_orders SET
    employee_id = v_tech1_id,
    assigned_technician_id = v_owner_profile_id,
    assigned_to = v_owner_user_id
  WHERE id = v_wo_ids[10]; -- WO-TEST-010 (in progress)

  -- Completed jobs
  UPDATE work_orders SET
    employee_id = v_tech2_id,
    assigned_technician_id = v_owner_profile_id,
    assigned_to = v_owner_user_id
  WHERE id = v_wo_ids[11]; -- WO-TEST-011 (completed)

  UPDATE work_orders SET
    employee_id = v_tech3_id,
    assigned_technician_id = v_owner_profile_id,
    assigned_to = v_owner_user_id
  WHERE id = v_wo_ids[12]; -- WO-TEST-012 (completed)

  -- Invoiced jobs
  UPDATE work_orders SET
    employee_id = v_tech1_id,
    assigned_technician_id = v_owner_profile_id,
    assigned_to = v_owner_user_id
  WHERE id = v_wo_ids[13]; -- WO-TEST-013 (invoiced)

  UPDATE work_orders SET
    employee_id = v_tech2_id,
    assigned_technician_id = v_owner_profile_id,
    assigned_to = v_owner_user_id
  WHERE id = v_wo_ids[14]; -- WO-TEST-014 (invoiced)

  -- Paid job
  UPDATE work_orders SET
    employee_id = v_tech3_id,
    assigned_technician_id = v_owner_profile_id,
    assigned_to = v_owner_user_id
  WHERE id = v_wo_ids[15]; -- WO-TEST-015 (paid)

  -- Closed job
  UPDATE work_orders SET
    employee_id = v_tech1_id,
    assigned_technician_id = v_owner_profile_id,
    assigned_to = v_owner_user_id
  WHERE id = v_wo_ids[16]; -- WO-TEST-016 (closed)
  
  RAISE NOTICE 'Adding line items to work orders...';
  
  -- Add line items to completed/invoiced/paid/closed jobs
  -- WO-TEST-011 (completed) - $811.88
  INSERT INTO work_order_line_items (work_order_id, line_type, description, quantity, unit_price, tax_rate, sort_order)
  VALUES
    (v_wo_ids[11], 'labor', 'Diagnostic and Repair - 5 hours', 5, 95.00, 0.0825, 1),
    (v_wo_ids[11], 'material', 'Replacement Parts Kit', 1, 125.00, 0.0825, 2),
    (v_wo_ids[11], 'material', 'Copper Piping (10ft)', 10, 8.50, 0.0825, 3);
  
  -- WO-TEST-012 (completed) - $1,190.75
  INSERT INTO work_order_line_items (work_order_id, line_type, description, quantity, unit_price, tax_rate, sort_order)
  VALUES
    (v_wo_ids[12], 'labor', 'Installation Labor - 8 hours', 8, 95.00, 0.0825, 1),
    (v_wo_ids[12], 'material', 'Water Heater Unit', 1, 450.00, 0.0825, 2),
    (v_wo_ids[12], 'material', 'Installation Hardware', 1, 50.00, 0.0825, 3);
  
  -- WO-TEST-013 (invoiced) - $2,165.00
  INSERT INTO work_order_line_items (work_order_id, line_type, description, quantity, unit_price, tax_rate, sort_order)
  VALUES
    (v_wo_ids[13], 'labor', 'HVAC Repair - 12 hours', 12, 110.00, 0.0825, 1),
    (v_wo_ids[13], 'material', 'Compressor Unit', 1, 850.00, 0.0825, 2),
    (v_wo_ids[13], 'material', 'Refrigerant R-410A', 5, 35.00, 0.0825, 3);
  
  -- WO-TEST-014 (invoiced) - $1,786.13
  INSERT INTO work_order_line_items (work_order_id, line_type, description, quantity, unit_price, tax_rate, sort_order)
  VALUES
    (v_wo_ids[14], 'labor', 'Plumbing Upgrade - 10 hours', 10, 95.00, 0.0825, 1),
    (v_wo_ids[14], 'material', 'PEX Piping (100ft)', 100, 2.50, 0.0825, 2),
    (v_wo_ids[14], 'material', 'Fixtures and Fittings', 1, 400.00, 0.0825, 3);
  
  -- WO-TEST-015 (paid) - $3,031.00
  INSERT INTO work_order_line_items (work_order_id, line_type, description, quantity, unit_price, tax_rate, sort_order)
  VALUES
    (v_wo_ids[15], 'labor', 'Emergency Service - 16 hours', 16, 125.00, 0.0825, 1),
    (v_wo_ids[15], 'material', 'Emergency Parts Kit', 1, 600.00, 0.0825, 2),
    (v_wo_ids[15], 'service', 'After-Hours Service Fee', 1, 200.00, 0.0825, 3);
  
  -- WO-TEST-016 (closed) - $3,788.75
  INSERT INTO work_order_line_items (work_order_id, line_type, description, quantity, unit_price, tax_rate, sort_order)
  VALUES
    (v_wo_ids[16], 'labor', 'Commercial Installation - 20 hours', 20, 110.00, 0.0825, 1),
    (v_wo_ids[16], 'material', 'Commercial HVAC Unit', 1, 1200.00, 0.0825, 2),
    (v_wo_ids[16], 'equipment', 'Crane Rental', 1, 300.00, 0.0825, 3);
  
  RAISE NOTICE 'Adding timesheets for completed work...';
  
  -- Add timesheets for completed/invoiced/paid/closed jobs
  -- WO-TEST-011 (completed by tech 2)
  INSERT INTO employee_timesheets (employee_id, work_order_id, date, clock_in, clock_out, break_duration, regular_hours, overtime_hours, status, user_id)
  VALUES
    (v_tech2_id, v_wo_ids[11], CURRENT_DATE - INTERVAL '3 days',
     (CURRENT_DATE - INTERVAL '3 days' + TIME '08:00:00')::timestamptz,
     (CURRENT_DATE - INTERVAL '3 days' + TIME '13:00:00')::timestamptz,
     30, 4.5, 0, 'approved', v_owner_user_id);

  -- WO-TEST-012 (completed by tech 3)
  INSERT INTO employee_timesheets (employee_id, work_order_id, date, clock_in, clock_out, break_duration, regular_hours, overtime_hours, status, user_id)
  VALUES
    (v_tech3_id, v_wo_ids[12], CURRENT_DATE - INTERVAL '5 days',
     (CURRENT_DATE - INTERVAL '5 days' + TIME '07:00:00')::timestamptz,
     (CURRENT_DATE - INTERVAL '5 days' + TIME '16:00:00')::timestamptz,
     60, 8.0, 0, 'approved', v_owner_user_id);

  -- WO-TEST-013 (invoiced, completed by tech 1)
  INSERT INTO employee_timesheets (employee_id, work_order_id, date, clock_in, clock_out, break_duration, regular_hours, overtime_hours, status, user_id)
  VALUES
    (v_tech1_id, v_wo_ids[13], CURRENT_DATE - INTERVAL '10 days',
     (CURRENT_DATE - INTERVAL '10 days' + TIME '06:00:00')::timestamptz,
     (CURRENT_DATE - INTERVAL '10 days' + TIME '19:00:00')::timestamptz,
     60, 8.0, 4.0, 'approved', v_owner_user_id);

  -- WO-TEST-014 (invoiced, completed by tech 2)
  INSERT INTO employee_timesheets (employee_id, work_order_id, date, clock_in, clock_out, break_duration, regular_hours, overtime_hours, status, user_id)
  VALUES
    (v_tech2_id, v_wo_ids[14], CURRENT_DATE - INTERVAL '12 days',
     (CURRENT_DATE - INTERVAL '12 days' + TIME '08:00:00')::timestamptz,
     (CURRENT_DATE - INTERVAL '12 days' + TIME '18:00:00')::timestamptz,
     60, 9.0, 0, 'approved', v_owner_user_id);

  -- WO-TEST-015 (paid, completed by tech 3 - overnight emergency)
  INSERT INTO employee_timesheets (employee_id, work_order_id, date, clock_in, clock_out, break_duration, regular_hours, overtime_hours, status, user_id)
  VALUES
    (v_tech3_id, v_wo_ids[15], CURRENT_DATE - INTERVAL '20 days',
     (CURRENT_DATE - INTERVAL '20 days' + TIME '18:00:00')::timestamptz,
     (CURRENT_DATE - INTERVAL '20 days' + TIME '23:59:59')::timestamptz,
     0, 0, 6.0, 'approved', v_owner_user_id),
    (v_tech3_id, v_wo_ids[15], CURRENT_DATE - INTERVAL '19 days',
     (CURRENT_DATE - INTERVAL '19 days' + TIME '00:00:00')::timestamptz,
     (CURRENT_DATE - INTERVAL '19 days' + TIME '02:00:00')::timestamptz,
     0, 0, 2.0, 'approved', v_owner_user_id);

  -- WO-TEST-016 (closed, completed by tech 1)
  INSERT INTO employee_timesheets (employee_id, work_order_id, date, clock_in, clock_out, break_duration, regular_hours, overtime_hours, status, user_id)
  VALUES
    (v_tech1_id, v_wo_ids[16], CURRENT_DATE - INTERVAL '30 days',
     (CURRENT_DATE - INTERVAL '30 days' + TIME '07:00:00')::timestamptz,
     (CURRENT_DATE - INTERVAL '30 days' + TIME '17:00:00')::timestamptz,
     60, 9.0, 0, 'approved', v_owner_user_id),
    (v_tech1_id, v_wo_ids[16], CURRENT_DATE - INTERVAL '29 days',
     (CURRENT_DATE - INTERVAL '29 days' + TIME '07:00:00')::timestamptz,
     (CURRENT_DATE - INTERVAL '29 days' + TIME '18:00:00')::timestamptz,
     60, 10.0, 0, 'approved', v_owner_user_id);
  
  RAISE NOTICE 'Creating invoices for invoiced/paid/closed jobs...';

  -- Create invoices (manually set invoice_number to avoid broken trigger)
  -- WO-TEST-013 (invoiced)
  INSERT INTO invoices (company_id, work_order_id, customer_id, invoice_number, status, issue_date, due_date, subtotal, tax_amount, total_amount, amount_paid, terms)
  SELECT
    v_company_id,
    v_wo_ids[13],
    customer_id,
    'INV-TEST-001',
    'sent',
    CURRENT_DATE - INTERVAL '10 days',
    CURRENT_DATE - INTERVAL '10 days' + INTERVAL '30 days',
    2000.00,
    165.00,
    2165.00,
    0.00,
    'NET30'
  FROM work_orders WHERE id = v_wo_ids[13];

  -- WO-TEST-014 (invoiced)
  INSERT INTO invoices (company_id, work_order_id, customer_id, invoice_number, status, issue_date, due_date, subtotal, tax_amount, total_amount, amount_paid, terms)
  SELECT
    v_company_id,
    v_wo_ids[14],
    customer_id,
    'INV-TEST-002',
    'sent',
    CURRENT_DATE - INTERVAL '12 days',
    CURRENT_DATE - INTERVAL '12 days' + INTERVAL '30 days',
    1650.00,
    136.13,
    1786.13,
    0.00,
    'NET30'
  FROM work_orders WHERE id = v_wo_ids[14];

  -- WO-TEST-015 (paid)
  INSERT INTO invoices (company_id, work_order_id, customer_id, invoice_number, status, issue_date, due_date, subtotal, tax_amount, total_amount, amount_paid, terms)
  SELECT
    v_company_id,
    v_wo_ids[15],
    customer_id,
    'INV-TEST-003',
    'paid',
    CURRENT_DATE - INTERVAL '20 days',
    CURRENT_DATE - INTERVAL '20 days' + INTERVAL '30 days',
    2800.00,
    231.00,
    3031.00,
    3031.00,
    'NET30'
  FROM work_orders WHERE id = v_wo_ids[15];

  -- WO-TEST-016 (closed)
  INSERT INTO invoices (company_id, work_order_id, customer_id, invoice_number, status, issue_date, due_date, subtotal, tax_amount, total_amount, amount_paid, terms)
  SELECT
    v_company_id,
    v_wo_ids[16],
    customer_id,
    'INV-TEST-004',
    'paid',
    CURRENT_DATE - INTERVAL '30 days',
    CURRENT_DATE - INTERVAL '30 days' + INTERVAL '30 days',
    3500.00,
    288.75,
    3788.75,
    3788.75,
    'NET30'
  FROM work_orders WHERE id = v_wo_ids[16];
  
  RAISE NOTICE 'Done! Created comprehensive realistic test data.';
  
END $$;

COMMIT;

-- Verification queries
SELECT '=== EMPLOYEES ===' AS section;
SELECT employee_number, job_title, department, hourly_rate, is_schedulable
FROM employees
WHERE company_id = 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e'
ORDER BY employee_number;

SELECT '=== WORK ORDERS WITH ASSIGNMENTS ===' AS section;
SELECT 
  wo.work_order_number,
  wo.status,
  wo.title,
  e.employee_number as assigned_tech,
  wo.total_amount
FROM work_orders wo
LEFT JOIN employees e ON wo.employee_id = e.id
WHERE wo.company_id = 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e' AND wo.title LIKE 'TEST%'
ORDER BY wo.work_order_number;

SELECT '=== TIMESHEETS ===' AS section;
SELECT 
  e.employee_number,
  wo.work_order_number,
  ts.date,
  ts.regular_hours,
  ts.overtime_hours,
  ts.status
FROM employee_timesheets ts
JOIN employees e ON ts.employee_id = e.id
JOIN work_orders wo ON ts.work_order_id = wo.id
WHERE wo.title LIKE 'TEST%'
ORDER BY ts.date DESC;

SELECT '=== INVOICES ===' AS section;
SELECT 
  i.invoice_number,
  wo.work_order_number,
  i.status,
  i.total_amount,
  i.amount_paid,
  i.balance_due
FROM invoices i
JOIN work_orders wo ON i.work_order_id = wo.id
WHERE wo.title LIKE 'TEST%'
ORDER BY i.invoice_number;

SELECT '=== LINE ITEMS ===' AS section;
SELECT 
  wo.work_order_number,
  li.line_type,
  li.description,
  li.quantity,
  li.unit_price,
  li.total_price
FROM work_order_line_items li
JOIN work_orders wo ON li.work_order_id = wo.id
WHERE wo.title LIKE 'TEST%'
ORDER BY wo.work_order_number, li.sort_order;

