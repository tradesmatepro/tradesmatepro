// Use Dev Tools to Check for Real 400 Error Causes
// This uses our built-in dev SQL execution server

const fetch = require('node-fetch');

const DEV_SERVER_URL = 'http://127.0.0.1:4000';

async function execSQL(sql, description) {
  try {
    console.log(`\n🔍 ${description}`);
    console.log(`SQL: ${sql}`);
    
    const response = await fetch(`${DEV_SERVER_URL}/dev/sql/exec`, {
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
      console.log(`✅ SUCCESS - ${result.data?.length || 0} rows`);
      return { success: true, data: result.data };
    } else {
      console.log(`❌ FAILED - ${result.error}`);
      return { success: false, error: result.error, details: result.details };
    }
  } catch (error) {
    console.log(`❌ ERROR - ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function checkDatabaseIssues() {
  console.log('🔍 USING DEV TOOLS TO CHECK FOR REAL 400 ERROR CAUSES');
  console.log('This will identify the actual database issues causing browser 400 errors');
  console.log('='.repeat(80));

  // 1. Check for missing foreign key relationships
  console.log('\n1️⃣ CHECKING FOREIGN KEY RELATIONSHIPS');
  console.log('-'.repeat(50));

  const fkChecks = [
    {
      name: 'customer_communications → users relationship',
      sql: `
        SELECT 
          tc.constraint_name,
          tc.table_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_name = 'customer_communications'
          AND ccu.table_name = 'users';
      `
    },
    {
      name: 'customer_messages → customers relationship',
      sql: `
        SELECT 
          tc.constraint_name,
          tc.table_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_name = 'customer_messages'
          AND ccu.table_name = 'customers';
      `
    }
  ];

  for (const check of fkChecks) {
    const result = await execSQL(check.sql, check.name);
    if (result.success && result.data.length === 0) {
      console.log('   ⚠️ Missing foreign key relationship - This causes 400 errors in joins');
    }
  }

  // 2. Check for missing columns that components expect
  console.log('\n2️⃣ CHECKING FOR MISSING COLUMNS');
  console.log('-'.repeat(50));

  const columnChecks = [
    {
      table: 'sales_activities',
      expectedColumns: ['subject', 'activity_type', 'user_id', 'description'],
      sql: `
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'sales_activities'
        ORDER BY ordinal_position;
      `
    },
    {
      table: 'customer_communications',
      expectedColumns: ['user_id'],
      sql: `
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'customer_communications'
        ORDER BY ordinal_position;
      `
    },
    {
      table: 'users',
      expectedColumns: ['first_name', 'last_name', 'full_name'],
      sql: `
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'users'
        ORDER BY ordinal_position;
      `
    }
  ];

  for (const check of columnChecks) {
    const result = await execSQL(check.sql, `${check.table} columns`);
    if (result.success) {
      const actualColumns = result.data.map(row => row.column_name);
      const missingColumns = check.expectedColumns.filter(col => !actualColumns.includes(col));
      
      if (missingColumns.length > 0) {
        console.log(`   ❌ ${check.table} missing columns: ${missingColumns.join(', ')}`);
      } else {
        console.log(`   ✅ ${check.table} has all expected columns`);
      }
    }
  }

  // 3. Check for missing tables
  console.log('\n3️⃣ CHECKING FOR MISSING TABLES');
  console.log('-'.repeat(50));

  const expectedTables = [
    'customer_messages',
    'customer_communications', 
    'customer_tags',
    'customer_service_agreements',
    'sales_activities',
    'leads',
    'opportunities'
  ];

  const tableCheckSQL = `
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN (${expectedTables.map(t => `'${t}'`).join(', ')})
    ORDER BY table_name;
  `;

  const tableResult = await execSQL(tableCheckSQL, 'Check for missing tables');
  if (tableResult.success) {
    const existingTables = tableResult.data.map(row => row.table_name);
    const missingTables = expectedTables.filter(table => !existingTables.includes(table));
    
    if (missingTables.length > 0) {
      console.log(`   ❌ Missing tables: ${missingTables.join(', ')}`);
    } else {
      console.log(`   ✅ All expected tables exist`);
    }
  }

  // 4. Check for enum value issues
  console.log('\n4️⃣ CHECKING ENUM VALUES');
  console.log('-'.repeat(50));

  const enumChecks = [
    {
      name: 'work_orders.stage enum values',
      sql: `
        SELECT unnest(enum_range(NULL::stage_enum)) as stage_value;
      `
    }
  ];

  for (const check of enumChecks) {
    const result = await execSQL(check.sql, check.name);
    if (result.success) {
      const enumValues = result.data.map(row => Object.values(row)[0]);
      console.log(`   📋 Available values: ${enumValues.join(', ')}`);
      
      // Check if JOB vs WORK_ORDER issue exists
      if (enumValues.includes('JOB') && enumValues.includes('WORK_ORDER')) {
        console.log('   ⚠️ Both JOB and WORK_ORDER exist - components might use wrong value');
      }
    }
  }

  // 5. Test actual problematic queries
  console.log('\n5️⃣ TESTING PROBLEMATIC QUERIES FROM COMPONENTS');
  console.log('-'.repeat(50));

  const COMPANY_ID = 'ba643da1-c16f-468e-8fcb-f347e7929597';

  const problematicQueries = [
    {
      name: 'Customers.js - loadCommunications with users join',
      sql: `
        SELECT cc.*, u.first_name, u.last_name
        FROM customer_communications cc
        LEFT JOIN users u ON cc.user_id = u.id
        WHERE cc.company_id = '${COMPANY_ID}'
        ORDER BY cc.created_at DESC
        LIMIT 5;
      `
    },
    {
      name: 'CustomerDashboard.js - customer_messages join',
      sql: `
        SELECT cm.*, c.name, c.email
        FROM customer_messages cm
        LEFT JOIN customers c ON cm.customer_id = c.id
        WHERE cm.company_id = '${COMPANY_ID}'
        ORDER BY cm.created_at DESC
        LIMIT 5;
      `
    },
    {
      name: 'SalesDashboard.js - sales_activities with description',
      sql: `
        SELECT sa.id, sa.activity_type, sa.description, sa.user_id, u.full_name
        FROM sales_activities sa
        LEFT JOIN users u ON sa.user_id = u.id
        WHERE sa.company_id = '${COMPANY_ID}'
        ORDER BY sa.created_at DESC
        LIMIT 5;
      `
    }
  ];

  for (const query of problematicQueries) {
    await execSQL(query.sql, query.name);
  }

  console.log('\n' + '='.repeat(80));
  console.log('📊 DEV TOOLS DATABASE CHECK COMPLETE');
  console.log('='.repeat(80));
  console.log('🎯 This shows the REAL database issues causing 400 errors');
  console.log('🔧 Fix these issues to resolve browser 400 errors');
}

// Run the database check using dev tools
checkDatabaseIssues().catch(console.error);
