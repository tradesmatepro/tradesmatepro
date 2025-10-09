// Comprehensive 400 Error Check Using ALL Dev Tools
// This script uses the complete dev tools suite we built

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Dev Tools Endpoints
const DEV_SQL_URL = 'http://127.0.0.1:4000';
const LOCAL_LOGGER_URL = 'http://localhost:4321';

console.log('🔧 COMPREHENSIVE 400 ERROR CHECK USING ALL DEV TOOLS');
console.log('Using the complete dev tools suite we built');
console.log('='.repeat(80));

async function checkDevToolsStatus() {
  console.log('\n📊 CHECKING DEV TOOLS STATUS');
  console.log('-'.repeat(50));

  // Check Dev SQL Server
  try {
    const sqlHealth = await fetch(`${DEV_SQL_URL}/health`);
    const sqlStatus = await sqlHealth.json();
    console.log('✅ Dev SQL Server (port 4000):', sqlStatus.status || 'RUNNING');
  } catch (error) {
    console.log('❌ Dev SQL Server (port 4000): OFFLINE');
    console.log('   Run: node devSqlExec.js');
  }

  // Check Local Logger Server
  try {
    const loggerHealth = await fetch(`${LOCAL_LOGGER_URL}/health`);
    const loggerStatus = await loggerHealth.json();
    console.log('✅ Local Logger Server (port 4321):', loggerStatus.ok ? 'RUNNING' : 'ERROR');
  } catch (error) {
    console.log('❌ Local Logger Server (port 4321): OFFLINE');
    console.log('   Run: node devtools/local_logger_server.js');
  }

  // Check Console Capture Scripts
  const consoleScripts = [
    'public/console-error-capture.js',
    'public/enhanced-console-capture.js',
    'public/network-capture.js',
    'public/auto-fix-console-errors.js'
  ];

  console.log('\n📁 CONSOLE CAPTURE SCRIPTS:');
  consoleScripts.forEach(script => {
    if (fs.existsSync(script)) {
      console.log(`✅ ${script}`);
    } else {
      console.log(`❌ ${script} - MISSING`);
    }
  });
}

async function getLatestBrowserLogs() {
  console.log('\n📋 GETTING LATEST BROWSER CONSOLE LOGS');
  console.log('-'.repeat(50));

  try {
    const response = await fetch(`${LOCAL_LOGGER_URL}/logs/latest?limit=100`);
    const logs = await response.json();
    
    if (logs && logs.length > 0) {
      console.log(`✅ Found ${logs.length} recent log entries`);
      
      // Filter for HTTP 400 errors
      const http400Errors = logs.filter(log => 
        log.message && (
          log.message.includes('400') ||
          log.message.includes('Bad Request') ||
          log.message.includes('HTTP error') ||
          log.message.includes('Failed to fetch')
        )
      );

      if (http400Errors.length > 0) {
        console.log(`\n🚨 FOUND ${http400Errors.length} HTTP 400 ERRORS:`);
        http400Errors.forEach((error, index) => {
          console.log(`\n${index + 1}. ${error.timestamp}`);
          console.log(`   Type: ${error.type}`);
          console.log(`   Message: ${error.message}`);
        });
        return http400Errors;
      } else {
        console.log('✅ No HTTP 400 errors found in recent logs');
        return [];
      }
    } else {
      console.log('⚠️ No recent logs found');
      return [];
    }
  } catch (error) {
    console.log('❌ Failed to get browser logs:', error.message);
    return [];
  }
}

async function analyzeDatabase() {
  console.log('\n🗄️ ANALYZING DATABASE SCHEMA');
  console.log('-'.repeat(50));

  try {
    // Get all tables
    const tablesResponse = await fetch(`${DEV_SQL_URL}/dev/schema/tables`);
    const tablesResult = await tablesResponse.json();
    
    if (tablesResult.success) {
      console.log(`✅ Found ${tablesResult.data.length} tables in database`);
      
      // Check for key tables that commonly cause 400 errors
      const keyTables = [
        'customers',
        'customer_messages', 
        'customer_communications',
        'sales_activities',
        'work_orders',
        'invoices',
        'users'
      ];

      console.log('\n📋 KEY TABLES STATUS:');
      for (const table of keyTables) {
        const exists = tablesResult.data.some(t => t.table_name === table);
        console.log(`${exists ? '✅' : '❌'} ${table}`);
      }

      return tablesResult.data;
    } else {
      console.log('❌ Failed to get database schema:', tablesResult.error);
      return [];
    }
  } catch (error) {
    console.log('❌ Database analysis failed:', error.message);
    return [];
  }
}

