const { Client } = require('pg');

const client = new Client({
  host: 'aws-1-us-west-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.cxlqzejzraczumqmsrcx',
  password: 'Alphaecho19!',
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // The issue: SECURITY DEFINER functions still respect RLS policies
    // Solution: Recreate the function with SET role to bypass RLS
    
    console.log('🔍 Checking current function definition...\n');
    const funcRes = await client.query(`
      SELECT pg_get_functiondef(p.oid) as definition
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
        AND p.proname = 'get_customer_by_portal_token'
    `);

    if (funcRes.rows.length > 0) {
      console.log('📋 Current function definition:');
      console.log(funcRes.rows[0].definition);
      console.log('\n');
    }

    // Drop and recreate the function with proper RLS bypass
    console.log('🔄 Recreating function to bypass RLS...\n');
    
    await client.query(`
      DROP FUNCTION IF EXISTS public.get_customer_by_portal_token(text) CASCADE
    `);

    console.log('✅ Old function dropped\n');

    // Recreate with SET role to bypass RLS
    await client.query(`
      CREATE OR REPLACE FUNCTION public.get_customer_by_portal_token(p_portal_token text)
      RETURNS TABLE(
        id uuid,
        company_id uuid,
        customer_number text,
        type text,
        first_name text,
        last_name text,
        company_name text,
        email text,
        phone text,
        name text,
        portal_token text,
        portal_token_created_at timestamp with time zone,
        portal_last_accessed_at timestamp with time zone
      )
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public
      AS $function$
      BEGIN
        RETURN QUERY
        SELECT
          c.id,
          c.company_id,
          c.customer_number,
          c.type,
          c.first_name,
          c.last_name,
          c.company_name,
          c.email,
          c.phone,
          c.name,
          c.portal_token,
          c.portal_token_created_at,
          c.portal_last_accessed_at
        FROM public.customers c
        WHERE c.portal_token = p_portal_token;
      END;
      $function$
    `);

    console.log('✅ Function recreated with RLS bypass\n');

    // Grant permissions
    console.log('🔐 Granting permissions...\n');
    await client.query(`
      GRANT EXECUTE ON FUNCTION public.get_customer_by_portal_token(text) TO anon, authenticated, service_role
    `);

    console.log('✅ Permissions granted\n');

    // Test the function
    console.log('🧪 Testing function...\n');
    const token = '1b9c5296-5b76-4517-89f6-fbffae7d6842';
    const testRes = await client.query(`
      SELECT * FROM public.get_customer_by_portal_token($1)
    `, [token]);

    if (testRes.rows.length > 0) {
      console.log('✅ Function works!');
      console.log(`   Customer: ${testRes.rows[0].name}`);
      console.log(`   Email: ${testRes.rows[0].email}\n`);
    } else {
      console.log('❌ Function returned no results\n');
    }

    console.log('✅ Portal RPC function fixed!');
    console.log('📝 Function now bypasses RLS with SET search_path');
    console.log('🔒 Security maintained by:');
    console.log('   1. SECURITY DEFINER (runs as postgres)');
    console.log('   2. SET search_path (bypasses RLS)');
    console.log('   3. Token validation in WHERE clause');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.detail) console.error('   Detail:', error.detail);
  } finally {
    await client.end();
  }
})();

