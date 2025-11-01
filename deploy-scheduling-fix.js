/**
 * Deploy the scheduling RPC fix to Supabase
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function deployFix() {
  let client;
  try {
    console.log('🚀 Deploying scheduling RPC fix...\n');

    client = new Client({
      host: process.env.SUPABASE_DB_HOST,
      port: parseInt(process.env.SUPABASE_DB_PORT || 5432),
      database: process.env.SUPABASE_DB_NAME || 'postgres',
      user: process.env.SUPABASE_DB_USER,
      password: process.env.SUPABASE_DB_PASSWORD,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();
    console.log('✅ Connected to database\n');

    // Read and execute the fix SQL
    const sqlPath = path.join(__dirname, 'sql files', 'fix_scheduling_rpc_time_logic.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📝 Executing SQL fix...');
    await client.query(sql);
    console.log('✅ SQL executed successfully!\n');

    // Test the RPC
    console.log('🧪 Testing the fixed RPC...\n');

    // Get a test company and employee
    const companyResult = await client.query(`
      SELECT company_id FROM employees LIMIT 1
    `);

    if (companyResult.rows.length === 0) {
      console.log('⚠️  No employees found to test with');
      await client.end();
      return;
    }

    const testCompanyId = companyResult.rows[0].company_id;
    console.log(`Testing with company_id: ${testCompanyId}`);

    // Get an employee for this company
    const empResult = await client.query(`
      SELECT id FROM employees WHERE company_id = $1 LIMIT 1
    `, [testCompanyId]);

    if (empResult.rows.length === 0) {
      console.log('⚠️  No employees found for this company');
      await client.end();
      return;
    }

    const testEmployeeId = empResult.rows[0].id;
    console.log(`Testing with employee_id: ${testEmployeeId}\n`);

    // Call the RPC
    const testResult = await client.query(`
      SELECT get_available_time_slots_consolidated(
        $1::uuid,
        ARRAY[$2::uuid],
        120,
        CURRENT_DATE + 1,
        CURRENT_DATE + 7
      ) as result
    `, [testCompanyId, testEmployeeId]);

    const result = testResult.rows[0]?.result;
    if (result) {
      console.log('📊 Test Result:');
      console.log(`  Success: ${result.success}`);
      console.log(`  Slots found: ${result.slots ? result.slots.length : 0}`);
      console.log(`  Debug info:`, JSON.stringify(result.debug, null, 2));
      console.log();

      if (result.success && result.slots.length > 0) {
        console.log('✅ RPC is working correctly!');
        console.log(`   Found ${result.slots.length} available slots\n`);
        console.log('Sample slot:');
        console.log(JSON.stringify(result.slots[0], null, 2));
      } else if (result.success && result.slots.length === 0) {
        console.log('⚠️  RPC returned success but no slots found');
        console.log('   This could mean:');
        console.log('   - Employee is fully booked');
        console.log('   - Date range is outside business hours');
        console.log('   - All slots have conflicts');
      } else {
        console.log('❌ RPC returned error:', result.debug?.error);
      }
    } else {
      console.log('⚠️  Could not parse RPC result');
    }

    await client.end();
    console.log('\n✅ Deployment complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.detail) console.error('   Detail:', error.detail);
    if (error.hint) console.error('   Hint:', error.hint);
  }
}

deployFix();

