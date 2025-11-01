const fs = require('fs');
const path = require('path');

console.log('\n🔍 FRONTEND vs BACKEND MISMATCH CHECK\n');
console.log('='.repeat(80));

// Read the SettingsDatabasePanel.js file
const settingsPanelPath = path.join(__dirname, '..', 'src', 'components', 'SettingsDatabasePanel.js');
const content = fs.readFileSync(settingsPanelPath, 'utf8');

console.log('\n📋 CHECKING SettingsDatabasePanel.js\n');

// Extract what fields are being sent to companies table
const companyDataMatch = content.match(/const companyData = sanitizeCompanyData\(\{([^}]+)\}\);/s);
if (companyDataMatch) {
  console.log('✅ Found companyData object (sanitized)');
  const fields = companyDataMatch[1].match(/(\w+):/g);
  if (fields) {
    console.log('\n📤 Fields being sent to COMPANIES table:');
    fields.forEach(field => {
      console.log(`   - ${field.replace(':', '')}`);
    });
  }
} else {
  console.log('❌ Could not find companyData object');
}

// Extract what fields are being sent to settings table
const settingsDataMatch = content.match(/const settingsData = \{([^}]+)\};/s);
if (settingsDataMatch) {
  console.log('\n✅ Found settingsData object');
  const fields = settingsDataMatch[1].match(/(\w+):/g);
  if (fields) {
    console.log('\n📤 Fields being sent to SETTINGS table:');
    fields.forEach(field => {
      console.log(`   - ${field.replace(':', '')}`);
    });
  }
} else {
  console.log('❌ Could not find settingsData object');
}

// Check if sanitizeCompanyData exists
if (content.includes('sanitizeCompanyData')) {
  console.log('\n✅ sanitizeCompanyData function EXISTS');
  
  // Check what it does
  if (content.includes('if (sanitized[key] === \'\')')) {
    console.log('   ✅ Converts empty strings to null');
  }
  if (content.includes('E.164')) {
    console.log('   ✅ Formats phone to E.164');
  }
  if (content.includes('email')) {
    console.log('   ✅ Validates email format');
  }
} else {
  console.log('\n❌ sanitizeCompanyData function MISSING');
}

// Check if saveSettings function exists
if (content.includes('const saveSettings = async')) {
  console.log('\n✅ saveSettings function EXISTS');
} else {
  console.log('\n❌ saveSettings function MISSING');
}

// Check if it's exported
if (content.includes('saveSettings,')) {
  console.log('✅ saveSettings is EXPORTED');
} else {
  console.log('❌ saveSettings is NOT EXPORTED');
}

console.log('\n' + '='.repeat(80));

// Now check Settings.js to see if it's being called
const settingsPagePath = path.join(__dirname, '..', 'src', 'pages', 'Settings.js');
const settingsPageContent = fs.readFileSync(settingsPagePath, 'utf8');

console.log('\n📋 CHECKING Settings.js (the page)\n');

if (settingsPageContent.includes('SettingsDatabasePanel()')) {
  console.log('✅ SettingsDatabasePanel hook is CALLED');
} else {
  console.log('❌ SettingsDatabasePanel hook is NOT CALLED');
}

if (settingsPageContent.includes('saveSettings')) {
  console.log('✅ saveSettings is USED');
  
  // Find the button
  const buttonMatch = settingsPageContent.match(/onClick={saveSettings}/);
  if (buttonMatch) {
    console.log('✅ Save button onClick={saveSettings} EXISTS');
  } else {
    console.log('❌ Save button onClick={saveSettings} NOT FOUND');
  }
} else {
  console.log('❌ saveSettings is NOT USED');
}

console.log('\n' + '='.repeat(80));
console.log('\n💡 DIAGNOSIS:\n');

const issues = [];

if (!companyDataMatch) {
  issues.push('❌ companyData object not found or not sanitized');
}

if (!content.includes('sanitizeCompanyData')) {
  issues.push('❌ sanitizeCompanyData function missing');
}

if (!content.includes('const saveSettings = async')) {
  issues.push('❌ saveSettings function missing');
}

if (!settingsPageContent.includes('onClick={saveSettings}')) {
  issues.push('❌ Save button not wired to saveSettings');
}

if (issues.length === 0) {
  console.log('✅ Frontend code looks correct!');
  console.log('\n🔍 Next steps:');
  console.log('   1. Open browser DevTools (F12)');
  console.log('   2. Go to Console tab');
  console.log('   3. Click Save button');
  console.log('   4. Look for these logs:');
  console.log('      - "🔧 Starting settings save..."');
  console.log('      - "📝 Updating company with ID:"');
  console.log('      - Network requests to /companies and /settings');
  console.log('\n   5. If no logs appear, the button is not calling saveSettings');
  console.log('   6. If logs appear but no network requests, check supaFetch');
  console.log('   7. If network requests fail, check the error in copyable modal');
} else {
  console.log('❌ Issues found:');
  issues.forEach(issue => console.log(`   ${issue}`));
}

console.log('\n' + '='.repeat(80) + '\n');

