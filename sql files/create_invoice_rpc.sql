-- ============================================================================
-- RPC: create_invoice
-- ============================================================================
-- Creates an invoice record with proper company scoping and RLS bypass
-- This RPC handles all invoice creation logic at the backend level
-- 
-- USAGE:
-- SELECT * FROM create_invoice(
--   p_company_id := 'company-uuid',
--   p_work_order_id := 'work-order-uuid',
--   p_customer_id := 'customer-uuid',
--   p_invoice_number := 'INV-2025-0001',
--   p_total_amount := 1500.00,
--   p_subtotal := 1500.00,
--   p_tax_amount := 0.00,
--   p_issue_date := '2025-10-29',
--   p_due_date := '2025-11-28',
--   p_notes := 'Thank you for your business.'
-- );
-- ============================================================================

DROP FUNCTION IF EXISTS create_invoice(uuid, uuid, uuid, text, numeric, numeric, numeric, date, date, text) CASCADE;

CREATE OR REPLACE FUNCTION create_invoice(
  p_company_id uuid,
  p_work_order_id uuid,
  p_customer_id uuid,
  p_invoice_number text,
  p_total_amount numeric,
  p_subtotal numeric,
  p_tax_amount numeric,
  p_issue_date date,
  p_due_date date,
  p_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invoice_id uuid;
  v_result jsonb;
BEGIN
  -- ========================================================================
  -- VALIDATION
  -- ========================================================================
  
  -- Verify company exists
  IF NOT EXISTS (SELECT 1 FROM companies WHERE id = p_company_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Company not found',
      'invoice_id', NULL
    );
  END IF;

  -- Verify customer exists and belongs to company
  IF NOT EXISTS (SELECT 1 FROM customers WHERE id = p_customer_id AND company_id = p_company_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Customer not found or does not belong to this company',
      'invoice_id', NULL
    );
  END IF;

  -- Verify work order exists and belongs to company (if provided)
  IF p_work_order_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM work_orders WHERE id = p_work_order_id AND company_id = p_company_id) THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Work order not found or does not belong to this company',
        'invoice_id', NULL
      );
    END IF;
  END IF;

  -- Verify invoice number is unique
  IF EXISTS (SELECT 1 FROM invoices WHERE invoice_number = p_invoice_number AND company_id = p_company_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invoice number already exists for this company',
      'invoice_id', NULL
    );
  END IF;

  -- ========================================================================
  -- CREATE INVOICE
  -- ========================================================================
  
  INSERT INTO invoices (
    company_id,
    work_order_id,
    customer_id,
    invoice_number,
    total_amount,
    subtotal,
    tax_amount,
    issue_date,
    due_date,
    notes,
    status,
    created_at,
    updated_at
  ) VALUES (
    p_company_id,
    p_work_order_id,
    p_customer_id,
    p_invoice_number,
    p_total_amount,
    p_subtotal,
    p_tax_amount,
    p_issue_date,
    p_due_date,
    p_notes,
    'draft',
    NOW(),
    NOW()
  )
  RETURNING id INTO v_invoice_id;

  -- ========================================================================
  -- RETURN SUCCESS
  -- ========================================================================
  
  RETURN jsonb_build_object(
    'success', true,
    'invoice_id', v_invoice_id,
    'invoice_number', p_invoice_number,
    'message', 'Invoice created successfully'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'invoice_id', NULL
  );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION create_invoice(uuid, uuid, uuid, text, numeric, numeric, numeric, date, date, text) TO authenticated;
GRANT EXECUTE ON FUNCTION create_invoice(uuid, uuid, uuid, text, numeric, numeric, numeric, date, date, text) TO anon;

-- ============================================================================
-- RPC: create_invoice_and_update_work_order
-- ============================================================================
-- Creates an invoice AND updates work order status in a single atomic transaction
-- This ensures consistency - if either fails, both are rolled back
--
-- USAGE:
-- SELECT * FROM create_invoice_and_update_work_order(
--   p_company_id := 'company-uuid',
--   p_work_order_id := 'work-order-uuid',
--   p_customer_id := 'customer-uuid',
--   p_invoice_number := 'INV-2025-0001',
--   p_total_amount := 1500.00,
--   p_subtotal := 1500.00,
--   p_tax_amount := 0.00,
--   p_issue_date := '2025-10-29',
--   p_due_date := '2025-11-28',
--   p_notes := 'Thank you for your business.'
-- );
-- ============================================================================

DROP FUNCTION IF EXISTS create_invoice_and_update_work_order(uuid, uuid, uuid, text, numeric, numeric, numeric, date, date, text) CASCADE;

CREATE OR REPLACE FUNCTION create_invoice_and_update_work_order(
  p_company_id uuid,
  p_work_order_id uuid,
  p_customer_id uuid,
  p_invoice_number text,
  p_total_amount numeric,
  p_subtotal numeric,
  p_tax_amount numeric,
  p_issue_date date,
  p_due_date date,
  p_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invoice_id uuid;
  v_result jsonb;
BEGIN
  -- ========================================================================
  -- VALIDATION
  -- ========================================================================

  -- Verify company exists
  IF NOT EXISTS (SELECT 1 FROM companies WHERE id = p_company_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Company not found',
      'invoice_id', NULL
    );
  END IF;

  -- Verify customer exists and belongs to company
  IF NOT EXISTS (SELECT 1 FROM customers WHERE id = p_customer_id AND company_id = p_company_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Customer not found or does not belong to this company',
      'invoice_id', NULL
    );
  END IF;

  -- Verify work order exists and belongs to company
  IF NOT EXISTS (SELECT 1 FROM work_orders WHERE id = p_work_order_id AND company_id = p_company_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Work order not found or does not belong to this company',
      'invoice_id', NULL
    );
  END IF;

  -- Verify invoice number is unique
  IF EXISTS (SELECT 1 FROM invoices WHERE invoice_number = p_invoice_number AND company_id = p_company_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invoice number already exists for this company',
      'invoice_id', NULL
    );
  END IF;

  -- ========================================================================
  -- CREATE INVOICE (ATOMIC TRANSACTION)
  -- ========================================================================

  INSERT INTO invoices (
    company_id,
    work_order_id,
    customer_id,
    invoice_number,
    total_amount,
    subtotal,
    tax_amount,
    issue_date,
    due_date,
    notes,
    status,
    created_at,
    updated_at
  ) VALUES (
    p_company_id,
    p_work_order_id,
    p_customer_id,
    p_invoice_number,
    p_total_amount,
    p_subtotal,
    p_tax_amount,
    p_issue_date,
    p_due_date,
    p_notes,
    'draft',
    NOW(),
    NOW()
  )
  RETURNING id INTO v_invoice_id;

  -- ========================================================================
  -- UPDATE WORK ORDER STATUS TO INVOICED
  -- ========================================================================

  UPDATE work_orders
  SET
    status = 'invoiced',
    invoiced_at = NOW(),
    updated_at = NOW()
  WHERE id = p_work_order_id AND company_id = p_company_id;

  -- ========================================================================
  -- RETURN SUCCESS
  -- ========================================================================

  RETURN jsonb_build_object(
    'success', true,
    'invoice_id', v_invoice_id,
    'invoice_number', p_invoice_number,
    'message', 'Invoice created and work order updated successfully'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'invoice_id', NULL
  );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION create_invoice_and_update_work_order(uuid, uuid, uuid, text, numeric, numeric, numeric, date, date, text) TO authenticated;
GRANT EXECUTE ON FUNCTION create_invoice_and_update_work_order(uuid, uuid, uuid, text, numeric, numeric, numeric, date, date, text) TO anon;

