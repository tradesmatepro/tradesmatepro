const { Client } = require('pg');
require('dotenv').config();

async function testRPC() {
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

    // Test the RPC function directly
    const companyId = '48f32d34-f32c-46d0-8281-312fd21762d8';
    
    console.log('🔍 Testing RPC: get_filtered_invoices\n');
    console.log(`Company ID: ${companyId}\n`);

    const result = await client.query(`
      SELECT * FROM get_filtered_invoices(
        p_company_id := $1,
        p_status_filter := 'all',
        p_search_term := '',
        p_date_start := NULL,
        p_date_end := NULL,
        p_limit := 100,
        p_offset := 0
      )
    `, [companyId]);

    console.log(`✅ RPC returned ${result.rows.length} work order IDs:\n`);
    result.rows.forEach((row, idx) => {
      console.log(`  ${idx + 1}. ${row.id}`);
    });

    // Now fetch the full work order details
    if (result.rows.length > 0) {
      const ids = result.rows.map(r => r.id);
      console.log(`\n📋 Fetching full work order details...\n`);
      
      const woResult = await client.query(`
        SELECT id, title, status, total_amount, invoiced_at
        FROM work_orders
        WHERE id = ANY($1)
        ORDER BY created_at DESC
      `, [ids]);

      woResult.rows.forEach((wo, idx) => {
        console.log(`  ${idx + 1}. ${wo.title}`);
        console.log(`     ID: ${wo.id}`);
        console.log(`     Status: ${wo.status}`);
        console.log(`     Total: $${wo.total_amount}`);
        console.log(`     Invoiced At: ${wo.invoiced_at}\n`);
      });
    }

    await client.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testRPC();

