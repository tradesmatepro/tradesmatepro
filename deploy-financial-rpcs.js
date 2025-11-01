/**
 * Deploy financial operations RPCs to Supabase
 * Creates: create_expense, create_vendor, create_purchase_order, add_po_item
 */

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

const fs = require('fs');
const path = require('path');

async function deploy() {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Read SQL file
    const sqlFile = path.join(__dirname, 'sql files', 'create_financial_operations_rpcs.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('📝 Deploying financial operations RPCs...\n');

    // Execute SQL
    await client.query(sql);

    console.log('✅ All RPCs deployed successfully!\n');
    console.log('📋 Deployed functions:');
    console.log('   1. create_expense()');
    console.log('   2. create_vendor()');
    console.log('   3. create_purchase_order()');
    console.log('   4. add_po_item()\n');

    // Verify functions exist
    const result = await client.query(`
      SELECT routine_name 
      FROM information_schema.routines 
      WHERE routine_schema = 'public' 
      AND routine_name IN ('create_expense', 'create_vendor', 'create_purchase_order', 'add_po_item')
      ORDER BY routine_name
    `);

    console.log('✅ Verification:');
    result.rows.forEach(row => {
      console.log(`   ✓ ${row.routine_name}`);
    });

    console.log('\n🎉 Deployment complete!');

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

deploy();

