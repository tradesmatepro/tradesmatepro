const fs = require('fs');
const path = require('path');

console.log('\n🔧 AUTO-FIX ALL SETTINGS TABS\n');
console.log('='.repeat(100));

const sanitizationFunction = `
// Sanitize data to convert empty strings to null (database constraint requirement)
const sanitizeData = (data) => {
  const sanitized = { ...data };
  Object.keys(sanitized).forEach(key => {
    if (sanitized[key] === '') {
      sanitized[key] = null;
    }
  });
  return sanitized;
};
`.trim();

const phoneFormattingFunction = `
// Format phone to E.164 format (+15551234567)
const formatPhoneE164 = (phone) => {
  if (!phone) return null;
  const digits = phone.replace(/\\D/g, '');
  if (digits.length === 10) return \`+1\${digits}\`;
  if (digits.length === 11 && digits[0] === '1') return \`+\${digits}\`;
  return phone; // Return as-is if already formatted or invalid
};
`.trim();

const tabs = [
  { file: 'src/components/BusinessSettingsTab.js', needsPhone: true, needsSanitization: true },
  { file: 'src/pages/Settings/ServiceTags.js', needsPhone: false, needsSanitization: true },
  { file: 'src/components/RatesPricingTab.js', needsPhone: false, needsSanitization: true },
  { file: 'src/components/SchedulingSettingsTab.js', needsPhone: false, needsSanitization: true },
  { file: 'src/components/Settings/MarketplaceSettings.js', needsPhone: false, needsSanitization: true },
  { file: 'src/components/Settings/QuoteAcceptanceSettingsTab.js', needsPhone: false, needsSanitization: true },
  { file: 'src/components/InvoicingSettingsTab.js', needsPhone: false, needsSanitization: true },
  { file: 'src/components/DocumentTemplatesTab.js', needsPhone: false, needsSanitization: true },
  { file: 'src/components/Settings/ModulePermissionsTab.js', needsPhone: false, needsSanitization: true },
  { file: 'src/components/NotificationsSettingsTab.js', needsPhone: false, needsSanitization: true },
  { file: 'src/components/SecuritySettingsTab.js', needsPhone: false, needsSanitization: true }
];

const fixes = [];

tabs.forEach(tab => {
  console.log(`\n${'─'.repeat(100)}`);
  console.log(`📋 Processing: ${tab.file}`);
  
  const filePath = path.join(__dirname, '..', tab.file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`   ❌ FILE NOT FOUND`);
    fixes.push({ file: tab.file, status: 'FILE_NOT_FOUND' });
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Check if already has sanitization
  if (content.includes('sanitizeData') || content.includes('sanitize')) {
    console.log(`   ✅ Already has sanitization`);
  } else if (tab.needsSanitization) {
    console.log(`   🔧 Adding sanitization function...`);
    
    // Find a good place to insert (after imports, before component)
    const componentMatch = content.match(/(export default function|const \w+ = \(\) =>|function \w+\()/);
    if (componentMatch) {
      const insertIndex = componentMatch.index;
      content = content.slice(0, insertIndex) + sanitizationFunction + '\n\n' + content.slice(insertIndex);
      modified = true;
      console.log(`   ✅ Added sanitization function`);
    } else {
      console.log(`   ⚠️  Could not find insertion point`);
    }
  }
  
  // Check if needs phone formatting
  if (tab.needsPhone && !content.includes('formatPhoneE164')) {
    console.log(`   🔧 Adding phone formatting function...`);
    
    const componentMatch = content.match(/(export default function|const \w+ = \(\) =>|function \w+\()/);
    if (componentMatch) {
      const insertIndex = componentMatch.index;
      content = content.slice(0, insertIndex) + phoneFormattingFunction + '\n\n' + content.slice(insertIndex);
      modified = true;
      console.log(`   ✅ Added phone formatting function`);
    }
  }
  
  // Find save functions and wrap data with sanitization
  const saveFunctionPatterns = [
    /const (save\w+) = async \(\) => \{/g,
    /const (handle\w*Save\w*) = async \(\) => \{/g
  ];
  
  saveFunctionPatterns.forEach(pattern => {
    const matches = [...content.matchAll(pattern)];
    matches.forEach(match => {
      const funcName = match[1];
      console.log(`   🔍 Found save function: ${funcName}`);
      
      // Look for PATCH/POST calls in this function
      const funcStart = match.index;
      const funcEnd = content.indexOf('};', funcStart) + 2;
      const funcBody = content.slice(funcStart, funcEnd);
      
      if (funcBody.includes('supaFetch') && funcBody.includes('PATCH')) {
        console.log(`      💡 Has PATCH call - should wrap data with sanitizeData()`);
        // Note: Actual wrapping would require more sophisticated parsing
        // For now, just flag it
      }
    });
  });
  
  if (modified) {
    // Backup original
    const backupPath = filePath + '.backup';
    fs.writeFileSync(backupPath, fs.readFileSync(filePath));
    
    // Write modified content
    fs.writeFileSync(filePath, content);
    console.log(`   ✅ File updated (backup saved to ${path.basename(backupPath)})`);
    fixes.push({ file: tab.file, status: 'MODIFIED' });
  } else {
    console.log(`   ℹ️  No changes needed`);
    fixes.push({ file: tab.file, status: 'NO_CHANGES' });
  }
});

console.log(`\n${'='.repeat(100)}`);
console.log('\n📊 SUMMARY\n');

const modified = fixes.filter(f => f.status === 'MODIFIED');
const noChanges = fixes.filter(f => f.status === 'NO_CHANGES');
const notFound = fixes.filter(f => f.status === 'FILE_NOT_FOUND');

console.log(`Total files processed: ${fixes.length}`);
console.log(`✅ Modified: ${modified.length}`);
console.log(`ℹ️  No changes: ${noChanges.length}`);
console.log(`❌ Not found: ${notFound.length}`);

if (modified.length > 0) {
  console.log('\n✅ MODIFIED FILES:\n');
  modified.forEach(f => {
    console.log(`   ${f.file}`);
  });
}

console.log('\n💡 NEXT STEPS:\n');
console.log('   1. Review the changes in each file');
console.log('   2. Manually wrap PATCH/POST data with sanitizeData()');
console.log('   3. For phone fields, wrap with formatPhoneE164()');
console.log('   4. Test each tab saves correctly');
console.log('   5. Delete .backup files once verified');

console.log('\n' + '='.repeat(100) + '\n');

