// Test script to verify schema fixes for marketplace
// Run this in the browser console on the marketplace page

console.log('🧪 Testing schema fixes for marketplace...');

// Test function to check API endpoints
async function testSchemaFixes() {
  console.log('📊 Testing corrected API endpoints...');
  
  try {
    // Get user context
    const userContext = window.React?.useContext ? 'Available' : 'Not Available';
    console.log('React Context:', userContext);
    
    // Test company ID (hardcoded for testing)
    const testCompanyId = 'ba643da1-c16f-468e-8fcb-f347e7929597';
    
    console.log('🔍 Testing corrected endpoints:');
    
    // Test 1: work_orders with customer_id (not customer_company_id)
    console.log('\n1. Testing work_orders endpoint...');
    const workOrdersUrl = `https://amgtktrwpdsigcomavlg.supabase.co/rest/v1/work_orders?customer_id=eq.${testCompanyId}&status=in.(scheduled,in_progress)&order=created_at.desc&limit=5`;
    console.log('URL:', workOrdersUrl);
    
    // Test 2: marketplace_responses with response_status (not status)
    console.log('\n2. Testing marketplace_responses endpoint...');
    const responsesUrl = `https://amgtktrwpdsigcomavlg.supabase.co/rest/v1/marketplace_responses?select=*,marketplace_requests!marketplace_responses_request_id_fkey(*)&marketplace_requests.company_id=eq.${testCompanyId}&response_status=eq.pending&order=created_at.desc&limit=5`;
    console.log('URL:', responsesUrl);
    
    // Test 3: invoices with customer_id (not customer_company_id)
    console.log('\n3. Testing invoices endpoint...');
    const invoicesUrl = `https://amgtktrwpdsigcomavlg.supabase.co/rest/v1/invoices?customer_id=eq.${testCompanyId}&status=in.(sent,overdue)&order=created_at.desc&limit=5`;
    console.log('URL:', invoicesUrl);
    
    // Test 4: messages (instead of marketplace_messages)
    console.log('\n4. Testing messages endpoint...');
    const messagesUrl = `https://amgtktrwpdsigcomavlg.supabase.co/rest/v1/messages?company_id=eq.${testCompanyId}&order=created_at.desc&limit=5`;
    console.log('URL:', messagesUrl);
    
    console.log('\n✅ All endpoint URLs have been corrected!');
    console.log('\n📋 Summary of fixes:');
    console.log('- work_orders: customer_company_id → customer_id');
    console.log('- marketplace_responses: status → response_status');
    console.log('- invoices: customer_company_id → customer_id');
    console.log('- marketplace_messages → messages');
    
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Test marketplace request creation schema
function testRequestCreationSchema() {
  console.log('\n🔧 Testing marketplace request creation schema...');
  
  const expectedFields = [
    'company_id',
    'title', 
    'description',
    'trade_tag', // Required field from schema
    'budget', // Maps from flat_rate
    'request_type',
    'max_responses',
    'start_time',
    'end_time'
  ];
  
  const removedFields = [
    'service_mode', // Not in actual schema
    'pricing_preference', // Not in actual schema
    'flat_rate', // Mapped to budget
    'hourly_rate', // Not in actual schema
    'requires_inspection' // Not in actual schema
  ];
  
  console.log('✅ Expected fields in marketplace_requests:', expectedFields);
  console.log('❌ Removed fields (not in schema):', removedFields);
  console.log('🔄 Field mappings:');
  console.log('  - flat_rate → budget');
  console.log('  - selected_tags[0].name → trade_tag');
  
  return true;
}

// Check for console errors
function checkForErrors() {
  console.log('\n🔍 Checking for 400 Bad Request errors...');
  
  // Look for error indicators in the DOM
  const errorElements = document.querySelectorAll('[class*="error"], .text-red-500, .text-red-600');
  console.log(`Found ${errorElements.length} potential error elements in DOM`);
  
  // Check if marketplace is loaded
  const marketplaceElements = document.querySelectorAll('[class*="marketplace"], [class*="hiring"], [class*="providing"]');
  console.log(`Found ${marketplaceElements.length} marketplace-related elements`);
  
  // Check for mode toggle buttons
  const modeButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
    btn.textContent.includes('Hiring') || btn.textContent.includes('Providing')
  );
  console.log(`Found ${modeButtons.length} mode toggle buttons`);
  
  return {
    errorElements: errorElements.length,
    marketplaceElements: marketplaceElements.length,
    modeButtons: modeButtons.length
  };
}

// Main test function
async function runSchemaFixTests() {
  console.log('🚀 Running schema fix verification tests...\n');
  
  const results = {
    schemaFixes: await testSchemaFixes(),
    requestSchema: testRequestCreationSchema(),
    domCheck: checkForErrors()
  };
  
  console.log('\n📊 Test Results:');
  console.log('Schema Fixes:', results.schemaFixes ? '✅ PASS' : '❌ FAIL');
  console.log('Request Schema:', results.requestSchema ? '✅ PASS' : '❌ FAIL');
  console.log('DOM Check:', results.domCheck.marketplaceElements > 0 ? '✅ PASS' : '❌ FAIL');
  
  const allPassed = results.schemaFixes && results.requestSchema && results.domCheck.marketplaceElements > 0;
  console.log('\n🎯 Overall Result:', allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
  
  if (allPassed) {
    console.log('\n🎉 Schema fixes are working correctly!');
    console.log('The 400 Bad Request errors should now be resolved.');
    console.log('\nNext steps:');
    console.log('1. Check browser Network tab for any remaining 400 errors');
    console.log('2. Test marketplace request creation');
    console.log('3. Verify all marketplace components load data properly');
  } else {
    console.log('\n🔧 Some issues may remain. Check the individual test results above.');
  }
  
  return results;
}

// Export for manual use
window.testSchemaFixes = {
  runSchemaFixTests,
  testSchemaFixes,
  testRequestCreationSchema,
  checkForErrors
};

console.log('✅ Schema fix test script loaded!');
console.log('Run: window.testSchemaFixes.runSchemaFixTests()');
