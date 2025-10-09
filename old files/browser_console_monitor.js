// Browser Console Monitor - Capture real 400 errors from browser
// This script should be run in the browser console to capture actual errors

console.log('🔍 BROWSER CONSOLE MONITOR STARTED');
console.log('Monitoring for 400 errors and network failures...');
console.log('='.repeat(60));

// Store original console methods
const originalError = console.error;
const originalWarn = console.warn;
const originalLog = console.log;

// Track errors
const errors = [];
const networkErrors = [];

// Override console.error to capture errors
console.error = function(...args) {
  const errorMsg = args.join(' ');
  
  // Check for 400 errors
  if (errorMsg.includes('400') || errorMsg.includes('Failed to load') || errorMsg.includes('Error loading')) {
    errors.push({
      type: 'console.error',
      message: errorMsg,
      timestamp: new Date().toISOString(),
      stack: new Error().stack
    });
    
    console.log('🚨 CAPTURED 400 ERROR:', errorMsg);
  }
  
  // Call original console.error
  originalError.apply(console, args);
};

// Monitor fetch requests
const originalFetch = window.fetch;
window.fetch = async function(...args) {
  const url = args[0];
  const options = args[1] || {};
  
  try {
    const response = await originalFetch.apply(this, args);
    
    // Check for 400 errors in responses
    if (response.status === 400) {
      const errorText = await response.clone().text();
      networkErrors.push({
        type: 'fetch_400',
        url: url,
        status: response.status,
        error: errorText,
        timestamp: new Date().toISOString()
      });
      
      console.log('🚨 CAPTURED FETCH 400 ERROR:');
      console.log('   URL:', url);
      console.log('   Status:', response.status);
      console.log('   Error:', errorText);
    }
    
    return response;
  } catch (error) {
    networkErrors.push({
      type: 'fetch_error',
      url: url,
      error: error.message,
      timestamp: new Date().toISOString()
    });
    
    console.log('🚨 CAPTURED FETCH ERROR:');
    console.log('   URL:', url);
    console.log('   Error:', error.message);
    
    throw error;
  }
};

// Function to get all captured errors
window.getCapturedErrors = function() {
  console.log('\n📊 CAPTURED ERRORS SUMMARY');
  console.log('='.repeat(40));
  
  console.log(`Console Errors: ${errors.length}`);
  errors.forEach((error, index) => {
    console.log(`${index + 1}. ${error.message}`);
    console.log(`   Time: ${error.timestamp}`);
  });
  
  console.log(`\nNetwork Errors: ${networkErrors.length}`);
  networkErrors.forEach((error, index) => {
    console.log(`${index + 1}. ${error.url}`);
    console.log(`   Status: ${error.status || 'N/A'}`);
    console.log(`   Error: ${error.error}`);
    console.log(`   Time: ${error.timestamp}`);
  });
  
  return { errors, networkErrors };
};

// Function to clear captured errors
window.clearCapturedErrors = function() {
  errors.length = 0;
  networkErrors.length = 0;
  console.log('✅ Cleared all captured errors');
};

// Auto-report function for specific pages
window.checkPageErrors = function(pageName) {
  console.log(`\n🔍 CHECKING ${pageName.toUpperCase()} PAGE ERRORS`);
  console.log('='.repeat(50));
  
  // Wait a bit for page to load and make requests
  setTimeout(() => {
    const currentErrors = getCapturedErrors();
    
    if (currentErrors.errors.length === 0 && currentErrors.networkErrors.length === 0) {
      console.log(`✅ ${pageName} page - No errors detected`);
    } else {
      console.log(`❌ ${pageName} page - ${currentErrors.errors.length + currentErrors.networkErrors.length} errors found`);
    }
  }, 3000);
};

console.log('✅ Browser Console Monitor Ready!');
console.log('📋 Available commands:');
console.log('   getCapturedErrors() - Show all captured errors');
console.log('   clearCapturedErrors() - Clear error log');
console.log('   checkPageErrors("pagename") - Check specific page');
console.log('\n🎯 Now navigate to pages to capture real 400 errors...');

// Auto-check current page
const currentPath = window.location.pathname;
if (currentPath.includes('/customers')) {
  checkPageErrors('Customers');
} else if (currentPath.includes('/quotes')) {
  checkPageErrors('Quotes');
} else if (currentPath.includes('/invoices')) {
  checkPageErrors('Invoices');
} else if (currentPath.includes('/sales')) {
  checkPageErrors('Sales Dashboard');
}
