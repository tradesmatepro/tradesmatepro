// Check if columns actually exist in the database
const fetch = require('node-fetch');

const DEV_SQL_URL = 'http://127.0.0.1:4000';

async function checkColumn(table, column) {
  try {
    const response = await fetch(`${DEV_SQL_URL}/dev/sql/exec`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sql: `SELECT column_name FROM information_schema.columns WHERE table_name = '${table}' AND column_name = '${column}';`,
        description: `Check if ${table}.${column} exists`
      })
    });

    const result = await response.json();
    
    if (result.success) {
      const exists = result.data && result.data.length > 0;
      console.log(`${exists ? '✅' : '❌'} ${table}.${column} - ${exists ? 'EXISTS' : 'MISSING'}`);
      return exists;
    } else {
      console.log(`❌ ${table}.${column} - ERROR: ${result.error}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${table}.${column} - NETWORK ERROR: ${error.message}`);
    return false;
  }
}

async function checkTable(table) {
  try {
    const response = await fetch(`${DEV_SQL_URL}/dev/sql/exec`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sql: `SELECT table_name FROM information_schema.tables WHERE table_name = '${table}';`,
        description: `Check if ${table} table exists`
      })
    });

    const result = await response.json();
    
    if (result.success) {
      const exists = result.data && result.data.length > 0;
      console.log(`${exists ? '✅' : '❌'} ${table} table - ${exists ? 'EXISTS' : 'MISSING'}`);
      return exists;
    } else {
      console.log(`❌ ${table} table - ERROR: ${result.error}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${table} table - NETWORK ERROR: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🔍 CHECKING IF COLUMNS ACTUALLY EXIST IN DATABASE');
  console.log('='.repeat(60));

  // Check tables
  console.log('\n📋 CHECKING TABLES:');
  await checkTable('customers');
  await checkTable('sales_activities');
  await checkTable('users');
  await checkTable('customer_messages');
  await checkTable('customer_communications');

  // Check specific columns that were causing 400 errors
  console.log('\n📋 CHECKING SPECIFIC COLUMNS:');
  await checkColumn('customers', 'updated_at');
  await checkColumn('sales_activities', 'next_action_date');
  await checkColumn('sales_activities', 'completed_at');
  await checkColumn('users', 'first_name');
  await checkColumn('users', 'last_name');
  await checkColumn('customer_messages', 'customer_id');
  await checkColumn('customer_communications', 'user_id');

  console.log('\n='.repeat(60));
  console.log('🎯 If any columns show as MISSING, our fixes did not apply correctly');
}

main().catch(console.error);
