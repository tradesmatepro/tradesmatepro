-- Enhanced work order stage/status management with backward transitions and audit logging
-- Run this directly in Supabase SQL Editor
-- Adds missing columns and sequences if they don't exist

-- Create job number sequence if it doesn't exist
CREATE SEQUENCE IF NOT EXISTS job_number_seq START 1000;

-- Add missing columns to work_orders table if they don't exist
DO $$
BEGIN
    -- Add reason column for backward transitions
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'work_orders' AND column_name = 'reason') THEN
        ALTER TABLE work_orders ADD COLUMN reason TEXT;
    END IF;

    -- Add stage column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'work_orders' AND column_name = 'stage') THEN
        ALTER TABLE work_orders ADD COLUMN stage TEXT DEFAULT 'WORK_ORDER';
    END IF;

    -- Add status columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'work_orders' AND column_name = 'quote_status') THEN
        ALTER TABLE work_orders ADD COLUMN quote_status TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'work_orders' AND column_name = 'job_status') THEN
        ALTER TABLE work_orders ADD COLUMN job_status TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'work_orders' AND column_name = 'work_status') THEN
        ALTER TABLE work_orders ADD COLUMN work_status TEXT;
    END IF;

    -- Add job_number column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'work_orders' AND column_name = 'job_number') THEN
        ALTER TABLE work_orders ADD COLUMN job_number TEXT UNIQUE;
    END IF;

    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'work_orders' AND column_name = 'updated_at') THEN
        ALTER TABLE work_orders ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Enhanced stage/status management function
CREATE OR REPLACE FUNCTION wo_stage_status_auto()
RETURNS TRIGGER AS $$
DECLARE
    old_stage TEXT;
    new_stage TEXT;
    old_status TEXT;
    new_status TEXT;
    current_user_id UUID;
    is_backward_move BOOLEAN := FALSE;
    stage_order_old INTEGER;
    stage_order_new INTEGER;
    reason_text TEXT;
BEGIN
    -- Get current user ID from Supabase auth context
    current_user_id := auth.uid();
    
    -- Extract reason from NEW record if provided
    reason_text := NEW.reason;
    
    -- Determine old and new stages/statuses
    IF TG_OP = 'INSERT' THEN
        old_stage := NULL;
        old_status := NULL;
        new_stage := NEW.stage;
        
        -- Determine new status based on stage
        new_status := CASE 
            WHEN NEW.stage = 'QUOTE' THEN NEW.quote_status
            WHEN NEW.stage = 'JOB' THEN NEW.job_status  
            WHEN NEW.stage = 'WORK_ORDER' THEN NEW.work_status
            ELSE NEW.status
        END;
        
        RAISE NOTICE 'WO_TRIGGER: INSERT - Stage: %, Status: %', new_stage, new_status;
        
    ELSIF TG_OP = 'UPDATE' THEN
        old_stage := OLD.stage;
        new_stage := NEW.stage;
        
        -- Determine old and new statuses based on their respective stages
        old_status := CASE 
            WHEN OLD.stage = 'QUOTE' THEN OLD.quote_status
            WHEN OLD.stage = 'JOB' THEN OLD.job_status
            WHEN OLD.stage = 'WORK_ORDER' THEN OLD.work_status
            ELSE OLD.status
        END;
        
        new_status := CASE 
            WHEN NEW.stage = 'QUOTE' THEN NEW.quote_status
            WHEN NEW.stage = 'JOB' THEN NEW.job_status
            WHEN NEW.stage = 'WORK_ORDER' THEN NEW.work_status
            ELSE NEW.status
        END;
        
        RAISE NOTICE 'WO_TRIGGER: UPDATE - Stage: % → %, Status: % → %', old_stage, new_stage, old_status, new_status;
        
        -- Check if this is a backward stage transition
        stage_order_old := CASE old_stage
            WHEN 'QUOTE' THEN 1
            WHEN 'JOB' THEN 2  
            WHEN 'WORK_ORDER' THEN 3
            WHEN 'INVOICED' THEN 4
            WHEN 'PAID' THEN 5
            ELSE 0
        END;
        
        stage_order_new := CASE new_stage
            WHEN 'QUOTE' THEN 1
            WHEN 'JOB' THEN 2
            WHEN 'WORK_ORDER' THEN 3  
            WHEN 'INVOICED' THEN 4
            WHEN 'PAID' THEN 5
            ELSE 0
        END;
        
        is_backward_move := (stage_order_new < stage_order_old);
        
        -- For backward moves, require a reason
        IF is_backward_move AND (reason_text IS NULL OR trim(reason_text) = '') THEN
            RAISE EXCEPTION 'Backward stage transition from % to % requires a reason', old_stage, new_stage;
        END IF;
        
        -- Validate allowed backward transitions
        IF is_backward_move THEN
            RAISE NOTICE 'WO_TRIGGER: Backward move detected: % → % with reason: %', old_stage, new_stage, reason_text;
            
            -- Define allowed backward transitions
            IF NOT (
                (old_stage = 'WORK_ORDER' AND new_stage = 'JOB') OR
                (old_stage = 'INVOICED' AND new_stage = 'WORK_ORDER') OR  
                (old_stage = 'PAID' AND new_stage = 'INVOICED')
            ) THEN
                RAISE EXCEPTION 'Backward transition from % to % is not allowed', old_stage, new_stage;
            END IF;
        END IF;
        
        -- Validate forward stage progressions (existing logic)
        IF NOT is_backward_move AND old_stage != new_stage THEN
            IF NOT (
                (old_stage = 'QUOTE' AND new_stage = 'JOB') OR
                (old_stage = 'JOB' AND new_stage = 'WORK_ORDER') OR
                (old_stage = 'WORK_ORDER' AND new_stage = 'INVOICED') OR
                (old_stage = 'INVOICED' AND new_stage = 'PAID')
            ) THEN
                RAISE EXCEPTION 'Invalid stage transition from % to %', old_stage, new_stage;
            END IF;
        END IF;
        
        -- Auto-generate job numbers and other existing logic
        IF NEW.stage = 'JOB' AND (OLD.stage != 'JOB' OR OLD.job_number IS NULL) THEN
            IF NEW.job_number IS NULL OR NEW.job_number = '' THEN
                NEW.job_number := 'J' || EXTRACT(YEAR FROM NOW()) || '-' ||
                    LPAD(NEXTVAL('job_number_seq')::TEXT, 4, '0');
                RAISE NOTICE 'WO_TRIGGER: Generated job_number: %', NEW.job_number;
            END IF;
        END IF;
        
        -- Sync unified status field with stage-specific status
        NEW.status := new_status;
        
        -- Set updated_at
        NEW.updated_at := NOW();
    END IF;
    
    -- Insert audit record for any stage or status change using existing wo_audit table
    IF TG_OP = 'INSERT' OR (old_stage IS DISTINCT FROM new_stage OR old_status IS DISTINCT FROM new_status) THEN
        INSERT INTO wo_audit (
            wo_id,
            action,
            details
        ) VALUES (
            COALESCE(NEW.id, OLD.id),
            CASE
                WHEN TG_OP = 'INSERT' THEN 'CREATED'
                WHEN old_stage IS DISTINCT FROM new_stage THEN 'STAGE_CHANGE'
                ELSE 'STATUS_CHANGE'
            END,
            jsonb_build_object(
                'old_stage', old_stage,
                'new_stage', new_stage,
                'old_status', old_status,
                'new_status', new_status,
                'reason', reason_text,
                'changed_by', current_user_id,
                'operation', TG_OP
            )
        );

        RAISE NOTICE 'WO_TRIGGER: Audit record created for wo_id: %', COALESCE(NEW.id, OLD.id);
    END IF;
    
    -- Clear the reason field so it doesn't persist in the work_orders table
    IF TG_OP = 'UPDATE' AND NEW.reason IS NOT NULL THEN
        NEW.reason := NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists and recreate
