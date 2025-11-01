const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_SERVICE_KEY or SUPABASE_URL');
  console.error('   SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_KEY:', supabaseServiceKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAndFixSchema() {
  try {
    console.log('🔍 Checking current schema...\n');

    // Check companies table
    console.log('📊 Checking companies table...');
    const { data: companiesData, error: companiesCheckError } = await supabase
      .from('companies')
      .select('*')
      .limit(1);

    if (companiesCheckError) {
      console.error('❌ Error checking companies table:', companiesCheckError);
    } else {
      console.log('✅ Companies table accessible');
    }

    // Check settings table
    console.log('📊 Checking settings table...');
    const { data: settingsData, error: settingsCheckError } = await supabase
      .from('settings')
      .select('*')
      .limit(1);

    if (settingsCheckError) {
      console.error('❌ Error checking settings table:', settingsCheckError);
    } else {
      console.log('✅ Settings table accessible');
      if (settingsData && settingsData.length > 0) {
        const sample = settingsData[0];
        console.log('   - Has working_days:', 'working_days' in sample);
        console.log('   - working_days type:', typeof sample.working_days);
      }
    }

    // Check company_settings table
    console.log('📊 Checking company_settings table...');
    const { data: companySettingsData, error: companySettingsCheckError } = await supabase
      .from('company_settings')
      .select('*')
      .limit(1);

    if (companySettingsCheckError) {
      console.error('❌ Error checking company_settings table:', companySettingsCheckError);
    } else {
      console.log('✅ Company_settings table accessible');
      if (companySettingsData && companySettingsData.length > 0) {
        const sample = companySettingsData[0];
        console.log('   - Has working_days:', 'working_days' in sample);
        console.log('   - Has industry:', 'industry' in sample);
        console.log('   - Has tags:', 'tags' in sample);
      }
    }

    console.log('\n✅ Schema check complete');
    console.log('\n📝 To apply the migration, run the SQL in migrations/2025-10-27_add_missing_onboarding_columns.sql');
    console.log('   in the Supabase SQL Editor at: https://app.supabase.com/project/[PROJECT_ID]/sql/new');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAndFixSchema();

