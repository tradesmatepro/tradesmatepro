// Debug Dev SQL Server Connection
const fetch = require('node-fetch');

const DEV_SQL_URL = 'http://127.0.0.1:4000';

async function testConnection() {
  console.log('🔍 DEBUGGING DEV SQL SERVER CONNECTION');
  console.log('='.repeat(60));

  try {
    // Test 1: Health check
    console.log('\n1️⃣ TESTING HEALTH CHECK');
    const healthResponse = await fetch(`${DEV_SQL_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('Health check:', healthData);

    // Test 2: Simple query
    console.log('\n2️⃣ TESTING SIMPLE QUERY');
    const simpleResponse = await fetch(`${DEV_SQL_URL}/dev/sql/exec`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sql: 'SELECT NOW() as current_time;',
        description: 'Test basic query'
      })
    });

    const simpleResult = await simpleResponse.json();
    console.log('Simple query result:', JSON.stringify(simpleResult, null, 2));

    // Test 3: Database info
    console.log('\n3️⃣ TESTING DATABASE INFO');
    const dbInfoResponse = await fetch(`${DEV_SQL_URL}/dev/sql/exec`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sql: 'SELECT current_database() as db, current_user as user, version() as version;',
        description: 'Get database info'
      })
    });

    const dbInfoResult = await dbInfoResponse.json();
    console.log('Database info result:', JSON.stringify(dbInfoResult, null, 2));

    // Test 4: List all tables
    console.log('\n4️⃣ TESTING TABLE LIST');
    const tablesResponse = await fetch(`${DEV_SQL_URL}/dev/sql/exec`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sql: 'SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\' ORDER BY table_name;',
        description: 'List all tables'
      })
    });

    const tablesResult = await tablesResponse.json();
    console.log('Tables result:', JSON.stringify(tablesResult, null, 2));

    if (tablesResult.success && tablesResult.data) {
      console.log('\n📋 FOUND TABLES:');
      tablesResult.data.forEach(table => {
        console.log(`   - ${table.table_name}`);
      });
    }

    // Test 5: Schema endpoint
    console.log('\n5️⃣ TESTING SCHEMA ENDPOINT');
    const schemaResponse = await fetch(`${DEV_SQL_URL}/dev/schema/tables`);
    const schemaResult = await schemaResponse.json();
    console.log('Schema endpoint result:', JSON.stringify(schemaResult, null, 2));

  } catch (error) {
    console.error('❌ Connection test failed:', error);
  }
}

testConnection();