-- Check if table is work_orders or wo_master
DROP TRIGGER IF EXISTS trg_wo_stage_status_auto ON work_orders;
DROP TRIGGER IF EXISTS trg_wo_stage_status_auto ON wo_master;

-- Create the trigger - adjust table name as needed
-- If your table is called wo_master instead of work_orders, change this line:
CREATE TRIGGER trg_wo_stage_status_auto
    BEFORE INSERT OR UPDATE ON work_orders
    FOR EACH ROW
    EXECUTE FUNCTION wo_stage_status_auto();

-- Alternative if your table is wo_master:
-- CREATE TRIGGER trg_wo_stage_status_auto
--     BEFORE INSERT OR UPDATE ON wo_master
--     FOR EACH ROW
--     EXECUTE FUNCTION wo_stage_status_auto();

-- Create RPC function for status changes
CREATE OR REPLACE FUNCTION wo_change_status(
    p_id UUID,
    p_to TEXT,
    p_reason TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
    v_record RECORD;
    v_result JSON;
BEGIN
    -- Get current record
    SELECT * INTO v_record FROM work_orders WHERE id = p_id;

    IF NOT FOUND THEN
        RETURN json_build_object('error', 'Work order not found');
    END IF;

    -- Update the work order with new status/stage and reason
    -- The trigger will handle validation and audit logging
    UPDATE work_orders
    SET work_status = p_to,
        reason = p_reason,
        updated_at = NOW()
    WHERE id = p_id;

    -- Get updated record
    SELECT * INTO v_record FROM work_orders WHERE id = p_id;

    -- Return success with updated data
    v_result := json_build_object(
        'success', true,
        'message', 'Status updated successfully',
        'data', row_to_json(v_record)
    );

    RETURN v_result;

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT SELECT, INSERT ON wo_audit TO authenticated;
GRANT USAGE ON SEQUENCE job_number_seq TO authenticated;
GRANT EXECUTE ON FUNCTION wo_change_status(UUID, TEXT, TEXT) TO authenticated;

-- Test the setup
SELECT 'Enhanced work order trigger installed successfully!' as result;
