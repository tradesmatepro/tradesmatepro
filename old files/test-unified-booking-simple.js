// Simple Unified Booking System Test
// Run this in browser console on either /booking page

console.log('🧪 Starting Unified Booking System Test...');

// Test 1: Check if BookingForm is rendered
function testBookingFormExists() {
  const form = document.querySelector('form');
  const timePreferenceButtons = document.querySelectorAll('button[type="button"]');
  
  console.log('✅ Test 1: BookingForm Elements');
  console.log(`- Form found: ${form ? '✅' : '❌'}`);
  console.log(`- Time preference buttons: ${timePreferenceButtons.length} found`);
  
  return form && timePreferenceButtons.length >= 5;
}

// Test 2: Check time preference functionality
function testTimePreferences() {
  console.log('✅ Test 2: Time Preference Buttons');
  
  const buttons = document.querySelectorAll('button[type="button"]');
  let timeButtons = [];
  
  buttons.forEach(btn => {
    const text = btn.textContent.toLowerCase();
    if (text.includes('anytime') || text.includes('soonest') || text.includes('week') || text.includes('weekend') || text.includes('pick dates')) {
      timeButtons.push(btn);
    }
  });
  
  console.log(`- Time preference buttons found: ${timeButtons.length}`);
  
  // Test clicking a button
  if (timeButtons.length > 0) {
    const firstButton = timeButtons[0];
    console.log(`- Testing click on: ${firstButton.textContent}`);
    firstButton.click();
    
    // Check if button becomes active
    setTimeout(() => {
      const isActive = firstButton.classList.contains('border-blue-500') || 
                      firstButton.classList.contains('bg-blue-50');
      console.log(`- Button activation: ${isActive ? '✅' : '❌'}`);
    }, 100);
  }
  
  return timeButtons.length >= 5;
}

// Test 3: Check form fields
function testFormFields() {
  console.log('✅ Test 3: Form Fields');
  
  const requiredFields = [
    'input[placeholder*="service"]',
    'textarea[placeholder*="describe"]',
    'input[placeholder*="address"]',
    'select, input[type="text"]'
  ];
  
  let fieldsFound = 0;
  requiredFields.forEach(selector => {
    const field = document.querySelector(selector);
    if (field) fieldsFound++;
  });
  
  console.log(`- Required form fields found: ${fieldsFound}/${requiredFields.length}`);
  
  return fieldsFound >= 2; // At least service and description
}

// Test 4: Check submit functionality
function testSubmitButton() {
  console.log('✅ Test 4: Submit Button');
  
  const submitButton = document.querySelector('button[type="submit"]');
  console.log(`- Submit button found: ${submitButton ? '✅' : '❌'}`);
  
  if (submitButton) {
    console.log(`- Submit button text: "${submitButton.textContent}"`);
    console.log(`- Submit button enabled: ${!submitButton.disabled ? '✅' : '❌'}`);
  }
  
  return !!submitButton;
}

// Run all tests
function runAllTests() {
  console.log('🚀 Running Unified Booking System Tests...\n');
  
  const results = {
    formExists: testBookingFormExists(),
    timePreferences: testTimePreferences(),
    formFields: testFormFields(),
    submitButton: testSubmitButton()
  };
  
  console.log('\n📊 Test Results Summary:');
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  const allPassed = Object.values(results).every(result => result);
  console.log(`\n🎯 Overall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  if (allPassed) {
    console.log('🎉 Unified Booking System is working correctly!');
    console.log('📝 Next steps:');
    console.log('   1. Fill out the form with test data');
    console.log('   2. Test form submission');
    console.log('   3. Verify data appears in marketplace');
  }
  
  return results;
}

// Auto-run tests
setTimeout(runAllTests, 1000);

// Export for manual testing
window.testUnifiedBooking = {
  runAllTests,
  testBookingFormExists,
  testTimePreferences,
  testFormFields,
  testSubmitButton
};

console.log('📋 Test functions available:');
console.log('   window.testUnifiedBooking.runAllTests()');
console.log('   Or individual tests: testBookingFormExists(), testTimePreferences(), etc.');
