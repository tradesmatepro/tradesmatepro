-- =====================================================
-- WORK ORDERS PIPELINE CLEANUP
-- Eliminates dual sources between quotes table and work_orders
-- Ensures single source of truth through work_orders pipeline
-- =====================================================

BEGIN;

-- 1. ENSURE QUOTES_COMPAT_V VIEW EXISTS
-- =====================================================
CREATE OR REPLACE VIEW quotes_compat_v AS
SELECT 
    id,
    company_id,
    customer_id,
    title,
    description,
    subtotal,
    total_amount,
    quote_status as status,
    quote_number,
    created_at,
    updated_at,
    -- Additional fields that might be expected
    notes,
    tax_rate,
    tax_amount,
    labor_subtotal,
    service_address_line_1,
    service_address_line_2,
    service_city,
    service_state,
    service_zip_code
FROM work_orders
WHERE stage = 'QUOTE';

COMMENT ON VIEW quotes_compat_v IS 'COMPATIBILITY VIEW: Maps work_orders (stage=QUOTE) to legacy quotes interface. Use this instead of quotes table for read operations.';

-- 2. ENSURE QUOTE_ITEMS_COMPAT_V VIEW EXISTS  
-- =====================================================
CREATE OR REPLACE VIEW quote_items_compat_v AS
SELECT 
    woi.id,
    woi.work_order_id as quote_id,
    woi.company_id,
    woi.item_name,
    woi.description,
    woi.quantity,
    woi.rate,
    woi.total,
    woi.is_overtime,
    woi.photo_url,
    woi.created_at,
    woi.updated_at
FROM work_order_items woi
JOIN work_orders wo ON woi.work_order_id = wo.id
WHERE wo.stage = 'QUOTE';

COMMENT ON VIEW quote_items_compat_v IS 'COMPATIBILITY VIEW: Maps work_order_items (for quotes) to legacy quote_items interface. Use this instead of quote_items table.';

-- 3. MARK LEGACY TABLES AS DEPRECATED
-- =====================================================

-- Mark quotes table as deprecated
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quotes' AND table_type = 'BASE TABLE') THEN
        COMMENT ON TABLE quotes IS 'DEPRECATED: Use work_orders with stage=QUOTE instead. This table causes data inconsistency. Use quotes_compat_v view for read operations.';
    END IF;
END $$;

-- Mark quote_items table as deprecated
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quote_items' AND table_type = 'BASE TABLE') THEN
        COMMENT ON TABLE quote_items IS 'DEPRECATED: Use work_order_items instead. This table causes data inconsistency. Use quote_items_compat_v view for read operations.';
    END IF;
END $$;

-- Mark jobs table as deprecated (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jobs' AND table_type = 'BASE TABLE') THEN
        COMMENT ON TABLE jobs IS 'DEPRECATED: Use work_orders with stage=JOB instead. This table causes data inconsistency.';
    END IF;
END $$;

-- 4. CREATE HELPER FUNCTIONS FOR PIPELINE OPERATIONS
-- =====================================================

-- Function to promote quote to job
CREATE OR REPLACE FUNCTION promote_quote_to_job(
    p_work_order_id UUID,
    p_job_status TEXT DEFAULT 'DRAFT'
) RETURNS BOOLEAN AS $$
DECLARE
    v_current_stage TEXT;
BEGIN
    -- Check current stage
    SELECT stage INTO v_current_stage
    FROM work_orders 
    WHERE id = p_work_order_id;
    
    IF v_current_stage IS NULL THEN
        RAISE EXCEPTION 'Work order not found: %', p_work_order_id;
    END IF;
    
    IF v_current_stage != 'QUOTE' THEN
        RAISE EXCEPTION 'Can only promote quotes to jobs. Current stage: %', v_current_stage;
    END IF;
    
    -- Promote to job stage
    UPDATE work_orders 
    SET 
        stage = 'JOB',
        job_status = p_job_status,
        updated_at = NOW()
    WHERE id = p_work_order_id;
    
    -- Log the transition
    INSERT INTO work_order_audit (
        work_order_id, 
        action, 
        old_values, 
        new_values,
        created_at
    ) VALUES (
        p_work_order_id,
        'STAGE_PROMOTION',
        jsonb_build_object('stage', v_current_stage),
        jsonb_build_object('stage', 'JOB', 'job_status', p_job_status),
        NOW()
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to promote job to work order
CREATE OR REPLACE FUNCTION promote_job_to_work_order(
    p_work_order_id UUID,
    p_work_status TEXT DEFAULT 'ASSIGNED'
) RETURNS BOOLEAN AS $$
DECLARE
    v_current_stage TEXT;
BEGIN
    -- Check current stage
    SELECT stage INTO v_current_stage
    FROM work_orders 
    WHERE id = p_work_order_id;
    
    IF v_current_stage IS NULL THEN
        RAISE EXCEPTION 'Work order not found: %', p_work_order_id;
    END IF;
    
    IF v_current_stage != 'JOB' THEN
        RAISE EXCEPTION 'Can only promote jobs to work orders. Current stage: %', v_current_stage;
    END IF;
    
    -- Promote to work order stage
    UPDATE work_orders 
    SET 
        stage = 'WORK_ORDER',
        work_status = p_work_status,
        updated_at = NOW()
    WHERE id = p_work_order_id;
    
    -- Log the transition
    INSERT INTO work_order_audit (
        work_order_id, 
        action, 
        old_values, 
        new_values,
        created_at
    ) VALUES (
        p_work_order_id,
        'STAGE_PROMOTION',
        jsonb_build_object('stage', v_current_stage),
        jsonb_build_object('stage', 'WORK_ORDER', 'work_status', p_work_status),
        NOW()
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 5. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Index on work_orders for stage filtering (if not exists)
CREATE INDEX IF NOT EXISTS idx_work_orders_stage 
ON work_orders (stage);

-- Index on work_orders for stage + company filtering
CREATE INDEX IF NOT EXISTS idx_work_orders_stage_company 
ON work_orders (stage, company_id);

-- Index on work_order_items for work_order_id
CREATE INDEX IF NOT EXISTS idx_work_order_items_work_order_id 
ON work_order_items (work_order_id);

-- 6. GRANT PERMISSIONS
-- =====================================================

-- Grant access to compatibility views
GRANT SELECT ON quotes_compat_v TO authenticated;
GRANT SELECT ON quotes_compat_v TO anon;
GRANT SELECT ON quote_items_compat_v TO authenticated;
GRANT SELECT ON quote_items_compat_v TO anon;

-- Grant access to helper functions
GRANT EXECUTE ON FUNCTION promote_quote_to_job TO authenticated;
GRANT EXECUTE ON FUNCTION promote_job_to_work_order TO authenticated;

COMMIT;

-- =====================================================
-- PIPELINE CLEANUP COMPLETED!
--
-- What was accomplished:
-- 1. ✅ Created quotes_compat_v view for legacy compatibility
-- 2. ✅ Created quote_items_compat_v view for legacy compatibility
-- 3. ✅ Marked legacy tables as deprecated with clear comments
-- 4. ✅ Added helper functions for stage promotions with audit trail
-- 5. ✅ Created performance indexes for stage-based queries
-- 6. ✅ Granted proper permissions for views and functions
--
-- Next Steps:
-- - Update application code to remove legacy table references
-- - Use work_orders with stage filtering instead of separate tables
-- - Use compatibility views only where absolutely necessary
-- - All new development should use unified work_orders pipeline
-- =====================================================
