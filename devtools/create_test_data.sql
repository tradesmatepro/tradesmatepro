-- ✅ CREATE COMPREHENSIVE TEST DATA FOR TRADEMATE PRO
-- Company: Smith Plumbing (cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e)
-- User: jeraldjsmith@gmail.com

-- Get existing employee IDs
DO $$
DECLARE
    v_company_id UUID := 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e';
    v_user_id UUID;
    v_employee1_id UUID;
    v_employee2_id UUID;
    v_customer1_id UUID;
    v_customer2_id UUID;
    v_vendor1_id UUID;
    v_vendor2_id UUID;
    v_wo1_id UUID;
    v_wo2_id UUID;
    v_wo3_id UUID;
    v_wo4_id UUID;
    v_wo5_id UUID;
BEGIN
    -- Get user ID
    SELECT id INTO v_user_id FROM users WHERE email = 'jeraldjsmith@gmail.com' LIMIT 1;
    
    -- Get existing employees
    SELECT id INTO v_employee1_id FROM employees WHERE company_id = v_company_id ORDER BY created_at LIMIT 1;
    SELECT id INTO v_employee2_id FROM employees WHERE company_id = v_company_id ORDER BY created_at OFFSET 1 LIMIT 1;
    
    -- Get existing customers
    SELECT id INTO v_customer1_id FROM customers WHERE company_id = v_company_id ORDER BY created_at LIMIT 1;
    SELECT id INTO v_customer2_id FROM customers WHERE company_id = v_company_id ORDER BY created_at OFFSET 1 LIMIT 1;
    
    -- Create vendors if they don't exist
    INSERT INTO vendors (id, company_id, name, email, phone, status, created_at)
    VALUES 
        (gen_random_uuid(), v_company_id, 'ABC Supply Co', 'orders@abcsupply.com', '+15551234567', 'ACTIVE', NOW()),
        (gen_random_uuid(), v_company_id, 'Plumbing Wholesale', 'sales@plumbingwholesale.com', '+15559876543', 'ACTIVE', NOW())
    ON CONFLICT DO NOTHING;
    
    SELECT id INTO v_vendor1_id FROM vendors WHERE company_id = v_company_id ORDER BY created_at LIMIT 1;
    SELECT id INTO v_vendor2_id FROM vendors WHERE company_id = v_company_id ORDER BY created_at OFFSET 1 LIMIT 1;
    
    -- Create work orders with various statuses
    -- Quote 1: Draft quote
    INSERT INTO work_orders (id, company_id, customer_id, created_by, title, description, status, total_amount, created_at)
    VALUES (
        gen_random_uuid(), v_company_id, v_customer1_id, v_user_id,
        'Kitchen Sink Replacement - Quote',
        'Replace old kitchen sink with new stainless steel model',
        'draft', 850.00, NOW() - INTERVAL '5 days'
    ) ON CONFLICT DO NOTHING;
    
    -- Quote 2: Sent quote
    INSERT INTO work_orders (id, company_id, customer_id, created_by, title, description, status, total_amount, created_at)
    VALUES (
        gen_random_uuid(), v_company_id, v_customer2_id, v_user_id,
        'Water Heater Installation - Quote',
        'Install 50-gallon gas water heater',
        'sent', 1850.00, NOW() - INTERVAL '3 days'
    ) ON CONFLICT DO NOTHING;
    
    -- Quote 3: Approved quote (ready to schedule)
    v_wo1_id := gen_random_uuid();
    INSERT INTO work_orders (id, company_id, customer_id, created_by, title, description, status, total_amount, created_at)
    VALUES (
        v_wo1_id, v_company_id, v_customer1_id, v_user_id,
        'Bathroom Remodel - Approved',
        'Complete bathroom remodel with new fixtures',
        'approved', 5500.00, NOW() - INTERVAL '2 days'
    ) ON CONFLICT DO NOTHING;
    
    -- Work Order 1: Scheduled job
    v_wo2_id := gen_random_uuid();
    INSERT INTO work_orders (id, company_id, customer_id, created_by, title, description, status, total_amount, start_time, end_time, created_at)
    VALUES (
        v_wo2_id, v_company_id, v_customer2_id, v_user_id,
        'Leak Repair - Scheduled',
        'Fix leaking pipe under kitchen sink',
        'scheduled', 350.00, 
        NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days' + INTERVAL '2 hours',
        NOW() - INTERVAL '1 day'
    ) ON CONFLICT DO NOTHING;
    
    -- Work Order 2: In progress
    v_wo3_id := gen_random_uuid();
    INSERT INTO work_orders (id, company_id, customer_id, created_by, title, description, status, total_amount, start_time, end_time, created_at)
    VALUES (
        v_wo3_id, v_company_id, v_customer1_id, v_user_id,
        'Drain Cleaning - In Progress',
        'Clear clogged main drain line',
        'in_progress', 275.00,
        NOW() - INTERVAL '1 hour', NOW() + INTERVAL '1 hour',
        NOW() - INTERVAL '2 hours'
    ) ON CONFLICT DO NOTHING;
    
    -- Work Order 3: Completed (ready to invoice)
    v_wo4_id := gen_random_uuid();
    INSERT INTO work_orders (id, company_id, customer_id, created_by, title, description, status, total_amount, start_time, end_time, created_at)
    VALUES (
        v_wo4_id, v_company_id, v_customer2_id, v_user_id,
        'Faucet Replacement - Completed',
        'Replace bathroom faucet',
        'completed', 425.00,
        NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '1 hour',
        NOW() - INTERVAL '2 days'
    ) ON CONFLICT DO NOTHING;
    
    -- Work Order 4: Invoiced
    v_wo5_id := gen_random_uuid();
    INSERT INTO work_orders (id, company_id, customer_id, created_by, title, description, status, total_amount, start_time, end_time, created_at)
    VALUES (
        v_wo5_id, v_company_id, v_customer1_id, v_user_id,
        'Toilet Repair - Invoiced',
        'Fix running toilet',
        'invoiced', 185.00,
        NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '30 minutes',
        NOW() - INTERVAL '4 days'
    ) ON CONFLICT DO NOTHING;
    
    -- Create invoices for invoiced work orders
    INSERT INTO invoices (id, company_id, customer_id, work_order_id, invoice_number, status, subtotal, tax, total, due_date, created_at)
    VALUES (
        gen_random_uuid(), v_company_id, v_customer1_id, v_wo5_id,
        'INV-1001', 'unpaid', 185.00, 18.50, 203.50,
        NOW() + INTERVAL '30 days', NOW() - INTERVAL '3 days'
    ) ON CONFLICT DO NOTHING;
    
    -- Create schedule events for scheduled jobs
    INSERT INTO schedule_events (id, company_id, work_order_id, employee_id, title, start_time, end_time, status, created_at)
    VALUES (
        gen_random_uuid(), v_company_id, v_wo2_id, v_employee1_id,
        'Leak Repair - Scheduled',
        NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days' + INTERVAL '2 hours',
        'scheduled', NOW()
    ) ON CONFLICT DO NOTHING;
    
    INSERT INTO schedule_events (id, company_id, work_order_id, employee_id, title, start_time, end_time, status, created_at)
    VALUES (
        gen_random_uuid(), v_company_id, v_wo3_id, v_employee2_id,
        'Drain Cleaning - In Progress',
        NOW() - INTERVAL '1 hour', NOW() + INTERVAL '1 hour',
        'in_progress', NOW()
    ) ON CONFLICT DO NOTHING;
    
    -- Create timesheets
    INSERT INTO employee_timesheets (id, employee_id, work_order_id, date, clock_in, clock_out, break_duration, regular_hours, overtime_hours, status, user_id, created_at)
    VALUES (
        gen_random_uuid(), v_employee1_id, v_wo4_id,
        (NOW() - INTERVAL '1 day')::DATE,
        NOW() - INTERVAL '1 day' + INTERVAL '8 hours',
        NOW() - INTERVAL '1 day' + INTERVAL '16 hours',
        30, 7.50, 0.00, 'submitted', v_user_id, NOW()
    ) ON CONFLICT DO NOTHING;
    
    INSERT INTO employee_timesheets (id, employee_id, work_order_id, date, clock_in, clock_out, break_duration, regular_hours, overtime_hours, status, user_id, created_at)
    VALUES (
        gen_random_uuid(), v_employee2_id, v_wo5_id,
        (NOW() - INTERVAL '3 days')::DATE,
        NOW() - INTERVAL '3 days' + INTERVAL '9 hours',
        NOW() - INTERVAL '3 days' + INTERVAL '17 hours',
        30, 7.50, 0.00, 'approved', v_user_id, NOW()
    ) ON CONFLICT DO NOTHING;
    
    -- Create PTO requests
    INSERT INTO employee_time_off (id, employee_id, company_id, kind, starts_at, ends_at, hours_requested, status, created_by, created_at)
    VALUES (
        gen_random_uuid(), v_employee1_id, v_company_id,
        'VACATION', NOW() + INTERVAL '7 days', NOW() + INTERVAL '9 days',
        24.00, 'PENDING', v_user_id, NOW()
    ) ON CONFLICT DO NOTHING;
    
    INSERT INTO employee_time_off (id, employee_id, company_id, kind, starts_at, ends_at, hours_requested, hours_approved, status, created_by, approved_by, approved_at, created_at)
    VALUES (
        gen_random_uuid(), v_employee2_id, v_company_id,
        'SICK', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day',
        8.00, 8.00, 'APPROVED', v_user_id, v_user_id, NOW() - INTERVAL '2 days', NOW() - INTERVAL '3 days'
    ) ON CONFLICT DO NOTHING;
    
    -- Create inventory items
    INSERT INTO inventory_items (id, company_id, name, sku, category, unit_of_measure, unit_cost, unit_price, quantity_on_hand, reorder_point, status, created_at)
    VALUES 
        (gen_random_uuid(), v_company_id, 'PVC Pipe 1/2"', 'PVC-PIPE-05', 'Plumbing', 'FT', 0.50, 1.25, 500, 100, 'ACTIVE', NOW()),
        (gen_random_uuid(), v_company_id, 'PVC Elbow 1/2"', 'PVC-ELBOW-05', 'Plumbing', 'EA', 0.25, 0.75, 200, 50, 'ACTIVE', NOW()),
        (gen_random_uuid(), v_company_id, 'Copper Pipe 3/4"', 'CU-PIPE-075', 'Plumbing', 'FT', 2.50, 5.00, 150, 50, 'ACTIVE', NOW()),
        (gen_random_uuid(), v_company_id, 'Ball Valve 1/2"', 'VALVE-BALL-05', 'Plumbing', 'EA', 5.00, 12.00, 75, 20, 'ACTIVE', NOW()),
        (gen_random_uuid(), v_company_id, 'Wax Ring', 'WAX-RING-STD', 'Plumbing', 'EA', 1.50, 4.00, 50, 10, 'ACTIVE', NOW())
    ON CONFLICT DO NOTHING;
    
    -- Create purchase orders
    INSERT INTO purchase_orders (id, company_id, vendor_id, po_number, status, subtotal, tax, total, expected_delivery_date, created_by, created_at)
    VALUES (
        gen_random_uuid(), v_company_id, v_vendor1_id,
        'PO-1001', 'SENT', 500.00, 50.00, 550.00,
        NOW() + INTERVAL '5 days', v_user_id, NOW()
    ) ON CONFLICT DO NOTHING;
    
    INSERT INTO purchase_orders (id, company_id, vendor_id, po_number, status, subtotal, tax, total, expected_delivery_date, received_date, created_by, created_at)
    VALUES (
        gen_random_uuid(), v_company_id, v_vendor2_id,
        'PO-1002', 'RECEIVED', 750.00, 75.00, 825.00,
        NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', v_user_id, NOW() - INTERVAL '7 days'
    ) ON CONFLICT DO NOTHING;
    
    -- Create expenses
    INSERT INTO expenses (id, company_id, employee_id, category, amount, description, expense_date, status, created_by, created_at)
    VALUES (
        gen_random_uuid(), v_company_id, v_employee1_id,
        'FUEL', 45.00, 'Gas for service truck', NOW() - INTERVAL '1 day',
        'SUBMITTED', v_user_id, NOW()
    ) ON CONFLICT DO NOTHING;
    
    INSERT INTO expenses (id, company_id, employee_id, category, amount, description, expense_date, status, approved_by, approved_at, created_by, created_at)
    VALUES (
        gen_random_uuid(), v_company_id, v_employee2_id,
        'TOOLS', 125.00, 'New pipe wrench', NOW() - INTERVAL '3 days',
        'APPROVED', v_user_id, NOW() - INTERVAL '2 days', v_user_id, NOW() - INTERVAL '3 days'
    ) ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Test data created successfully!';
END $$;

