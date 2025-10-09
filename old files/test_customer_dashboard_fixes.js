// Test Customer Dashboard Fixes
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

async function testCustomerDashboardQueries() {
  console.log('🧪 TESTING CUSTOMER DASHBOARD QUERIES AFTER FIXES...\n');

  // Test the exact queries that were failing
  const testQueries = [
    {
      name: 'Customers Query',
      sql: 'SELECT COUNT(*) FROM customers',
      shouldWork: true
    },
    {
      name: 'Work Orders - Quotes',
      sql: "SELECT COUNT(*) FROM work_orders WHERE stage = 'QUOTE'",
      shouldWork: true
    },
    {
      name: 'Work Orders - Jobs (WORK_ORDER stage)',
      sql: "SELECT COUNT(*) FROM work_orders WHERE stage = 'WORK_ORDER'",
      shouldWork: true
    },
    {
      name: 'Invoices Query',
      sql: 'SELECT COUNT(*) FROM invoices',
      shouldWork: true
    },
    {
      name: 'Service Requests Query',
      sql: 'SELECT COUNT(*) FROM service_requests',
      shouldWork: true
    },
    {
      name: 'Customer Messages (SHOULD FAIL - table missing)',
      sql: 'SELECT COUNT(*) FROM customer_messages',
      shouldWork: false
    }
  ];

  let passedTests = 0;
  let totalTests = testQueries.length;

  for (const test of testQueries) {
    console.log(`Testing: ${test.name}`);
    const result = await execSQL(test.sql);
    
    if (test.shouldWork && result.success) {
      console.log(`✅ PASS - ${test.name}: ${JSON.stringify(result.data)}`);
      passedTests++;
    } else if (!test.shouldWork && !result.success) {
      console.log(`✅ PASS - ${test.name}: Expected failure - ${result.error}`);
      passedTests++;
    } else if (test.shouldWork && !result.success) {
      console.log(`❌ FAIL - ${test.name}: ${result.error}`);
    } else {
      console.log(`❌ FAIL - ${test.name}: Expected failure but got success`);
    }
    console.log('');
  }

  console.log(`🎯 TEST RESULTS: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ALL TESTS PASSED! Customer Dashboard should work now.');
  } else {
    console.log('⚠️  Some tests failed. Customer Dashboard may still have issues.');
  }

  // Test unified pipeline stages
  console.log('\n🔍 CHECKING UNIFIED PIPELINE STAGES...');
  const stagesResult = await execSQL('SELECT DISTINCT stage FROM work_orders ORDER BY stage');
  if (stagesResult.success) {
    console.log('Available stages:', stagesResult.data.map(s => s.stage));
  }
}

// Run the test
testCustomerDashboardQueries().catch(console.error);
