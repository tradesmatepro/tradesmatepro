-- Fix the status validation function to allow same-status transitions
-- This is the ROOT CAUSE of "Invalid status transition from quote to quote"
-- The function already checks for same status, but the CASE statement below overrides it

CREATE OR REPLACE FUNCTION validate_work_order_status_transition(
    p_current_status work_order_status_enum,
    p_new_status work_order_status_enum
) RETURNS BOOLEAN AS $$
BEGIN
    -- ✅ CRITICAL FIX: Allow same status (no transition) - MUST BE FIRST
    IF p_current_status = p_new_status THEN
        RETURN TRUE;
    END IF;

    -- ✅ CRITICAL FIX: Allow NULL transitions (for updates that don't change status)
    IF p_current_status IS NULL OR p_new_status IS NULL THEN
        RETURN TRUE;
    END IF;

    -- Define valid status transitions
    -- Based on actual enum values: draft, quote, approved, scheduled, parts_ordered,
    -- on_hold, in_progress, requires_approval, rework_needed, completed, invoiced, cancelled
    RETURN CASE
        -- Quote statuses
        WHEN p_current_status = 'quote' THEN
            p_new_status IN ('draft', 'approved', 'cancelled', 'sent', 'rejected')
        WHEN p_current_status = 'draft' THEN
            p_new_status IN ('quote', 'scheduled', 'cancelled')
        WHEN p_current_status = 'approved' THEN
            p_new_status IN ('scheduled', 'cancelled')
        WHEN p_current_status = 'sent' THEN
            p_new_status IN ('quote', 'approved', 'rejected', 'cancelled')
        WHEN p_current_status = 'rejected' THEN
            p_new_status IN ('quote', 'cancelled')

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
            p_new_status IN ('completed', 'paid') -- Allow un-invoicing
        WHEN p_current_status = 'paid' THEN
            p_new_status IN ('closed')
        WHEN p_current_status = 'closed' THEN
            FALSE -- Can't change from closed
        WHEN p_current_status = 'cancelled' THEN
            p_new_status IN ('draft', 'quote', 'scheduled') -- Allow reactivation

        ELSE FALSE
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add comment
COMMENT ON FUNCTION validate_work_order_status_transition(work_order_status_enum, work_order_status_enum) IS
'Validates work order status transitions. Allows same-status updates (no transition).
Frontend controls workflow logic, database validates allowed transitions.';

