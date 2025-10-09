-- Multi-Role Marketplace RPC Functions
-- Based on the specifications in Marketplace/todo.md

-- 1. Function to get full request with roles and responses
CREATE OR REPLACE FUNCTION get_request_with_roles(request_id uuid)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'request_id', r.id,
    'title', r.title,
    'description', r.description,
    'fulfillment_mode', r.fulfillment_mode,
    'pricing_type', r.pricing_type,
    'service_mode', r.service_mode,
    'budget', r.budget,
    'start_time', r.start_time,
    'end_time', r.end_time,
    'preferred_time_option', r.preferred_time_option,
    'postal_code', r.postal_code,
    'location_city', r.location_city,
    'location_state', r.location_state,
    'location_address', r.location_address,
    'request_type', r.request_type,
    'status', r.status,
    'max_responses', r.max_responses,
    'response_count', r.response_count,
    'created_at', r.created_at,
    'roles', (
      SELECT json_agg(
        json_build_object(
          'role_id', rr.id,
          'category', sc.name,
          'category_description', sc.description,
          'quantity_required', rr.quantity_required,
          'quantity_fulfilled', rr.quantity_fulfilled,
          'responses', (
            SELECT json_agg(
              json_build_object(
                'response_id', resp.id,
                'company_id', resp.company_id,
                'response_type', resp.response_type,
                'pricing_type', resp.pricing_type,
                'quantity_fulfilled', resp.quantity_fulfilled,
                'proposed_start_time', resp.proposed_start_time,
                'proposed_end_time', resp.proposed_end_time,
                'created_at', resp.created_at
              )
            )
            FROM marketplace_responses resp
            WHERE resp.role_id = rr.id
          )
        )
      )
      FROM marketplace_request_roles rr
      LEFT JOIN service_categories sc ON rr.category_id = sc.id
      WHERE rr.request_id = r.id
    )
  )
  INTO result
  FROM marketplace_requests r
  WHERE r.id = get_request_with_roles.request_id;

  RETURN result;
END;
$$;

