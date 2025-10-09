-- Developer Tools RPC Functions for TradeMate Pro
-- These functions provide debugging and inspection capabilities

-- Function to get basic schema information
CREATE OR REPLACE FUNCTION public.get_schema_info()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'tables', (
            SELECT json_agg(
                json_build_object(
                    'table_name', table_name,
                    'table_type', table_type
                )
            )
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        ),
        'views', (
            SELECT json_agg(
                json_build_object(
                    'view_name', table_name
                )
            )
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            AND table_type = 'VIEW'
            ORDER BY table_name
        ),
        'functions', (
            SELECT json_agg(
                json_build_object(
                    'function_name', routine_name,
                    'return_type', data_type
                )
            )
            FROM information_schema.routines 
            WHERE routine_schema = 'public'
            AND routine_type = 'FUNCTION'
            ORDER BY routine_name
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to execute safe read-only SQL queries
CREATE OR REPLACE FUNCTION public.execute_sql(query TEXT)
RETURNS JSON AS $$
DECLARE
    result JSON;
    query_lower TEXT;
BEGIN
    -- Convert query to lowercase for safety checks
    query_lower := lower(trim(query));
    
    -- Only allow SELECT, SHOW, DESCRIBE, EXPLAIN queries
    IF NOT (
        query_lower LIKE 'select %' OR
        query_lower LIKE 'show %' OR
        query_lower LIKE 'describe %' OR
        query_lower LIKE 'explain %' OR
        query_lower LIKE 'with %'
    ) THEN
        RETURN json_build_object(
            'error', 'Only SELECT, SHOW, DESCRIBE, EXPLAIN, and WITH queries are allowed',
            'query', query
        );
    END IF;
    
    -- Prevent potentially dangerous operations even in SELECT
    IF (
        query_lower LIKE '%drop %' OR
        query_lower LIKE '%delete %' OR
        query_lower LIKE '%update %' OR
        query_lower LIKE '%insert %' OR
        query_lower LIKE '%alter %' OR
        query_lower LIKE '%create %' OR
        query_lower LIKE '%truncate %'
    ) THEN
        RETURN json_build_object(
            'error', 'Query contains potentially unsafe operations',
            'query', query
        );
    END IF;
    
    -- Execute the query and return results
    BEGIN
        EXECUTE format('SELECT json_agg(row_to_json(t)) FROM (%s) t', query) INTO result;
        
        RETURN json_build_object(
            'success', true,
            'data', COALESCE(result, '[]'::json),
            'query', query,
            'executed_at', now()
        );
    EXCEPTION WHEN OTHERS THEN
        RETURN json_build_object(
            'error', SQLERRM,
            'query', query,
            'executed_at', now()
        );
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get table column information
CREATE OR REPLACE FUNCTION public.get_table_columns(table_name_param TEXT)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'column_name', column_name,
            'data_type', data_type,
            'is_nullable', is_nullable,
            'column_default', column_default,
            'character_maximum_length', character_maximum_length
        )
        ORDER BY ordinal_position
    )
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = table_name_param
    INTO result;
    
    RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get basic table statistics
CREATE OR REPLACE FUNCTION public.get_table_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- This is a simplified version - in production you'd want more detailed stats
    SELECT json_build_object(
        'total_tables', (
            SELECT count(*)
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            AND table_type = 'BASE TABLE'
        ),
        'total_views', (
            SELECT count(*)
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            AND table_type = 'VIEW'
        ),
        'total_functions', (
            SELECT count(*)
            FROM information_schema.routines 
            WHERE routine_schema = 'public'
            AND routine_type = 'FUNCTION'
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to test database connectivity and performance
CREATE OR REPLACE FUNCTION public.test_db_health()
RETURNS JSON AS $$
DECLARE
    result JSON;
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    query_time INTERVAL;
BEGIN
    start_time := clock_timestamp();
    
    -- Simple query to test responsiveness
    PERFORM 1;
    
    end_time := clock_timestamp();
    query_time := end_time - start_time;
    
    SELECT json_build_object(
        'status', 'healthy',
        'timestamp', now(),
        'query_time_ms', EXTRACT(MILLISECONDS FROM query_time),
        'database_name', current_database(),
        'database_version', version()
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_schema_info() TO authenticated;
GRANT EXECUTE ON FUNCTION public.execute_sql(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_table_columns(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_table_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.test_db_health() TO authenticated;

-- Also grant to service_role for admin operations
GRANT EXECUTE ON FUNCTION public.get_schema_info() TO service_role;
GRANT EXECUTE ON FUNCTION public.execute_sql(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_table_columns(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_table_stats() TO service_role;
GRANT EXECUTE ON FUNCTION public.test_db_health() TO service_role;
