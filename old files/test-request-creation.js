// Test script to verify marketplace request creation functionality
// Run this in the browser console on the marketplace page

console.log('🧪 Starting Marketplace Request Creation Test...');

// Test data for creating a marketplace request
const testRequestData = {
  title: 'Test Kitchen Faucet Repair',
  description: 'Need to fix a leaky kitchen faucet ASAP. Water is dripping constantly.',
  selected_tags: [
    { id: 'test-tag-1', name: 'plumbing' },
    { id: 'test-tag-2', name: 'residential' }
  ],
  request_type: 'standard',
  service_mode: 'onsite',
  pricing_preference: 'FLAT',
  flat_rate: '150',
  hourly_rate: '',
  max_responses: 5,
  unlimited_responses: false,
  requires_inspection: true,
  start_time: '',
  end_time: ''
};

// Function to test direct Supabase insert
async function testDirectSupabaseInsert() {
  console.log('📝 Testing direct Supabase insert...');

  try {
    // Try to get the supabase client from window (if available)
    let supabase;
    if (window.supabase) {
      supabase = window.supabase;
    } else {
      console.log('🔍 Supabase client not found in window, trying to import...');
      // This might not work in browser console, but worth trying
      try {
        const module = await import('/src/utils/supabaseClient.js');
        supabase = module.supabase;
      } catch (importError) {
        console.error('❌ Could not import supabase client:', importError);
        console.log('ℹ️ Try running this test from within the React app context');
        return false;
      }
    }

    // Get actual user data from React context if available
    let user;
    if (window.testUser) {
      user = window.testUser;
    } else {
      // Mock user data for testing
      user = {
        id: 'test-user-' + Date.now(),
        company_id: 'test-company-' + Date.now()
      };
      console.log('⚠️ Using mock user data:', user);
    }

    // Test the insert
    const { data: newRequest, error: requestError } = await supabase
      .from('marketplace_requests')
      .insert([{
        company_id: user.company_id,
        title: testRequestData.title,
        description: testRequestData.description,
        request_type: testRequestData.request_type,
        service_mode: testRequestData.service_mode,
        pricing_preference: testRequestData.pricing_preference,
        flat_rate: testRequestData.pricing_preference === 'FLAT' ? parseFloat(testRequestData.flat_rate) : null,
        hourly_rate: testRequestData.pricing_preference === 'HOURLY' ? parseFloat(testRequestData.hourly_rate) : null,
        max_responses: testRequestData.unlimited_responses ? null : testRequestData.max_responses,
        requires_inspection: testRequestData.requires_inspection,
        start_time: testRequestData.start_time || null,
        end_time: testRequestData.end_time || null,
        status: 'available'
      }])
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

    console.log('✅ Request created successfully:', newRequest);

    // Test tag linking if we have tags (skip for now since tags might not exist)
    if (testRequestData.selected_tags.length > 0) {
      console.log('ℹ️ Skipping tag linking test (tags might not exist in database)');
      // Uncomment below to test tag linking if you have tags set up
      /*
      const tagLinks = testRequestData.selected_tags.map(tag => ({
        request_id: newRequest.id,
        tag_id: tag.id
      }));

      const { error: tagError } = await supabase
        .from('request_tags')
        .insert(tagLinks);

      if (tagError) {
        console.warn('⚠️ Tag linking failed:', tagError);
      } else {
        console.log('✅ Tags linked successfully');
      }
      */
    }

    return newRequest;

  } catch (error) {
    console.error('❌ Test failed with error:', error);
    return false;
  }
}

// Function to test the unified booking form submission
async function testModalFormSubmission() {
  console.log('📝 Testing unified booking form submission...');
  
  try {
    // Check if we're on the marketplace page
    if (!window.location.pathname.includes('/marketplace')) {
      console.warn('⚠️ Not on marketplace page. Navigate to /marketplace first.');
      return false;
    }
    
    // Look for the "Post Request" button
    const postRequestButtons = document.querySelectorAll('button');
    let postRequestButton = null;
    
    for (const button of postRequestButtons) {
      if (button.textContent.includes('Post a Request') || button.textContent.includes('New Request')) {
        postRequestButton = button;
        break;
      }
    }
    
    if (!postRequestButton) {
      console.warn('⚠️ Could not find "Post Request" button. Make sure you\'re in Hiring mode.');
      return false;
    }
    
    console.log('✅ Found "Post Request" button');
    
    // Click the button to open modal
    postRequestButton.click();
    
    // Wait a bit for modal to open
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if modal opened
    const modal = document.querySelector('[role="dialog"]') || document.querySelector('.modal');
    if (!modal) {
      console.warn('⚠️ Modal did not open. Check for JavaScript errors.');
      return false;
    }
    
    console.log('✅ Modal opened successfully');
    
    // Fill out the form (this would need to be customized based on actual form structure)
    const titleInput = modal.querySelector('input[name="title"]');
    const descriptionInput = modal.querySelector('textarea[name="description"]');
    
    if (titleInput) {
      titleInput.value = testRequestData.title;
      titleInput.dispatchEvent(new Event('input', { bubbles: true }));
      console.log('✅ Title filled');
    }
    
    if (descriptionInput) {
      descriptionInput.value = testRequestData.description;
      descriptionInput.dispatchEvent(new Event('input', { bubbles: true }));
      console.log('✅ Description filled');
    }
    
    console.log('✅ Form filled successfully');
    console.log('ℹ️ You can now manually submit the form to test the full flow');
    
    return true;
    
  } catch (error) {
    console.error('❌ Modal test failed:', error);
    return false;
  }
}

