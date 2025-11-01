/**
 * Verify invoice was created in database
 */

const { Client } = require('pg');
require('dotenv').config();

async function verifyInvoice() {
  let client;
  try {
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

    // Check for invoices created in the last minute
    const result = await client.query(`
      SELECT id, invoice_number, company_id, work_order_id, customer_id, status, created_at
      FROM invoices
      WHERE created_at > NOW() - INTERVAL '1 minute'
      ORDER BY created_at DESC
      LIMIT 10
    `);

    console.log(`📊 Recent Invoices (${result.rows.length}):\n`);
    result.rows.forEach(inv => {
      console.log(`  Invoice: ${inv.invoice_number}`);
      console.log(`    ID: ${inv.id}`);
      console.log(`    Company: ${inv.company_id}`);
      console.log(`    Work Order: ${inv.work_order_id}`);
      console.log(`    Customer: ${inv.customer_id}`);
      console.log(`    Status: ${inv.status}`);
      console.log(`    Created: ${inv.created_at}\n`);
    });

    // Check work order status
    const woResult = await client.query(`
      SELECT id, status, invoiced_at, updated_at
      FROM work_orders
      WHERE id = 'f1669866-fa94-4bdb-9366-4a686e720469'
    `);

    if (woResult.rows.length > 0) {
      const wo = woResult.rows[0];
      console.log('📊 Work Order Status:');
      console.log(`  ID: ${wo.id}`);
      console.log(`  Status: ${wo.status}`);
      console.log(`  Invoiced At: ${wo.invoiced_at}`);
      console.log(`  Updated At: ${wo.updated_at}\n`);
    }

    await client.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verifyInvoice();

