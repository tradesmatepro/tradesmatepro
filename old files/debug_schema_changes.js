// Debug Schema Changes - Check if our fixes actually applied
// This script checks the actual database schema to see what happened

const fetch = require('node-fetch');

const DEV_SQL_URL = 'http://127.0.0.1:4000';

async function execSQL(sql, description) {
  try {
    const response = await fetch(`${DEV_SQL_URL}/dev/sql/exec`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql, description })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ ${description} - SUCCESS`);
      if (result.data && result.data.length > 0) {
        console.log(`   Results: ${JSON.stringify(result.data, null, 2)}`);
      }
      return { success: true, data: result.data };
    } else {
      console.log(`❌ ${description} - ${result.error}`);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.log(`❌ ${description} - ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function debugSchemaChanges() {
  console.log('🔍 DEBUG SCHEMA CHANGES - CHECKING ACTUAL DATABASE STATE');
  console.log('='.repeat(80));

  // Check 1: Customers table columns
  console.log('\n1️⃣ CHECKING CUSTOMERS TABLE COLUMNS');
  console.log('-'.repeat(50));

  const customersColumnsSQL = `
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns 
    WHERE table_name = 'customers' 
    AND table_schema = 'public'
    ORDER BY column_name;
  `;

  await execSQL(customersColumnsSQL, 'Check customers table columns');

  // Check 2: Sales activities table columns
  console.log('\n2️⃣ CHECKING SALES_ACTIVITIES TABLE COLUMNS');
  console.log('-'.repeat(50));

  const salesActivitiesColumnsSQL = `
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns 
    WHERE table_name = 'sales_activities' 
    AND table_schema = 'public'
    ORDER BY column_name;
  `;

  await execSQL(salesActivitiesColumnsSQL, 'Check sales_activities table columns');

  // Check 3: Users table columns
  console.log('\n3️⃣ CHECKING USERS TABLE COLUMNS');
  console.log('-'.repeat(50));

  const usersColumnsSQL = `
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND table_schema = 'public'
    ORDER BY column_name;
  `;

  await execSQL(usersColumnsSQL, 'Check users table columns');

  // Check 4: Customer messages table and foreign keys
  console.log('\n4️⃣ CHECKING CUSTOMER_MESSAGES TABLE AND FOREIGN KEYS');
  console.log('-'.repeat(50));

  const customerMessagesSQL = `
    SELECT 
      c.column_name, 
      c.data_type,
      tc.constraint_name,
      tc.constraint_type,
      kcu.referenced_table_name,
      kcu.referenced_column_name
    FROM information_schema.columns c
    LEFT JOIN information_schema.key_column_usage kcu 
      ON c.table_name = kcu.table_name AND c.column_name = kcu.column_name
    LEFT JOIN information_schema.table_constraints tc 
      ON kcu.constraint_name = tc.constraint_name
    WHERE c.table_name = 'customer_messages' 
    AND c.table_schema = 'public'
    ORDER BY c.column_name;
  `;

  await execSQL(customerMessagesSQL, 'Check customer_messages table and foreign keys');

  // Check 5: Customer communications table and foreign keys
  console.log('\n5️⃣ CHECKING CUSTOMER_COMMUNICATIONS TABLE AND FOREIGN KEYS');
  console.log('-'.repeat(50));

  const customerCommunicationsSQL = `
    SELECT 
      c.column_name, 
      c.data_type,
      tc.constraint_name,
      tc.constraint_type,
      kcu.referenced_table_name,
      kcu.referenced_column_name
    FROM information_schema.columns c
    LEFT JOIN information_schema.key_column_usage kcu 
      ON c.table_name = kcu.table_name AND c.column_name = kcu.column_name
    LEFT JOIN information_schema.table_constraints tc 
      ON kcu.constraint_name = tc.constraint_name
    WHERE c.table_name = 'customer_communications' 
    AND c.table_schema = 'public'
    ORDER BY c.column_name;
  `;

  await execSQL(customerCommunicationsSQL, 'Check customer_communications table and foreign keys');

  // Check 6: RPC functions
  console.log('\n6️⃣ CHECKING RPC FUNCTIONS');
  console.log('-'.repeat(50));

  const rpcFunctionsSQL = `
    SELECT 
      routine_name,
      routine_type,
      data_type,
      routine_definition
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_name LIKE '%customer%'
    ORDER BY routine_name;
  `;

  await execSQL(rpcFunctionsSQL, 'Check RPC functions');

  // Check 7: Test actual queries that were failing
  console.log('\n7️⃣ TESTING ACTUAL FAILING QUERIES');
  console.log('-'.repeat(50));

  const testQueries = [
    {
      name: 'customers.updated_at query',
      sql: "SELECT id, name, updated_at FROM customers ORDER BY updated_at DESC LIMIT 1;"
    },
    {
      name: 'sales_activities.next_action_date query',
      sql: "SELECT id, next_action_date, completed_at FROM sales_activities LIMIT 1;"
    },
    {
      name: 'users.first_name query',
      sql: "SELECT id, first_name, last_name FROM users LIMIT 1;"
    }
  ];

  for (const query of testQueries) {
    await execSQL(query.sql, query.name);
  }

  // Check 8: Database connection info
  console.log('\n8️⃣ CHECKING DATABASE CONNECTION INFO');
  console.log('-'.repeat(50));

  const dbInfoSQL = `
    SELECT 
      current_database() as database_name,
      current_schema() as current_schema,
      version() as postgres_version;
  `;

  await execSQL(dbInfoSQL, 'Check database connection info');

  console.log('\n' + '='.repeat(80));
  console.log('🎉 SCHEMA DEBUG CHECK COMPLETE');
  console.log('='.repeat(80));
  console.log('📊 Review the results above to see:');
  console.log('   - Which columns actually exist');
  console.log('   - Which foreign keys are properly created');
  console.log('   - Which RPC functions are available');
  console.log('   - Whether our changes took effect');
}

// Run the schema debug check
debugSchemaChanges().catch(console.error);
