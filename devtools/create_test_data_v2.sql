-- ✅ CREATE COMPREHENSIVE TEST DATA FOR TRADEMATE PRO (V2 - Fixed)
-- Company: Smith Plumbing (cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e)

DO $$
DECLARE
    v_company_id UUID := 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e';
    v_user_id UUID;
    v_employee1_id UUID;
    v_employee2_id UUID;
    v_customer1_id UUID;
    v_customer2_id UUID;
    v_wo1_id UUID;
    v_wo2_id UUID;
    v_wo3_id UUID;
    v_wo4_id UUID;
    v_wo5_id UUID;
    v_wo6_id UUID;
    v_wo7_id UUID;
BEGIN
    -- Get user ID
    SELECT id INTO v_user_id FROM users WHERE email = 'jeraldjsmith@gmail.com' LIMIT 1;
    
    -- Get existing employees
    SELECT id INTO v_employee1_id FROM employees WHERE company_id = v_company_id ORDER BY created_at LIMIT 1;
    SELECT id INTO v_employee2_id FROM employees WHERE company_id = v_company_id ORDER BY created_at OFFSET 1 LIMIT 1;
    
    -- Get existing customers
    SELECT id INTO v_customer1_id FROM customers WHERE company_id = v_company_id ORDER BY created_at LIMIT 1;
    SELECT id INTO v_customer2_id FROM customers WHERE company_id = v_company_id ORDER BY created_at OFFSET 1 LIMIT 1;
    
    RAISE NOTICE 'Creating work orders...';
    
    -- Quote 1: Draft quote
    INSERT INTO work_orders (id, company_id, work_order_number, customer_id, created_by, title, description, status, subtotal, tax_amount, total_amount, created_at)
    VALUES (
        gen_random_uuid(), v_company_id, 'WO-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-001', v_customer1_id, v_user_id,
        'Kitchen Sink Replacement - Quote',
        'Replace old kitchen sink with new stainless steel model',
        'draft', 773.64, 76.36, 850.00, NOW() - INTERVAL '5 days'
    );

    -- Quote 2: Sent quote
    INSERT INTO work_orders (id, company_id, work_order_number, customer_id, created_by, title, description, status, subtotal, tax_amount, total_amount, created_at)
    VALUES (
        gen_random_uuid(), v_company_id, 'WO-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-002', v_customer2_id, v_user_id,
        'Water Heater Installation - Quote',
        'Install 50-gallon gas water heater',
        'sent', 1681.82, 168.18, 1850.00, NOW() - INTERVAL '3 days'
    );

    -- Quote 3: Approved quote (ready to schedule)
    v_wo1_id := gen_random_uuid();
    INSERT INTO work_orders (id, company_id, work_order_number, customer_id, created_by, title, description, status, subtotal, tax_amount, total_amount, created_at)
    VALUES (
        v_wo1_id, v_company_id, 'WO-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-003', v_customer1_id, v_user_id,
        'Bathroom Remodel - Approved',
        'Complete bathroom remodel with new fixtures',
        'approved', 5000.00, 500.00, 5500.00, NOW() - INTERVAL '2 days'
    );
    
    -- Work Order 1: Scheduled job
    v_wo2_id := gen_random_uuid();
    INSERT INTO work_orders (id, company_id, work_order_number, customer_id, created_by, title, description, status, subtotal, tax_amount, total_amount, start_time, end_time, created_at)
    VALUES (
        v_wo2_id, v_company_id, 'WO-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-004', v_customer2_id, v_user_id,
        'Leak Repair - Scheduled',
        'Fix leaking pipe under kitchen sink',
        'scheduled', 318.18, 31.82, 350.00,
        NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days' + INTERVAL '2 hours',
        NOW() - INTERVAL '1 day'
    );

    -- Work Order 2: In progress
    v_wo3_id := gen_random_uuid();
    INSERT INTO work_orders (id, company_id, work_order_number, customer_id, created_by, title, description, status, subtotal, tax_amount, total_amount, start_time, end_time, created_at)
    VALUES (
        v_wo3_id, v_company_id, 'WO-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-005', v_customer1_id, v_user_id,
        'Drain Cleaning - In Progress',
        'Clear clogged main drain line',
        'in_progress', 250.00, 25.00, 275.00,
        NOW() - INTERVAL '1 hour', NOW() + INTERVAL '1 hour',
        NOW() - INTERVAL '2 hours'
    );

    -- Work Order 3: Completed (ready to invoice)
    v_wo4_id := gen_random_uuid();
    INSERT INTO work_orders (id, company_id, work_order_number, customer_id, created_by, title, description, status, subtotal, tax_amount, total_amount, start_time, end_time, created_at)
    VALUES (
        v_wo4_id, v_company_id, 'WO-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-006', v_customer2_id, v_user_id,
        'Faucet Replacement - Completed',
        'Replace bathroom faucet',
        'completed', 386.36, 38.64, 425.00,
        NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '1 hour',
        NOW() - INTERVAL '2 days'
    );

    -- Work Order 4: Invoiced
    v_wo5_id := gen_random_uuid();
    INSERT INTO work_orders (id, company_id, work_order_number, customer_id, created_by, title, description, status, subtotal, tax_amount, total_amount, start_time, end_time, created_at)
    VALUES (
        v_wo5_id, v_company_id, 'WO-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-007', v_customer1_id, v_user_id,
        'Toilet Repair - Invoiced',
        'Fix running toilet',
        'invoiced', 168.18, 16.82, 185.00,
        NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '30 minutes',
        NOW() - INTERVAL '4 days'
    );

    -- Work Order 5: Paid
    v_wo6_id := gen_random_uuid();
    INSERT INTO work_orders (id, company_id, work_order_number, customer_id, created_by, title, description, status, subtotal, tax_amount, total_amount, start_time, end_time, created_at)
    VALUES (
        v_wo6_id, v_company_id, 'WO-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-008', v_customer2_id, v_user_id,
        'Garbage Disposal Installation - Paid',
        'Install new garbage disposal unit',
        'paid', 295.45, 29.55, 325.00,
        NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days' + INTERVAL '1 hour',
        NOW() - INTERVAL '8 days'
    );

    -- Work Order 6: Closed
    v_wo7_id := gen_random_uuid();
    INSERT INTO work_orders (id, company_id, work_order_number, customer_id, created_by, title, description, status, subtotal, tax_amount, total_amount, start_time, end_time, created_at)
    VALUES (
        v_wo7_id, v_company_id, 'WO-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-009', v_customer1_id, v_user_id,
        'Shower Head Replacement - Closed',
        'Replace old shower head with new model',
        'closed', 113.64, 11.36, 125.00,
        NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days' + INTERVAL '30 minutes',
        NOW() - INTERVAL '11 days'
    );
    
    RAISE NOTICE 'Creating invoices...';
    
    -- Create invoices for invoiced/paid/closed work orders
    INSERT INTO invoices (id, company_id, customer_id, work_order_id, invoice_number, status, subtotal, tax, total, due_date, created_at)
    VALUES (
        gen_random_uuid(), v_company_id, v_customer1_id, v_wo5_id,
        'INV-1001', 'unpaid', 185.00, 18.50, 203.50,
        NOW() + INTERVAL '30 days', NOW() - INTERVAL '3 days'
    );
    
    INSERT INTO invoices (id, company_id, customer_id, work_order_id, invoice_number, status, subtotal, tax, total, paid_date, due_date, created_at)
    VALUES (
        gen_random_uuid(), v_company_id, v_customer2_id, v_wo6_id,
        'INV-1002', 'paid', 325.00, 32.50, 357.50,
        NOW() - INTERVAL '5 days', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'
    );
    
    INSERT INTO invoices (id, company_id, customer_id, work_order_id, invoice_number, status, subtotal, tax, total, paid_date, due_date, created_at)
    VALUES (
        gen_random_uuid(), v_company_id, v_customer1_id, v_wo7_id,
        'INV-1003', 'paid', 125.00, 12.50, 137.50,
        NOW() - INTERVAL '8 days', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'
    );
    
    RAISE NOTICE 'Creating schedule events...';
    
    -- Create schedule events for scheduled/in_progress jobs
    INSERT INTO schedule_events (id, company_id, work_order_id, employee_id, title, start_time, end_time, status, created_at)
    VALUES (
        gen_random_uuid(), v_company_id, v_wo2_id, v_employee1_id,
        'Leak Repair - Scheduled',
        NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days' + INTERVAL '2 hours',
        'scheduled', NOW()
    );
    
    INSERT INTO schedule_events (id, company_id, work_order_id, employee_id, title, start_time, end_time, status, created_at)
    VALUES (
        gen_random_uuid(), v_company_id, v_wo3_id, v_employee2_id,
        'Drain Cleaning - In Progress',
        NOW() - INTERVAL '1 hour', NOW() + INTERVAL '1 hour',
        'in_progress', NOW()
    );
    
    RAISE NOTICE 'Creating timesheets...';
    
    -- Create timesheets
    INSERT INTO employee_timesheets (id, employee_id, work_order_id, date, clock_in, clock_out, break_duration, regular_hours, overtime_hours, status, user_id, created_at)
    VALUES (
        gen_random_uuid(), v_employee1_id, v_wo4_id,
        (NOW() - INTERVAL '1 day')::DATE,
        NOW() - INTERVAL '1 day' + INTERVAL '8 hours',
        NOW() - INTERVAL '1 day' + INTERVAL '16 hours',
        30, 7.50, 0.00, 'submitted', v_user_id, NOW()
    );
    
    INSERT INTO employee_timesheets (id, employee_id, work_order_id, date, clock_in, clock_out, break_duration, regular_hours, overtime_hours, status, user_id, created_at)
    VALUES (
        gen_random_uuid(), v_employee2_id, v_wo5_id,
        (NOW() - INTERVAL '3 days')::DATE,
        NOW() - INTERVAL '3 days' + INTERVAL '9 hours',
        NOW() - INTERVAL '3 days' + INTERVAL '17 hours',
        30, 7.50, 0.00, 'approved', v_user_id, NOW()
    );
    
    INSERT INTO employee_timesheets (id, employee_id, work_order_id, date, clock_in, clock_out, break_duration, regular_hours, overtime_hours, status, user_id, created_at)
    VALUES (
        gen_random_uuid(), v_employee1_id, v_wo6_id,
        (NOW() - INTERVAL '7 days')::DATE,
        NOW() - INTERVAL '7 days' + INTERVAL '8 hours',
        NOW() - INTERVAL '7 days' + INTERVAL '16 hours',
        30, 7.50, 0.00, 'approved', v_user_id, NOW() - INTERVAL '6 days'
    );
    
    RAISE NOTICE 'Creating PTO requests...';
    
    -- Create PTO requests
    INSERT INTO employee_time_off (id, employee_id, company_id, kind, starts_at, ends_at, hours_requested, status, created_by, created_at)
    VALUES (
        gen_random_uuid(), v_employee1_id, v_company_id,
        'VACATION', NOW() + INTERVAL '7 days', NOW() + INTERVAL '9 days',
        24.00, 'PENDING', v_user_id, NOW()
    );
    
    INSERT INTO employee_time_off (id, employee_id, company_id, kind, starts_at, ends_at, hours_requested, hours_approved, status, created_by, approved_by, approved_at, created_at)
    VALUES (
        gen_random_uuid(), v_employee2_id, v_company_id,
        'SICK', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day',
        8.00, 8.00, 'APPROVED', v_user_id, v_user_id, NOW() - INTERVAL '2 days', NOW() - INTERVAL '3 days'
    );
    
    INSERT INTO employee_time_off (id, employee_id, company_id, kind, starts_at, ends_at, hours_requested, status, created_by, created_at)
    VALUES (
        gen_random_uuid(), v_employee1_id, v_company_id,
        'PERSONAL', NOW() + INTERVAL '14 days', NOW() + INTERVAL '14 days',
        8.00, 'PENDING', v_user_id, NOW()
    );
    
    RAISE NOTICE 'Creating inventory items...';
    
    -- Create inventory items
    INSERT INTO inventory_items (id, company_id, name, sku, category, unit_of_measure, unit_cost, unit_price, quantity_on_hand, reorder_point, created_at)
    VALUES 
        (gen_random_uuid(), v_company_id, 'PVC Pipe 1/2"', 'PVC-PIPE-05', 'Plumbing', 'FT', 0.50, 1.25, 500, 100, NOW()),
        (gen_random_uuid(), v_company_id, 'PVC Elbow 1/2"', 'PVC-ELBOW-05', 'Plumbing', 'EA', 0.25, 0.75, 200, 50, NOW()),
        (gen_random_uuid(), v_company_id, 'Copper Pipe 3/4"', 'CU-PIPE-075', 'Plumbing', 'FT', 2.50, 5.00, 150, 50, NOW()),
        (gen_random_uuid(), v_company_id, 'Ball Valve 1/2"', 'VALVE-BALL-05', 'Plumbing', 'EA', 5.00, 12.00, 75, 20, NOW()),
        (gen_random_uuid(), v_company_id, 'Wax Ring', 'WAX-RING-STD', 'Plumbing', 'EA', 1.50, 4.00, 50, 10, NOW()),
        (gen_random_uuid(), v_company_id, 'Teflon Tape', 'TEFLON-TAPE', 'Plumbing', 'EA', 0.50, 1.50, 100, 25, NOW()),
        (gen_random_uuid(), v_company_id, 'Pipe Dope', 'PIPE-DOPE', 'Plumbing', 'EA', 3.00, 7.00, 30, 10, NOW())
    ;
    
    RAISE NOTICE 'Test data created successfully!';
    RAISE NOTICE 'Created: 8 work orders, 3 invoices, 2 schedule events, 3 timesheets, 3 PTO requests, 7 inventory items';
END $$;

