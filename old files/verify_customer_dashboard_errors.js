// Verify Customer Dashboard Errors - Using proper authentication system
const fetch = require('node-fetch');

// Import the proper environment configuration
const SUPABASE_URL = "https://amgtktrwpdsigcomavlg.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64";

const COMPANY_ID = 'ba643da1-c16f-468e-8fcb-f347e7929597';

// Test the exact queries that Customer Dashboard makes
const TEST_QUERIES = [
  {
    name: 'Customer Messages',
    path: 'customer_messages?select=*,customers(name,email)&order=created_at.desc&limit=20',
    shouldExist: false // Table doesn't exist yet
  },
  {
    name: 'Customers with company filter',
    path: `customers?select=*&order=updated_at.desc&limit=50&company_id=eq.${COMPANY_ID}`,
    shouldExist: true
  },
  {
    name: 'Service Requests',
    path: `service_requests?select=*,customers(name,email,phone)&or=(company_id.is.null,company_id.eq.${COMPANY_ID})&order=created_at.desc&limit=20`,
    shouldExist: true
  }
];

async function testSupabaseQuery(query, description) {
  try {
    console.log(`\n🧪 Testing: ${description}`);
    console.log(`Query: ${query.path}`);

    const url = `${SUPABASE_URL}/rest/v1/${query.path}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Accept': 'application/json'
      }
    });

    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ SUCCESS - Returned ${Array.isArray(data) ? data.length : 'non-array'} records`);
      return { success: true, status: response.status, data };
    } else {
      const errorText = await response.text();
      console.log(`❌ FAILED - ${response.status}: ${errorText}`);
      return { success: false, status: response.status, error: errorText };
    }
  } catch (error) {
    console.log(`❌ ERROR - ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function verifyCustomerDashboardFixes() {
  console.log('🔍 VERIFYING CUSTOMER DASHBOARD FIXES...');
  console.log('Testing the exact queries that Customer Dashboard makes\n');

  const results = [];

  // Test each query
  for (const query of TEST_QUERIES) {
    const result = await testSupabaseQuery(query, query.name);
    results.push({ query, result });
  }

  // Summary
  console.log('\n📊 VERIFICATION SUMMARY:');
  console.log('=' .repeat(50));
  
  let stillFailing = 0;
  let expectedFailures = 0;
  let fixed = 0;

  results.forEach(({ description, result }) => {
    if (description.includes('EXPECTED TO FAIL')) {
      if (!result.success) {
        console.log(`✅ ${description} - Expected failure`);
        expectedFailures++;
      } else {
        console.log(`❌ ${description} - Should have failed but didn't`);
      }
    } else {
      if (result.success) {
        console.log(`✅ ${description} - FIXED`);
        fixed++;
      } else {
        console.log(`❌ ${description} - STILL FAILING: ${result.error || result.status}`);
        stillFailing++;
      }
    }
  });

  console.log(`\n🎯 RESULTS:`);
  console.log(`   Fixed: ${fixed}`);
  console.log(`   Still Failing: ${stillFailing}`);
  console.log(`   Expected Failures: ${expectedFailures}`);

  if (stillFailing === 0) {
    console.log('\n🎉 ALL CUSTOMER DASHBOARD ERRORS SHOULD BE FIXED!');
  } else {
    console.log('\n⚠️  CUSTOMER DASHBOARD STILL HAS ERRORS - NEED MORE FIXES');
  }
}

// Run verification
verifyCustomerDashboardFixes().catch(console.error);
