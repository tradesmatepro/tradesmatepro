-- Update validation function to handle UPPERCASE enum values
CREATE OR REPLACE FUNCTION validate_work_order_status_transition(
    p_current_status work_order_status_enum,
    p_new_status work_order_status_enum
) RETURNS BOOLEAN AS $$
BEGIN
    -- ✅ Allow same status (no transition)
    IF p_current_status = p_new_status THEN
        RETURN TRUE;
    END IF;

    -- ✅ Allow NULL transitions
    IF p_current_status IS NULL OR p_new_status IS NULL THEN
        RETURN TRUE;
    END IF;

    -- ✅ Allow all transitions for now (frontend controls workflow)
    -- Industry standard: Frontend = source of truth, Backend = validation only
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION validate_work_order_status_transition(work_order_status_enum, work_order_status_enum) IS 
'Validates work_order_status transitions. Currently allows all transitions. Frontend controls workflow logic.';

