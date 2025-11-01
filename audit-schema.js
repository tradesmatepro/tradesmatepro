/**
 * Full schema audit for living quote link system
 */

const { Client } = require('pg');
require('dotenv').config();

const DB_HOST = process.env.SUPABASE_DB_HOST || process.env.DB_HOST;
const DB_PORT = process.env.SUPABASE_DB_PORT || process.env.DB_PORT;
const DB_NAME = process.env.SUPABASE_DB_NAME || process.env.DB_NAME;
const DB_USER = process.env.SUPABASE_DB_USER || process.env.DB_USER;
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD || process.env.DB_PASSWORD;

const connectionString = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

(async () => {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('🔌 Connected to database\n');
    console.log('='.repeat(80));
    console.log('SCHEMA AUDIT FOR LIVING QUOTE LINK SYSTEM');
    console.log('='.repeat(80));
    
    // 1. Check work_orders table columns
    console.log('\n📋 1. WORK_ORDERS TABLE COLUMNS:\n');
    const woColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'work_orders'
      ORDER BY ordinal_position
    `);
    
    const requiredWOColumns = [
      'id', 'work_order_number', 'quote_number', 'status', 'title', 'description',
      'subtotal', 'tax_amount', 'total_amount', 'scheduled_start', 'scheduled_end',
      'actual_start', 'actual_end', 'created_at', 'updated_at', 'sent_at', 
      'viewed_at', 'approved_at', 'portal_token', 'portal_link_expires_at',
      'portal_last_accessed_at', 'portal_access_count', 'portal_token_created_at',
      'portal_token_expires_reason', 'customer_id', 'service_address_line_1',
      'service_city', 'service_state', 'service_zip_code'
    ];
    
    const woColumnNames = woColumns.rows.map(r => r.column_name);
    requiredWOColumns.forEach(col => {
      const exists = woColumnNames.includes(col);
      console.log(`  ${exists ? '✅' : '❌'} ${col}`);
    });
    
    // 2. Check customers table columns
    console.log('\n📋 2. CUSTOMERS TABLE COLUMNS:\n');
    const custColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'customers'
      ORDER BY ordinal_position
    `);
    
    const requiredCustColumns = ['id', 'name', 'email', 'phone', 'company_name'];
    const custColumnNames = custColumns.rows.map(r => r.column_name);
    requiredCustColumns.forEach(col => {
      const exists = custColumnNames.includes(col);
      console.log(`  ${exists ? '✅' : '❌'} ${col}`);
    });
    
    // 3. Check work_order_line_items table
    console.log('\n📋 3. WORK_ORDER_LINE_ITEMS TABLE:\n');
    const lineItemsCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'work_order_line_items'
      ) as exists
    `);
    
    if (lineItemsCheck.rows[0].exists) {
      console.log('  ✅ Table exists');
      const liColumns = await client.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'work_order_line_items'
        ORDER BY ordinal_position
      `);
      
      const requiredLIColumns = ['id', 'work_order_id', 'description', 'quantity', 'unit_price', 'total_price', 'line_type', 'sort_order'];
      const liColumnNames = liColumns.rows.map(r => r.column_name);
      requiredLIColumns.forEach(col => {
        const exists = liColumnNames.includes(col);
        console.log(`    ${exists ? '✅' : '❌'} ${col}`);
      });
    } else {
      console.log('  ❌ Table does NOT exist');
    }
    
    // 4. Check invoices table
    console.log('\n📋 4. INVOICES TABLE:\n');
    const invoicesCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'invoices'
      ) as exists
    `);
    
    if (invoicesCheck.rows[0].exists) {
      console.log('  ✅ Table exists');
      const invColumns = await client.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'invoices'
        ORDER BY ordinal_position
      `);
      
      console.log('\n  Available columns:');
      invColumns.rows.forEach(col => {
        console.log(`    - ${col.column_name} (${col.data_type})`);
      });
      
      const requiredInvColumns = ['id', 'work_order_id', 'invoice_number', 'status', 'amount_due', 'amount_paid', 'due_date', 'paid_at'];
      const invColumnNames = invColumns.rows.map(r => r.column_name);
      console.log('\n  Required columns:');
      requiredInvColumns.forEach(col => {
        const exists = invColumnNames.includes(col);
        console.log(`    ${exists ? '✅' : '❌'} ${col}`);
      });
    } else {
      console.log('  ❌ Table does NOT exist');
    }
    
    // 5. Check messages table
    console.log('\n📋 5. MESSAGES TABLE:\n');
    const messagesCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'messages'
      ) as exists
    `);
    
    if (messagesCheck.rows[0].exists) {
      console.log('  ✅ Table exists');
      const msgColumns = await client.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'messages'
        ORDER BY ordinal_position
      `);
      
      const requiredMsgColumns = ['id', 'work_order_id', 'message', 'sender_type', 'created_at'];
      const msgColumnNames = msgColumns.rows.map(r => r.column_name);
      requiredMsgColumns.forEach(col => {
        const exists = msgColumnNames.includes(col);
        console.log(`    ${exists ? '✅' : '❌'} ${col}`);
      });
    } else {
      console.log('  ❌ Table does NOT exist');
    }
    
    // 6. Check work_order_files table
    console.log('\n📋 6. WORK_ORDER_FILES TABLE:\n');
    const filesCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'work_order_files'
      ) as exists
    `);
    
    if (filesCheck.rows[0].exists) {
      console.log('  ✅ Table exists');
      const fileColumns = await client.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'work_order_files'
        ORDER BY ordinal_position
      `);
      
      const requiredFileColumns = ['id', 'work_order_id', 'file_name', 'file_url', 'file_type', 'uploaded_at'];
      const fileColumnNames = fileColumns.rows.map(r => r.column_name);
      requiredFileColumns.forEach(col => {
        const exists = fileColumnNames.includes(col);
        console.log(`    ${exists ? '✅' : '❌'} ${col}`);
      });
    } else {
      console.log('  ❌ Table does NOT exist');
    }
    
    // 7. Check RPC function exists
    console.log('\n📋 7. RPC FUNCTION:\n');
    const rpcCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM pg_proc 
        WHERE proname = 'get_living_quote_data'
      ) as exists
    `);
    console.log(`  ${rpcCheck.rows[0].exists ? '✅' : '❌'} get_living_quote_data function exists`);
    
    console.log('\n' + '='.repeat(80));
    console.log('AUDIT COMPLETE');
    console.log('='.repeat(80) + '\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('🔌 Disconnected\n');
  }
})();

