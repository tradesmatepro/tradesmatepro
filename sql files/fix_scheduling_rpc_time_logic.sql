-- ============================================================================
-- FIX: CONSOLIDATED SCHEDULING RPC - TIME ARITHMETIC BUG
-- ============================================================================
-- PROBLEM: The slot generation loop has broken time arithmetic
-- Line 124: WHILE (v_current_time::time + (p_duration_minutes || ' minutes')::interval)::time <= v_business_end
-- This doesn't work because you can't add an interval to a TIME type directly
--
-- SOLUTION: Use TIMESTAMP arithmetic instead of TIME arithmetic
-- ============================================================================

DROP FUNCTION IF EXISTS get_available_time_slots_consolidated(uuid, uuid[], integer, date, date) CASCADE;

CREATE OR REPLACE FUNCTION get_available_time_slots_consolidated(
  p_company_id uuid,
  p_employee_ids uuid[],
  p_duration_minutes integer,
  p_start_date date,
  p_end_date date
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_settings record;
  v_employee_id uuid;
  v_slots jsonb := '[]'::jsonb;
  v_debug jsonb := '{}'::jsonb;
  v_current_date date;
  v_slot_start timestamp;
  v_slot_end timestamp;
  v_business_start time;
  v_business_end time;
  v_working_days jsonb;
  v_dow integer;
  v_conflict_count integer;
  v_slot_obj jsonb;
  v_slots_generated integer := 0;
  v_slots_filtered integer := 0;
BEGIN
  -- ========================================================================
  -- PHASE 1: LOAD SETTINGS
  -- ========================================================================
  SELECT
    business_hours_start,
    business_hours_end,
    COALESCE(working_days, '["monday", "tuesday", "wednesday", "thursday", "friday"]'::jsonb) as working_days,
    timezone
  INTO v_settings
  FROM company_settings
  WHERE company_id = p_company_id;

  IF NOT FOUND THEN
    v_debug := jsonb_set(v_debug, '{error}', '"Settings not found for company"');
    RETURN jsonb_build_object('success', false, 'slots', '[]'::jsonb, 'debug', v_debug);
  END IF;

  v_business_start := COALESCE(v_settings.business_hours_start, '08:00'::time);
  v_business_end := COALESCE(v_settings.business_hours_end, '17:00'::time);

  -- Handle both working_days formats:
  -- Format 1 (array): ["monday", "tuesday", ...]
  -- Format 2 (object): {"monday":true, "tuesday":true, ...}
  IF v_settings.working_days IS NULL THEN
    v_working_days := '["monday", "tuesday", "wednesday", "thursday", "friday"]'::jsonb;
  ELSIF jsonb_typeof(v_settings.working_days) = 'array' THEN
    v_working_days := v_settings.working_days;
  ELSE
    -- Convert object format to array format
    v_working_days := jsonb_agg(key) FILTER (WHERE value::boolean = true)
      FROM jsonb_each(v_settings.working_days);
  END IF;

  v_debug := jsonb_set(v_debug, '{settings_loaded}', 'true');
  v_debug := jsonb_set(v_debug, '{business_hours}', to_jsonb(v_business_start::text || '-' || v_business_end::text));

  -- ========================================================================
  -- PHASE 2: VALIDATE INPUTS
  -- ========================================================================
  IF p_duration_minutes < 15 THEN
    v_debug := jsonb_set(v_debug, '{error}', '"Duration must be at least 15 minutes"');
    RETURN jsonb_build_object('success', false, 'slots', '[]'::jsonb, 'debug', v_debug);
  END IF;

  IF p_employee_ids IS NULL OR array_length(p_employee_ids, 1) = 0 THEN
    v_debug := jsonb_set(v_debug, '{error}', '"No employees provided"');
    RETURN jsonb_build_object('success', false, 'slots', '[]'::jsonb, 'debug', v_debug);
  END IF;

  -- ========================================================================
  -- PHASE 3: GENERATE SLOTS FOR EACH EMPLOYEE
  -- ========================================================================
  FOREACH v_employee_id IN ARRAY p_employee_ids LOOP
    v_current_date := p_start_date;

    WHILE v_current_date <= p_end_date LOOP
      -- Check if this is a working day
      v_dow := EXTRACT(DOW FROM v_current_date)::integer;

      -- PostgreSQL DOW: 0=Sunday, 1=Monday, ..., 6=Saturday
      IF (v_dow = 1 AND v_working_days @> '"monday"'::jsonb) OR
         (v_dow = 2 AND v_working_days @> '"tuesday"'::jsonb) OR
         (v_dow = 3 AND v_working_days @> '"wednesday"'::jsonb) OR
         (v_dow = 4 AND v_working_days @> '"thursday"'::jsonb) OR
         (v_dow = 5 AND v_working_days @> '"friday"'::jsonb) OR
         (v_dow = 6 AND v_working_days @> '"saturday"'::jsonb) OR
         (v_dow = 0 AND v_working_days @> '"sunday"'::jsonb) THEN

        -- Generate 15-minute slots for this day using TIMESTAMP arithmetic
        v_slot_start := v_current_date::timestamp + v_business_start;

        -- FIXED: Use TIMESTAMP arithmetic instead of TIME arithmetic
        WHILE v_slot_start + (p_duration_minutes || ' minutes')::interval <= v_current_date::timestamp + v_business_end LOOP
          v_slot_end := v_slot_start + (p_duration_minutes || ' minutes')::interval;

          v_slots_generated := v_slots_generated + 1;

          -- Check for conflicts
          SELECT COUNT(*) INTO v_conflict_count
          FROM (
            SELECT se.id FROM schedule_events se
            WHERE se.employee_id = v_employee_id
              AND se.company_id = p_company_id
              AND se.start_time < v_slot_end
              AND se.end_time > v_slot_start
            UNION ALL
            SELECT wo.id FROM work_orders wo
            WHERE wo.assigned_to = v_employee_id
              AND wo.company_id = p_company_id
              AND wo.status IN ('scheduled', 'in_progress')
              AND wo.scheduled_start < v_slot_end
              AND wo.scheduled_end > v_slot_start
            UNION ALL
            SELECT eto.id FROM employee_time_off eto
            WHERE eto.employee_id = v_employee_id
              AND eto.company_id = p_company_id
              AND eto.status = 'APPROVED'
              AND eto.starts_at < v_slot_end
              AND eto.ends_at > v_slot_start
          ) conflicts;

          -- If no conflicts, add to slots
          IF v_conflict_count = 0 THEN
            v_slot_obj := jsonb_build_object(
              'start_time', v_slot_start::text,
              'end_time', v_slot_end::text,
              'employee_id', v_employee_id::text,
              'duration_minutes', p_duration_minutes,
              'date', v_current_date::text,
              'time_range', (v_slot_start::time)::text || ' - ' || (v_slot_end::time)::text
            );
            v_slots := v_slots || jsonb_build_array(v_slot_obj);
          ELSE
            v_slots_filtered := v_slots_filtered + 1;
          END IF;

          -- Move to next 15-minute slot
          v_slot_start := v_slot_start + '15 minutes'::interval;
        END LOOP;
      END IF;

      v_current_date := v_current_date + 1;
    END LOOP;
  END LOOP;

  -- ========================================================================
  -- PHASE 4: BUILD RESPONSE
  -- ========================================================================
  v_debug := jsonb_set(v_debug, '{slots_generated}', to_jsonb(v_slots_generated));
  v_debug := jsonb_set(v_debug, '{slots_filtered_due_to_conflicts}', to_jsonb(v_slots_filtered));
  v_debug := jsonb_set(v_debug, '{slots_returned}', to_jsonb(jsonb_array_length(v_slots)));
  v_debug := jsonb_set(v_debug, '{employees_checked}', to_jsonb(array_length(p_employee_ids, 1)));
  v_debug := jsonb_set(v_debug, '{date_range}', to_jsonb(p_start_date::text || ' to ' || p_end_date::text));

  RETURN jsonb_build_object(
    'success', true,
    'slots', v_slots,
    'debug', v_debug
  );

EXCEPTION WHEN OTHERS THEN
  v_debug := jsonb_set(v_debug, '{error}', to_jsonb(SQLERRM));
  RETURN jsonb_build_object(
    'success', false,
    'slots', '[]'::jsonb,
    'debug', v_debug
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_available_time_slots_consolidated(uuid, uuid[], integer, date, date) TO anon;
GRANT EXECUTE ON FUNCTION get_available_time_slots_consolidated(uuid, uuid[], integer, date, date) TO authenticated;

