const { Client } = require('pg');
require('dotenv').config();

async function checkRPC() {
  const client = new Client({
    host: process.env.SUPABASE_DB_HOST,
    port: parseInt(process.env.SUPABASE_DB_PORT || 5432),
    database: process.env.SUPABASE_DB_NAME || 'postgres',
    user: process.env.SUPABASE_DB_USER,
    password: process.env.SUPABASE_DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  // Check the RPC function definition
  const result = await client.query(`
    SELECT pg_get_functiondef(oid) as definition
    FROM pg_proc
    WHERE proname = 'get_filtered_invoices'
    LIMIT 1
  `);

  if (result.rows.length > 0) {
    console.log('✅ RPC Function Definition:');
    console.log(result.rows[0].definition);
    console.log('\n');
    
    // Check if it queries work_orders
    if (result.rows[0].definition.includes('work_orders')) {
      console.log('✅ RPC is querying work_orders table (CORRECT)');
    } else if (result.rows[0].definition.includes('invoices')) {
      console.log('❌ RPC is querying invoices table (WRONG - needs update)');
    }
  } else {
    console.log('❌ RPC function not found');
  }

  await client.end();
}

checkRPC().catch(console.error);

