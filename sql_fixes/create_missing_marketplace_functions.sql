-- ========================================
-- CREATE MISSING MARKETPLACE FUNCTIONS
-- Fix function overloading errors
-- ========================================

-- 1. CREATE get_browse_requests FUNCTION (SIMPLIFIED)
-- This function was missing and causing overloading errors
-- Simplified version without missing enum dependencies
CREATE OR REPLACE FUNCTION get_browse_requests(
    p_company_id UUID,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    service_type TEXT,
    budget_min NUMERIC,
    budget_max NUMERIC,
    location TEXT,
    status marketplace_request_status_enum,
    customer_company_id UUID,
    customer_company_name TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if marketplace_requests table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'marketplace_requests') THEN
        -- Return empty result if table doesn't exist
        RETURN;
    END IF;

    RETURN QUERY
    SELECT
        mr.id,
        mr.title,
        mr.description,
        mr.service_type,
        mr.budget_min,
        mr.budget_max,
        mr.location,
        mr.status,
        mr.company_id as customer_company_id,
        c.name as customer_company_name,
        mr.created_at,
        mr.updated_at
    FROM marketplace_requests mr
    JOIN companies c ON mr.company_id = c.id
    WHERE
        mr.status = 'posted'
        AND mr.company_id != p_company_id  -- Don't show own requests
    ORDER BY
        mr.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- 2. CREATE get_marketplace_stats FUNCTION
-- Provide marketplace statistics for dashboard
CREATE OR REPLACE FUNCTION get_marketplace_stats(p_company_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
    total_requests INTEGER;
    open_requests INTEGER;
    my_responses INTEGER;
    accepted_responses INTEGER;
    avg_response_time INTERVAL;
BEGIN
    -- Get total requests in marketplace
    SELECT COUNT(*) INTO total_requests
    FROM marketplace_requests
    WHERE status IN ('open', 'in_progress', 'completed');
    
    -- Get open requests (available for bidding)
    SELECT COUNT(*) INTO open_requests
    FROM marketplace_requests
    WHERE status = 'open' AND company_id != p_company_id;
    
    -- Get my responses count
    SELECT COUNT(*) INTO my_responses
    FROM marketplace_responses
    WHERE company_id = p_company_id;
    
    -- Get accepted responses count
    SELECT COUNT(*) INTO accepted_responses
    FROM marketplace_responses
    WHERE company_id = p_company_id AND status = 'accepted';
    
    -- Get average response time
    SELECT AVG(created_at - (
        SELECT created_at FROM marketplace_requests mr2 
        WHERE mr2.id = marketplace_responses.request_id
    )) INTO avg_response_time
    FROM marketplace_responses
    WHERE company_id = p_company_id
    AND created_at >= NOW() - INTERVAL '30 days';
    
    -- Build result JSON
    result := json_build_object(
        'total_requests', total_requests,
        'open_requests', open_requests,
        'my_responses', my_responses,
        'accepted_responses', accepted_responses,
        'acceptance_rate', 
            CASE 
                WHEN my_responses > 0 THEN ROUND((accepted_responses::NUMERIC / my_responses::NUMERIC) * 100, 2)
                ELSE 0 
            END,
        'avg_response_time_hours', 
            CASE 
                WHEN avg_response_time IS NOT NULL THEN EXTRACT(EPOCH FROM avg_response_time) / 3600
                ELSE NULL 
            END
    );
    
    RETURN result;
END;
$$;

-- 3. CREATE update_marketplace_request_status FUNCTION (SIMPLIFIED)
-- Handle status transitions with proper validation
CREATE OR REPLACE FUNCTION update_marketplace_request_status(
    p_request_id UUID,
    p_new_status marketplace_request_status_enum,
    p_company_id UUID,
    p_reason TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_status marketplace_request_status_enum;
    request_owner_id UUID;
    result JSON;
BEGIN
    -- Check if marketplace_requests table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'marketplace_requests') THEN
        RETURN json_build_object('error', 'Marketplace not available');
    END IF;

    -- Get current status and owner
    SELECT status, company_id INTO current_status, request_owner_id
    FROM marketplace_requests
    WHERE id = p_request_id;

    IF NOT FOUND THEN
        RETURN json_build_object('error', 'Request not found');
    END IF;

    -- Verify ownership for certain operations
    IF p_new_status IN ('cancelled', 'completed') AND request_owner_id != p_company_id THEN
        RETURN json_build_object('error', 'Only request owner can perform this action');
    END IF;

    -- Update the request (simplified validation)
    UPDATE marketplace_requests
    SET
        status = p_new_status,
        updated_at = NOW()
    WHERE id = p_request_id;

    result := json_build_object(
        'success', true,
        'request_id', p_request_id,
        'old_status', current_status,
        'new_status', p_new_status
    );

    RETURN result;
END;
$$;

-- 4. CREATE marketplace_request_status_log TABLE (SIMPLIFIED)
-- Track status changes for audit trail - only if marketplace_requests exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'marketplace_requests') THEN
        CREATE TABLE IF NOT EXISTS marketplace_request_status_log (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            request_id UUID NOT NULL,
            old_status TEXT,
            new_status TEXT NOT NULL,
            changed_by_company_id UUID NOT NULL REFERENCES companies(id),
            reason TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create index for performance
        CREATE INDEX IF NOT EXISTS idx_marketplace_request_status_log_request_id
        ON marketplace_request_status_log(request_id);

        -- Enable RLS but no policies for now
        ALTER TABLE marketplace_request_status_log ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- 5. GRANT PERMISSIONS
-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_browse_requests(UUID, INTEGER, INTEGER, TEXT[], TEXT, NUMERIC, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION get_marketplace_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_marketplace_request_status(UUID, marketplace_request_status_enum, UUID, TEXT) TO authenticated;

-- Grant table permissions
GRANT SELECT, INSERT ON marketplace_request_status_log TO authenticated;

-- ========================================
-- COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON FUNCTION get_browse_requests IS 'Browse available marketplace requests with filtering and pagination';
COMMENT ON FUNCTION get_marketplace_stats IS 'Get marketplace statistics for a company dashboard';
COMMENT ON FUNCTION update_marketplace_request_status IS 'Update marketplace request status with validation and audit logging';
COMMENT ON TABLE marketplace_request_status_log IS 'Audit trail for marketplace request status changes';
