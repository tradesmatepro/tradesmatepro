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

    console.log('🔍 Checking update_onboarding_progress RPC function...\n');

    // Get the function definition
    const funcRes = await client.query(`
      SELECT 
        p.proname as function_name,
        pg_get_functiondef(p.oid) as definition
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
        AND p.proname = 'update_onboarding_progress'
    `);

    if (funcRes.rows.length === 0) {
      console.log('❌ update_onboarding_progress function NOT FOUND!');
      console.log('This explains why the fallback code is being used.');
    } else {
      console.log('✅ update_onboarding_progress function exists\n');
      console.log('Function definition:');
      console.log(funcRes.rows[0].definition);
    }

    // Also check is_onboarding_complete
    console.log('\n\n🔍 Checking is_onboarding_complete RPC function...\n');
    
    const completeRes = await client.query(`
      SELECT 
        p.proname as function_name,
        pg_get_functiondef(p.oid) as definition
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
        AND p.proname = 'is_onboarding_complete'
    `);

    if (completeRes.rows.length === 0) {
      console.log('❌ is_onboarding_complete function NOT FOUND!');
    } else {
      console.log('✅ is_onboarding_complete function exists\n');
      console.log('Function definition:');
      console.log(completeRes.rows[0].definition);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (client) await client.end();
  }
})();

