// Test adding a simple column to verify dev SQL server is working
const fetch = require('node-fetch');

async function execSQL(sql, description) {
  try {
    console.log(`\n🔧 ${description}`);
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
      if (result.data) {
        console.log('   Result:', JSON.stringify(result.data, null, 2));
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
  console.log('🧪 TESTING SIMPLE COLUMN ADDITION');
  console.log('='.repeat(60));

  // First, check current customers columns
  await execSQL(
    `SELECT column_name FROM information_schema.columns 
     WHERE table_schema = 'public' AND table_name = 'customers' 
     AND column_name = 'updated_at'`,
    'Check if customers.updated_at exists BEFORE adding'
  );

  // Try to add the column
  await execSQL(
    `ALTER TABLE customers ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`,
    'Add updated_at column to customers'
  );

  // Check if it was added
  await execSQL(
    `SELECT column_name, data_type FROM information_schema.columns 
     WHERE table_schema = 'public' AND table_name = 'customers' 
     AND column_name = 'updated_at'`,
    'Check if customers.updated_at exists AFTER adding'
  );

  // Test with a different approach - try to select from the column
  await execSQL(
    `SELECT updated_at FROM customers LIMIT 1`,
    'Try to select from updated_at column'
  );

  console.log('\n' + '='.repeat(60));
  console.log('🎯 SIMPLE TEST COMPLETE');
}

main().catch(console.error);
