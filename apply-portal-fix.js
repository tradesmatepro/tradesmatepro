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

    // Check if policy already exists
    const checkRes = await client.query(`
      SELECT policyname FROM pg_policies 
      WHERE tablename = 'customers' 
      AND policyname = 'anon_access_customer_by_portal_token'
    `);

    if (checkRes.rows.length > 0) {
      console.log('⚠️ Policy already exists, dropping it first...');
      await client.query(`
        DROP POLICY IF EXISTS "anon_access_customer_by_portal_token" ON public.customers
      `);
    }

    // Create the new policy
    console.log('🔐 Creating RLS policy for portal token access...\n');
    await client.query(`
      CREATE POLICY "anon_access_customer_by_portal_token" ON public.customers
        FOR SELECT
        TO anon
        USING (portal_token IS NOT NULL)
    `);

    console.log('✅ Policy created successfully!\n');

    // Verify the policy
    const verifyRes = await client.query(`
      SELECT policyname, permissive, roles, qual 
      FROM pg_policies 
      WHERE tablename = 'customers' 
      AND policyname = 'anon_access_customer_by_portal_token'
    `);

    if (verifyRes.rows.length > 0) {
      const policy = verifyRes.rows[0];
      console.log('📋 Policy Details:');
      console.log(`   Name: ${policy.policyname}`);
      console.log(`   Permissive: ${policy.permissive}`);
      console.log(`   Roles: ${policy.roles}`);
      console.log(`   Condition: portal_token IS NOT NULL\n`);
      console.log('✅ Portal authentication fix applied successfully!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
})();

