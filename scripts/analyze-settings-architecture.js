const fs = require('fs');
const path = require('path');

console.log('\n🔍 DEEP ARCHITECTURE ANALYSIS - ALL SETTINGS TABS\n');
console.log('='.repeat(100));

const tabs = [
  { id: 'company', name: 'Company Profile', file: 'src/components/CompanyProfileSettingsTab.js' },
  { id: 'business', name: 'Business Settings', file: 'src/components/BusinessSettingsTab.js' },
  { id: 'service-tags', name: 'Service Tags', file: 'src/pages/Settings/ServiceTags.js' },
  { id: 'rate-cards', name: 'Rate Cards', file: 'src/pages/Settings/RateCards.js' },
  { id: 'rates', name: 'Rates & Pricing', file: 'src/components/RatesPricingTab.js' },
  { id: 'scheduling', name: 'Smart Scheduling', file: 'src/components/SchedulingSettingsTab.js' },
  { id: 'marketplace', name: 'Marketplace Settings', file: 'src/components/Settings/MarketplaceSettings.js' },
  { id: 'quote-acceptance', name: 'Quote Acceptance', file: 'src/components/Settings/QuoteAcceptanceSettingsTab.js' },
  { id: 'invoicing', name: 'Invoicing', file: 'src/components/InvoicingSettingsTab.js' },
  { id: 'documents', name: 'Document Templates', file: 'src/components/DocumentTemplatesTab.js' },
  { id: 'approvals', name: 'Org & Approvals', file: 'src/components/Settings/ApprovalsSettingsTab.js' },
  { id: 'module-permissions', name: 'Module Permissions', file: 'src/components/Settings/ModulePermissionsTab.js' },
  { id: 'appearance', name: 'Appearance', file: 'src/components/AppearanceSettingsTab.js' },
  { id: 'notifications', name: 'Notifications', file: 'src/components/NotificationsSettingsTab.js' },
  { id: 'security', name: 'Security', file: 'src/components/SecuritySettingsTab.js' }
];

const issues = [];

