-- ============================================================================
-- FINANCIAL OPERATIONS RPCs
-- ============================================================================
-- Backend RPC functions for expenses, purchase orders, vendors
-- All use SECURITY DEFINER for RLS bypass with proper company scoping
-- ============================================================================

-- ============================================================================
-- RPC: create_expense
-- ============================================================================
DROP FUNCTION IF EXISTS create_expense(uuid, numeric, text, date, text, text, numeric, boolean, text) CASCADE;

CREATE OR REPLACE FUNCTION create_expense(
  p_company_id uuid,
  p_amount numeric,
  p_description text,
  p_date date,
  p_category text DEFAULT NULL,
  p_vendor text DEFAULT NULL,
  p_tax_amount numeric DEFAULT 0,
  p_is_billable boolean DEFAULT false,
  p_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_expense_id uuid;
BEGIN
  -- Validate company exists
  IF NOT EXISTS (SELECT 1 FROM companies WHERE id = p_company_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Company not found');
  END IF;

  -- Validate amount is positive
  IF p_amount <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Amount must be greater than 0');
  END IF;

  -- Create expense
  INSERT INTO expenses (
    company_id, amount, description, date, category, vendor, tax_amount, is_billable, notes
  ) VALUES (
    p_company_id, p_amount, p_description, p_date, p_category, p_vendor, p_tax_amount, p_is_billable, p_notes
  )
  RETURNING id INTO v_expense_id;

  RETURN jsonb_build_object(
    'success', true,
    'expense_id', v_expense_id,
    'message', 'Expense created successfully'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION create_expense(uuid, numeric, text, date, text, text, numeric, boolean, text) TO authenticated;
GRANT EXECUTE ON FUNCTION create_expense(uuid, numeric, text, date, text, text, numeric, boolean, text) TO anon;

-- ============================================================================
-- RPC: create_vendor
-- ============================================================================
DROP FUNCTION IF EXISTS create_vendor(uuid, text, text, text, text) CASCADE;

CREATE OR REPLACE FUNCTION create_vendor(
  p_company_id uuid,
  p_name text,
  p_email text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_address text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_vendor_id uuid;
BEGIN
  -- Validate company exists
  IF NOT EXISTS (SELECT 1 FROM companies WHERE id = p_company_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Company not found');
  END IF;

  -- Validate vendor name is not empty
  IF p_name IS NULL OR p_name = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Vendor name is required');
  END IF;

  -- Check for duplicate vendor name
  IF EXISTS (SELECT 1 FROM vendors WHERE company_id = p_company_id AND name = p_name) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Vendor with this name already exists');
  END IF;

  -- Create vendor
  INSERT INTO vendors (
    company_id, name, email, phone, address
  ) VALUES (
    p_company_id, p_name, p_email, p_phone, p_address
  )
  RETURNING id INTO v_vendor_id;

  RETURN jsonb_build_object(
    'success', true,
    'vendor_id', v_vendor_id,
    'vendor_name', p_name,
    'message', 'Vendor created successfully'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION create_vendor(uuid, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION create_vendor(uuid, text, text, text, text) TO anon;

-- ============================================================================
-- RPC: create_purchase_order
-- ============================================================================
DROP FUNCTION IF EXISTS create_purchase_order(uuid, text, uuid, numeric, numeric, numeric, numeric, date, text) CASCADE;

CREATE OR REPLACE FUNCTION create_purchase_order(
  p_company_id uuid,
  p_po_number text,
  p_vendor_id uuid,
  p_subtotal numeric DEFAULT 0,
  p_tax_amount numeric DEFAULT 0,
  p_shipping_amount numeric DEFAULT 0,
  p_total_amount numeric DEFAULT 0,
  p_expected_date date DEFAULT NULL,
  p_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_po_id uuid;
BEGIN
  -- Validate company exists
  IF NOT EXISTS (SELECT 1 FROM companies WHERE id = p_company_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Company not found');
  END IF;

  -- Validate PO number is unique
  IF EXISTS (SELECT 1 FROM purchase_orders WHERE company_id = p_company_id AND po_number = p_po_number) THEN
    RETURN jsonb_build_object('success', false, 'error', 'PO number already exists for this company');
  END IF;

  -- Validate vendor exists and belongs to company (if provided)
  IF p_vendor_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM vendors WHERE id = p_vendor_id AND company_id = p_company_id) THEN
      RETURN jsonb_build_object('success', false, 'error', 'Vendor not found or does not belong to this company');
    END IF;
  END IF;

  -- Create purchase order
  INSERT INTO purchase_orders (
    company_id, po_number, vendor_id, subtotal, tax_amount, shipping_amount, total_amount, expected_date, notes, status
  ) VALUES (
    p_company_id, p_po_number, p_vendor_id, p_subtotal, p_tax_amount, p_shipping_amount, p_total_amount, p_expected_date, p_notes, 'DRAFT'
  )
  RETURNING id INTO v_po_id;

  RETURN jsonb_build_object(
    'success', true,
    'po_id', v_po_id,
    'po_number', p_po_number,
    'message', 'Purchase order created successfully'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION create_purchase_order(uuid, text, uuid, numeric, numeric, numeric, numeric, date, text) TO authenticated;
GRANT EXECUTE ON FUNCTION create_purchase_order(uuid, text, uuid, numeric, numeric, numeric, numeric, date, text) TO anon;

-- ============================================================================
-- RPC: add_po_item
-- ============================================================================
DROP FUNCTION IF EXISTS add_po_item(uuid, uuid, text, numeric, numeric) CASCADE;

CREATE OR REPLACE FUNCTION add_po_item(
  p_company_id uuid,
  p_purchase_order_id uuid,
  p_item_name text,
  p_quantity numeric,
  p_unit_cost numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item_id uuid;
  v_line_total numeric;
BEGIN
  -- Validate company exists
  IF NOT EXISTS (SELECT 1 FROM companies WHERE id = p_company_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Company not found');
  END IF;

  -- Validate PO exists and belongs to company
  IF NOT EXISTS (SELECT 1 FROM purchase_orders WHERE id = p_purchase_order_id AND company_id = p_company_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Purchase order not found or does not belong to this company');
  END IF;

  -- Validate quantity and cost are positive
  IF p_quantity <= 0 OR p_unit_cost < 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Quantity must be positive and unit cost must be non-negative');
  END IF;

  -- Calculate line total
  v_line_total := p_quantity * p_unit_cost;

  -- Create PO item
  INSERT INTO po_items (
    company_id, purchase_order_id, item_name, quantity, unit_cost, line_total
  ) VALUES (
    p_company_id, p_purchase_order_id, p_item_name, p_quantity, p_unit_cost, v_line_total
  )
  RETURNING id INTO v_item_id;

  RETURN jsonb_build_object(
    'success', true,
    'item_id', v_item_id,
    'line_total', v_line_total,
    'message', 'PO item added successfully'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION add_po_item(uuid, uuid, text, numeric, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION add_po_item(uuid, uuid, text, numeric, numeric) TO anon;

