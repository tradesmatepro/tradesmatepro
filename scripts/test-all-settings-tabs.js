const fs = require('fs');
const path = require('path');

console.log('\n🧪 COMPREHENSIVE SETTINGS TABS SAVE TESTING\n');
console.log('='.repeat(100));

// Read Supabase credentials from AIDevTools
const credPath = path.join(__dirname, '..', 'AIDevTools', 'credentials.json');
if (!fs.existsSync(credPath)) {
  console.error('❌ credentials.json not found in AIDevTools/');
  console.log('   Please create AIDevTools/credentials.json with:');
  console.log('   {');
  console.log('     "supabaseUrl": "https://your-project.supabase.co",');
  console.log('     "supabaseServiceKey": "your-service-key",');
  console.log('     "testCompanyId": "your-company-id"');
  console.log('   }');
  process.exit(1);
}

const creds = JSON.parse(fs.readFileSync(credPath, 'utf8'));
const SUPABASE_URL = creds.supabase?.url || creds.supabaseUrl;
const SUPABASE_SERVICE_KEY = creds.supabase?.serviceRoleKey || creds.supabaseServiceKey;
const TEST_COMPANY_ID = creds.testCompanyId || 'c27b7833-5eec-4688-8409-cbb6784470c1';

console.log(`📍 Supabase URL: ${SUPABASE_URL}`);
console.log(`🔑 Service Key: ${SUPABASE_SERVICE_KEY ? '***' + SUPABASE_SERVICE_KEY.slice(-10) : 'MISSING'}`);

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || SUPABASE_SERVICE_KEY.includes('YOUR_')) {
  console.error('❌ Missing or placeholder Supabase credentials in credentials.json');
  console.log('\n💡 Need to get service role key from Supabase dashboard:');
  console.log('   1. Go to https://supabase.com/dashboard/project/cxlqzejzraczumqmsrcx/settings/api');
  console.log('   2. Copy the service_role key');
  console.log('   3. Update AIDevTools/credentials.json');
  process.exit(1);
}

console.log(`\n🔧 Using company ID: ${TEST_COMPANY_ID}\n`);

const tabs = [
  {
    name: 'Company Profile',
    table: 'companies',
    testData: {
      name: 'Test Company Updated',
      phone: '+15551234567',
      email: 'test@example.com',
      website: 'https://example.com',
      tax_id: '12-3456789',
      address_line1: '123 Test St',
      city: 'Test City',
      state_province: 'CA',
      postal_code: '12345'
    },
    filter: `id=eq.${TEST_COMPANY_ID}`
  },
  {
    name: 'Business Settings',
    table: 'settings',
    testData: {
      timezone: 'America/Los_Angeles',
      currency: 'USD'
    },
    filter: `company_id=eq.${TEST_COMPANY_ID}`
  },
  {
    name: 'Rates & Pricing',
    table: 'settings',
    testData: {
      labor_rate: 85.00,
      parts_markup: 35.0,
      default_tax_rate: 8.5
    },
    filter: `company_id=eq.${TEST_COMPANY_ID}`
  },
  {
    name: 'Invoicing',
    table: 'settings',
    testData: {
      invoice_footer: 'Thank you for your business! Test update.',
      default_invoice_terms: 'NET_30'
    },
    filter: `company_id=eq.${TEST_COMPANY_ID}`
  }
];

async function testTabSave(tab) {
  console.log(`\n${'─'.repeat(100)}`);
  console.log(`📋 Testing: ${tab.name}`);
  console.log(`   Table: ${tab.table}`);
  
  const result = {
    name: tab.name,
    table: tab.table,
    success: false,
    error: null,
    verified: false
  };
  
  try {
    // Update data
    console.log(`\n   💾 Updating data...`);
    const updateUrl = `${SUPABASE_URL}/rest/v1/${tab.table}?${tab.filter}`;
    const updateResponse = await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(tab.testData)
    });
    
    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      let errorObj;
      try {
        errorObj = JSON.parse(errorText);
      } catch {
        errorObj = { message: errorText };
      }
      throw new Error(`${updateResponse.status} - ${JSON.stringify(errorObj)}`);
    }
    
    const updateResult = await updateResponse.json();
    console.log(`   ✅ Update successful (${updateResult.length} rows)`);
    
    // Verify
    console.log(`   🔍 Verifying...`);
    const verifyResponse = await fetch(`${SUPABASE_URL}/rest/v1/${tab.table}?${tab.filter}`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    });
    
    const afterData = await verifyResponse.json();
    
    if (afterData.length === 0) {
      throw new Error('No data found after update');
    }
    
    const record = afterData[0];
    let verified = true;
    
    for (const key of Object.keys(tab.testData)) {
      if (record[key] !== tab.testData[key]) {
        console.log(`   ❌ Field '${key}': expected ${tab.testData[key]}, got ${record[key]}`);
        verified = false;
      }
    }
    
    if (verified) {
      console.log(`   ✅ All fields verified!`);
      result.verified = true;
    }
    
    result.success = true;
    
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    result.error = error.message;
  }
  
  return result;
}

async function runAllTests() {
  const results = [];
  
  for (const tab of tabs) {
    const result = await testTabSave(tab);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\n${'='.repeat(100)}`);
  console.log('\n📊 SUMMARY\n');
  
  const passed = results.filter(r => r.success && r.verified);
  const failed = results.filter(r => !r.success || !r.verified);
  
  console.log(`Total: ${results.length}`);
  console.log(`✅ Passed: ${passed.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  
  if (failed.length > 0) {
    console.log('\n🚨 FAILED:\n');
    failed.forEach(r => {
      console.log(`   ❌ ${r.name} - ${r.error || 'Data mismatch'}`);
    });
  }
  
  console.log('\n' + '='.repeat(100) + '\n');
  
  process.exit(failed.length > 0 ? 1 : 0);
}

runAllTests().catch(error => {
  console.error('\n💥 FATAL:', error);
  process.exit(1);
});