tabs.forEach(tab => {
  console.log(`\n${'─'.repeat(100)}`);
  console.log(`📋 ${tab.name}`);
  
  const filePath = path.join(__dirname, '..', tab.file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`   ❌ FILE NOT FOUND: ${tab.file}`);
    issues.push({ tab: tab.name, issue: 'FILE_NOT_FOUND', severity: 'CRITICAL' });
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Analyze save mechanism
  const hasSaveFunction = /const (save\w+|handle\w*Save\w*) = async/.test(content);
  const hasAutoSave = content.includes('setTimeout') && /save/.test(content);
  const usesSupaFetch = content.includes('supaFetch');
  const usesSettingsService = /settingsService|SettingsService/.test(content);
  const usesSupabaseClient = content.includes('supabase.from');
  
  console.log(`   💾 Save mechanism:`);
  if (hasSaveFunction) {
    const matches = content.match(/const (save\w+|handle\w*Save\w*) = async/g);
    console.log(`      ✅ Has save function: ${matches.join(', ')}`);
  } else {
    console.log(`      ❌ NO SAVE FUNCTION`);
    issues.push({ tab: tab.name, issue: 'NO_SAVE_FUNCTION', severity: 'CRITICAL' });
  }
  
  if (hasAutoSave) {
    console.log(`      ⏱️  Has auto-save`);
  }
  
  console.log(`\n   🌐 API method:`);
  if (usesSupaFetch) {
    console.log(`      ✅ Uses supaFetch`);
  }
  if (usesSettingsService) {
    console.log(`      ✅ Uses SettingsService`);
  }
  if (usesSupabaseClient) {
    console.log(`      ✅ Uses supabase.from()`);
  }
  if (!usesSupaFetch && !usesSettingsService && !usesSupabaseClient) {
    console.log(`      ❌ NO API METHOD FOUND`);
    issues.push({ tab: tab.name, issue: 'NO_API_METHOD', severity: 'CRITICAL' });
  }
  
  // Check for empty string sanitization
  const hasSanitization = content.includes('sanitize') || /if.*===\s*['"]['"]/.test(content);
  console.log(`\n   🧹 Data sanitization:`);
  if (hasSanitization) {
    console.log(`      ✅ Has sanitization logic`);
  } else {
    console.log(`      ⚠️  NO SANITIZATION (may fail on empty strings)`);
    issues.push({ tab: tab.name, issue: 'NO_SANITIZATION', severity: 'WARNING' });
  }
  
  // Check for phone formatting
  const hasPhoneFormatting = /E\.164|formatPhone|\+1/.test(content);
  if (content.includes('phone') && !hasPhoneFormatting) {
    console.log(`      ⚠️  Has phone field but NO E.164 formatting`);
    issues.push({ tab: tab.name, issue: 'NO_PHONE_FORMATTING', severity: 'WARNING' });
  }
  
  // Check for error handling
  const hasErrorHandling = content.includes('try') && content.includes('catch');
  console.log(`\n   🛡️  Error handling:`);
  if (hasErrorHandling) {
    console.log(`      ✅ Has try/catch`);
  } else {
    console.log(`      ❌ NO ERROR HANDLING`);
    issues.push({ tab: tab.name, issue: 'NO_ERROR_HANDLING', severity: 'HIGH' });
  }
  
  // Check for loading state
  const hasLoadingState = /useState.*loading|setLoading/.test(content);
  console.log(`\n   ⏳ Loading state:`);
  if (hasLoadingState) {
    console.log(`      ✅ Has loading state`);
  } else {
    console.log(`      ⚠️  NO LOADING STATE`);
    issues.push({ tab: tab.name, issue: 'NO_LOADING_STATE', severity: 'LOW' });
  }
  
  // Check for success/error messages
  const hasAlerts = /alert|message|toast|notification/.test(content);
  console.log(`\n   💬 User feedback:`);
  if (hasAlerts) {
    console.log(`      ✅ Has user feedback`);
  } else {
    console.log(`      ⚠️  NO USER FEEDBACK`);
    issues.push({ tab: tab.name, issue: 'NO_USER_FEEDBACK', severity: 'MEDIUM' });
  }
});

console.log(`\n${'='.repeat(100)}`);
console.log('\n📊 ISSUES SUMMARY\n');

const critical = issues.filter(i => i.severity === 'CRITICAL');
const high = issues.filter(i => i.severity === 'HIGH');
const warnings = issues.filter(i => i.severity === 'WARNING' || i.severity === 'MEDIUM' || i.severity === 'LOW');

console.log(`🔴 CRITICAL: ${critical.length}`);
console.log(`🟠 HIGH: ${high.length}`);
console.log(`🟡 WARNINGS: ${warnings.length}`);
console.log(`📋 TOTAL: ${issues.length}`);

if (critical.length > 0) {
  console.log('\n🔴 CRITICAL ISSUES:\n');
  critical.forEach(i => {
    console.log(`   ${i.tab}: ${i.issue}`);
  });
}

if (high.length > 0) {
  console.log('\n🟠 HIGH PRIORITY:\n');
  high.forEach(i => {
    console.log(`   ${i.tab}: ${i.issue}`);
  });
}

// Save results
const outputPath = path.join(__dirname, 'settings-architecture-analysis.json');
fs.writeFileSync(outputPath, JSON.stringify(issues, null, 2));
console.log(`\n💾 Full analysis saved to: ${outputPath}`);

console.log('\n' + '='.repeat(100) + '\n');

if (critical.length > 0) {
  console.log('❌ CRITICAL ISSUES FOUND - REQUIRES IMMEDIATE ATTENTION\n');
  process.exit(1);
} else {
  console.log('✅ NO CRITICAL ISSUES - WARNINGS MAY NEED ATTENTION\n');
  process.exit(0);
}

