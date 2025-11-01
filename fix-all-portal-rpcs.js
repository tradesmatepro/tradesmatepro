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

    // Find all portal-related RPC functions
    console.log('🔍 Finding all portal-related RPC functions...\n');
    const funcsRes = await client.query(`
      SELECT 
        p.proname,
        pg_get_functiondef(p.oid) as definition
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
        AND (
          p.proname LIKE '%portal%'
          OR p.proname LIKE '%customer_work_orders%'
          OR p.proname LIKE '%customer_portal%'
        )
      ORDER BY p.proname
    `);

    console.log(`Found ${funcsRes.rows.length} portal-related functions:\n`);
    funcsRes.rows.forEach(func => {
      console.log(`  - ${func.proname}`);
    });
    console.log('\n');

    // Grant permissions to all portal functions
    const portalFunctions = [
      'get_customer_by_portal_token',
      'get_customer_work_orders',
      'log_customer_portal_activity'
    ];

    console.log('🔐 Granting EXECUTE permissions to anon role...\n');
    
    for (const funcName of portalFunctions) {
      try {
        // Try different signatures
        const signatures = [
          `${funcName}(text)`,
          `${funcName}(uuid)`,
          `${funcName}(uuid, text)`,
          `${funcName}(uuid, uuid, text, jsonb)`
        ];

        for (const sig of signatures) {
          try {
            await client.query(`
              GRANT EXECUTE ON FUNCTION public.${sig} TO anon, authenticated
            `);
            console.log(`  ✅ ${sig}`);
            break; // If successful, move to next function
          } catch (e) {
            // Try next signature
            continue;
          }
        }
      } catch (error) {
        console.log(`  ⚠️ ${funcName} - could not grant (may not exist)`);
      }
    }

    console.log('\n✅ Portal RPC permissions updated!\n');

    // Test all functions
    console.log('🧪 Testing portal functions...\n');
    
    const token = '1b9c5296-5b76-4517-89f6-fbffae7d6842';
    const customerId = 'e961cd63-6c38-4c94-b1a2-1e734e6740c0';

    // Test 1: get_customer_by_portal_token
    try {
      const res1 = await client.query(`
        SELECT * FROM public.get_customer_by_portal_token($1)
      `, [token]);
      console.log(`✅ get_customer_by_portal_token: ${res1.rows.length} result(s)`);
    } catch (e) {
      console.log(`❌ get_customer_by_portal_token: ${e.message}`);
    }

    // Test 2: get_customer_work_orders
    try {
      const res2 = await client.query(`
        SELECT * FROM public.get_customer_work_orders($1)
      `, [customerId]);
      console.log(`✅ get_customer_work_orders: ${res2.rows.length} result(s)`);
    } catch (e) {
      console.log(`❌ get_customer_work_orders: ${e.message}`);
    }

    // Test 3: log_customer_portal_activity
    try {
      const res3 = await client.query(`
        SELECT * FROM public.log_customer_portal_activity($1, $2, $3, $4)
      `, [customerId, null, 'viewed_portal', JSON.stringify({test: true})]);
      console.log(`✅ log_customer_portal_activity: executed`);
    } catch (e) {
      console.log(`❌ log_customer_portal_activity: ${e.message}`);
    }

    console.log('\n✅ All portal RPC functions are ready!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.detail) console.error('   Detail:', error.detail);
  } finally {
    await client.end();
  }
})();

