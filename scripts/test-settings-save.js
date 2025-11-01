const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Test data matching what SettingsDatabasePanel.js sends
const testSettingsData = {
  labor_rate: 75.0,
  overtime_multiplier: 1.5,
  parts_markup: 30.0,
  default_tax_rate: 8.25,
  minimum_travel_charge: 50.0,
  timezone: 'America/Los_Angeles',
  currency: 'USD',
  invoice_footer: 'Thank you for your business!',
  default_invoice_terms: 'NET_15',
  updated_at: new Date().toISOString()
};

const testCompanyData = {
  name: 'Test Company',
  phone: '+15551234567',  // E.164 format required
  email: 'test@example.com',
  website: 'https://example.com',
  licenses: [{ number: 'TEST123' }],
  tax_id: '12-3456789',  // This might trigger constraint
  theme_color: '#3B82F6',
  logo_url: null,
  banner_url: null,
  address_line1: '123 Test St',
  city: 'Test City',
  state_province: 'CA',
  postal_code: '12345',
  quote_terms: 'Payment due within 30 days.',
  invoice_footer: 'Thank you for your business!'
};

async function checkConstraints() {
  console.log('\n🔍 CHECKING DATABASE CONSTRAINTS\n');
  console.log('='.repeat(80));

  console.log('⚠️  Will test with actual data to discover constraints');

  console.log('\n' + '='.repeat(80) + '\n');
}

