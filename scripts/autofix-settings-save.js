const fs = require('fs');
const path = require('path');

console.log('\n🔧 AUTOFIX: Settings Save Issues\n');
console.log('='.repeat(80));

const fixes = [];

// FIX 1: Phone number format in SettingsDatabasePanel.js
console.log('\n📋 FIX 1: Phone number format validation');
console.log('Issue: Phone must be in E.164 format (+15551234567)');
console.log('File: src/components/SettingsDatabasePanel.js');

const settingsPanelPath = path.join(__dirname, '..', 'src', 'components', 'SettingsDatabasePanel.js');
let settingsPanelContent = fs.readFileSync(settingsPanelPath, 'utf8');

// Add phone formatting function
const phoneFormatterFunction = `
// Format phone to E.164 format (+15551234567)
const formatPhoneE164 = (phone) => {
  if (!phone) return null;
  // Remove all non-digit characters
  const digits = phone.replace(/\\D/g, '');
  // If it starts with 1 and has 11 digits, add +
  if (digits.length === 11 && digits.startsWith('1')) {
    return '+' + digits;
  }
  // If it has 10 digits, assume US and add +1
  if (digits.length === 10) {
    return '+1' + digits;
  }
  // If it already starts with +, return as is
  if (phone.startsWith('+')) {
    return '+' + digits;
  }
  // Otherwise return null (invalid)
  return null;
};
`;

// Check if function already exists
if (!settingsPanelContent.includes('formatPhoneE164')) {
  // Add function before saveSettings
  settingsPanelContent = settingsPanelContent.replace(
    /const saveSettings = async \(\) => {/,
    phoneFormatterFunction + '\n  const saveSettings = async () => {'
  );
  
  // Update phone field in companyData
  settingsPanelContent = settingsPanelContent.replace(
    /phone: companySettings\.companyPhone \|\| '',/,
    `phone: formatPhoneE164(companySettings.companyPhone),`
  );
  
  fs.writeFileSync(settingsPanelPath, settingsPanelContent, 'utf8');
  console.log('✅ Added phone formatter to SettingsDatabasePanel.js');
  fixes.push('Added E.164 phone formatter to SettingsDatabasePanel.js');
} else {
  console.log('⏭️  Phone formatter already exists');
}

// FIX 2: Phone number format in CompanyProfileSettingsTab.js
console.log('\n📋 FIX 2: Phone number format in Company Profile');
console.log('File: src/components/CompanyProfileSettingsTab.js');

const companyProfilePath = path.join(__dirname, '..', 'src', 'components', 'CompanyProfileSettingsTab.js');
if (fs.existsSync(companyProfilePath)) {
  let companyProfileContent = fs.readFileSync(companyProfilePath, 'utf8');
  
  if (!companyProfileContent.includes('formatPhoneE164')) {
    // Add function
    companyProfileContent = companyProfileContent.replace(
      /const saveCompanyData = async \(\) => {/,
      phoneFormatterFunction + '\n  const saveCompanyData = async () => {'
    );
    
    // Update phone field
    companyProfileContent = companyProfileContent.replace(
      /phone: updatedData\.phone_number \|\| updatedData\.phone,/,
      `phone: formatPhoneE164(updatedData.phone_number || updatedData.phone),`
    );
    
    fs.writeFileSync(companyProfilePath, companyProfileContent, 'utf8');
    console.log('✅ Added phone formatter to CompanyProfileSettingsTab.js');
    fixes.push('Added E.164 phone formatter to CompanyProfileSettingsTab.js');
  } else {
    console.log('⏭️  Phone formatter already exists');
  }
}

// FIX 3: Tax ID format (if needed)
console.log('\n📋 FIX 3: Tax ID format validation');
console.log('Note: Tax ID should be XX-XXXXXXX format or encrypted');

// Check if tax_id has constraints
console.log('⚠️  Tax ID constraints need to be checked separately');
console.log('   Run: node scripts/test-settings-save.js to verify');

console.log('\n' + '='.repeat(80));
console.log('\n📊 AUTOFIX SUMMARY:\n');

if (fixes.length > 0) {
  console.log('✅ Applied fixes:');
  fixes.forEach((fix, index) => {
    console.log(`   ${index + 1}. ${fix}`);
  });
  console.log('\n💡 Next steps:');
  console.log('   1. Hard refresh browser (Ctrl+Shift+R)');
  console.log('   2. Try saving settings again');
  console.log('   3. Run: node scripts/test-settings-save.js to verify');
} else {
  console.log('⏭️  No fixes needed - all formatters already in place');
  console.log('\n💡 If still getting errors:');
  console.log('   1. Check the copyable error modal for exact error message');
  console.log('   2. Run: node scripts/test-settings-save.js to test');
  console.log('   3. Run: node scripts/get-constraints.js to discover constraints');
}

console.log('\n' + '='.repeat(80) + '\n');

