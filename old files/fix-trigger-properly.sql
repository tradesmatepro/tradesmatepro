-- FIX THE TRIGGER TO HANDLE NULL STATUS PROPERLY
-- Industry standard: Allow updates that don't change status (NULL means "don't change")

CREATE OR REPLACE FUNCTION public.enforce_work_order_status()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    -- ✅ FIX: If NEW.status is NULL, keep OLD.status (don't change it)
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
    IF NEW.status = 'in_progress' AND NEW.actual_start IS NULL THEN
        NEW.actual_start := NOW();
    END IF;

    IF NEW.status = 'completed' AND NEW.actual_end IS NULL THEN
        NEW.actual_end := NOW();
    END IF;

    -- Auto-generate reference numbers
    IF NEW.work_order_number IS NULL OR NEW.work_order_number = '' THEN
        NEW.work_order_number := generate_work_order_number(NEW.company_id);
    END IF;

    RETURN NEW;
END;
$function$;

