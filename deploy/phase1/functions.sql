-- =========================================
-- PHASE 1: CORE FSM FUNCTIONS
-- Business logic functions for field service management
-- =========================================

-- Generate Smart Reference Numbers
CREATE OR REPLACE FUNCTION generate_smart_reference_number(
    p_company_id UUID,
    p_type TEXT,
    p_prefix TEXT DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
    v_prefix TEXT;
    v_sequence INTEGER;
    v_reference_number TEXT;
    v_max_attempts INTEGER := 10;
    v_attempt INTEGER := 0;
BEGIN
    -- Set default prefix based on type
    v_prefix := COALESCE(p_prefix, 
        CASE p_type
            WHEN 'work_order' THEN 'WO'
            WHEN 'invoice' THEN 'INV'
            WHEN 'customer' THEN 'CUST'
            WHEN 'payment' THEN 'PAY'
            ELSE 'REF'
        END
    );
    
    -- Generate reference number with collision avoidance
    LOOP
        v_attempt := v_attempt + 1;
        
        -- Get next sequence number
        SELECT COALESCE(MAX(
            CASE 
                WHEN p_type = 'work_order' THEN 
                    CAST(SUBSTRING(work_order_number FROM '[0-9]+$') AS INTEGER)
                WHEN p_type = 'invoice' THEN 
                    CAST(SUBSTRING(invoice_number FROM '[0-9]+$') AS INTEGER)
                WHEN p_type = 'customer' THEN 
                    CAST(SUBSTRING(customer_number FROM '[0-9]+$') AS INTEGER)
                ELSE 0
            END
        ), 0) + 1 INTO v_sequence
        FROM (
            SELECT work_order_number FROM work_orders WHERE company_id = p_company_id
            UNION ALL
            SELECT invoice_number FROM invoices WHERE company_id = p_company_id
            UNION ALL
            SELECT customer_number FROM customers WHERE company_id = p_company_id
        ) AS all_numbers;
        
        -- Format reference number
        v_reference_number := v_prefix || '-' || TO_CHAR(v_sequence, 'FM00000');
        
        -- Check for collision
        IF NOT EXISTS (
            SELECT 1 FROM work_orders 
            WHERE company_id = p_company_id AND work_order_number = v_reference_number
            UNION ALL
            SELECT 1 FROM invoices 
            WHERE company_id = p_company_id AND invoice_number = v_reference_number
            UNION ALL
            SELECT 1 FROM customers 
            WHERE company_id = p_company_id AND customer_number = v_reference_number
        ) THEN
            EXIT; -- No collision, we're good
        END IF;
        
        -- Prevent infinite loop
        IF v_attempt >= v_max_attempts THEN
            v_reference_number := v_prefix || '-' || TO_CHAR(EXTRACT(EPOCH FROM NOW())::INTEGER, 'FM99999999');
            EXIT;
        END IF;
    END LOOP;
    
    RETURN v_reference_number;
END;
$$ LANGUAGE plpgsql;

-- Calculate Invoice Balance
CREATE OR REPLACE FUNCTION calculate_invoice_balance(p_invoice_id UUID)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    v_total_amount DECIMAL(10,2);
    v_amount_paid DECIMAL(10,2);
    v_balance DECIMAL(10,2);
BEGIN
    -- Get invoice total
    SELECT total_amount INTO v_total_amount
    FROM invoices 
    WHERE id = p_invoice_id;
    
    IF v_total_amount IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Calculate total payments
    SELECT COALESCE(SUM(amount), 0) INTO v_amount_paid
    FROM payments 
    WHERE invoice_id = p_invoice_id 
      AND status = 'completed';
    
    -- Calculate balance
    v_balance := v_total_amount - v_amount_paid;
    
    -- Update invoice record
    UPDATE invoices 
    SET 
        amount_paid = v_amount_paid,
        balance_due = v_balance,
        status = CASE 
            WHEN v_balance <= 0 THEN 'paid'::invoice_status_enum
            WHEN v_amount_paid > 0 THEN 'partial_payment'::invoice_status_enum
            ELSE status
        END,
        updated_at = NOW()
    WHERE id = p_invoice_id;
    
    RETURN v_balance;
END;
$$ LANGUAGE plpgsql;

-- Update Work Order Totals
CREATE OR REPLACE FUNCTION update_work_order_totals(p_work_order_id UUID)
RETURNS VOID AS $$
DECLARE
    v_subtotal DECIMAL(10,2);
    v_tax_rate DECIMAL(5,4) := 0.0875; -- Default 8.75% tax rate
    v_tax_amount DECIMAL(10,2);
    v_total_amount DECIMAL(10,2);
BEGIN
    -- Calculate subtotal from line items
    SELECT COALESCE(SUM(total_price), 0) INTO v_subtotal
    FROM work_order_line_items 
    WHERE work_order_id = p_work_order_id;
    
    -- Calculate tax (you might want to get this from company settings)
    v_tax_amount := v_subtotal * v_tax_rate;
    v_total_amount := v_subtotal + v_tax_amount;
    
    -- Update work order
    UPDATE work_orders 
    SET 
        subtotal = v_subtotal,
        tax_amount = v_tax_amount,
        total_amount = v_total_amount,
        updated_at = NOW()
    WHERE id = p_work_order_id;
END;
$$ LANGUAGE plpgsql;

-- Validate Work Order Status Transition
CREATE OR REPLACE FUNCTION validate_work_order_status_transition(
    p_current_status work_order_status_enum,
    p_new_status work_order_status_enum
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Define valid status transitions
    RETURN CASE 
        WHEN p_current_status = 'draft' THEN 
            p_new_status IN ('scheduled', 'cancelled')
        WHEN p_current_status = 'scheduled' THEN 
            p_new_status IN ('dispatched', 'cancelled', 'rescheduled')
        WHEN p_current_status = 'dispatched' THEN 
            p_new_status IN ('in_progress', 'cancelled')
        WHEN p_current_status = 'in_progress' THEN 
            p_new_status IN ('completed', 'on_hold', 'cancelled')
        WHEN p_current_status = 'on_hold' THEN 
            p_new_status IN ('in_progress', 'cancelled')
        WHEN p_current_status = 'completed' THEN 
            p_new_status IN ('requires_follow_up')
        WHEN p_current_status = 'cancelled' THEN 
            p_new_status IN ('draft', 'scheduled') -- Allow reactivation
        WHEN p_current_status = 'requires_follow_up' THEN 
            p_new_status IN ('completed', 'scheduled') -- Create follow-up or mark complete
        ELSE FALSE
    END;
END;
$$ LANGUAGE plpgsql;

-- Get User Dashboard Data
CREATE OR REPLACE FUNCTION get_user_dashboard_data(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
    v_company_id UUID;
BEGIN
    -- Get user's company
    SELECT company_id INTO v_company_id
    FROM users 
    WHERE id = p_user_id;
    
    IF v_company_id IS NULL THEN
        RETURN '{"error": "User not found"}'::JSON;
    END IF;
    
    -- Build dashboard data
    SELECT json_build_object(
        'user_id', p_user_id,
        'company_id', v_company_id,
        
        -- Work order metrics
        'active_work_orders', (
            SELECT COUNT(*) 
            FROM work_orders 
            WHERE assigned_to = p_user_id 
              AND status IN ('scheduled', 'dispatched', 'in_progress')
        ),
        'completed_today', (
            SELECT COUNT(*) 
            FROM work_orders 
            WHERE assigned_to = p_user_id 
              AND status = 'completed'
              AND DATE(actual_end) = CURRENT_DATE
        ),
        'total_revenue_today', (
            SELECT COALESCE(SUM(total_amount), 0)
            FROM work_orders 
            WHERE assigned_to = p_user_id 
              AND status = 'completed'
              AND DATE(actual_end) = CURRENT_DATE
        ),
        
        -- Company-wide metrics (for managers/admins)
        'company_active_work_orders', (
            SELECT COUNT(*) 
            FROM work_orders 
            WHERE company_id = v_company_id 
              AND status IN ('scheduled', 'dispatched', 'in_progress')
        ),
        'company_revenue_today', (
            SELECT COALESCE(SUM(total_amount), 0)
            FROM work_orders 
            WHERE company_id = v_company_id 
              AND status = 'completed'
              AND DATE(actual_end) = CURRENT_DATE
        ),
        
        -- Invoice metrics
        'pending_invoices', (
            SELECT COUNT(*)
            FROM invoices i
            JOIN work_orders wo ON i.work_order_id = wo.id
            WHERE wo.assigned_to = p_user_id
              AND i.status IN ('draft', 'sent')
        ),
        'overdue_invoices', (
            SELECT COUNT(*)
            FROM invoices i
            JOIN work_orders wo ON i.work_order_id = wo.id
            WHERE wo.company_id = v_company_id
              AND i.status NOT IN ('paid', 'cancelled')
              AND i.due_date < CURRENT_DATE
        ),
        
        -- Notification count
        'unread_notifications', (
            SELECT COUNT(*)
            FROM notifications
            WHERE user_id = p_user_id
              AND status = 'sent'
              AND read_at IS NULL
        )
    ) INTO v_result;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Create Audit Log Entry
CREATE OR REPLACE FUNCTION create_audit_log(
    p_company_id UUID,
    p_user_id UUID,
    p_action audit_action_enum,
    p_table_name TEXT,
    p_record_id UUID,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_audit_id UUID;
BEGIN
    INSERT INTO audit_logs (
        company_id,
        user_id,
        action,
        table_name,
        record_id,
        old_values,
        new_values,
        created_at
    ) VALUES (
        p_company_id,
        p_user_id,
        p_action,
        p_table_name,
        p_record_id,
        p_old_values,
        p_new_values,
        NOW()
    ) RETURNING id INTO v_audit_id;
    
    RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql;

-- HOTFIX: Fix validate_onboarding_step function schema issue
-- The service_types table doesn't have company_id, it goes through service_categories
CREATE OR REPLACE FUNCTION validate_onboarding_step(
  p_company_id UUID,
  p_step INTEGER
) RETURNS JSONB AS $$
DECLARE
  v_result JSONB := '{"valid": false, "errors": [], "warnings": []}'::jsonb;
  v_company_record RECORD;
  v_service_count INTEGER;
  v_employee_count INTEGER;
  v_errors TEXT[] := '{}';
  v_warnings TEXT[] := '{}';
BEGIN
  -- Get company data
  SELECT * INTO v_company_record
  FROM companies
  WHERE id = p_company_id;

  IF NOT FOUND THEN
    v_errors := array_append(v_errors, 'Company not found');
    RETURN jsonb_build_object(
      'valid', false,
      'errors', v_errors,
      'warnings', v_warnings
    );
  END IF;

  -- Step 1: Company Basics validation
  IF p_step = 1 THEN
    IF v_company_record.name IS NULL OR trim(v_company_record.name) = '' THEN
      v_errors := array_append(v_errors, 'Company name is required');
    END IF;

    IF v_company_record.phone IS NULL OR trim(v_company_record.phone) = '' THEN
      v_warnings := array_append(v_warnings, 'Phone number recommended for customer contact');
    END IF;

    IF v_company_record.address_line1 IS NULL OR trim(v_company_record.address_line1) = '' THEN
      v_warnings := array_append(v_warnings, 'Business address recommended for professional appearance');
    END IF;
  END IF;

  -- Step 2: Services/Pricing validation (mode-dependent)
  IF p_step = 2 THEN
    DECLARE
      v_mode TEXT;
    BEGIN
      -- Get onboarding mode from company_settings
      SELECT (onboarding_progress->>'mode') INTO v_mode
      FROM company_settings
      WHERE company_id = p_company_id;

      -- QUICK START: Skip service validation (pricing setup instead)
      IF v_mode = 'quick' THEN
        -- Quick start uses pricing setup - always valid
        v_warnings := array_append(v_warnings, 'Quick Start mode - services can be added later');
      ELSE
        -- ADVANCED: Check for services in company-specific OR global categories
        SELECT COUNT(*) INTO v_service_count
        FROM service_types st
        INNER JOIN service_categories sc ON st.category_id = sc.id
        WHERE (sc.company_id = p_company_id OR sc.company_id IS NULL);

        IF v_service_count = 0 THEN
          v_errors := array_append(v_errors, 'At least one service must be defined before creating quotes');
        END IF;
      END IF;
    END;
  END IF;

  -- Step 3: Team validation
  IF p_step = 3 THEN
    SELECT COUNT(*) INTO v_employee_count
    FROM users
    WHERE company_id = p_company_id
    AND role IN ('owner', 'admin', 'manager', 'technician');

    IF v_employee_count = 0 THEN
      v_warnings := array_append(v_warnings, 'Consider adding team members to assign work orders');
    END IF;
  END IF;

  -- Return validation result
  RETURN jsonb_build_object(
    'valid', array_length(v_errors, 1) IS NULL,
    'errors', v_errors,
    'warnings', v_warnings
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION validate_onboarding_step(UUID, INTEGER) TO authenticated;
