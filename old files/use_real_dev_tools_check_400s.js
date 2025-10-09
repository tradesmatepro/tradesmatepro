// Use Real Dev Tools to Check for 400 Errors
// This uses our built-in dev tools: local logger server + dev SQL server

const fetch = require('node-fetch');

const DEV_SQL_URL = 'http://127.0.0.1:4000';
const DEV_LOGGER_URL = 'http://127.0.0.1:4321';

async function getLatestLogs(limit = 100) {
  try {
    const response = await fetch(`${DEV_LOGGER_URL}/logs/latest?limit=${limit}`);
    const data = await response.json();
    return data.entries || [];
  } catch (error) {
    console.log('❌ Failed to get logs:', error.message);
    return [];
  }
}

async function execSQL(sql, description) {
  try {
    const response = await fetch(`${DEV_SQL_URL}/dev/sql/exec`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql, description })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ ${description} - ${result.data?.length || 0} rows`);
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

async function analyzeRealDevToolsErrors() {
  console.log('🔍 USING REAL DEV TOOLS TO ANALYZE 400 ERRORS');
  console.log('Getting actual browser console errors from dev tools');
  console.log('='.repeat(80));

  // 1. Get recent logs from dev tools
  console.log('\n1️⃣ GETTING RECENT BROWSER CONSOLE LOGS');
  console.log('-'.repeat(50));

  const logs = await getLatestLogs(200);
  console.log(`📋 Retrieved ${logs.length} log entries`);

  // 2. Filter for HTTP 400 errors
  const httpErrors = logs.filter(log => 
    log.type === 'HTTP_ERROR' && log.status === 400
  );

  console.log(`🚨 Found ${httpErrors.length} HTTP 400 errors:`);
  
  const errorPatterns = {};
  
  httpErrors.forEach((error, index) => {
    console.log(`\n${index + 1}. HTTP 400 Error:`);
    console.log(`   URL: ${error.url}`);
    console.log(`   Time: ${error.timestamp}`);
    
    // Extract table and query pattern
    const urlMatch = error.url.match(/\/rest\/v1\/([^?]+)\?(.+)/);
    if (urlMatch) {
      const table = urlMatch[1];
      const query = urlMatch[2];
      
      if (!errorPatterns[table]) {
        errorPatterns[table] = [];
      }
      errorPatterns[table].push({ query, url: error.url, timestamp: error.timestamp });
    }
  });

  // 3. Analyze error patterns
  console.log('\n2️⃣ ANALYZING ERROR PATTERNS');
  console.log('-'.repeat(50));

  for (const [table, errors] of Object.entries(errorPatterns)) {
    console.log(`\n📋 ${table} table - ${errors.length} errors:`);
    
    errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error.query}`);
    });

    // Check what's wrong with this table
    await analyzeTableIssues(table, errors);
  }

  // 4. Check for missing foreign key relationships
  console.log('\n3️⃣ CHECKING FOREIGN KEY RELATIONSHIPS');
  console.log('-'.repeat(50));

  const fkChecks = [
    {
      table: 'sales_activities',
      joinTable: 'users',
      description: 'sales_activities → users relationship'
    },
    {
      table: 'customer_communications', 
      joinTable: 'users',
      description: 'customer_communications → users relationship'
    },
    {
      table: 'customer_messages',
      joinTable: 'customers', 
      description: 'customer_messages → customers relationship'
    }
  ];

  for (const check of fkChecks) {
    const sql = `
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
        AND tc.table_name = '${check.table}'
        AND ccu.table_name = '${check.joinTable}';
    `;

    const result = await execSQL(sql, check.description);
    if (result.success && result.data.length === 0) {
      console.log(`   ⚠️ Missing foreign key: ${check.table} → ${check.joinTable}`);
    }
  }

  // 5. Provide specific fixes
  console.log('\n4️⃣ SPECIFIC FIXES NEEDED');
  console.log('-'.repeat(50));

  if (httpErrors.length > 0) {
    console.log('Based on the real browser errors found:');
    
    httpErrors.forEach((error, index) => {
      console.log(`\n🔧 Fix ${index + 1}:`);
      console.log(`   URL: ${error.url}`);
      
      if (error.url.includes('sales_activities') && error.url.includes('users(first_name,last_name)')) {
        console.log('   Issue: Missing foreign key relationship between sales_activities and users');
        console.log('   Fix: Add foreign key constraint or fix user_id column');
      }
      
      if (error.url.includes('next_action_date') || error.url.includes('completed_at')) {
        console.log('   Issue: Missing columns in sales_activities table');
        console.log('   Fix: Add next_action_date and completed_at columns');
      }
      
      if (error.url.includes('customer_communications') && error.url.includes('users(')) {
        console.log('   Issue: Missing foreign key relationship between customer_communications and users');
        console.log('   Fix: Add foreign key constraint or fix user_id column');
      }
    });
  } else {
    console.log('✅ No HTTP 400 errors found in recent logs');
  }

  return { httpErrors, errorPatterns };
}

async function analyzeTableIssues(table, errors) {
  console.log(`\n🔍 Analyzing ${table} table issues:`);
  
  // Check table columns
  const columnsSQL = `
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = '${table}'
    ORDER BY ordinal_position;
  `;
  
  const result = await execSQL(columnsSQL, `${table} columns`);
  if (result.success && result.data && Array.isArray(result.data)) {
    const columns = result.data.map(row => row.column_name);
    console.log(`   📊 Available columns: ${columns.join(', ')}`);
    
    // Check for missing columns mentioned in errors
    errors.forEach(error => {
      if (error.query.includes('first_name') && !columns.includes('first_name')) {
        console.log('   ❌ Missing column: first_name (needed for users join)');
      }
      if (error.query.includes('last_name') && !columns.includes('last_name')) {
        console.log('   ❌ Missing column: last_name (needed for users join)');
      }
      if (error.query.includes('next_action_date') && !columns.includes('next_action_date')) {
        console.log('   ❌ Missing column: next_action_date');
      }
      if (error.query.includes('completed_at') && !columns.includes('completed_at')) {
        console.log('   ❌ Missing column: completed_at');
      }
    });
  }
}

// Run the real dev tools analysis
analyzeRealDevToolsErrors().catch(console.error);
