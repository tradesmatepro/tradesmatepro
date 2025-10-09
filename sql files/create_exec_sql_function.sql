-- =====================================================
-- CRITICAL: Create exec_sql RPC Function
-- =====================================================
-- This enables Claude/GPT to execute ANY SQL via the API
-- ⚠️ EXTREMELY DANGEROUS - Only use in development!

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.exec_sql(text);

-- Create the exec_sql function with proper error handling
CREATE OR REPLACE FUNCTION public.exec_sql(query text)
RETURNS json AS $$
DECLARE
  result json;
  rec record;
  query_type text;
  row_count integer := 0;
  result_array json[] := '{}';
BEGIN
  -- Log the query for debugging
  RAISE NOTICE 'Executing SQL: %', substring(query, 1, 100);
  
  -- Determine query type
  query_type := upper(trim(split_part(query, ' ', 1)));
  
  -- Handle different types of queries
  IF query_type IN ('SELECT', 'WITH') THEN
    -- For SELECT queries, return the actual data
    FOR rec IN EXECUTE query LOOP
      result_array := result_array || to_json(rec);
      row_count := row_count + 1;
    END LOOP;
    
    result := json_build_object(
      'type', 'SELECT',
      'data', result_array,
      'row_count', row_count,
      'success', true
    );
    
  ELSIF query_type IN ('INSERT', 'UPDATE', 'DELETE') THEN
    -- For DML queries, execute and return row count
    EXECUTE query;
    GET DIAGNOSTICS row_count = ROW_COUNT;
    
    result := json_build_object(
      'type', query_type,
      'rows_affected', row_count,
      'success', true,
      'message', format('%s completed successfully', query_type)
    );
    
  ELSIF query_type IN ('CREATE', 'ALTER', 'DROP', 'TRUNCATE') THEN
    -- For DDL queries, execute and return success
    EXECUTE query;
    
    result := json_build_object(
      'type', query_type,
      'success', true,
      'message', format('%s completed successfully', query_type)
    );
    
  ELSE
    -- For other queries (GRANT, REVOKE, etc.)
    EXECUTE query;
    
    result := json_build_object(
      'type', 'OTHER',
      'success', true,
      'message', 'Query executed successfully'
    );
  END IF;
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Return detailed error information
    result := json_build_object(
      'success', false,
      'error', SQLERRM,
      'error_code', SQLSTATE,
      'query_type', query_type,
      'message', format('SQL execution failed: %s', SQLERRM)
    );
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO service_role;

-- Add comment for documentation
COMMENT ON FUNCTION public.exec_sql(text) IS 
'Executes arbitrary SQL queries. EXTREMELY DANGEROUS - only use in development environments with proper backups!';

-- Test the function
SELECT public.exec_sql('SELECT NOW() as current_time, ''exec_sql function created successfully!'' as message;');

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
-- The exec_sql function has been created successfully!
-- Claude/GPT can now execute any SQL via the API endpoint.
