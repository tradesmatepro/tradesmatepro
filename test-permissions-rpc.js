const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

async function test() {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Get a test company and user
    const companyRes = await client.query('SELECT id FROM companies LIMIT 1');
    if (companyRes.rows.length === 0) {
      console.error('❌ No companies found');
      process.exit(1);
    }
    const companyId = companyRes.rows[0].id;

    const userRes = await client.query(
      'SELECT id FROM users WHERE company_id = $1 LIMIT 1',
      [companyId]
    );
    if (userRes.rows.length === 0) {
      console.error('❌ No users found in company');
      process.exit(1);
    }
    const userId = userRes.rows[0].id;

    console.log(`📋 Testing with:`);
    console.log(`   Company: ${companyId}`);
    console.log(`   User: ${userId}\n`);

    // Test RPC
    console.log('🧪 Calling upsert_employee_permissions RPC...\n');
    const result = await client.query(
      `SELECT * FROM upsert_employee_permissions(
        $1, $2, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true
      )`,
      [companyId, userId]
    );

    const rpcResult = result.rows[0].upsert_employee_permissions;
    console.log('RPC Result:', JSON.stringify(rpcResult, null, 2));

    if (rpcResult.success) {
      console.log('\n✅ RPC executed successfully!\n');

      // Verify data was saved
      const verifyRes = await client.query(
        'SELECT * FROM employee_permissions WHERE user_id = $1 AND company_id = $2',
        [userId, companyId]
      );

      if (verifyRes.rows.length > 0) {
        console.log('✅ Permissions saved to database:');
        const perms = verifyRes.rows[0];
        console.log(`   Dashboard: ${perms.dashboard}`);
        console.log(`   Calendar: ${perms.calendar}`);
        console.log(`   Jobs: ${perms.jobs}`);
        console.log(`   Quotes: ${perms.quotes}`);
        console.log(`   Invoices: ${perms.invoices}`);
      } else {
        console.log('❌ Permissions not found in database');
      }
    } else {
      console.log('❌ RPC failed:', rpcResult.error);
    }

    await client.end();
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

test();

