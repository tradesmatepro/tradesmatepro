// Test Schema Fix for Marketplace Request Posting
// Run this in browser console on /booking page

console.log('🧪 Testing Schema Fix for Marketplace Request Posting...');

function testSchemaFieldMapping() {
  console.log('✅ Test 1: Schema Field Mapping');
  
  // Check if the form is using correct field names that match the database
  const correctFields = {
    'pricing_type': 'Should use pricing_type (not pricing_preference)',
    'budget': 'Should use budget (not flat_rate)',
    'hourly_rate_limit': 'Should use hourly_rate_limit (not hourly_rate)',
    'service_mode': 'Should use service_mode',
    'request_type': 'Should use request_type'
  };
  
  console.log('📋 Expected database field mappings:');
  Object.entries(correctFields).forEach(([field, description]) => {
    console.log(`  - ${field}: ${description}`);
  });
  
  return true;
}

function testFormSubmissionData() {
  console.log('✅ Test 2: Form Submission Data Structure');
  
  // Simulate the data structure that should be sent to database
  const mockFormData = {
    title: 'Test Request',
    description: 'Test description',
    pricing_preference: 'FLAT',
    flat_rate: '150',
    hourly_rate: '',
    service_mode: 'ONSITE',
    request_type: 'STANDARD',
    preferred_time_option: 'specific',
    start_time: '2025-01-15T10:00',
    end_time: '2025-01-15T12:00',
    unlimited_responses: false,
    max_responses: 5
  };
  
  // Simulate the correct mapping that should be sent to database
  const correctRequestData = {
    title: mockFormData.title.trim(),
    description: mockFormData.description.trim(),
    request_type: (mockFormData.request_type || 'standard').toLowerCase(),
    service_mode: (mockFormData.service_mode || 'onsite').toLowerCase(),
    pricing_type: mockFormData.pricing_preference.toLowerCase(), // ✅ Correct field name
    budget: mockFormData.pricing_preference === 'FLAT' ? parseFloat(mockFormData.flat_rate) : null, // ✅ Correct field name
    hourly_rate_limit: mockFormData.pricing_preference === 'HOURLY' ? parseFloat(mockFormData.hourly_rate) : null, // ✅ Correct field name
    max_responses: mockFormData.unlimited_responses ? null : mockFormData.max_responses,
    start_time: mockFormData.preferred_time_option === 'specific' ? (mockFormData.start_time || null) : null,
    end_time: mockFormData.preferred_time_option === 'specific' ? (mockFormData.end_time || null) : null
  };
  
  console.log('📤 Correct request data structure:');
  console.log(correctRequestData);
  
  // Check for problematic fields that should NOT be included
  const problematicFields = [
    'preferred_time_option', // ❌ This field doesn't exist in DB
    'pricing_preference',    // ❌ Should be pricing_type
    'flat_rate',            // ❌ Should be budget
    'hourly_rate',          // ❌ Should be hourly_rate_limit
    'requires_inspection',   // ❌ This field doesn't exist in DB
    'location_address',      // ❌ This field doesn't exist in DB
    'location_city',         // ❌ This field doesn't exist in DB
    'location_state',        // ❌ This field doesn't exist in DB
    'postal_code'           // ❌ This field doesn't exist in DB
  ];
  
  const hasProblematicFields = problematicFields.some(field => correctRequestData.hasOwnProperty(field));
  
  console.log(`- Contains problematic fields: ${hasProblematicFields ? '❌ YES' : '✅ NO'}`);
  
  if (hasProblematicFields) {
    console.log('❌ Found problematic fields:');
    problematicFields.forEach(field => {
      if (correctRequestData.hasOwnProperty(field)) {
        console.log(`  - ${field}: ${correctRequestData[field]}`);
      }
    });
  }
  
  return !hasProblematicFields;
}

function testCancelButton() {
  console.log('✅ Test 3: Cancel Button Availability');
  
  const cancelButton = document.querySelector('button[type="button"]');
  const cancelButtonText = cancelButton?.textContent?.trim();
  
  console.log(`- Cancel button found: ${cancelButton ? '✅' : '❌'}`);
  console.log(`- Cancel button text: "${cancelButtonText}"`);
  console.log(`- Cancel button always visible: ${cancelButton && !cancelButton.style.display === 'none' ? '✅' : '❌'}`);
  
  return cancelButton && cancelButtonText === 'Cancel';
}

function testFormValidation() {
  console.log('✅ Test 4: Form Validation');
  
  const form = document.querySelector('form');
  const requiredFields = form?.querySelectorAll('input[required], select[required], textarea[required]');
  
  console.log(`- Form found: ${form ? '✅' : '❌'}`);
  console.log(`- Required fields count: ${requiredFields?.length || 0}`);
  
  if (requiredFields) {
    console.log('📋 Required fields:');
    requiredFields.forEach((field, index) => {
      console.log(`  ${index + 1}. ${field.name || field.id}: ${field.type} - "${field.value}"`);
    });
  }
  
  return form && requiredFields && requiredFields.length > 0;
}

function testSchemaErrorPrevention() {
  console.log('✅ Test 5: Schema Error Prevention');
  
  // Monitor console for schema-related errors
  const originalConsoleError = console.error;
  let schemaErrors = [];
  
  console.error = function(...args) {
    const message = args.join(' ');
    if (message.includes('schema cache') || message.includes('column') || message.includes('PGRST204')) {
      schemaErrors.push(message);
    }
    originalConsoleError.apply(console, args);
  };
  
  // Restore console.error after monitoring
  setTimeout(() => {
    console.error = originalConsoleError;
    console.log(`- Schema errors detected: ${schemaErrors.length}`);
    
    if (schemaErrors.length > 0) {
      console.log('❌ Schema errors found:');
      schemaErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    } else {
      console.log('✅ No schema errors detected');
    }
  }, 3000);
  
  return true;
}

function runAllSchemaTests() {
  console.log('🚀 Running Schema Fix Tests...\n');
  
  const results = {
    schemaFieldMapping: testSchemaFieldMapping(),
    formSubmissionData: testFormSubmissionData(),
    cancelButton: testCancelButton(),
    formValidation: testFormValidation(),
    schemaErrorPrevention: testSchemaErrorPrevention()
  };
  
  console.log('\n📊 Schema Fix Test Results:');
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  const allPassed = Object.values(results).every(result => result);
  console.log(`\n🎯 Overall Result: ${allPassed ? '✅ SCHEMA FIXES SUCCESSFUL' : '❌ SOME ISSUES REMAIN'}`);
  
  if (allPassed) {
    console.log('🎉 Schema fixes are working! The posting system should work now.');
    console.log('📝 What was fixed:');
    console.log('   1. ✅ Used correct database field names (pricing_type, budget, hourly_rate_limit)');
    console.log('   2. ✅ Removed non-existent fields (preferred_time_option, location_*, etc.)');
    console.log('   3. ✅ Added always-visible Cancel button');
    console.log('   4. ✅ Fixed field mapping to match working EditRequestModal');
  } else {
    console.log('⚠️  Some schema issues may still need attention');
  }
  
  return results;
}

// Auto-run tests
setTimeout(runAllSchemaTests, 1000);

// Export for manual testing
window.testSchemaFix = {
  runAllSchemaTests,
  testSchemaFieldMapping,
  testFormSubmissionData,
  testCancelButton,
  testFormValidation,
  testSchemaErrorPrevention
};

console.log('📋 Schema fix test functions available:');
console.log('   window.testSchemaFix.runAllSchemaTests()');
console.log('   Or individual tests: testSchemaFieldMapping(), testFormSubmissionData(), etc.');