-- 2. Function to create request with multiple roles
CREATE OR REPLACE FUNCTION create_request_with_roles(
    p_customer_id uuid,
    p_company_id uuid,
    p_title text,
    p_description text,
    p_fulfillment_mode text,
    p_pricing_type text,
    p_service_mode text,
    p_budget numeric DEFAULT NULL,
    p_start_time timestamptz DEFAULT NULL,
    p_end_time timestamptz DEFAULT NULL,
    p_preferred_time_option text DEFAULT 'anytime',
    p_max_responses integer DEFAULT 10,
    p_postal_code text DEFAULT NULL,
    p_location_address text DEFAULT NULL,
    p_location_city text DEFAULT NULL,
    p_location_state text DEFAULT NULL,
    p_roles jsonb  -- array of roles like [{ "category_id": "...", "quantity_required": 5 }]
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
    v_request_id uuid;
    v_role jsonb;
BEGIN
    -- Insert parent request
    INSERT INTO marketplace_requests
        (customer_id, company_id, title, description,
         fulfillment_mode, pricing_type, service_mode, budget,
         start_time, end_time, preferred_time_option, max_responses,
         postal_code, location_address, location_city, location_state,
         status, request_type)
    VALUES
        (p_customer_id, p_company_id, p_title, p_description,
         p_fulfillment_mode, p_pricing_type, p_service_mode, p_budget,
         p_start_time, p_end_time, p_preferred_time_option, p_max_responses,
         p_postal_code, p_location_address, p_location_city, p_location_state,
         'available', 'STANDARD')
    RETURNING id INTO v_request_id;

    -- Insert roles (loop through JSON array)
    FOR v_role IN
        SELECT * FROM jsonb_array_elements(p_roles)
    LOOP
        INSERT INTO marketplace_request_roles
            (request_id, category_id, quantity_required, quantity_fulfilled)
        VALUES
            (v_request_id,
             (v_role->>'category_id')::uuid,
             COALESCE((v_role->>'quantity_required')::int, 1),
             0);
    END LOOP;

    RETURN v_request_id;
END;
$$;

-- 3. Enhanced function to submit response to specific role
CREATE OR REPLACE FUNCTION submit_response_to_role(
    p_request_id uuid,
    p_role_id uuid,
    p_company_id uuid,
    p_response_type text,
    p_pricing_type text DEFAULT 'negotiable',
    p_quantity_fulfilled integer DEFAULT 1,
    p_proposed_start_time timestamptz DEFAULT NULL,
    p_proposed_end_time timestamptz DEFAULT NULL,
    p_proposed_amount numeric DEFAULT NULL,
    p_message text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
    v_response_id uuid;
    v_required int;
    v_current int;
    v_remaining int;
    v_final_qty int;
BEGIN
    -- Get required vs current fulfillment
    SELECT quantity_required, quantity_fulfilled
    INTO v_required, v_current
    FROM marketplace_request_roles
    WHERE id = p_role_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid role_id: %', p_role_id;
    END IF;

    -- Calculate how many spots remain
    v_remaining := GREATEST(v_required - v_current, 0);

    -- Clamp the contractor's offered quantity to remaining capacity
    v_final_qty := LEAST(COALESCE(p_quantity_fulfilled, 1), v_remaining);

    IF v_final_qty <= 0 THEN
        RAISE EXCEPTION 'Role % is already fully staffed (required %, fulfilled %)',
            p_role_id, v_required, v_current;
    END IF;

    -- Insert contractor response
    INSERT INTO marketplace_responses
        (request_id, role_id, company_id, response_type,
         pricing_type, quantity_fulfilled,
         proposed_start_time, proposed_end_time,
         proposed_rate, message, response_status)
    VALUES
        (p_request_id, p_role_id, p_company_id, p_response_type,
         p_pricing_type, v_final_qty,
         p_proposed_start_time, p_proposed_end_time,
         p_proposed_amount, p_message, 'PENDING')
    RETURNING id INTO v_response_id;

    -- Update role fulfillment tally
    UPDATE marketplace_request_roles
    SET quantity_fulfilled = quantity_fulfilled + v_final_qty
    WHERE id = p_role_id;

    -- Update request response count
    UPDATE marketplace_requests
    SET response_count = COALESCE(response_count, 0) + 1
    WHERE id = p_request_id;

    RETURN v_response_id;
END;
$$;

-- 4. Function to get available multi-role requests for a company
CREATE OR REPLACE FUNCTION get_available_multi_role_requests(
    p_company_id uuid,
    p_tags text[] DEFAULT NULL,
    p_pricing_filters text[] DEFAULT NULL,
    p_request_type_filters text[] DEFAULT NULL
)
RETURNS SETOF marketplace_requests
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT r.*
    FROM marketplace_requests r
    LEFT JOIN marketplace_request_roles rr ON rr.request_id = r.id
    LEFT JOIN service_categories sc ON rr.category_id = sc.id
    WHERE r.company_id IS DISTINCT FROM p_company_id
      AND r.status = 'available'
      AND (
        p_tags IS NULL
        OR EXISTS (
          SELECT 1
          FROM marketplace_request_roles rr2
          JOIN service_categories sc2 ON rr2.category_id = sc2.id
          WHERE rr2.request_id = r.id
            AND lower(sc2.name) = ANY (SELECT lower(unnest(p_tags)))
        )
      )
      AND (
        p_request_type_filters IS NULL
        OR r.request_type::text = ANY(p_request_type_filters)
      )
      AND (
        p_pricing_filters IS NULL
        OR r.pricing_preference::text = ANY(p_pricing_filters)
      )
    ORDER BY r.created_at DESC;
END;
$$;

-- 5. Add the missing preferred_time_option column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'marketplace_requests' 
        AND column_name = 'preferred_time_option'
    ) THEN
        ALTER TABLE marketplace_requests 
        ADD COLUMN preferred_time_option TEXT DEFAULT 'anytime' 
        CHECK (preferred_time_option IN ('anytime', 'soonest', 'this_week', 'weekend_only', 'specific'));
    END IF;
END $$;
