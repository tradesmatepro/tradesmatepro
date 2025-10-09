-- Create the missing get_request_with_roles RPC function
-- This function is called by the frontend but doesn't exist in the database

CREATE OR REPLACE FUNCTION public.get_request_with_roles(p_request_id UUID)
RETURNS JSON 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    request_data JSON;
    roles_data JSON;
    result JSON;
BEGIN
    -- Get the main request data
    SELECT to_json(r.*) INTO request_data
    FROM marketplace_requests r
    WHERE r.id = p_request_id;
    
    -- If no request found, return null
    IF request_data IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Get roles with their responses and progress
    SELECT json_agg(
        json_build_object(
            'id', mrr.id,
            'role_name', mrr.role_name,
            'quantity_required', mrr.quantity_required,
            'quantity_fulfilled', mrr.quantity_fulfilled,
            'hourly_rate', mrr.hourly_rate,
            'pricing_type', mrr.pricing_type,
            'responses', COALESCE(role_responses.responses, '[]'::json)
        )
    ) INTO roles_data
    FROM marketplace_request_roles mrr
    LEFT JOIN (
        SELECT 
            mr.role_id,
            json_agg(
                json_build_object(
                    'id', mr.id,
                    'company_id', mr.company_id,
                    'response_status', mr.response_status,
                    'counter_offer', mr.counter_offer,
                    'available_start', mr.available_start,
                    'available_end', mr.available_end,
                    'message', mr.message,
                    'created_at', mr.created_at,
                    'quantity_fulfilled', mr.quantity_fulfilled
                )
            ) as responses
        FROM marketplace_responses mr
        WHERE mr.request_id = p_request_id
        GROUP BY mr.role_id
    ) role_responses ON mrr.id = role_responses.role_id
    WHERE mrr.request_id = p_request_id;
    
    -- Combine request and roles data
    SELECT json_build_object(
        'request', request_data,
        'roles', COALESCE(roles_data, '[]'::json)
    ) INTO result;
    
    RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_request_with_roles(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_request_with_roles(UUID) TO anon;
