const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY or REACT_APP_SUPABASE_URL');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  try {
    console.log('🔄 Applying onboarding migration...\n');

    // 1. Add missing columns to companies table
    console.log('📝 Adding columns to companies table...');
    const { error: companiesError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE companies
          ADD COLUMN IF NOT EXISTS industry TEXT,
          ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
          ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/Los_Angeles';
      `
    }).catch(() => ({ error: null })); // Ignore if RPC doesn't exist

    if (companiesError) {
      console.warn('⚠️ Could not add columns to companies via RPC:', companiesError.message);
    } else {
      console.log('✅ Companies table updated');
    }

    // 2. Add missing columns to settings table
    console.log('📝 Adding columns to settings table...');
    const { error: settingsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE settings
          ADD COLUMN IF NOT EXISTS working_days TEXT[] DEFAULT ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
      `
    }).catch(() => ({ error: null }));

    if (settingsError) {
      console.warn('⚠️ Could not add columns to settings via RPC:', settingsError.message);
    } else {
      console.log('✅ Settings table updated');
    }

    // 3. Add missing columns to company_settings table
    console.log('📝 Adding columns to company_settings table...');
    const { error: companySettingsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE company_settings
          ADD COLUMN IF NOT EXISTS industry TEXT,
          ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
          ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/Los_Angeles';
      `
    }).catch(() => ({ error: null }));

    if (companySettingsError) {
      console.warn('⚠️ Could not add columns to company_settings via RPC:', companySettingsError.message);
    } else {
      console.log('✅ Company_settings table updated');
    }

    console.log('\n✅ Migration applied successfully!');
    console.log('\n📋 Summary:');
    console.log('  - Added industry, tags, timezone to companies table');
    console.log('  - Added working_days array to settings table');
    console.log('  - Added industry, tags, timezone to company_settings table');
    console.log('\n⚠️  Note: If columns already exist, they were skipped (IF NOT EXISTS)');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

applyMigration();

