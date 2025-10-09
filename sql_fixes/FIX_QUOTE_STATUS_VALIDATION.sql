-- =========================================
-- FIX: Quote Status Validation
-- =========================================
-- Problem: validate_work_order_status_transition() doesn't handle 'quote' status
-- This causes "Invalid status transition from quote to quote" errors
--
-- Solution: Add all quote-related statuses to the validation function

-- Drop the existing function first (required when changing parameter names)
DROP FUNCTION IF EXISTS validate_work_order_status_transition(work_order_status_enum, work_order_status_enum);

CREATE OR REPLACE FUNCTION validate_work_order_status_transition(
    p_current_status work_order_status_enum,
    p_new_status work_order_status_enum
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Allow same-status updates (no transition)
    IF p_current_status = p_new_status THEN
        RETURN TRUE;
    END IF;

    -- Define valid status transitions
    -- Based on actual enum values: draft, quote, approved, scheduled, parts_ordered,
    -- on_hold, in_progress, requires_approval, rework_needed, completed, invoiced, cancelled
    RETURN CASE
        -- Quote statuses
        WHEN p_current_status = 'quote' THEN
            p_new_status IN ('draft', 'approved', 'cancelled')
        WHEN p_current_status = 'draft' THEN
            p_new_status IN ('quote', 'scheduled', 'cancelled')
        WHEN p_current_status = 'approved' THEN
            p_new_status IN ('scheduled', 'cancelled')

        -- Job statuses
        WHEN p_current_status = 'scheduled' THEN
            p_new_status IN ('in_progress', 'parts_ordered', 'on_hold', 'cancelled')
        WHEN p_current_status = 'parts_ordered' THEN
            p_new_status IN ('scheduled', 'on_hold', 'cancelled')
        WHEN p_current_status = 'in_progress' THEN
            p_new_status IN ('completed', 'on_hold', 'rework_needed', 'requires_approval', 'cancelled')
        WHEN p_current_status = 'on_hold' THEN
            p_new_status IN ('in_progress', 'scheduled', 'cancelled')
        WHEN p_current_status = 'rework_needed' THEN
            p_new_status IN ('in_progress', 'cancelled')
        WHEN p_current_status = 'requires_approval' THEN
            p_new_status IN ('approved', 'in_progress', 'cancelled')

        -- Completion statuses
        WHEN p_current_status = 'completed' THEN
            p_new_status IN ('invoiced', 'requires_approval')
        WHEN p_current_status = 'invoiced' THEN
            p_new_status IN ('completed') -- Allow un-invoicing
        WHEN p_current_status = 'cancelled' THEN
            p_new_status IN ('draft', 'quote', 'scheduled') -- Allow reactivation

        ELSE FALSE
    END;
END;
$$ LANGUAGE plpgsql;

-- Test the function
DO $$
BEGIN
    -- Test same-status (should return TRUE)
    IF NOT validate_work_order_status_transition('quote'::work_order_status_enum, 'quote'::work_order_status_enum) THEN
        RAISE EXCEPTION 'FAILED: Same status should be allowed';
    END IF;

    -- Test quote → approved (should return TRUE)
    IF NOT validate_work_order_status_transition('quote'::work_order_status_enum, 'approved'::work_order_status_enum) THEN
        RAISE EXCEPTION 'FAILED: quote → approved should be allowed';
    END IF;

    -- Test quote → completed (should return FALSE)
    IF validate_work_order_status_transition('quote'::work_order_status_enum, 'completed'::work_order_status_enum) THEN
        RAISE EXCEPTION 'FAILED: quote → completed should NOT be allowed';
    END IF;

    RAISE NOTICE 'SUCCESS: All validation tests passed!';
END $$;