// Simple Page Error Check - Run this in browser console on each page
// Copy and paste this into browser console, then navigate to each page

console.log('🔍 SIMPLE PAGE ERROR CHECKER ACTIVATED');
console.log('This will monitor the current page for 400 errors');
console.log('='.repeat(50));

// Store errors for current page
const currentPageErrors = [];

// Get current page name
function getCurrentPageName() {
  const path = window.location.pathname;
  if (path.includes('/customers')) return 'Customers';
  if (path.includes('/quotes')) return 'Quotes';  
  if (path.includes('/invoices')) return 'Invoices';
  if (path.includes('/sales')) return 'Sales Dashboard';
  if (path.includes('/customer-dashboard')) return 'Customer Dashboard';
  return 'Unknown Page';
}

const pageName = getCurrentPageName();
console.log(`📍 Current page: ${pageName}`);

// Monitor fetch requests
const originalFetch = window.fetch;
window.fetch = async function(...args) {
  const url = args[0];
  
  try {
    const response = await originalFetch.apply(this, args);
    
    // Log all Supabase requests
    if (url.includes('supabase.co')) {
      console.log(`📡 API Request: ${response.status} - ${url}`);
      
      if (response.status === 400) {
        const errorText = await response.clone().text();
        currentPageErrors.push({
          type: '400_ERROR',
          url: url,
          error: errorText,
          timestamp: new Date().toISOString()
        });
        
        console.log('🚨 400 ERROR DETECTED:');
        console.log('   URL:', url);
        console.log('   Error:', errorText);
      }
    }
    
    return response;
  } catch (error) {
    if (url.includes('supabase.co')) {
      currentPageErrors.push({
        type: 'NETWORK_ERROR',
        url: url,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      console.log('🚨 NETWORK ERROR:');
      console.log('   URL:', url);
      console.log('   Error:', error.message);
    }
    
    throw error;
  }
};

// Monitor console errors
const originalError = console.error;
console.error = function(...args) {
  const errorMsg = args.join(' ');
  
  if (errorMsg.includes('Error loading') || errorMsg.includes('Failed to') || errorMsg.includes('400')) {
    currentPageErrors.push({
      type: 'CONSOLE_ERROR',
      message: errorMsg,
      timestamp: new Date().toISOString()
    });
    
    console.log('🚨 CONSOLE ERROR DETECTED:', errorMsg);
  }
  
  originalError.apply(console, args);
};

// Function to check current page errors
window.checkCurrentPageErrors = function() {
  console.log(`\n📊 ${pageName.toUpperCase()} ERROR SUMMARY`);
  console.log('='.repeat(40));
  
  if (currentPageErrors.length === 0) {
    console.log('✅ No errors detected on this page');
    return [];
  }
  
  console.log(`❌ Found ${currentPageErrors.length} errors:`);
  currentPageErrors.forEach((error, index) => {
    console.log(`\n${index + 1}. ${error.type}`);
    console.log(`   Time: ${error.timestamp}`);
    if (error.url) console.log(`   URL: ${error.url}`);
    console.log(`   Error: ${error.error || error.message}`);
  });
  
  return currentPageErrors;
};

// Function to clear errors
window.clearPageErrors = function() {
  currentPageErrors.length = 0;
  console.log('✅ Cleared page errors');
};

// Auto-check after 3 seconds
setTimeout(() => {
  console.log('\n🔍 AUTO-CHECKING FOR ERRORS...');
  checkCurrentPageErrors();
}, 3000);

console.log('\n✅ Page Error Checker Ready!');
console.log('📋 Commands:');
console.log('   checkCurrentPageErrors() - Show errors for current page');
console.log('   clearPageErrors() - Clear error log');
console.log('\n🎯 Navigate to different pages and run checkCurrentPageErrors() on each');

// Instructions for user
console.log('\n📋 MANUAL TESTING INSTRUCTIONS:');
console.log('1. Navigate to http://localhost:3000/customers');
console.log('2. Wait 5 seconds, then run: checkCurrentPageErrors()');
console.log('3. Navigate to http://localhost:3000/quotes');
console.log('4. Wait 5 seconds, then run: checkCurrentPageErrors()');
console.log('5. Navigate to http://localhost:3000/invoices');
console.log('6. Wait 5 seconds, then run: checkCurrentPageErrors()');
console.log('7. Navigate to http://localhost:3000/sales');
console.log('8. Wait 5 seconds, then run: checkCurrentPageErrors()');
console.log('9. Navigate to http://localhost:3000/customer-dashboard');
console.log('10. Wait 5 seconds, then run: checkCurrentPageErrors()');
