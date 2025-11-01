/**
 * Debug RPC function structure
 */

const { Client } = require('pg');
require('dotenv').config();

async function debugRPC() {
  let client;
  try {
    console.log('🔍 DEBUGGING RPC FUNCTION\n');

    client = new Client({
      host: process.env.SUPABASE_DB_HOST,
      port: parseInt(process.env.SUPABASE_DB_PORT || 5432),
      database: process.env.SUPABASE_DB_NAME || 'postgres',
      user: process.env.SUPABASE_DB_USER,
      password: process.env.SUPABASE_DB_PASSWORD,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();

    // Get RPC function definition
    console.log('1️⃣  RPC Function Definition:');
    const funcDef = await client.query(`
      SELECT 
        proname,
        pg_get_functiondef(oid) as definition
      FROM pg_proc
      WHERE proname = 'get_schedulable_employees'
    `);

    if (funcDef.rows.length > 0) {
      console.log(funcDef.rows[0].definition);
      console.log();
    }

    // Get RPC return type
    console.log('2️⃣  RPC Return Type:');
    const returnType = await client.query(`
      SELECT 
        proname,
        pg_get_function_result(oid) as return_type
      FROM pg_proc
      WHERE proname = 'get_schedulable_employees'
    `);

    if (returnType.rows.length > 0) {
      console.log(`   Return type: ${returnType.rows[0].return_type}`);
      console.log();
    }

    // Get company_id
    const companyCheck = await client.query(`
      SELECT DISTINCT company_id FROM employees LIMIT 1
    `);

    if (companyCheck.rows.length > 0) {
      const company_id = companyCheck.rows[0].company_id;
      
      // Try calling with SELECT *
      console.log('3️⃣  Calling RPC with SELECT *:');
      try {
        const result = await client.query(`
          SELECT * FROM get_schedulable_employees($1::uuid)
        `, [company_id]);
        
        console.log(`   ✅ Success! Got ${result.rows.length} rows`);
        if (result.rows.length > 0) {
          console.log('   Columns:', Object.keys(result.rows[0]));
          console.log('   First row:', result.rows[0]);
        }
      } catch (e) {
        console.log(`   ❌ Error: ${e.message}`);
      }
      console.log();

      // Try calling with specific columns
      console.log('4️⃣  Calling RPC with specific columns:');
      try {
        const result = await client.query(`
          SELECT id, user_id, employee_id, full_name, email FROM get_schedulable_employees($1::uuid)
        `, [company_id]);
        
        console.log(`   ✅ Success! Got ${result.rows.length} rows`);
        if (result.rows.length > 0) {
          console.log('   First row:', result.rows[0]);
        }
      } catch (e) {
        console.log(`   ❌ Error: ${e.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (client) {
      await client.end();
    }
  }
}

debugRPC();

