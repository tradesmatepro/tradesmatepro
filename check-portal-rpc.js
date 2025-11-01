const { Client } = require('pg');

// Database connection config
const DB_CONFIGS = [
  {
    name: 'Pooler Connection',
    host: 'aws-1-us-west-1.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    user: 'postgres.cxlqzejzraczumqmsrcx',
    password: 'Alphaecho19!',
    ssl: { rejectUnauthorized: false }
  }
];

async function getWorkingConnection() {
  for (const config of DB_CONFIGS) {
    try {
      const client = new Client(config);
      await client.connect();
      console.log(`✅ ${config.name} successful!\n`);
      return client;
    } catch (error) {
      console.log(`❌ ${config.name} failed: ${error.message}`);
      continue;
    }
  }
  throw new Error('All database connections failed');
}

(async () => {
  let client;
  try {
    client = await getWorkingConnection();

    console.log('🔍 Checking get_customer_by_portal_token RPC function...\n');

    // Get the function definition
    const funcRes = await client.query(`
      SELECT 
        p.proname as function_name,
        pg_get_functiondef(p.oid) as definition
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
        AND p.proname = 'get_customer_by_portal_token'
    `);

    if (funcRes.rows.length === 0) {
      console.log('❌ get_customer_by_portal_token function NOT FOUND!');
    } else {
      console.log('✅ get_customer_by_portal_token function exists\n');
      console.log('Function definition:');
      console.log(funcRes.rows[0].definition);
    }

    // Check RLS policies on customers table
    console.log('\n\n🔍 Checking RLS policies on customers table...\n');
    
    const rlsRes = await client.query(`
      SELECT 
        schemaname,
        tablename,
        policyname,
        permissive,
        roles,
        qual,
        with_check
      FROM pg_policies
      WHERE tablename = 'customers'
      ORDER BY policyname
    `);

    if (rlsRes.rows.length === 0) {
      console.log('⚠️ No RLS policies found on customers table');
    } else {
      console.log(`✅ Found ${rlsRes.rows.length} RLS policies:\n`);
      rlsRes.rows.forEach((policy, i) => {
        console.log(`${i + 1}. ${policy.policyname}`);
        console.log(`   Permissive: ${policy.permissive}`);
        console.log(`   Roles: ${policy.roles}`);
        console.log(`   Qual: ${policy.qual}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (client) await client.end();
  }
})();

