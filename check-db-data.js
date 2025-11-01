/**
 * Check what data exists in the database
 */

const { Client } = require('pg');
require('dotenv').config();

async function checkData() {
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

    // Check companies
    const compResult = await client.query('SELECT id, name FROM companies LIMIT 5');
    console.log(`📊 Companies (${compResult.rows.length}):`);
    compResult.rows.forEach(c => console.log(`  - ${c.name} (${c.id})`));
    console.log();

    // Check customers
    const custResult = await client.query('SELECT id, name, company_id FROM customers LIMIT 5');
    console.log(`📊 Customers (${custResult.rows.length}):`);
    custResult.rows.forEach(c => console.log(`  - ${c.name} (${c.id}) - Company: ${c.company_id}`));
    console.log();

    // Check work orders
    const woResult = await client.query('SELECT id, title, company_id, status FROM work_orders LIMIT 5');
    console.log(`📊 Work Orders (${woResult.rows.length}):`);
    woResult.rows.forEach(w => console.log(`  - ${w.title} (${w.id}) - Status: ${w.status} - Company: ${w.company_id}`));
    console.log();

    // Check invoices
    const invResult = await client.query('SELECT id, invoice_number, company_id, status FROM invoices LIMIT 5');
    console.log(`📊 Invoices (${invResult.rows.length}):`);
    invResult.rows.forEach(i => console.log(`  - ${i.invoice_number} (${i.id}) - Status: ${i.status} - Company: ${i.company_id}`));

    await client.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkData();

