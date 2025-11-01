const { Client } = require('pg');
require('dotenv').config();
const fs = require('fs');

async function runSQL() {
  const client = new Client({
    host: process.env.SUPABASE_DB_HOST,
    port: parseInt(process.env.SUPABASE_DB_PORT || 5432),
    database: process.env.SUPABASE_DB_NAME || 'postgres',
    user: process.env.SUPABASE_DB_USER,
    password: process.env.SUPABASE_DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Read the SQL file
    const sql = fs.readFileSync('database/migrations/AGGRESSIVE_RPC_FIX.sql', 'utf8');
    
    console.log('🔄 Running SQL migration...\n');
    
    // Execute the SQL
    await client.query(sql);
    
    console.log('✅ SQL migration executed successfully!\n');

    // Verify the RPC was updated
    const result = await client.query(`
      SELECT pg_get_functiondef(oid) as definition
      FROM pg_proc
      WHERE proname = 'get_filtered_invoices'
      LIMIT 1
    `);

    if (result.rows.length > 0) {
      const def = result.rows[0].definition;
      if (def.includes('work_orders')) {
        console.log('✅ RPC now queries work_orders table (CORRECT!)');
      } else {
        console.log('❌ RPC still queries invoices table');
      }
    }

    await client.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

runSQL();