async function testSettingsSave() {
  console.log('\n🧪 AUTOMATED SETTINGS SAVE TEST\n');
  console.log('='.repeat(80));

  const results = {
    settingsTest: { passed: false, error: null },
    companyTest: { passed: false, error: null },
    issues: []
  };

  // Get first company ID for testing
  const { data: companies, error: companyError } = await supabase
    .from('companies')
    .select('id, tax_id')
    .limit(1);

  if (companyError || !companies || companies.length === 0) {
    console.error('❌ Cannot run test - no companies found');
    return results;
  }

  const companyId = companies[0].id;
  console.log(`\n📋 Testing with company ID: ${companyId}`);
  console.log(`   Current tax_id: ${companies[0].tax_id || 'NULL'}\n`);

  // TEST 1: Settings table PATCH
  console.log('🔧 TEST 1: PATCH /settings');
  console.log('Data being sent:', JSON.stringify(testSettingsData, null, 2));
  
  try {
    const { data: existingSettings, error: checkError } = await supabase
      .from('settings')
      .select('id')
      .eq('company_id', companyId)
      .limit(1);

    if (checkError) throw checkError;

    let settingsResult;
    if (existingSettings && existingSettings.length > 0) {
      // UPDATE
      settingsResult = await supabase
        .from('settings')
        .update(testSettingsData)
        .eq('id', existingSettings[0].id)
        .select();
    } else {
      // INSERT
      settingsResult = await supabase
        .from('settings')
        .insert({ ...testSettingsData, company_id: companyId })
        .select();
    }

    if (settingsResult.error) {
      console.error('❌ SETTINGS SAVE FAILED');
      console.error('Error:', JSON.stringify(settingsResult.error, null, 2));
      results.settingsTest.error = settingsResult.error;
      results.issues.push({
        table: 'settings',
        operation: existingSettings?.length > 0 ? 'UPDATE' : 'INSERT',
        error: settingsResult.error,
        data: testSettingsData
      });
    } else {
      console.log('✅ SETTINGS SAVE SUCCEEDED');
      results.settingsTest.passed = true;
    }
  } catch (error) {
    console.error('❌ SETTINGS TEST EXCEPTION:', error);
    results.settingsTest.error = error;
    results.issues.push({
      table: 'settings',
      operation: 'TEST',
      error: error.message,
      data: testSettingsData
    });
  }

  console.log('\n' + '-'.repeat(80) + '\n');

  // TEST 2: Companies table PATCH
  console.log('🔧 TEST 2: PATCH /companies');
  console.log('Data being sent:', JSON.stringify(testCompanyData, null, 2));

  try {
    const { data: companyResult, error: companyUpdateError } = await supabase
      .from('companies')
      .update(testCompanyData)
      .eq('id', companyId)
      .select();

    if (companyUpdateError) {
      console.error('❌ COMPANY SAVE FAILED');
      console.error('Error:', JSON.stringify(companyUpdateError, null, 2));
      results.companyTest.error = companyUpdateError;
      results.issues.push({
        table: 'companies',
        operation: 'UPDATE',
        error: companyUpdateError,
        data: testCompanyData
      });
    } else {
      console.log('✅ COMPANY SAVE SUCCEEDED');
      results.companyTest.passed = true;
    }
  } catch (error) {
    console.error('❌ COMPANY TEST EXCEPTION:', error);
    results.companyTest.error = error;
    results.issues.push({
      table: 'companies',
      operation: 'TEST',
      error: error.message,
      data: testCompanyData
    });
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n📊 TEST RESULTS:\n');
  console.log(`Settings save: ${results.settingsTest.passed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Company save: ${results.companyTest.passed ? '✅ PASSED' : '❌ FAILED'}`);

  if (results.issues.length > 0) {
    console.log('\n🔍 ISSUES FOUND:\n');
    results.issues.forEach((issue, index) => {
      console.log(`\nIssue ${index + 1}:`);
      console.log(`  Table: ${issue.table}`);
      console.log(`  Operation: ${issue.operation}`);
      console.log(`  Error:`, issue.error);
      
      // Analyze error
      const errorMsg = issue.error.message || JSON.stringify(issue.error);
      const msg = errorMsg.toLowerCase();
      
      if (msg.includes('column') && msg.includes('does not exist')) {
        const match = errorMsg.match(/column "([^"]+)"/);
        if (match) {
          console.log(`  ⚠️  DIAGNOSIS: Column "${match[1]}" does not exist in ${issue.table} table`);
          console.log(`  💡 FIX: Remove "${match[1]}" from the data being sent to ${issue.table}`);
        }
      } else if (msg.includes('constraint')) {
        console.log(`  ⚠️  DIAGNOSIS: Database constraint violation`);
        
        // Check for specific constraint types
        if (msg.includes('check constraint')) {
          const constraintMatch = errorMsg.match(/check constraint "([^"]+)"/);
          if (constraintMatch) {
            console.log(`  📋 Constraint name: ${constraintMatch[1]}`);
            
            // Specific constraint analysis
            if (constraintMatch[1].includes('tax_id')) {
              console.log(`  💡 FIX: tax_id constraint failed - check format requirements`);
              console.log(`     - Current value: "${issue.data.tax_id}"`);
              console.log(`     - Try: Remove tax_id from update OR use correct format`);
            }
          }
        } else if (msg.includes('foreign key')) {
          console.log(`  💡 FIX: Foreign key constraint - referenced record doesn't exist`);
        } else if (msg.includes('unique')) {
          console.log(`  💡 FIX: Unique constraint - value already exists`);
        }
      } else if (msg.includes('null value')) {
        console.log(`  ⚠️  DIAGNOSIS: Required field is null`);
        console.log(`  💡 FIX: Ensure all required fields have values`);
      }
      
      console.log(`  📦 Data sent:`, JSON.stringify(issue.data, null, 2));
    });
  }

  console.log('\n' + '='.repeat(80));

  return results;
}

// Run the test
(async () => {
  await checkConstraints();
  const results = await testSettingsSave();
  const allPassed = results.settingsTest.passed && results.companyTest.passed;
  console.log(`\n${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}\n`);
  process.exit(allPassed ? 0 : 1);
})().catch(error => {
  console.error('\n❌ TEST SUITE FAILED:', error);
  process.exit(1);
});

