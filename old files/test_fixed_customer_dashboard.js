// Test the fixed Customer Dashboard queries
const fetch = require('node-fetch');

const SUPABASE_URL = "https://amgtktrwpdsigcomavlg.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64";

async function testQuery(query, description) {
  try {
    console.log(`\n🧪 Testing: ${description}`);
    console.log(`Query: ${query}`);
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${query}`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ SUCCESS - ${data.length} records`);
      return { success: true, data };
    } else {
      const error = await response.text();
      console.log(`❌ FAILED - ${response.status}: ${error}`);
      return { success: false, error, status: response.status };
    }
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testFixedCustomerDashboard() {
  console.log('🔧 TESTING FIXED CUSTOMER DASHBOARD QUERIES');
  console.log('These are the exact queries CustomerDashboard.js now makes\n');

  const COMPANY_ID = 'ba643da1-c16f-468e-8fcb-f347e7929597';

  // Test all the fixed queries
  const tests = [
    {
      query: `customers?select=*&order=created_at.desc&limit=50&company_id=eq.${COMPANY_ID}`,
      description: 'Customers (FIXED: created_at.desc)',
      shouldWork: true
    },
    {
      query: `work_orders?select=*,customers(name,email,phone)&stage=eq.QUOTE&order=created_at.desc&limit=20&company_id=eq.${COMPANY_ID}`,
      description: 'Quotes from work_orders',
      shouldWork: true
    },
    {
      query: `work_orders?select=*,customers(name,email,phone)&stage=eq.WORK_ORDER&order=created_at.desc&limit=20&company_id=eq.${COMPANY_ID}`,
      description: 'Jobs from work_orders',
      shouldWork: true
    },
    {
      query: `invoices?select=*,customers(name,email,phone)&order=created_at.desc&limit=20&company_id=eq.${COMPANY_ID}`,
      description: 'Invoices',
      shouldWork: true
    },
    {
      query: `service_requests?select=*,customers(name,email,phone)&or=(company_id.is.null,company_id.eq.${COMPANY_ID})&order=id.desc&limit=20`,
      description: 'Service Requests (FIXED: id.desc)',
      shouldWork: true
    },
    {
      query: `customer_messages?select=*,customers(name,email)&order=created_at.desc&limit=20&company_id=eq.${COMPANY_ID}`,
      description: 'Customer Messages (WILL FAIL until table created)',
      shouldWork: false
    }
  ];

  const results = [];

  for (const test of tests) {
    const result = await testQuery(test.query, test.description);
    results.push({ ...test, result });
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 CUSTOMER DASHBOARD QUERY TEST RESULTS');
  console.log('='.repeat(80));

  let fixed = 0;
  let stillBroken = 0;
  let expectedFailures = 0;

  results.forEach((test, index) => {
    const status = test.result.success ? '✅ WORKING' : '❌ FAILING';
    const expected = test.shouldWork ? '' : '(Expected to fail)';
    
    console.log(`${index + 1}. ${status} ${expected}`);
    console.log(`   ${test.description}`);
    
    if (test.shouldWork && test.result.success) {
      fixed++;
      console.log(`   📊 Records: ${test.result.data.length}`);
    } else if (test.shouldWork && !test.result.success) {
      stillBroken++;
      console.log(`   ❌ Error: ${test.result.error || test.result.status}`);
    } else if (!test.shouldWork && !test.result.success) {
      expectedFailures++;
      console.log(`   ⏳ Waiting for customer_messages table creation`);
    }
    console.log('');
  });

  console.log(`🎯 RESULTS:`);
  console.log(`   ✅ Fixed: ${fixed}`);
  console.log(`   ❌ Still Broken: ${stillBroken}`);
  console.log(`   ⏳ Expected Failures: ${expectedFailures}`);

  if (stillBroken === 0) {
    console.log('\n🎉 CUSTOMER DASHBOARD QUERIES ARE FIXED!');
    console.log('📋 Next step: Create customer_messages table using CREATE_CUSTOMER_MESSAGES_TABLE.sql');
    console.log('🌐 Then test Customer Dashboard in browser');
  } else {
    console.log('\n⚠️  STILL HAVE ISSUES - Need more investigation');
  }
}

// Run the test
testFixedCustomerDashboard().catch(console.error);
