// Test script to simulate the reported marketplace issues
// This will trigger errors that the AI Fix Engine can detect and create patch proposals for

console.log('🧪 Starting Marketplace Issue Testing...');

// Test 1: Dashboard Card Click Issue
console.log('📋 Test 1: Dashboard Card Clickability');

// Simulate the dashboard card click issue
// The user reported: "once when i click on marketplace and go to the dashboard the cards are supposed to be clickable and take me to what the card is talking about. it doesn't do that"

function testDashboardCardClicks() {
  try {
    // Check if we're in the marketplace
    const currentPath = window.location.pathname;
    console.log('Current path:', currentPath);
    
    // Look for dashboard cards
    const dashboardCards = document.querySelectorAll('[data-testid="dashboard-card"], .cursor-pointer');
    console.log(`Found ${dashboardCards.length} potential dashboard cards`);
    
    if (dashboardCards.length === 0) {
      throw new Error('DASHBOARD_CARDS_NOT_FOUND: No clickable dashboard cards detected');
    }
    
    // Test each card's click handler
    dashboardCards.forEach((card, index) => {
      const hasClickHandler = card.onclick || card.addEventListener;
      const hasCursorPointer = window.getComputedStyle(card).cursor === 'pointer';
      
      console.log(`Card ${index + 1}: onClick=${!!card.onclick}, cursor=${window.getComputedStyle(card).cursor}`);
      
      if (!hasClickHandler && !hasCursorPointer) {
        throw new Error(`DASHBOARD_CARD_NOT_CLICKABLE: Card ${index + 1} appears to be missing click functionality`);
      }
    });
    
    console.log('✅ Dashboard cards appear to have click handlers');
    return true;
  } catch (error) {
    console.error('❌ Dashboard Card Test Failed:', error.message);
    
    // Send error to error server for AI Fix Engine to process
    if (window.capturedErrors) {
      window.capturedErrors.push({
        type: 'UI_ERROR',
        message: error.message,
        timestamp: new Date().toISOString(),
        context: {
          test: 'dashboard_card_clicks',
          location: window.location.href,
          userAgent: navigator.userAgent
        }
      });
    }
    
    return false;
  }
}

// Test 2: Form Submission Error
console.log('📝 Test 2: Form Submission in Open Jobs');

function testFormSubmission() {
  try {
    // Look for the inline response form
    const forms = document.querySelectorAll('form');
    console.log(`Found ${forms.length} forms on page`);
    
    // Look specifically for marketplace response forms
    const responseForm = document.querySelector('form[data-testid="response-form"], form:has(button:contains("Submit Response"))');
    
    if (!responseForm) {
      // Try to find forms with submit buttons
      const submitButtons = document.querySelectorAll('button[type="submit"], button:contains("Submit")');
      console.log(`Found ${submitButtons.length} submit buttons`);
      
      if (submitButtons.length === 0) {
        throw new Error('FORM_SUBMISSION_NO_FORMS: No response forms or submit buttons found');
      }
    }
    
    // Check for common form submission issues
    const requiredFields = document.querySelectorAll('input[required], select[required], textarea[required]');
    console.log(`Found ${requiredFields.length} required fields`);
    
    // Simulate form validation issues
    requiredFields.forEach((field, index) => {
      if (!field.value && field.offsetParent !== null) { // visible field
        console.warn(`Required field ${index + 1} (${field.name || field.id || 'unnamed'}) is empty`);
      }
    });
    
    console.log('✅ Form structure appears valid');
    return true;
  } catch (error) {
    console.error('❌ Form Submission Test Failed:', error.message);
    
    // Send error to error server for AI Fix Engine to process
    if (window.capturedErrors) {
      window.capturedErrors.push({
        type: 'FORM_ERROR',
        message: error.message,
        timestamp: new Date().toISOString(),
        context: {
          test: 'form_submission',
          location: window.location.href,
          formCount: document.querySelectorAll('form').length
        }
      });
    }
    
    return false;
  }
}

// Test 3: API Endpoint Testing
console.log('🌐 Test 3: API Endpoint Validation');

async function testAPIEndpoints() {
  try {
    // Test the RPC endpoint that the form submission uses
    const testData = {
      p_request_id: 'test-request-id',
      p_role_id: 'test-role-id',
      p_company_id: 'test-company-id',
      p_response_type: 'interested',
      p_pricing_type: 'negotiable',
      p_quantity_fulfilled: 1
    };
    
    console.log('Testing RPC endpoint: rpc/submit_response_to_role');
    
    // This will likely fail, which is what we want to capture
    const response = await fetch('/rest/v1/rpc/submit_response_to_role', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'test-key' // This will fail, but that's expected
      },
      body: JSON.stringify(testData)
    });
    
    if (!response.ok) {
      throw new Error(`API_ENDPOINT_ERROR: ${response.status} ${response.statusText} - RPC endpoint may not exist or be properly configured`);
    }
    
    console.log('✅ API endpoint responded successfully');
    return true;
  } catch (error) {
    console.error('❌ API Endpoint Test Failed:', error.message);
    
    // Send error to error server for AI Fix Engine to process
    if (window.capturedErrors) {
      window.capturedErrors.push({
        type: 'API_ERROR',
        message: error.message,
        timestamp: new Date().toISOString(),
        context: {
          test: 'api_endpoints',
          endpoint: 'rpc/submit_response_to_role',
          location: window.location.href
        }
      });
    }
    
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Running comprehensive marketplace tests...');
  
  const results = {
    dashboardCards: testDashboardCardClicks(),
    formSubmission: testFormSubmission(),
    apiEndpoints: await testAPIEndpoints()
  };
  
  console.log('📊 Test Results:', results);
  
  const failedTests = Object.entries(results).filter(([_, passed]) => !passed);
  
  if (failedTests.length > 0) {
    console.error(`❌ ${failedTests.length} tests failed:`, failedTests.map(([test]) => test));
    
    // Trigger the AI Fix Engine to process these errors
    if (window.runAutoFix) {
      console.log('🛠️ Triggering AI Fix Engine...');
      setTimeout(() => {
        window.runAutoFix();
      }, 1000);
    } else {
      console.warn('⚠️ AI Fix Engine not available on window object');
    }
  } else {
    console.log('✅ All tests passed!');
  }
  
  return results;
}

// Initialize error capture if not already done
if (!window.capturedErrors) {
  window.capturedErrors = [];
}

// Run tests when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runAllTests);
} else {
  runAllTests();
}

// Export for manual execution
window.testMarketplaceIssues = runAllTests;

console.log('🧪 Marketplace issue testing script loaded. Run window.testMarketplaceIssues() to execute tests manually.');
