// Simple test script to verify marketplace request creation
// Run this in the browser console on the marketplace page

console.log('🧪 Testing marketplace request creation...');

// Test the unified booking form submission
async function testRequestCreation() {
  console.log('📝 Testing unified booking form functionality...');
  
  try {
    // Check if we're on the booking page
    if (!window.location.pathname.includes('/booking')) {
      console.warn('⚠️ Please navigate to /booking first');
      return false;
    }
    
    // Check if we can access the supabase client
    const { supabase } = await import('./src/utils/supabaseClient.js');
    if (!supabase) {
      console.error('❌ Could not access Supabase client');
      return false;
    }
    
    console.log('✅ Supabase client accessible');
    
    // Test data
    const testData = {
      company_id: 'test-company-' + Date.now(),
      title: 'Test Kitchen Faucet Repair',
      description: 'Need to fix a leaky kitchen faucet ASAP. Water is dripping constantly.',
      request_type: 'standard',
      service_mode: 'onsite',
      pricing_preference: 'FLAT',
      flat_rate: 150,
      hourly_rate: null,
      max_responses: 5,
      requires_inspection: true,
      start_time: null,
      end_time: null,
      status: 'available'
    };
    
    console.log('📊 Test data:', testData);
    
    // Test the direct insert (same as what CreateRequestModal does now)
    const { data: newRequest, error: requestError } = await supabase
      .from('marketplace_requests')
      .insert([testData])
      .select()
      .single();

    if (requestError) {
      console.error('❌ Request creation failed:', requestError);
      console.log('🔍 Error details:', {
        code: requestError.code,
        message: requestError.message,
        details: requestError.details,
        hint: requestError.hint
      });
      return false;
    }

    console.log('✅ Request created successfully!', newRequest);
    
    // Clean up - delete the test request
    const { error: deleteError } = await supabase
      .from('marketplace_requests')
      .delete()
      .eq('id', newRequest.id);
    
    if (deleteError) {
      console.warn('⚠️ Could not clean up test request:', deleteError);
    } else {
      console.log('🧹 Test request cleaned up');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    return false;
  }
}

// Test the UI interaction
function testUIInteraction() {
  console.log('🖱️ Testing UI interaction...');
  
  // Look for the "Post Request" button
  const buttons = Array.from(document.querySelectorAll('button'));
  const postRequestButtons = buttons.filter(btn => 
    btn.textContent.includes('Post a Request') || 
    btn.textContent.includes('New Request') ||
    btn.textContent.includes('Post Request')
  );
  
  if (postRequestButtons.length === 0) {
    console.warn('⚠️ No "Post Request" button found. Make sure you\'re in Hiring mode.');
    return false;
  }
  
  console.log(`✅ Found ${postRequestButtons.length} post request button(s):`, 
    postRequestButtons.map(btn => btn.textContent.trim()));
  
  // Check for mode toggle buttons
  const modeButtons = buttons.filter(btn => 
    btn.textContent.includes('Hiring') || 
    btn.textContent.includes('Providing')
  );
  
  console.log(`✅ Found ${modeButtons.length} mode toggle button(s):`, 
    modeButtons.map(btn => btn.textContent.trim()));
  
  return true;
}

// Check for console errors
function checkConsoleErrors() {
  console.log('🔍 Checking for console errors...');
  
  // Check if there are any 400 errors in the network
  const performanceEntries = performance.getEntriesByType('navigation');
  console.log('📊 Navigation entries:', performanceEntries.length);
  
  // Look for error indicators in the DOM
  const errorElements = document.querySelectorAll('[class*="error"], [class*="Error"]');
  console.log(`🔍 Found ${errorElements.length} potential error elements`);
  
  return true;
}

// Main test function
async function runQuickTest() {
  console.log('🚀 Running quick marketplace test...\n');
  
  const results = {
    ui: testUIInteraction(),
    console: checkConsoleErrors(),
    database: await testRequestCreation()
  };
  
  console.log('\n📊 Test Results:');
  console.log('UI Test:', results.ui ? '✅ PASS' : '❌ FAIL');
  console.log('Console Check:', results.console ? '✅ PASS' : '❌ FAIL');
  console.log('Database Test:', results.database ? '✅ PASS' : '❌ FAIL');
  
  const allPassed = Object.values(results).every(result => result);
  console.log('\n🎯 Overall Result:', allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
  
  if (allPassed) {
    console.log('\n🎉 Marketplace request creation is working correctly!');
    console.log('You can now:');
    console.log('1. Switch to "Hiring" mode');
    console.log('2. Click "Post a Request"');
    console.log('3. Fill out the form');
    console.log('4. Submit successfully');
  } else {
    console.log('\n🔧 Issues found. Check the individual test results above.');
  }
  
  return results;
}

// Export for manual use
window.testMarketplace = {
  runQuickTest,
  testRequestCreation,
  testUIInteraction,
  checkConsoleErrors
};

console.log('✅ Quick test script loaded!');
console.log('Run: window.testMarketplace.runQuickTest()');
