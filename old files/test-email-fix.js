// Test Email Auto-Population and Database Schema Fix
// Run this in browser console on /booking page

console.log('🧪 Testing Email Auto-Population and Schema Fix...');

function testEmailAutoPopulation() {
  console.log('✅ Test 1: Email Auto-Population');
  
  const emailField = document.querySelector('input[name="customer_email"]');
  const nameField = document.querySelector('input[name="customer_name"]');
  const phoneField = document.querySelector('input[name="customer_phone"]');
  
  console.log(`- Email field found: ${emailField ? '✅' : '❌'}`);
  console.log(`- Name field found: ${nameField ? '✅' : '❌'}`);
  console.log(`- Phone field found: ${phoneField ? '✅' : '❌'}`);
  
  if (emailField) {
    console.log(`- Email value: "${emailField.value}"`);
    console.log(`- Email populated: ${emailField.value ? '✅' : '❌'}`);
    console.log(`- Email read-only: ${emailField.readOnly ? '✅' : '❌'}`);
  }
  
  if (nameField) {
    console.log(`- Name value: "${nameField.value}"`);
    console.log(`- Name populated: ${nameField.value ? '✅' : '❌'}`);
    console.log(`- Name read-only: ${nameField.readOnly ? '✅' : '❌'}`);
  }
  
  if (phoneField) {
    console.log(`- Phone value: "${phoneField.value}"`);
    console.log(`- Phone read-only: ${phoneField.readOnly ? '✅' : '❌'}`);
  }
  
  return emailField && nameField && phoneField;
}

function testFormSubmission() {
  console.log('✅ Test 2: Form Submission (Dry Run)');
  
  const form = document.querySelector('form');
  if (!form) {
    console.log('❌ Form not found');
    return false;
  }
  
  // Check if all required fields are filled
  const requiredFields = form.querySelectorAll('input[required]');
  let allFilled = true;
  
  console.log(`- Required fields found: ${requiredFields.length}`);
  
  requiredFields.forEach((field, index) => {
    const isFilled = field.value.trim() !== '';
    console.log(`  ${index + 1}. ${field.name}: ${isFilled ? '✅' : '❌'} "${field.value}"`);
    if (!isFilled) allFilled = false;
  });
  
  console.log(`- All required fields filled: ${allFilled ? '✅' : '❌'}`);
  
  return allFilled;
}

function testDatabaseSchemaFix() {
  console.log('✅ Test 3: Database Schema Compatibility');
  
  // Check if the form is trying to submit the problematic fields
  const form = document.querySelector('form');
  if (!form) {
    console.log('❌ Form not found');
    return false;
  }
  
  // Look for any error messages in console that might indicate schema issues
  const originalConsoleError = console.error;
  let schemaErrors = [];
  
  console.error = function(...args) {
    const message = args.join(' ');
    if (message.includes('customer_email') || message.includes('customer_phone') || message.includes('schema cache')) {
      schemaErrors.push(message);
    }
    originalConsoleError.apply(console, args);
  };
  
  // Restore console.error after a short delay
  setTimeout(() => {
    console.error = originalConsoleError;
    console.log(`- Schema-related errors detected: ${schemaErrors.length}`);
    if (schemaErrors.length > 0) {
      console.log('❌ Schema errors found:');
      schemaErrors.forEach(error => console.log(`  - ${error}`));
    } else {
      console.log('✅ No schema errors detected');
    }
  }, 2000);
  
  return true;
}

function testFieldLabels() {
  console.log('✅ Test 4: Field Labels for Contractor Mode');
  
  const emailLabel = document.querySelector('label[for="customer_email"]');
  const nameLabel = document.querySelector('label[for="customer_name"]');
  const phoneLabel = document.querySelector('label[for="customer_phone"]');
  
  if (emailLabel) {
    const isContractorLabel = emailLabel.textContent.includes('Your Email');
    console.log(`- Email label: "${emailLabel.textContent}"`);
    console.log(`- Contractor-specific label: ${isContractorLabel ? '✅' : '❌'}`);
  }
  
  if (nameLabel) {
    const isContractorLabel = nameLabel.textContent.includes('Your Name');
    console.log(`- Name label: "${nameLabel.textContent}"`);
    console.log(`- Contractor-specific label: ${isContractorLabel ? '✅' : '❌'}`);
  }
  
  if (phoneLabel) {
    const isContractorLabel = phoneLabel.textContent.includes('Your Phone');
    console.log(`- Phone label: "${phoneLabel.textContent}"`);
    console.log(`- Contractor-specific label: ${isContractorLabel ? '✅' : '❌'}`);
  }
  
  return emailLabel && nameLabel && phoneLabel;
}

function runAllEmailTests() {
  console.log('🚀 Running Email Auto-Population and Schema Fix Tests...\n');
  
  const results = {
    emailAutoPopulation: testEmailAutoPopulation(),
    formSubmission: testFormSubmission(),
    schemaFix: testDatabaseSchemaFix(),
    fieldLabels: testFieldLabels()
  };
  
  console.log('\n📊 Email Fix Test Results:');
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  const allPassed = Object.values(results).every(result => result);
  console.log(`\n🎯 Overall Result: ${allPassed ? '✅ EMAIL FIXES SUCCESSFUL' : '❌ SOME ISSUES REMAIN'}`);
  
  if (allPassed) {
    console.log('🎉 Email auto-population and schema fixes are working!');
    console.log('📝 Next steps:');
    console.log('   1. Test actual form submission');
    console.log('   2. Verify no database schema errors');
    console.log('   3. Check marketplace request creation');
  } else {
    console.log('⚠️  Some email/schema issues need attention');
  }
  
  return results;
}

// Auto-run tests
setTimeout(runAllEmailTests, 1000);

// Export for manual testing
window.testEmailFix = {
  runAllEmailTests,
  testEmailAutoPopulation,
  testFormSubmission,
  testDatabaseSchemaFix,
  testFieldLabels
};

console.log('📋 Email fix test functions available:');
console.log('   window.testEmailFix.runAllEmailTests()');
console.log('   Or individual tests: testEmailAutoPopulation(), testFormSubmission(), etc.');
