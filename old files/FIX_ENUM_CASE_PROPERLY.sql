-- ============================================================================
-- FIX ENUM CASE MISMATCH - PROPER SOLUTION
-- ============================================================================
-- PROBLEM: Database has lowercase, frontend sends UPPERCASE
-- SOLUTION: Recreate enum with UPPERCASE values (industry standard)
-- ============================================================================

-- Step 1: Create new enum with UPPERCASE values
CREATE TYPE work_order_status_enum_new AS ENUM (
    'DRAFT',
    'QUOTE', 
    'SENT',
    'ACCEPTED',
    'REJECTED',
    'SCHEDULED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'INVOICED',
    'PAID',
    'CLOSED'
);

-- Step 2: Drop default constraint first
ALTER TABLE work_orders ALTER COLUMN status DROP DEFAULT;

-- Step 3: Convert work_orders.status column
-- Map lowercase to UPPERCASE
ALTER TABLE work_orders
ALTER COLUMN status TYPE work_order_status_enum_new
USING (
    CASE status::text
        WHEN 'draft' THEN 'DRAFT'
        WHEN 'quote' THEN 'QUOTE'
        WHEN 'sent' THEN 'SENT'
        WHEN 'approved' THEN 'ACCEPTED'  -- Map approved → ACCEPTED
        WHEN 'rejected' THEN 'REJECTED'
        WHEN 'scheduled' THEN 'SCHEDULED'
        WHEN 'in_progress' THEN 'IN_PROGRESS'
        WHEN 'completed' THEN 'COMPLETED'
        WHEN 'cancelled' THEN 'CANCELLED'
        WHEN 'invoiced' THEN 'INVOICED'
        WHEN 'paid' THEN 'PAID'
        WHEN 'closed' THEN 'CLOSED'
        ELSE 'DRAFT'  -- Default fallback
    END::work_order_status_enum_new
);

-- Step 4: Restore default with new enum
ALTER TABLE work_orders ALTER COLUMN status SET DEFAULT 'QUOTE'::work_order_status_enum_new;

-- Step 5: Drop old enum and rename new one
DROP TYPE work_order_status_enum CASCADE;
ALTER TYPE work_order_status_enum_new RENAME TO work_order_status_enum;

-- Step 6: Recreate the validation function with new enum
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

    -- Define valid status transitions (UPPERCASE)
    RETURN CASE
        -- Quote statuses
        WHEN p_current_status = 'QUOTE' THEN
            p_new_status IN ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'CANCELLED')
        WHEN p_current_status = 'DRAFT' THEN
            p_new_status IN ('QUOTE', 'SENT', 'SCHEDULED', 'CANCELLED')
        WHEN p_current_status = 'SENT' THEN
            p_new_status IN ('QUOTE', 'ACCEPTED', 'REJECTED', 'CANCELLED')
        WHEN p_current_status = 'ACCEPTED' THEN
            p_new_status IN ('SCHEDULED', 'CANCELLED')
        WHEN p_current_status = 'REJECTED' THEN
            p_new_status IN ('QUOTE', 'CANCELLED')

        -- Job statuses
        WHEN p_current_status = 'SCHEDULED' THEN
            p_new_status IN ('IN_PROGRESS', 'CANCELLED')
        WHEN p_current_status = 'IN_PROGRESS' THEN
            p_new_status IN ('COMPLETED', 'CANCELLED')

        -- Completion statuses
        WHEN p_current_status = 'COMPLETED' THEN
            p_new_status IN ('INVOICED')
        WHEN p_current_status = 'INVOICED' THEN
            p_new_status IN ('PAID', 'COMPLETED')
        WHEN p_current_status = 'PAID' THEN
            p_new_status IN ('CLOSED')
        WHEN p_current_status = 'CLOSED' THEN
            FALSE -- Can't change from closed
        WHEN p_current_status = 'CANCELLED' THEN
            p_new_status IN ('DRAFT', 'QUOTE', 'SCHEDULED') -- Allow reactivation

        ELSE TRUE -- Allow any other transitions for now
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Step 7: Recreate the trigger function
CREATE OR REPLACE FUNCTION enforce_work_order_status()
RETURNS TRIGGER AS $$
BEGIN
    -- ✅ If NEW.status is NULL, keep OLD.status
    IF NEW.status IS NULL AND OLD.status IS NOT NULL THEN
        NEW.status := OLD.status;
    END IF;

    -- Validate status transition (only if both are not null)
    IF OLD.status IS NOT NULL AND NEW.status IS NOT NULL THEN
        IF NOT validate_work_order_status_transition(OLD.status, NEW.status) THEN
            RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status;
        END IF;
    END IF;

    -- Auto-populate timestamps
    IF NEW.status = 'IN_PROGRESS' AND NEW.actual_start IS NULL THEN
        NEW.actual_start := NOW();
    END IF;

    IF NEW.status = 'COMPLETED' AND NEW.actual_end IS NULL THEN
        NEW.actual_end := NOW();
    END IF;

    -- Auto-generate reference numbers
    IF NEW.work_order_number IS NULL OR NEW.work_order_number = '' THEN
        NEW.work_order_number := generate_work_order_number(NEW.company_id);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Verify the fix
SELECT 'work_order_status_enum values (UPPERCASE):' as message;
SELECT unnest(enum_range(NULL::work_order_status_enum))::text as value;