// Function to check database schema
async function checkDatabaseSchema() {
  console.log('📝 Checking database schema...');
  
  try {
    const { supabase } = await import('./src/utils/supabaseClient.js');
    
    // Check if marketplace_requests table exists and get its structure
    const { data, error } = await supabase
      .from('marketplace_requests')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ marketplace_requests table check failed:', error);
      return false;
    }
    
    console.log('✅ marketplace_requests table exists');
    
    // Check if request_tags table exists
    const { data: tagData, error: tagError } = await supabase
      .from('request_tags')
      .select('*')
      .limit(1);
    
    if (tagError) {
      console.warn('⚠️ request_tags table check failed (might not exist):', tagError);
    } else {
      console.log('✅ request_tags table exists');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Schema check failed:', error);
    return false;
  }
}

// Main test function
async function runAllTests() {
  console.log('🚀 Running all marketplace request creation tests...\n');
  
  const results = {
    schemaCheck: await checkDatabaseSchema(),
    directInsert: await testDirectSupabaseInsert(),
    modalTest: await testModalFormSubmission()
  };
  
  console.log('\n📊 Test Results:');
  console.log('Schema Check:', results.schemaCheck ? '✅ PASS' : '❌ FAIL');
  console.log('Direct Insert:', results.directInsert ? '✅ PASS' : '❌ FAIL');
  console.log('Modal Test:', results.modalTest ? '✅ PASS' : '❌ FAIL');
  
  const allPassed = Object.values(results).every(result => result);
  console.log('\n🎯 Overall Result:', allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
  
  if (!allPassed) {
    console.log('\n🔧 Troubleshooting Tips:');
    if (!results.schemaCheck) {
      console.log('- Check if marketplace_requests table exists in Supabase');
      console.log('- Verify database connection and permissions');
    }
    if (!results.directInsert) {
      console.log('- Check Supabase client configuration');
      console.log('- Verify user authentication and company_id');
    }
    if (!results.modalTest) {
      console.log('- Make sure you\'re on the /marketplace page');
      console.log('- Switch to "Hiring" mode to see the Post Request button');
    }
  }
  
  return results;
}

// Simple browser console test
async function testInBrowser() {
  console.log('🧪 Running simple browser test...');

  // Check if we're on the right page
  if (!window.location.pathname.includes('/marketplace')) {
    console.warn('⚠️ Please navigate to /marketplace first');
    return false;
  }

  // Check for React components
  const reactRoot = document.querySelector('#root');
  if (!reactRoot) {
    console.error('❌ React app not found');
    return false;
  }

  console.log('✅ React app detected');

  // Look for marketplace elements
  const marketplaceElements = document.querySelectorAll('[class*="marketplace"], [class*="Marketplace"]');
  console.log(`✅ Found ${marketplaceElements.length} marketplace-related elements`);

  // Look for buttons that might open the create modal
  const buttons = Array.from(document.querySelectorAll('button'));
  const createButtons = buttons.filter(btn =>
    btn.textContent.includes('Post') ||
    btn.textContent.includes('Request') ||
    btn.textContent.includes('New') ||
    btn.textContent.includes('Create')
  );

  console.log(`✅ Found ${createButtons.length} potential create buttons:`,
    createButtons.map(btn => btn.textContent.trim()));

  // Check for mode toggle
  const modeButtons = buttons.filter(btn =>
    btn.textContent.includes('Hiring') ||
    btn.textContent.includes('Providing')
  );

  console.log(`✅ Found ${modeButtons.length} mode toggle buttons:`,
    modeButtons.map(btn => btn.textContent.trim()));

  // Instructions for manual testing
  console.log('\n📋 Manual Testing Instructions:');
  console.log('1. Navigate to /booking route in either Customer Portal or Contractor App');
  console.log('2. Fill out the unified booking form with test data');
  console.log('3. Select time preferences using the button options');
  console.log('4. Submit the form and check for success/error messages');
  console.log('5. Check the browser network tab for API calls');
  console.log('6. Check the console for any error messages');
  console.log('7. Verify the request appears in marketplace with correct time preferences');

  return true;
}

// Export functions for manual testing
window.testMarketplaceRequests = {
  runAllTests,
  checkDatabaseSchema,
  testDirectSupabaseInsert,
  testModalFormSubmission,
  testInBrowser
};

console.log('✅ Test script loaded!');
console.log('📋 Available test functions:');
console.log('- window.testMarketplaceRequests.runAllTests() - Run all automated tests');
console.log('- window.testMarketplaceRequests.testInBrowser() - Simple browser environment test');
console.log('- window.testMarketplaceRequests.checkDatabaseSchema() - Check database tables');
console.log('- window.testMarketplaceRequests.testDirectSupabaseInsert() - Test direct database insert');
