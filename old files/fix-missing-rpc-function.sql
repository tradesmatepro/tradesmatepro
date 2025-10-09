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
            'role_id', rr.id,
            'category_id', rr.category_id,
            'category', sc.name,
            'description', sc.description,
            'quantity_required', rr.quantity_required,
            'quantity_fulfilled', COALESCE(rr.quantity_fulfilled, 0),
            'pricing_type', rr.pricing_type,
            'responses', COALESCE(role_responses.responses, '[]'::json)
        )
    ) INTO roles_data
    FROM marketplace_request_roles rr
    LEFT JOIN service_categories sc ON rr.category_id = sc.id
    LEFT JOIN (
        -- Get responses for each role
        SELECT 
            mrr.role_id,
            json_agg(
                json_build_object(
                    'response_id', mr.id,
                    'company_id', mr.company_id,
                    'response_type', mr.response_type,
                    'quantity_fulfilled', mr.quantity_fulfilled,
                    'proposed_start_time', mr.proposed_start_time,
                    'proposed_end_time', mr.proposed_end_time,
                    'message', mr.message,
                    'created_at', mr.created_at
                )
            ) as responses
        FROM marketplace_responses mr
        JOIN marketplace_request_roles mrr ON mr.role_id = mrr.id
        WHERE mrr.request_id = p_request_id
        GROUP BY mrr.role_id
    ) role_responses ON role_responses.role_id = rr.id
    WHERE rr.request_id = p_request_id;
    
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
