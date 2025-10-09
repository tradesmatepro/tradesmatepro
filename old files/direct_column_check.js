// Direct check of columns using information_schema
const fetch = require('node-fetch');

async function execSQL(sql, description) {
  try {
    console.log(`\n🔍 ${description}`);
    console.log(`   SQL: ${sql}`);
    
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
    
    if (result.success) {
      console.log('   ✅ SUCCESS');
      if (result.data && Array.isArray(result.data)) {
        if (result.data.length > 0) {
          console.log('   Found:', result.data.length, 'results');
          result.data.forEach(row => {
            console.log('   -', JSON.stringify(row));
          });
        } else {
          console.log('   ❌ NO RESULTS FOUND');
        }
      } else {
        console.log('   Result:', JSON.stringify(result.data));
      }
    } else {
      console.log('   ❌ FAILED');
      console.log('   Error:', result.error || result.message || JSON.stringify(result));
    }
    
    return result;
  } catch (error) {
    console.log('   ❌ NETWORK ERROR:', error.message);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🔍 DIRECT COLUMN EXISTENCE CHECK');
  console.log('='.repeat(70));

  // Check customers table columns
  await execSQL(
    `SELECT column_name, data_type, is_nullable 
     FROM information_schema.columns 
     WHERE table_schema = 'public' AND table_name = 'customers' 
     ORDER BY column_name`,
    'List ALL customers table columns'
  );

  // Check sales_activities table columns
  await execSQL(
    `SELECT column_name, data_type, is_nullable 
     FROM information_schema.columns 
     WHERE table_schema = 'public' AND table_name = 'sales_activities' 
     ORDER BY column_name`,
    'List ALL sales_activities table columns'
  );

  // Check users table columns
  await execSQL(
    `SELECT column_name, data_type, is_nullable 
     FROM information_schema.columns 
     WHERE table_schema = 'public' AND table_name = 'users' 
     ORDER BY column_name`,
    'List ALL users table columns'
  );

  // Check if customer_messages table exists
  await execSQL(
    `SELECT table_name, table_type 
     FROM information_schema.tables 
     WHERE table_schema = 'public' AND table_name = 'customer_messages'`,
    'Check customer_messages table'
  );

  console.log('\n' + '='.repeat(70));
  console.log('🎯 DIRECT CHECK COMPLETE');
}

main().catch(console.error);
