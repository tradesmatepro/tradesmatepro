// Test Specific API Endpoints That Were Causing 400 Errors
// This script directly tests the Supabase REST API endpoints

const fetch = require('node-fetch');
const fs = require('fs');

// Supabase configuration (from your app)
const SUPABASE_URL = 'https://xtqjcvqjqjqjqjqjqjqj.supabase.co'; // Replace with actual URL
const SUPABASE_SERVICE_KEY = 'your-service-key'; // Replace with actual key

console.log('🧪 TESTING SPECIFIC API ENDPOINTS THAT CAUSED 400 ERRORS');
console.log('='.repeat(80));

// Read Supabase credentials from file if available
function getSupabaseCredentials() {
  try {
    if (fs.existsSync('supabasecreds.txt')) {
      const creds = fs.readFileSync('supabasecreds.txt', 'utf8');
      const lines = creds.split('\n');

      // Find URL line
      const urlLine = lines.find(line => line.includes('supabase.co'));
      const url = urlLine ? urlLine.replace('project url ', '').trim() : null;

      // Find service key line
      const serviceLine = lines.find(line => line.startsWith('service '));
      const key = serviceLine ? serviceLine.replace('service ', '').trim() : null;

      if (url && key) {
        console.log(`✅ Found Supabase credentials: ${url}`);
        return { url, key };
      } else {
        console.log('❌ Could not parse credentials from supabasecreds.txt');
        console.log(`   URL found: ${!!url}, Key found: ${!!key}`);
      }
    }
  } catch (error) {
    console.log('⚠️ Could not read supabasecreds.txt:', error.message);
  }

  return null;
}

