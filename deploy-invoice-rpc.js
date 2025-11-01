/**
 * Deploy the create_invoice RPC to Supabase
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function deployInvoiceRPC() {
  let client;
  try {
    console.log('🚀 Deploying create_invoice RPC...\n');

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

    // Read and execute the RPC SQL
    const sqlPath = path.join(__dirname, 'sql files', 'create_invoice_rpc.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📝 Executing SQL...');
    await client.query(sql);
    console.log('✅ RPC created successfully!\n');

    // Test the RPC
    console.log('🧪 Testing the RPC...\n');

    // Get a test company and customer
    const companyResult = await client.query(`
      SELECT id FROM companies LIMIT 1
    `);

    if (companyResult.rows.length === 0) {
      console.log('⚠️  No companies found to test with');
      await client.end();
      return;
    }

    const testCompanyId = companyResult.rows[0].id;
    console.log(`Testing with company_id: ${testCompanyId}`);

    // Get a customer for this company
    const custResult = await client.query(`
      SELECT id FROM customers WHERE company_id = $1 LIMIT 1
    `, [testCompanyId]);

    if (custResult.rows.length === 0) {
      console.log('⚠️  No customers found for this company');
      await client.end();
      return;
    }

    const testCustomerId = custResult.rows[0].id;
    console.log(`Testing with customer_id: ${testCustomerId}\n`);

    // Get a work order for this company
    const woResult = await client.query(`
      SELECT id FROM work_orders WHERE company_id = $1 LIMIT 1
    `, [testCompanyId]);

    const testWorkOrderId = woResult.rows.length > 0 ? woResult.rows[0].id : null;

    // Test RPC 1: create_invoice
    console.log('🧪 Testing create_invoice RPC...\n');
    const testResult1 = await client.query(`
      SELECT create_invoice(
        $1::uuid,
        $2::uuid,
        $3::uuid,
        'TEST-INV-' || to_char(NOW(), 'YYYYMMDDHH24MISS'),
        1500.00,
        1500.00,
        0.00,
        CURRENT_DATE,
        CURRENT_DATE + 30,
        'Test invoice'
      ) as result
    `, [testCompanyId, testWorkOrderId, testCustomerId]);

    const result1 = testResult1.rows[0]?.result;
    if (result1) {
      console.log('📊 create_invoice Result:');
      console.log(`  Success: ${result1.success}`);
      console.log(`  Invoice ID: ${result1.invoice_id}`);
      console.log(`  Invoice Number: ${result1.invoice_number}`);
      console.log(`  Message: ${result1.message}`);
      console.log();

      if (result1.success) {
        console.log('✅ create_invoice RPC is working correctly!\n');
      } else {
        console.log('❌ RPC returned error:', result1.error);
      }
    } else {
      console.log('⚠️  Could not parse RPC result');
    }

    // Test RPC 2: create_invoice_and_update_work_order (if work order exists)
    if (testWorkOrderId) {
      console.log('🧪 Testing create_invoice_and_update_work_order RPC...\n');
      const testResult2 = await client.query(`
        SELECT create_invoice_and_update_work_order(
          $1::uuid,
          $2::uuid,
          $3::uuid,
          'TEST-INV-' || to_char(NOW(), 'YYYYMMDDHH24MISS'),
          2000.00,
          2000.00,
          0.00,
          CURRENT_DATE,
          CURRENT_DATE + 30,
          'Test invoice with work order update'
        ) as result
      `, [testCompanyId, testWorkOrderId, testCustomerId]);

      const result2 = testResult2.rows[0]?.result;
      if (result2) {
        console.log('📊 create_invoice_and_update_work_order Result:');
        console.log(`  Success: ${result2.success}`);
        console.log(`  Invoice ID: ${result2.invoice_id}`);
        console.log(`  Invoice Number: ${result2.invoice_number}`);
        console.log(`  Message: ${result2.message}`);
        console.log();

        if (result2.success) {
          console.log('✅ create_invoice_and_update_work_order RPC is working correctly!\n');
        } else {
          console.log('❌ RPC returned error:', result2.error);
        }
      } else {
        console.log('⚠️  Could not parse RPC result');
      }
    }

    await client.end();
    console.log('✅ Deployment complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.detail) console.error('   Detail:', error.detail);
    if (error.hint) console.error('   Hint:', error.hint);
  }
}

deployInvoiceRPC();

