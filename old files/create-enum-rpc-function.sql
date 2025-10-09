-- Create RPC function to get enum values
-- This is a NEW function that doesn't modify existing schema
-- Safe to run, won't break anything

CREATE OR REPLACE FUNCTION get_enum_values(enum_name text)
RETURNS TABLE(value text) AS $$
BEGIN
  RETURN QUERY EXECUTE format(
    'SELECT unnest(enum_range(NULL::%I))::text',
    enum_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_enum_values(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_enum_values(text) TO anon;

-- Add comment
COMMENT ON FUNCTION get_enum_values(text) IS 
'Returns all values for a given enum type. Used by EnumCacheService for offline support.';