async function testSupabaseEndpoint(endpoint, description) {
  const creds = getSupabaseCredentials();
  
  if (!creds) {
    console.log('❌ Cannot test endpoints: Supabase credentials not found');
    console.log('   Create supabasecreds.txt with URL and service key');
    return { success: false, error: 'No credentials' };
  }

  const url = `${creds.url}/rest/v1/${endpoint}`;
  
  try {
    console.log(`\n🔍 Testing: ${description}`);
    console.log(`   URL: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': creds.key,
        'Authorization': `Bearer ${creds.key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      }
    });

    const responseText = await response.text();
    
    if (response.ok) {
      console.log(`✅ ${description} - SUCCESS (${response.status})`);
      
      // Try to parse as JSON
      try {
        const data = JSON.parse(responseText);
        console.log(`   Records: ${Array.isArray(data) ? data.length : 'N/A'}`);
      } catch (e) {
        console.log(`   Response: ${responseText.substring(0, 100)}...`);
      }
      
      return { success: true, status: response.status, data: responseText };
    } else {
      console.log(`❌ ${description} - ERROR (${response.status})`);
      console.log(`   Error: ${responseText}`);
      
      return { success: false, status: response.status, error: responseText };
    }
    
  } catch (error) {
    console.log(`❌ ${description} - NETWORK ERROR`);
    console.log(`   Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testAllProblematicEndpoints() {
  console.log('\n📋 TESTING ENDPOINTS THAT PREVIOUSLY CAUSED 400 ERRORS');
  console.log('-'.repeat(50));

  const endpoints = [
    {
      endpoint: 'customers?select=*&order=updated_at.desc&limit=10',
      description: 'Customers with updated_at ordering'
    },
    {
      endpoint: 'customer_messages?select=*,customers(name,email)&limit=10',
      description: 'Customer messages with customer join'
    },
    {
      endpoint: 'customer_communications?select=*,users(first_name,last_name)&limit=10',
      description: 'Customer communications with users join'
    },
    {
      endpoint: 'sales_activities?select=*,users(first_name,last_name)&limit=10',
      description: 'Sales activities with users join'
    },
    {
      endpoint: 'sales_activities?select=*&next_action_date=lte.2025-09-16&completed_at=is.null&limit=10',
      description: 'Sales activities with date filters'
    },
    {
      endpoint: 'work_orders?select=*&stage=eq.QUOTE&limit=10',
      description: 'Work orders filtered by QUOTE stage'
    },
    {
      endpoint: 'work_orders?select=*&stage=eq.WORK_ORDER&limit=10',
      description: 'Work orders filtered by WORK_ORDER stage'
    },
    {
      endpoint: 'invoices?select=*&order=created_at.desc&limit=10',
      description: 'Invoices ordered by created_at'
    },
    {
      endpoint: 'service_requests?select=*,customers(name,email,phone)&limit=10',
      description: 'Service requests with customer join'
    }
  ];

  const results = [];
  
  for (const test of endpoints) {
    const result = await testSupabaseEndpoint(test.endpoint, test.description);
    results.push({ ...test, ...result });
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return results;
}

async function testRPCFunctions() {
  console.log('\n🔧 TESTING RPC FUNCTIONS');
  console.log('-'.repeat(50));

  const creds = getSupabaseCredentials();
  
  if (!creds) {
    console.log('❌ Cannot test RPC functions: No credentials');
    return [];
  }

  const rpcTests = [
    {
      function: 'get_company_customers',
      params: { company_uuid: 'ba643da1-c16f-468e-8fcb-f347e7929597' },
      description: 'Get company customers RPC function'
    }
  ];

  const results = [];

  for (const test of rpcTests) {
    const url = `${creds.url}/rest/v1/rpc/${test.function}`;
    
    try {
      console.log(`\n🔍 Testing RPC: ${test.description}`);
      console.log(`   Function: ${test.function}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'apikey': creds.key,
          'Authorization': `Bearer ${creds.key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(test.params)
      });

      const responseText = await response.text();
      
      if (response.ok) {
        console.log(`✅ ${test.description} - SUCCESS (${response.status})`);
        try {
          const data = JSON.parse(responseText);
          console.log(`   Records: ${Array.isArray(data) ? data.length : 'N/A'}`);
        } catch (e) {
          console.log(`   Response: ${responseText.substring(0, 100)}...`);
        }
        results.push({ ...test, success: true, status: response.status });
      } else {
        console.log(`❌ ${test.description} - ERROR (${response.status})`);
        console.log(`   Error: ${responseText}`);
        results.push({ ...test, success: false, status: response.status, error: responseText });
      }
      
    } catch (error) {
      console.log(`❌ ${test.description} - NETWORK ERROR`);
      console.log(`   Error: ${error.message}`);
      results.push({ ...test, success: false, error: error.message });
    }
  }

  return results;
}

async function generateSummaryReport(endpointResults, rpcResults) {
  console.log('\n📊 SUMMARY REPORT');
  console.log('-'.repeat(50));

  const totalTests = endpointResults.length + rpcResults.length;
  const successfulTests = [...endpointResults, ...rpcResults].filter(r => r.success).length;
  const failedTests = totalTests - successfulTests;

  console.log(`📋 Total tests: ${totalTests}`);
  console.log(`✅ Successful: ${successfulTests}`);
  console.log(`❌ Failed: ${failedTests}`);

  if (failedTests > 0) {
    console.log('\n🚨 FAILED TESTS:');
    [...endpointResults, ...rpcResults]
      .filter(r => !r.success)
      .forEach((test, index) => {
        console.log(`\n${index + 1}. ${test.description}`);
        console.log(`   Status: ${test.status || 'Network Error'}`);
        console.log(`   Error: ${test.error || 'Unknown error'}`);
      });

    console.log('\n🎯 RECOMMENDED ACTIONS:');
    console.log('1. Check database schema for missing tables/columns');
    console.log('2. Verify foreign key relationships exist');
    console.log('3. Ensure RLS policies allow access');
    console.log('4. Check enum values match expected values');
  } else {
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('The 400 errors appear to be fixed.');
  }
}

async function main() {
  try {
    // Test all problematic endpoints
    const endpointResults = await testAllProblematicEndpoints();
    
    // Test RPC functions
    const rpcResults = await testRPCFunctions();
    
    // Generate summary report
    await generateSummaryReport(endpointResults, rpcResults);
    
    console.log('\n' + '='.repeat(80));
    console.log('🎉 API ENDPOINT TESTING COMPLETE');
    console.log('='.repeat(80));
    console.log('✅ Tested all endpoints that previously caused 400 errors');
    console.log('✅ Tested RPC functions');
    console.log('✅ Generated comprehensive report');
    
  } catch (error) {
    console.error('❌ API endpoint testing failed:', error);
  }
}

// Run the API endpoint tests
main().catch(console.error);
