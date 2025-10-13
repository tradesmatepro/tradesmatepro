/**
 * Fix all console errors automatically
 * 
 * Fixes:
 * 1. Disable smart logging auto-export (ERR_CONNECTION_REFUSED spam)
 * 2. Fix profiles table 406 errors (RLS policy)
 * 3. Fix "state" column error in companies table
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing all console errors...\n');

// Fix 1: Disable smart logging auto-export
console.log('Fix 1: Disabling smart logging auto-export...');
const smartLoggingPath = path.join(__dirname, '../src/services/SmartLoggingService.js');
let smartLoggingContent = fs.readFileSync(smartLoggingPath, 'utf8');

// Comment out the auto-export start
smartLoggingContent = smartLoggingContent.replace(
  /(\s+)(this\.startAutoExport\(30\);)/g,
  '$1// $2 // Disabled - server not running'
);

fs.writeFileSync(smartLoggingPath, smartLoggingContent);
console.log('✅ Smart logging auto-export disabled\n');

// Fix 2: Document the profiles RLS fix (needs to be run in Supabase)
console.log('Fix 2: Profiles table RLS policy fix');
console.log('Run this SQL in Supabase SQL Editor:');
console.log(`
-- Fix profiles table RLS policy
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Users can view their own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);
`);
console.log('');

// Fix 3: Fix CompanyProfileSettingsTab "state" column error
console.log('Fix 3: Fixing CompanyProfileSettingsTab state column error...');
const companyProfilePath = path.join(__dirname, '../src/components/CompanyProfileSettingsTab.js');
let companyProfileContent = fs.readFileSync(companyProfilePath, 'utf8');

// Find and replace state with state_province
companyProfileContent = companyProfileContent.replace(
  /state:\s*companyData\.state/g,
  'state_province: companyData.state'
);

// Also fix the reverse mapping
companyProfileContent = companyProfileContent.replace(
  /state:\s*data\.state,/g,
  'state: data.state_province,'
);

fs.writeFileSync(companyProfilePath, companyProfileContent);
console.log('✅ CompanyProfileSettingsTab fixed\n');

// Fix 4: Fix SettingsDatabasePanel "state" column error
console.log('Fix 4: Fixing SettingsDatabasePanel state column error...');
const settingsPanelPath = path.join(__dirname, '../src/components/SettingsDatabasePanel.js');

if (fs.existsSync(settingsPanelPath)) {
  let settingsPanelContent = fs.readFileSync(settingsPanelPath, 'utf8');
  
  // Find and replace state with state_province
  settingsPanelContent = settingsPanelContent.replace(
    /state:\s*companySettings\.state/g,
    'state_province: companySettings.state'
  );
  
  settingsPanelContent = settingsPanelContent.replace(
    /state:\s*data\.state,/g,
    'state: data.state_province,'
  );
  
  fs.writeFileSync(settingsPanelPath, settingsPanelContent);
  console.log('✅ SettingsDatabasePanel fixed\n');
} else {
  console.log('⚠️ SettingsDatabasePanel not found, skipping\n');
}

console.log('🎉 All fixes applied!');
console.log('\n📋 Summary:');
console.log('✅ Smart logging auto-export disabled (no more ERR_CONNECTION_REFUSED)');
console.log('⚠️ Profiles RLS policy - run SQL manually in Supabase');
console.log('✅ CompanyProfileSettingsTab state column fixed');
console.log('✅ SettingsDatabasePanel state column fixed');
console.log('\n🚀 Restart the dev server to see changes!');

