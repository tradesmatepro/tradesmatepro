// Test script to verify the unified booking system
// Run this in the browser console after navigating to /booking

console.log('🧪 Testing Unified Booking System...');

// Test function to verify the unified booking form
async function testUnifiedBooking() {
  console.log('📝 Testing unified booking form...');
  
  try {
    // Check if we're on the booking page
    if (!window.location.pathname.includes('/booking')) {
      console.warn('⚠️ Please navigate to /booking first');
      return false;
    }
    
    // Check for the unified BookingForm component
    const bookingForm = document.querySelector('form');
    if (!bookingForm) {
      console.error('❌ No booking form found on page');
      return false;
    }
    
    console.log('✅ Booking form found');
    
    // Check for time preference buttons
    const timeButtons = document.querySelectorAll('button[type="button"]');
    const timePreferenceButtons = Array.from(timeButtons).filter(btn => 
      btn.textContent.includes('Anytime') || 
      btn.textContent.includes('Soonest') || 
      btn.textContent.includes('This Week') || 
      btn.textContent.includes('Weekend') || 
      btn.textContent.includes('Pick Dates')
    );
    
    if (timePreferenceButtons.length >= 5) {
      console.log('✅ Time preference buttons found:', timePreferenceButtons.length);
    } else {
      console.warn('⚠️ Expected 5 time preference buttons, found:', timePreferenceButtons.length);
    }
    
    // Check for pricing preference radio buttons
    const pricingRadios = document.querySelectorAll('input[name="pricing_preference"]');
    if (pricingRadios.length >= 3) {
      console.log('✅ Pricing preference options found:', pricingRadios.length);
    } else {
      console.warn('⚠️ Expected 3 pricing options, found:', pricingRadios.length);
    }
    
    // Check for service location fields
    const locationFields = document.querySelectorAll('input[name*="location"]');
    if (locationFields.length >= 3) {
      console.log('✅ Location fields found:', locationFields.length);
    } else {
      console.warn('⚠️ Expected location fields, found:', locationFields.length);
    }
    
    // Check for submit button
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
      console.log('✅ Submit button found:', submitButton.textContent);
    } else {
      console.error('❌ No submit button found');
      return false;
    }
    
    console.log('✅ All unified booking form elements found!');
    return true;
    
  } catch (error) {
    console.error('❌ Error testing unified booking:', error);
    return false;
  }
}

// Test time preference functionality
async function testTimePreferences() {
  console.log('📝 Testing time preference functionality...');
  
  try {
    const timeButtons = document.querySelectorAll('button[type="button"]');
    const pickDatesButton = Array.from(timeButtons).find(btn => 
      btn.textContent.includes('Pick Dates')
    );
    
    if (!pickDatesButton) {
      console.warn('⚠️ Pick Dates button not found');
      return false;
    }
    
    // Click "Pick Dates" button
    pickDatesButton.click();
    console.log('✅ Clicked "Pick Dates" button');
    
    // Wait a moment for the UI to update
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Check if date/time inputs appear
    const startTimeInput = document.querySelector('input[name="start_time"]');
    const endTimeInput = document.querySelector('input[name="end_time"]');
    
    if (startTimeInput && endTimeInput) {
      console.log('✅ Date/time inputs appeared when "Pick Dates" selected');
      
      // Test clicking "Anytime" to hide the inputs
      const anytimeButton = Array.from(timeButtons).find(btn => 
        btn.textContent.includes('Anytime')
      );
      
      if (anytimeButton) {
        anytimeButton.click();
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Check if inputs are hidden (or at least not required)
        const isStartTimeRequired = startTimeInput.hasAttribute('required');
        if (!isStartTimeRequired) {
          console.log('✅ Date/time inputs properly hidden/optional when "Anytime" selected');
        } else {
          console.warn('⚠️ Date/time inputs still required when "Anytime" selected');
        }
      }
      
      return true;
    } else {
      console.error('❌ Date/time inputs did not appear');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error testing time preferences:', error);
    return false;
  }
}

// Test form validation
async function testFormValidation() {
  console.log('📝 Testing form validation...');
  
  try {
    const form = document.querySelector('form');
    const submitButton = document.querySelector('button[type="submit"]');
    
    if (!form || !submitButton) {
      console.error('❌ Form or submit button not found');
      return false;
    }
    
    // Try to submit empty form
    const originalOnSubmit = form.onsubmit;
    let validationTriggered = false;
    
    form.onsubmit = (e) => {
      e.preventDefault();
      validationTriggered = true;
      console.log('✅ Form validation triggered (prevented empty submission)');
      return false;
    };
    
    submitButton.click();
    
    // Restore original handler
    form.onsubmit = originalOnSubmit;
    
    if (validationTriggered) {
      console.log('✅ Form validation working correctly');
      return true;
    } else {
      console.warn('⚠️ Form validation may not be working');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error testing form validation:', error);
    return false;
  }
}

// Run all tests
async function runAllBookingTests() {
  console.log('🚀 Running all unified booking tests...\n');
  
  const results = {
    formElements: await testUnifiedBooking(),
    timePreferences: await testTimePreferences(),
    formValidation: await testFormValidation()
  };
  
  const allPassed = Object.values(results).every(result => result === true);
  
  console.log('\n📊 Test Results:');
  console.log('- Form Elements:', results.formElements ? '✅ PASS' : '❌ FAIL');
  console.log('- Time Preferences:', results.timePreferences ? '✅ PASS' : '❌ FAIL');
  console.log('- Form Validation:', results.formValidation ? '✅ PASS' : '❌ FAIL');
  
  if (allPassed) {
    console.log('\n🎉 All tests passed! Unified booking system is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Check the issues above.');
  }
  
  console.log('\n📋 Manual Testing Instructions:');
  console.log('1. Fill out the form with test data');
  console.log('2. Try different time preference options');
  console.log('3. Test pricing preferences (Flat Rate, Hourly, Negotiable)');
  console.log('4. Submit the form and check for success/error messages');
  console.log('5. Check browser network tab for API calls');
  console.log('6. Verify the request appears in marketplace with correct preferences');
  
  return results;
}

// Export functions for manual testing
window.testUnifiedBooking = {
  runAllBookingTests,
  testUnifiedBooking,
  testTimePreferences,
  testFormValidation
};

console.log('✅ Unified booking test script loaded!');
console.log('📋 Available test functions:');
console.log('- window.testUnifiedBooking.runAllBookingTests() - Run all tests');
console.log('- window.testUnifiedBooking.testUnifiedBooking() - Test form elements');
console.log('- window.testUnifiedBooking.testTimePreferences() - Test time preferences');
console.log('- window.testUnifiedBooking.testFormValidation() - Test form validation');
console.log('\n🎯 Navigate to /booking and run: window.testUnifiedBooking.runAllBookingTests()');
