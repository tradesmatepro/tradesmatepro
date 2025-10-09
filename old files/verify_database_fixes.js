// Verify that all database fixes were applied correctly
const fetch = require('node-fetch');

async function execSQL(sql, description) {
  try {
    console.log(`\n🔍 ${description}`);
    
    const response = await fetch('http://127.0.0.1:4000/dev/sql/exec', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sql: sql,
        description: description
      })
    });

    const result = await response.json();
    
    if (result.success && result.data) {
      console.log('   ✅ SUCCESS');
      if (result.data.length > 0) {
        console.log('   Result:', JSON.stringify(result.data, null, 2));
      } else {
        console.log('   Result: No data returned (query executed successfully)');
      }
      return true;
    } else {
      console.log('   ❌ FAILED');
      console.log('   Error:', result.error || result.message || JSON.stringify(result));
      return false;
    }
  } catch (error) {
    console.log('   ❌ NETWORK ERROR:', error.message);
    return false;
  }
}

async function main() {
  console.log('🔍 VERIFYING DATABASE FIXES');
  console.log('='.repeat(60));

  // Check if columns exist by querying information_schema
  await execSQL(
    `SELECT column_name, data_type 
     FROM information_schema.columns 
     WHERE table_name = 'customers' AND column_name = 'updated_at'`,
    'Check customers.updated_at column'
  );

  await execSQL(
    `SELECT column_name, data_type 
     FROM information_schema.columns 
     WHERE table_name = 'sales_activities' AND column_name IN ('next_action_date', 'completed_at')
     ORDER BY column_name`,
    'Check sales_activities columns'
  );

  await execSQL(
    `SELECT column_name, data_type 
     FROM information_schema.columns 
     WHERE table_name = 'users' AND column_name IN ('first_name', 'last_name')
     ORDER BY column_name`,
    'Check users name columns'
  );

  await execSQL(
    `SELECT table_name 
     FROM information_schema.tables 
     WHERE table_name = 'customer_messages'`,
    'Check customer_messages table exists'
  );

  // Test the RPC function
  await execSQL(
    `SELECT proname, proargnames 
     FROM pg_proc 
     WHERE proname = 'get_company_customers'`,
    'Check get_company_customers function exists'
  );

  console.log('\n' + '='.repeat(60));
  console.log('🎯 VERIFICATION COMPLETE');
  console.log('='.repeat(60));
}

main().catch(console.error);
