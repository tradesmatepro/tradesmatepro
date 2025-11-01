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

    const token = '1b9c5296-5b76-4517-89f6-fbffae7d6842';

    // Check if token exists
    console.log(`🔍 Checking for portal token: ${token}\n`);
    const tokenRes = await client.query(`
      SELECT 
        id,
        email,
        first_name,
        last_name,
        name,
        portal_token,
        portal_token_created_at,
        company_id
      FROM public.customers
      WHERE portal_token = $1
    `, [token]);

    if (tokenRes.rows.length === 0) {
      console.log('❌ Token NOT found in database!');
      console.log('\n📋 Checking all customers with portal tokens:\n');
      
      const allTokensRes = await client.query(`
        SELECT 
          id,
          email,
          first_name,
          last_name,
          portal_token,
          portal_token_created_at
        FROM public.customers
        WHERE portal_token IS NOT NULL
        LIMIT 10
      `);

      if (allTokensRes.rows.length === 0) {
        console.log('⚠️ No customers have portal tokens set!');
      } else {
        console.log(`Found ${allTokensRes.rows.length} customers with portal tokens:\n`);
        allTokensRes.rows.forEach((row, i) => {
          console.log(`${i + 1}. ${row.email}`);
          console.log(`   Token: ${row.portal_token}`);
          console.log(`   Created: ${row.portal_token_created_at}\n`);
        });
      }
    } else {
      console.log('✅ Token found!\n');
      const customer = tokenRes.rows[0];
      console.log('📋 Customer Details:');
      console.log(`   ID: ${customer.id}`);
      console.log(`   Name: ${customer.name || `${customer.first_name} ${customer.last_name}`}`);
      console.log(`   Email: ${customer.email}`);
      console.log(`   Company ID: ${customer.company_id}`);
      console.log(`   Token Created: ${customer.portal_token_created_at}\n`);

      // Now test the RPC function
      console.log('🔍 Testing RPC function call...\n');
      const rpcRes = await client.query(`
        SELECT * FROM public.get_customer_by_portal_token($1)
      `, [token]);

      if (rpcRes.rows.length > 0) {
        console.log('✅ RPC function works!\n');
        console.log('📋 RPC Result:');
        console.log(JSON.stringify(rpcRes.rows[0], null, 2));
      } else {
        console.log('❌ RPC function returned no results');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.detail) console.error('   Detail:', error.detail);
  } finally {
    await client.end();
  }
})();

