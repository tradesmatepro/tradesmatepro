// Check if customer_messages table exists and create it if needed
const fetch = require('node-fetch');

const DEV_PROXY_URL = 'http://127.0.0.1:4000/dev/sql/exec';

async function execSQL(sql) {
  try {
    const response = await fetch(DEV_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql })
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('SQL execution error:', error);
    return { success: false, error: error.message };
  }
}

async function checkAndCreateCustomerMessages() {
  console.log('🔍 CHECKING CUSTOMER MESSAGES TABLE...\n');

  // Check if table exists
  const checkResult = await execSQL(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_name = 'customer_messages'
  `);

  if (checkResult.success && checkResult.data && checkResult.data.length > 0) {
    console.log('✅ customer_messages table EXISTS');
    
    // Check structure
    const structureResult = await execSQL(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'customer_messages' 
      ORDER BY ordinal_position
    `);
    
    if (structureResult.success) {
      console.log('\n📋 Table structure:');
      structureResult.data.forEach(col => {
        console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
    }
    
    // Check if there are any records
    const countResult = await execSQL('SELECT COUNT(*) as count FROM customer_messages');
    if (countResult.success) {
      console.log(`\n📊 Records: ${countResult.data[0].count}`);
    }
    
  } else {
    console.log('❌ customer_messages table DOES NOT EXIST');
    console.log('\n🔧 This explains the 400 errors in Customer Dashboard!');
    console.log('\n💡 SOLUTION: The table needs to be created using the schema in:');
    console.log('   sql files/customer_dashboard_schema.sql');
    console.log('\n🎯 This table enables communication between:');
    console.log('   - Customer Portal app (separate React app)');
    console.log('   - TradeMate Pro main app (contractor dashboard)');
  }
}

// Run the check
checkAndCreateCustomerMessages().catch(console.error);