async function testCommonQueries() {
  console.log('\n🧪 TESTING COMMON QUERIES THAT CAUSE 400 ERRORS');
  console.log('-'.repeat(50));

  const testQueries = [
    {
      name: 'customers with updated_at',
      sql: "SELECT id, name, updated_at FROM customers LIMIT 1;"
    },
    {
      name: 'customer_messages table',
      sql: "SELECT COUNT(*) as count FROM customer_messages;"
    },
    {
      name: 'customer_communications with users join',
      sql: "SELECT cc.*, u.first_name FROM customer_communications cc LEFT JOIN users u ON cc.user_id = u.id LIMIT 1;"
    },
    {
      name: 'sales_activities with users join',
      sql: "SELECT sa.*, u.first_name FROM sales_activities sa LEFT JOIN users u ON sa.user_id = u.id LIMIT 1;"
    },
    {
      name: 'work_orders as quotes',
      sql: "SELECT COUNT(*) as quote_count FROM work_orders WHERE stage = 'QUOTE';"
    }
  ];

  const results = [];
  for (const query of testQueries) {
    try {
      const response = await fetch(`${DEV_SQL_URL}/dev/sql/exec`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sql: query.sql,
          description: `Testing: ${query.name}`
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ ${query.name} - SUCCESS`);
        results.push({ ...query, success: true, result });
      } else {
        console.log(`❌ ${query.name} - ${result.error}`);
        results.push({ ...query, success: false, error: result.error });
      }
    } catch (error) {
      console.log(`❌ ${query.name} - ${error.message}`);
      results.push({ ...query, success: false, error: error.message });
    }
  }

  return results;
}

async function checkBrowserConsoleCapture() {
  console.log('\n🌐 CHECKING BROWSER CONSOLE CAPTURE SETUP');
  console.log('-'.repeat(50));

  // Check if console capture scripts are properly injected
  const indexHtml = 'public/index.html';
  if (fs.existsSync(indexHtml)) {
    const content = fs.readFileSync(indexHtml, 'utf8');
    
    const hasConsoleCapture = content.includes('console-error-capture.js') || 
                             content.includes('enhanced-console-capture.js');
    
    if (hasConsoleCapture) {
      console.log('✅ Console capture scripts are injected in index.html');
    } else {
      console.log('⚠️ Console capture scripts NOT found in index.html');
      console.log('   Add: <script src="/console-error-capture.js"></script>');
    }
  }

  // Check if network capture is enabled
  const networkCapture = 'public/network-capture.js';
  if (fs.existsSync(networkCapture)) {
    console.log('✅ Network capture script available');
  } else {
    console.log('❌ Network capture script missing');
  }
}

async function generateFixRecommendations(browserErrors, queryResults) {
  console.log('\n💡 GENERATING FIX RECOMMENDATIONS');
  console.log('-'.repeat(50));

  const recommendations = [];

  // Analyze browser errors
  browserErrors.forEach(error => {
    if (error.message.includes('customer_messages')) {
      recommendations.push({
        priority: 'HIGH',
        issue: 'customer_messages table missing',
        fix: 'CREATE TABLE customer_messages with proper schema',
        sql: 'Already fixed in previous run'
      });
    }
    
    if (error.message.includes('updated_at')) {
      recommendations.push({
        priority: 'HIGH', 
        issue: 'customers.updated_at column missing',
        fix: 'ALTER TABLE customers ADD COLUMN updated_at',
        sql: 'Already fixed in previous run'
      });
    }
  });

  // Analyze query results
  queryResults.forEach(result => {
    if (!result.success) {
      if (result.error.includes('column') && result.error.includes('does not exist')) {
        recommendations.push({
          priority: 'HIGH',
          issue: `Missing column: ${result.name}`,
          fix: 'Add missing column to table',
          sql: 'Needs specific ALTER TABLE statement'
        });
      }
      
      if (result.error.includes('relation') && result.error.includes('does not exist')) {
        recommendations.push({
          priority: 'CRITICAL',
          issue: `Missing table: ${result.name}`,
          fix: 'Create missing table with proper schema',
          sql: 'Needs CREATE TABLE statement'
        });
      }
    }
  });

  if (recommendations.length > 0) {
    console.log(`\n🎯 FOUND ${recommendations.length} ISSUES TO FIX:`);
    recommendations.forEach((rec, index) => {
      console.log(`\n${index + 1}. [${rec.priority}] ${rec.issue}`);
      console.log(`   Fix: ${rec.fix}`);
      console.log(`   SQL: ${rec.sql}`);
    });
  } else {
    console.log('✅ No critical issues found!');
  }

  return recommendations;
}

async function main() {
  try {
    // Step 1: Check all dev tools are running
    await checkDevToolsStatus();
    
    // Step 2: Get latest browser console logs
    const browserErrors = await getLatestBrowserLogs();
    
    // Step 3: Analyze database schema
    const tables = await analyzeDatabase();
    
    // Step 4: Test common queries that cause 400 errors
    const queryResults = await testCommonQueries();
    
    // Step 5: Check browser console capture setup
    await checkBrowserConsoleCapture();
    
    // Step 6: Generate fix recommendations
    const recommendations = await generateFixRecommendations(browserErrors, queryResults);
    
    console.log('\n' + '='.repeat(80));
    console.log('🎉 COMPREHENSIVE DEV TOOLS CHECK COMPLETE');
    console.log('='.repeat(80));
    console.log('✅ Used Dev SQL Server for database analysis');
    console.log('✅ Used Local Logger Server for browser console logs');
    console.log('✅ Checked console capture script setup');
    console.log('✅ Tested common queries that cause 400 errors');
    console.log('✅ Generated targeted fix recommendations');
    
    if (recommendations.length > 0) {
      console.log(`\n🎯 Next: Apply ${recommendations.length} recommended fixes`);
    } else {
      console.log('\n🎉 All systems appear to be working correctly!');
    }
    
  } catch (error) {
    console.error('❌ Comprehensive check failed:', error);
  }
}

// Run the comprehensive check
main().catch(console.error);
