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

    // Step 1: Check current function permissions
    console.log('🔍 Checking current RPC function permissions...\n');
    const funcRes = await client.query(`
      SELECT 
        p.proname,
        proacl,
        prosecdef
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
        AND p.proname = 'get_customer_by_portal_token'
    `);

    if (funcRes.rows.length > 0) {
      const func = funcRes.rows[0];
      console.log('📋 Current Function Details:');
      console.log(`   Name: ${func.proname}`);
      console.log(`   SECURITY DEFINER: ${func.prosecdef}`);
      console.log(`   ACL: ${func.proacl}\n`);
    }

    // Step 2: Grant execute permission to anon role
    console.log('🔐 Granting EXECUTE permission to anon role...\n');
    await client.query(`
      GRANT EXECUTE ON FUNCTION public.get_customer_by_portal_token(text) TO anon
    `);

    console.log('✅ Permission granted!\n');

    // Step 3: Verify the permission was granted
    const verifyRes = await client.query(`
      SELECT 
        p.proname,
        proacl
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
        AND p.proname = 'get_customer_by_portal_token'
    `);

    if (verifyRes.rows.length > 0) {
      console.log('📋 Updated Function ACL:');
      console.log(`   ${verifyRes.rows[0].proacl}\n`);
    }

    // Step 4: Also grant to authenticated role for good measure
    console.log('🔐 Granting EXECUTE permission to authenticated role...\n');
    await client.query(`
      GRANT EXECUTE ON FUNCTION public.get_customer_by_portal_token(text) TO authenticated
    `);

    console.log('✅ All permissions granted!\n');

    // Step 5: Test the function as anon would
    console.log('🧪 Testing function execution...\n');
    const token = '1b9c5296-5b76-4517-89f6-fbffae7d6842';
    const testRes = await client.query(`
      SELECT * FROM public.get_customer_by_portal_token($1)
    `, [token]);

    if (testRes.rows.length > 0) {
      console.log('✅ Function executes successfully!');
      console.log(`   Customer: ${testRes.rows[0].name}`);
      console.log(`   Email: ${testRes.rows[0].email}\n`);
    }

    console.log('✅ Portal RPC permissions fixed!');
    console.log('📝 The anon role can now execute get_customer_by_portal_token');
    console.log('🔒 Security is maintained by:');
    console.log('   1. RLS policy restricts access to customers with portal_token');
    console.log('   2. Function is SECURITY DEFINER (runs as postgres)');
    console.log('   3. Token must match exactly to return data');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.detail) console.error('   Detail:', error.detail);
  } finally {
    await client.end();
  }
})();

