-- Enhanced work order stage/status management with backward transitions and audit logging
-- Extends existing forward progression logic with controlled backward moves

-- First, ensure work_order_audit table exists
CREATE TABLE IF NOT EXISTS work_order_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    changed_by UUID REFERENCES auth.users(id),
    old_stage TEXT,
    new_stage TEXT,
    old_status TEXT,
    new_status TEXT,
    reason TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_work_order_audit_work_order_id ON work_order_audit(work_order_id);
CREATE INDEX IF NOT EXISTS idx_work_order_audit_changed_at ON work_order_audit(changed_at);

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
    
    -- Insert audit record for any stage or status change
    IF TG_OP = 'INSERT' OR (old_stage != new_stage OR old_status != new_status) THEN
        INSERT INTO work_order_audit (
            work_order_id,
            changed_by, 
            old_stage,
            new_stage,
            old_status,
            new_status,
            reason,
            changed_at
        ) VALUES (
            COALESCE(NEW.id, OLD.id),
            current_user_id,
            old_stage,
            new_stage, 
            old_status,
            new_status,
            reason_text,
            NOW()
        );
        
        RAISE NOTICE 'WO_TRIGGER: Audit record created for work_order_id: %', COALESCE(NEW.id, OLD.id);
    END IF;
    
    -- Clear the reason field so it doesn't persist in the work_orders table
    IF TG_OP = 'UPDATE' AND NEW.reason IS NOT NULL THEN
        NEW.reason := NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists and recreate
DROP TRIGGER IF EXISTS trg_wo_stage_status_auto ON work_orders;

-- Create the trigger to fire on INSERT and UPDATE
CREATE TRIGGER trg_wo_stage_status_auto
    BEFORE INSERT OR UPDATE ON work_orders
    FOR EACH ROW
    EXECUTE FUNCTION wo_stage_status_auto();

-- Grant necessary permissions
GRANT SELECT, INSERT ON work_order_audit TO authenticated;
GRANT USAGE ON SEQUENCE job_number_seq TO authenticated;

-- Example usage:
-- Forward move (no reason required):
-- UPDATE work_orders SET stage = 'WORK_ORDER', work_status = 'ASSIGNED' WHERE id = 'some-uuid';

-- Backward move (reason required):  
-- UPDATE work_orders SET stage = 'JOB', job_status = 'SCHEDULED', reason = 'Customer requested postponement' WHERE id = 'some-uuid';

-- Status change within same stage (no reason required):
-- UPDATE work_orders SET work_status = 'COMPLETED' WHERE id = 'some-uuid';

-- Backward status change (reason required for certain cases):
-- UPDATE work_orders SET work_status = 'IN_PROGRESS', reason = 'Found additional work needed' WHERE id = 'some-uuid' AND work_status = 'COMPLETED';
