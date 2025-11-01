/**
 * Test all financial operations RPCs
 * Verifies: create_expense, create_vendor, create_purchase_order, add_po_item
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

async function test() {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Get a test company
    const companyRes = await client.query('SELECT id FROM companies LIMIT 1');
    if (companyRes.rows.length === 0) {
      console.error('❌ No companies found in database');
      process.exit(1);
    }
    const companyId = companyRes.rows[0].id;
    console.log(`📋 Using company: ${companyId}\n`);

    // Test 1: create_expense
    console.log('🧪 Test 1: create_expense');
    const expenseRes = await client.query(
      `SELECT * FROM create_expense($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [companyId, 150.00, 'Test expense', new Date().toISOString().split('T')[0], 'travel', 'Test Vendor', 0, false, 'Test notes']
    );
    const expenseResult = expenseRes.rows[0].create_expense;
    if (expenseResult.success) {
      console.log(`✅ Expense created: ${expenseResult.expense_id}\n`);
    } else {
      console.error(`❌ Failed: ${expenseResult.error}\n`);
    }

    // Test 2: create_vendor
    console.log('🧪 Test 2: create_vendor');
    const vendorRes = await client.query(
      `SELECT * FROM create_vendor($1, $2, $3, $4, $5)`,
      [companyId, 'Test Vendor ' + Date.now(), 'vendor@test.com', '555-1234', '123 Main St']
    );
    const vendorResult = vendorRes.rows[0].create_vendor;
    if (vendorResult.success) {
      console.log(`✅ Vendor created: ${vendorResult.vendor_id}\n`);
    } else {
      console.error(`❌ Failed: ${vendorResult.error}\n`);
    }

    // Test 3: create_purchase_order
    console.log('🧪 Test 3: create_purchase_order');
    const poRes = await client.query(
      `SELECT * FROM create_purchase_order($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [companyId, 'PO-' + Date.now(), vendorResult.vendor_id, 1000, 100, 50, 1150, null, 'Test PO']
    );
    const poResult = poRes.rows[0].create_purchase_order;
    if (poResult.success) {
      console.log(`✅ Purchase order created: ${poResult.po_id}\n`);
    } else {
      console.error(`❌ Failed: ${poResult.error}\n`);
    }

    // Test 4: add_po_item
    console.log('🧪 Test 4: add_po_item');
    const itemRes = await client.query(
      `SELECT * FROM add_po_item($1, $2, $3, $4, $5)`,
      [companyId, poResult.po_id, 'Test Item', 5, 100]
    );
    const itemResult = itemRes.rows[0].add_po_item;
    if (itemResult.success) {
      console.log(`✅ PO item added: ${itemResult.item_id}\n`);
    } else {
      console.error(`❌ Failed: ${itemResult.error}\n`);
    }

    // Verify data in database
    console.log('📊 Verification:\n');

    const expenseCheck = await client.query('SELECT COUNT(*) as count FROM expenses WHERE company_id = $1', [companyId]);
    console.log(`✓ Expenses in database: ${expenseCheck.rows[0].count}`);

    const vendorCheck = await client.query('SELECT COUNT(*) as count FROM vendors WHERE company_id = $1', [companyId]);
    console.log(`✓ Vendors in database: ${vendorCheck.rows[0].count}`);

    const poCheck = await client.query('SELECT COUNT(*) as count FROM purchase_orders WHERE company_id = $1', [companyId]);
    console.log(`✓ Purchase orders in database: ${poCheck.rows[0].count}`);

    const itemCheck = await client.query('SELECT COUNT(*) as count FROM po_items WHERE company_id = $1', [companyId]);
    console.log(`✓ PO items in database: ${itemCheck.rows[0].count}`);

    console.log('\n🎉 All tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

test();

