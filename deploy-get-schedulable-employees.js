/**
 * Deploy get_schedulable_employees RPC Function
 * Fixes the 400 Bad Request errors in logs
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function deployRPC() {
  try {
    // Load credentials
    const credPath = path.join(__dirname, 'AIDevTools', 'credentials.json');
    const creds = JSON.parse(fs.readFileSync(credPath, 'utf8'));

    const supabaseUrl = creds.supabase.url;
    const serviceRoleKey = creds.supabase.serviceRoleKey;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase credentials');
    }

    console.log('🔧 Deploying get_schedulable_employees RPC function...\n');

    // Create admin client with service role key
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // SQL to create the RPC function
    const sql = `
CREATE OR REPLACE FUNCTION get_schedulable_employees(p_company_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  employee_id UUID,
  full_name TEXT,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  role TEXT,
  status TEXT,
  job_title TEXT,
  is_schedulable BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    e.user_id,
    e.id AS employee_id,
    u.name AS full_name,
    u.first_name,
    u.last_name,
    u.email,
    u.role,
    u.status,
    e.job_title,
    COALESCE(e.is_schedulable, true) AS is_schedulable
  FROM employees e
  INNER JOIN users u ON e.user_id = u.id
  WHERE e.company_id = p_company_id
    AND COALESCE(e.is_schedulable, true) = true
  ORDER BY u.name ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_schedulable_employees(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_schedulable_employees(UUID) TO anon;

COMMENT ON FUNCTION get_schedulable_employees(UUID) IS 'Returns all schedulable employees for a company with their user details. Used by scheduling components.';
    `;

    // Execute SQL via Supabase
    const { data, error } = await supabase.rpc('exec_sql', { sql_text: sql });

    if (error) {
      // Try alternative approach - use direct SQL execution
      console.log('⚠️  Direct RPC exec_sql not available, trying alternative...\n');

      // For now, just log what needs to be done
      console.log('📋 SQL to execute in Supabase SQL Editor:\n');
      console.log(sql);
      console.log('\n✅ Copy the above SQL and execute it in your Supabase SQL Editor');
      console.log('   (Dashboard → SQL Editor → New Query → Paste → Run)\n');

      return;
    }

    console.log('✅ RPC function deployed successfully!\n');
    console.log('📊 Result:', data);

  } catch (error) {
    console.error('❌ Error deploying RPC:', error.message);
    console.log('\n📋 Manual deployment required:');
    console.log('1. Go to Supabase Dashboard');
    console.log('2. Open SQL Editor');
    console.log('3. Create new query');
    console.log('4. Copy content from: sql files/create_get_schedulable_employees_rpc.sql');
    console.log('5. Execute the query');
  }
}

deployRPC();


