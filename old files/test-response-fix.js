// Test script to verify the response loading fix
// Run this in browser console on marketplace page

window.testResponseFix = {
  async testResponseLoading() {
    console.log('🔧 === TESTING RESPONSE LOADING FIX ===');
    
    // Find a request with response_count > 0
    const requestCards = document.querySelectorAll('[class*="response_count"]');
    console.log('🔍 Found request cards:', requestCards.length);
    
    // Look for request cards that show response counts
    const requestsWithResponses = Array.from(document.querySelectorAll('div')).filter(div => {
      const text = div.textContent;
      return text.includes('response') && (text.includes('/') || text.includes('Response'));
    });
    
    console.log('🔍 Found potential request cards with responses:', requestsWithResponses.length);
    
    if (requestsWithResponses.length > 0) {
      console.log('🔍 First request card text:', requestsWithResponses[0].textContent);
      
      // Try to click on the first request card to open the modal
      const clickableCard = requestsWithResponses[0].closest('[class*="cursor-pointer"]') || 
                           requestsWithResponses[0].closest('div[onclick]') ||
                           requestsWithResponses[0];
      
      if (clickableCard) {
        console.log('🔍 Clicking on request card to test modal...');
        clickableCard.click();
        
        // Wait a moment for the modal to load
        setTimeout(() => {
          const modal = document.querySelector('[class*="fixed"][class*="inset-0"]');
          if (modal) {
            console.log('✅ Modal opened successfully');
            console.log('🔍 Modal content:', modal.textContent.substring(0, 200) + '...');
            
            // Look for response count in modal
            if (modal.textContent.includes('0 contractor')) {
              console.log('❌ Still showing 0 contractors - fix may not be working');
            } else if (modal.textContent.includes('contractor')) {
              console.log('✅ Modal shows contractor responses');
            }
          } else {
            console.log('❌ Modal did not open');
          }
        }, 2000);
      }
    } else {
      console.log('⚠️ No request cards with responses found. Try creating a test response first.');
    }
  },
  
  async createTestResponse() {
    console.log('🔧 === CREATING TEST RESPONSE ===');
    
    // This would need to be implemented based on the actual UI
    console.log('⚠️ Test response creation not implemented yet');
    console.log('💡 Manually create a response through the UI, then run testResponseLoading()');
  },
  
  async checkConsoleErrors() {
    console.log('🔧 === CHECKING FOR CONSOLE ERRORS ===');
    
    // Check if the error capture script is available
    if (window.consoleErrorCapture) {
      const errors = window.consoleErrorCapture.getCapturedErrors();
      console.log('📊 Captured errors:', errors.length);
      
      const responseErrors = errors.filter(error => 
        error.message && (
          error.message.includes('marketplace_responses') ||
          error.message.includes('400') ||
          error.message.includes('Bad Request')
        )
      );
      
      console.log('📊 Response-related errors:', responseErrors.length);
      if (responseErrors.length > 0) {
        console.log('❌ Recent response errors:', responseErrors.slice(-3));
      } else {
        console.log('✅ No response-related errors found');
      }
    } else {
      console.log('⚠️ Console error capture not available');
    }
  }
};

console.log('🔧 Response fix test tools loaded. Run:');
console.log('   window.testResponseFix.testResponseLoading()');
console.log('   window.testResponseFix.checkConsoleErrors()');
