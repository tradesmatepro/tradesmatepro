const { Client } = require('pg');
require('dotenv').config();

const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

// Columns referenced in the RPC function
const rpcColumns = {
  work_orders: [
    'id', 'work_order_number', 'quote_number', 'status', 'title', 'description',
    'subtotal', 'tax_amount', 'total_amount', 'scheduled_start', 'scheduled_end',
    'actual_start', 'actual_end', 'created_at', 'updated_at', 'sent_at', 'viewed_at',
    'approved_at', 'portal_link_expires_at', 'service_address_line_1', 'service_city',
    'service_state', 'service_zip_code', 'quote_sent_at', 'quote_accepted_at',
    'quote_rejected_at', 'deposit_required', 'deposit_amount', 'deposit_paid_at',
    'deposit_payment_method', 'scheduling_mode', 'allowed_payment_methods',
    'portal_last_accessed_at', 'portal_access_count', 'company_id', 'customer_id',
    'portal_token'
  ],
  customers: ['id', 'name', 'email', 'phone', 'company_name'],
  companies: [
    'id', 'name', 'email', 'phone', 'website', 'address_line1', 'address_line2',
    'city', 'state_province', 'postal_code', 'logo_url'
  ],
  work_order_line_items: [
    'id', 'description', 'quantity', 'unit_price', 'total_price', 'line_type',
    'sort_order', 'work_order_id'
  ],
  invoices: [
    'id', 'invoice_number', 'status', 'balance_due', 'amount_paid', 'due_date',
    'sent_at', 'work_order_id'
  ],
  messages: [
    'id', 'message_text', 'content', 'sender_type', 'sender_id', 'created_at',
    'work_order_id'
  ]
};

(async () => {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    console.log('🔍 Verifying all RPC columns exist in database...\n');
    
    let allValid = true;
    
    for (const [tableName, columns] of Object.entries(rpcColumns)) {
      console.log(`\n📋 Checking table: ${tableName}`);
      
      // Get actual columns from database
      const result = await client.query(`
        SELECT column_name
        FROM information_schema.columns 
        WHERE table_name = $1
        ORDER BY column_name
      `, [tableName]);
      
      const actualColumns = result.rows.map(r => r.column_name);
      
      // Check each RPC column
      for (const col of columns) {
        if (actualColumns.includes(col)) {
          console.log(`  ✅ ${col}`);
        } else {
          console.log(`  ❌ ${col} - DOES NOT EXIST!`);
          allValid = false;
        }
      }
    }
    
    console.log('\n' + '='.repeat(60));
    if (allValid) {
      console.log('✅ ALL COLUMNS VERIFIED - RPC SHOULD WORK!');
    } else {
      console.log('❌ SOME COLUMNS MISSING - RPC WILL FAIL!');
    }
    console.log('='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
})();

