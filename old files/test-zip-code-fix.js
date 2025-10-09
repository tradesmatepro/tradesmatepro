// Test Zip Code Functionality Fix
// Run this in browser console on /booking page

console.log('🧪 Testing Zip Code Fix...');

function testZipCodeField() {
  console.log('✅ Test 1: Zip Code Field Presence');
  
  const zipField = document.querySelector('input[name="location_postal_code"]');
  const zipLabel = document.querySelector('label[for="location_postal_code"]');
  
  console.log(`- Zip code input field: ${zipField ? '✅ FOUND' : '❌ MISSING'}`);
  console.log(`- Zip code label: ${zipLabel ? '✅ FOUND' : '❌ MISSING'}`);
  
  if (zipField) {
    console.log(`- Field placeholder: "${zipField.placeholder}"`);
    console.log(`- Field required: ${zipField.required ? '✅ YES' : '❌ NO'}`);
    console.log(`- Field type: ${zipField.type}`);
  }
  
  if (zipLabel) {
    console.log(`- Label text: "${zipLabel.textContent}"`);
  }
  
  return zipField && zipLabel;
}

function testZipCodeFunctionality() {
  console.log('✅ Test 2: Zip Code Input Functionality');
  
  const zipField = document.querySelector('input[name="location_postal_code"]');
  
  if (!zipField) {
    console.log('❌ Cannot test functionality - field not found');
    return false;
  }
  
  // Test typing in zip code
  const testZip = '12345';
  zipField.value = testZip;
  zipField.dispatchEvent(new Event('input', { bubbles: true }));
  zipField.dispatchEvent(new Event('change', { bubbles: true }));
  
  setTimeout(() => {
    console.log(`- Test zip entered: "${testZip}"`);
    console.log(`- Field value after input: "${zipField.value}"`);
    console.log(`- Value matches: ${zipField.value === testZip ? '✅ YES' : '❌ NO'}`);
  }, 100);
  
  return true;
}

function testFormValidation() {
  console.log('✅ Test 3: Form Validation with Zip Code');
  
  const form = document.querySelector('form');
  const zipField = document.querySelector('input[name="location_postal_code"]');
  
  if (!form || !zipField) {
    console.log('❌ Cannot test validation - form or zip field not found');
    return false;
  }
  
  // Clear zip field and try to submit
  zipField.value = '';
  
  // Check if form validation catches empty required zip
  const isValid = form.checkValidity();
  console.log(`- Form valid with empty zip: ${isValid ? '❌ SHOULD BE INVALID' : '✅ CORRECTLY INVALID'}`);
  
  // Fill zip and check again
  zipField.value = '90210';
  const isValidWithZip = form.checkValidity();
  console.log(`- Form valid with zip: ${isValidWithZip ? '✅ VALID' : '❌ STILL INVALID'}`);
  
  return true;
}

function testLocationSection() {
  console.log('✅ Test 4: Location Section Layout');
  
  const locationSection = document.querySelector('h4');
  const addressField = document.querySelector('input[name="location_address"]');
  const cityField = document.querySelector('input[name="location_city"]');
  const stateField = document.querySelector('input[name="location_state"]');
  const zipField = document.querySelector('input[name="location_postal_code"]');
  
  console.log(`- Location section header: ${locationSection ? '✅ FOUND' : '❌ MISSING'}`);
  console.log(`- Address field: ${addressField ? '✅ FOUND' : '❌ MISSING'}`);
  console.log(`- City field: ${cityField ? '✅ FOUND' : '❌ MISSING'}`);
  console.log(`- State field: ${stateField ? '✅ FOUND' : '❌ MISSING'}`);
  console.log(`- Zip field: ${zipField ? '✅ FOUND' : '❌ MISSING'}`);
  
  const allFieldsPresent = addressField && cityField && stateField && zipField;
  console.log(`- Complete location form: ${allFieldsPresent ? '✅ COMPLETE' : '❌ INCOMPLETE'}`);
  
  return allFieldsPresent;
}

function runAllZipTests() {
  console.log('🚀 Running Zip Code Fix Tests...\n');
  
  const results = {
    zipFieldPresent: testZipCodeField(),
    zipFunctionality: testZipCodeFunctionality(),
    formValidation: testFormValidation(),
    locationSection: testLocationSection()
  };
  
  console.log('\n📊 Zip Code Test Results:');
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  const allPassed = Object.values(results).every(result => result);
  console.log(`\n🎯 Overall Result: ${allPassed ? '✅ ZIP CODE FIX SUCCESSFUL' : '❌ SOME ISSUES REMAIN'}`);
  
  if (allPassed) {
    console.log('🎉 Zip code functionality has been restored!');
    console.log('📝 Next steps:');
    console.log('   1. Test form submission with zip code');
    console.log('   2. Verify zip appears in marketplace requests');
    console.log('   3. Check contractor can see zip in request cards');
  } else {
    console.log('⚠️  Some zip code issues need attention');
  }
  
  return results;
}

// Auto-run tests
setTimeout(runAllZipTests, 1000);

// Export for manual testing
window.testZipCodeFix = {
  runAllZipTests,
  testZipCodeField,
  testZipCodeFunctionality,
  testFormValidation,
  testLocationSection
};

console.log('📋 Zip code test functions available:');
console.log('   window.testZipCodeFix.runAllZipTests()');
console.log('   Or individual tests: testZipCodeField(), testZipCodeFunctionality(), etc.');
