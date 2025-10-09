-- Fix missing get_request_with_roles RPC function
-- This function is called by ExpandableRequestCard.js but missing from database

CREATE OR REPLACE FUNCTION public.get_request_with_roles(p_request_id UUID)
RETURNS JSON 
LANGUAGE plpgsql
AS $$
DECLARE
    request_data JSON;
    roles_data JSON;
BEGIN
    -- Get the main request
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
            'category_id', mrr.category_id,
            'quantity_required', mrr.quantity_required,
            'quantity_fulfilled', COALESCE(mrr.quantity_fulfilled, 0),
            'service_category', json_build_object(
                'name', sc.name,
                'description', sc.description
            ),
            'responses', COALESCE(responses.response_list, '[]'::json)
        )
    ) INTO roles_data
    FROM marketplace_request_roles mrr
    LEFT JOIN service_categories sc ON sc.id = mrr.category_id
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
                    'created_at', mr.created_at
                )
            ) as response_list
        FROM marketplace_responses mr
        GROUP BY mr.role_id
    ) responses ON responses.role_id = mrr.id
    WHERE mrr.request_id = p_request_id;
    
    -- Return combined data
    RETURN json_build_object(
        'request', request_data,
        'roles', COALESCE(roles_data, '[]'::json)
    );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_request_with_roles(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_request_with_roles(UUID) TO anon;

-- Test the function
SELECT get_request_with_roles('00000000-0000-0000-0000-000000000000'::UUID);