// Verify that all 400 error fixes are working
// Run this AFTER applying FIX_ALL_400_ERRORS.sql in Supabase SQL Editor

const fetch = require('node-fetch');
const fs = require('fs');

// Get Supabase credentials
function getSupabaseCredentials() {
  try {
    if (fs.existsSync('supabasecreds.txt')) {
      const creds = fs.readFileSync('supabasecreds.txt', 'utf8');
      const lines = creds.split('\n');
      
      const urlLine = lines.find(line => line.includes('supabase.co'));
      const url = urlLine ? urlLine.replace('project url ', '').trim() : null;
      
      const serviceLine = lines.find(line => line.startsWith('service '));
      const key = serviceLine ? serviceLine.replace('service ', '').trim() : null;
      
      if (url && key) {
        return { url, key };
      }
    }
  } catch (error) {
    console.log('⚠️ Could not read supabasecreds.txt:', error.message);
  }
  
  return null;
}

async function testEndpoint(url, description) {
  const creds = getSupabaseCredentials();
  
  if (!creds) {
    console.log('❌ No credentials available');
    return false;
  }

  try {
    console.log(`\n🧪 Testing: ${description}`);
    console.log(`   URL: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'apikey': creds.key,
        'Authorization': `Bearer ${creds.key}`,
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ SUCCESS');
      console.log(`   Status: ${response.status}`);
      if (Array.isArray(data)) {
        console.log(`   Results: ${data.length} items`);
      } else {
        console.log('   Data:', JSON.stringify(data).substring(0, 100) + '...');
      }
      return true;
    } else {
      const errorText = await response.text();
      console.log('   ❌ FAILED');
      console.log(`   Status: ${response.status}`);
      console.log('   Error:', errorText.substring(0, 200));
      return false;
    }

  } catch (error) {
    console.log('   ❌ NETWORK ERROR:', error.message);
    return false;
  }
}

async function testRPCFunction(functionName, params, description) {
  const creds = getSupabaseCredentials();
  
  if (!creds) {
    console.log('❌ No credentials available');
    return false;
  }

  try {
    console.log(`\n🧪 Testing RPC: ${description}`);
    console.log(`   Function: ${functionName}`);
    
    const response = await fetch(`${creds.url}/rest/v1/rpc/${functionName}`, {
      method: 'POST',
      headers: {
        'apikey': creds.key,
        'Authorization': `Bearer ${creds.key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });

    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ SUCCESS');
      console.log(`   Status: ${response.status}`);
      if (Array.isArray(data)) {
        console.log(`   Results: ${data.length} items`);
      }
      return true;
    } else {
      const errorText = await response.text();
      console.log('   ❌ FAILED');
      console.log(`   Status: ${response.status}`);
      console.log('   Error:', errorText.substring(0, 200));
      return false;
    }

  } catch (error) {
    console.log('   ❌ NETWORK ERROR:', error.message);
    return false;
  }
}

async function main() {
  console.log('🔍 VERIFYING ALL 400 ERROR FIXES');
  console.log('='.repeat(80));
  console.log('Run this AFTER applying FIX_ALL_400_ERRORS.sql in Supabase SQL Editor');
  console.log('='.repeat(80));

  const creds = getSupabaseCredentials();
  if (!creds) {
    console.log('❌ Cannot proceed without Supabase credentials');
    return;
  }

  let passedTests = 0;
  let totalTests = 0;

  // Test 1: Customers with updated_at column
  totalTests++;
  if (await testEndpoint(
    `${creds.url}/rest/v1/customers?select=id,name,updated_at&limit=1`,
    'Customers table with updated_at column'
  )) {
    passedTests++;
  }

  // Test 2: Sales activities with new columns
  totalTests++;
  if (await testEndpoint(
    `${creds.url}/rest/v1/sales_activities?select=id,next_action_date,completed_at&limit=1`,
    'Sales activities with next_action_date and completed_at columns'
  )) {
    passedTests++;
  }

  // Test 3: Users with first_name and last_name
  totalTests++;
  if (await testEndpoint(
    `${creds.url}/rest/v1/users?select=id,first_name,last_name&limit=1`,
    'Users table with first_name and last_name columns'
  )) {
    passedTests++;
  }

  // Test 4: Customer messages table
  totalTests++;
  if (await testEndpoint(
    `${creds.url}/rest/v1/customer_messages?select=id,message_text,created_at&limit=1`,
    'Customer messages table'
  )) {
    passedTests++;
  }

  // Test 5: get_company_customers RPC function
  totalTests++;
  if (await testRPCFunction(
    'get_company_customers',
    { company_uuid: '00000000-0000-0000-0000-000000000000' }, // Test with dummy UUID
    'get_company_customers RPC function'
  )) {
    passedTests++;
  }

  console.log('\n' + '='.repeat(80));
  console.log('🎯 VERIFICATION RESULTS');
  console.log('='.repeat(80));
  console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ALL TESTS PASSED! 400 errors should be fixed.');
    console.log('');
    console.log('Next steps:');
    console.log('1. Open your browser and navigate to the app');
    console.log('2. Check browser console (F12) for any remaining errors');
    console.log('3. Test Customers, Quotes, Invoices, and Sales pages');
  } else {
    console.log('⚠️ Some tests failed. Check the errors above.');
    console.log('');
    console.log('Troubleshooting:');
    console.log('1. Make sure you ran FIX_ALL_400_ERRORS.sql in Supabase SQL Editor');
    console.log('2. Check that all SQL commands executed successfully');
    console.log('3. Verify your Supabase credentials are correct');
  }
  
  console.log('='.repeat(80));
}

main().catch(console.error);
