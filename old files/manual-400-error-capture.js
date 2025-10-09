/**
 * Manual 400 Error Capture Script
 * Run this in browser console to capture and analyze current 400 errors
 * Based on How To methodology for manual error reproduction
 */

console.log('🔍 MANUAL 400 ERROR CAPTURE SCRIPT');
console.log('==================================');

// Step-by-step reproduction guide
console.log('📝 STEP-BY-STEP REPRODUCTION GUIDE:');
console.log('1. Open browser and go to: http://localhost:3000');
console.log('2. Log in with your credentials');
console.log('3. Navigate through different pages (Dashboard, Quotes, Jobs, etc.)');
console.log('4. Open browser console (F12) and run this script');
console.log('5. Check Network tab for 400 errors');
console.log('');

// Function to capture current errors
function captureAll400Errors() {
  console.log('🚨 CAPTURING ALL 400 ERRORS...');
  console.log('==============================');
  
  const results = {
    consoleErrors: [],
    networkErrors: [],
    capturedErrors: [],
    analysis: {}
  };
  
  // 1. Check captured errors from console-error-capture.js
  if (window.capturedErrors) {
    console.log(`📊 Found ${window.capturedErrors.length} captured console errors`);
    
    const http400Errors = window.capturedErrors.filter(error => 
      error.message && (
        error.message.includes('400') ||
        error.message.includes('Bad Request') ||
        error.message.includes('Failed to load resource') ||
        error.message.includes('column') && error.message.includes('does not exist')
      )
    );
    
    results.capturedErrors = http400Errors;
    console.log(`🚨 Found ${http400Errors.length} HTTP 400/schema errors in captured data:`);
    
    http400Errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error.timestamp}: ${error.message}`);
    });
  } else {
    console.log('⚠️ No captured errors found - console-error-capture.js may not be loaded');
  }
  
  // 2. Check for network errors in performance entries
  console.log('');
  console.log('🌐 CHECKING NETWORK PERFORMANCE ENTRIES...');
  
  if (window.performance && window.performance.getEntriesByType) {
    const networkEntries = window.performance.getEntriesByType('navigation')
      .concat(window.performance.getEntriesByType('resource'));
    
    const failedRequests = networkEntries.filter(entry => 
      entry.name && (
        entry.name.includes('supabase.co') ||
        entry.name.includes('localhost:4000')
      )
    );
    
    console.log(`📡 Found ${failedRequests.length} Supabase/API requests`);
    results.networkErrors = failedRequests;
  }
  
  // 3. Manual network inspection guide
  console.log('');
  console.log('🔍 MANUAL NETWORK INSPECTION:');
  console.log('1. Open DevTools Network tab');
  console.log('2. Filter by "400" or "supabase"');
  console.log('3. Look for red entries (failed requests)');
  console.log('4. Click on failed requests to see details');
  console.log('');
  
  // 4. Common 400 error patterns
  console.log('🎯 COMMON 400 ERROR PATTERNS TO LOOK FOR:');
  console.log('==========================================');
  
  const commonPatterns = [
    {
      pattern: 'column "stage" does not exist',
      table: 'work_orders',
      fix: 'Replace stage with status field'
    },
    {
      pattern: 'column "job_status" does not exist', 
      table: 'work_orders',
      fix: 'Replace job_status with status field'
    },
    {
      pattern: 'column "quote_status" does not exist',
      table: 'work_orders', 
      fix: 'Replace quote_status with status field'
    },
    {
      pattern: 'column "start_time" does not exist',
      table: 'work_orders',
      fix: 'Replace start_time with created_at field'
    },
    {
      pattern: 'column "tier" does not exist',
      table: 'users',
      fix: 'Remove tier field or use default value'
    },
    {
      pattern: 'column "phone_number" does not exist',
      table: 'users',
      fix: 'Replace phone_number with phone field'
    },
    {
      pattern: 'column "active" does not exist',
      table: 'users', 
      fix: 'Replace active with status enum field'
    }
  ];
  
  commonPatterns.forEach((item, index) => {
    console.log(`${index + 1}. ${item.pattern}`);
    console.log(`   Table: ${item.table}`);
    console.log(`   Fix: ${item.fix}`);
    console.log('');
  });
  
  results.analysis.commonPatterns = commonPatterns;
  
  // 5. Send errors to error server
  console.log('📤 SENDING ERRORS TO ERROR SERVER...');
  if (window.sendErrors) {
    window.sendErrors().then(() => {
      console.log('✅ Errors sent to error server');
      console.log('📁 Check error_logs/latest.json for captured data');
    }).catch(error => {
      console.log(`❌ Failed to send errors: ${error.message}`);
    });
  } else {
    console.log('⚠️ sendErrors function not available');
  }
  
  // 6. Analysis summary
  console.log('');
  console.log('📋 ANALYSIS SUMMARY');
  console.log('==================');
  console.log(`Console Errors: ${results.capturedErrors.length}`);
  console.log(`Network Entries: ${results.networkErrors.length}`);
  console.log(`Common Patterns: ${results.analysis.commonPatterns.length}`);
  
  // 7. Next steps
  console.log('');
  console.log('🎯 NEXT STEPS');
  console.log('=============');
  console.log('1. Check Network tab for actual 400 errors');
  console.log('2. Note the exact error messages and URLs');
  console.log('3. Check error_logs/latest.json after running sendErrors()');
  console.log('4. Apply schema fixes based on error patterns found');
  console.log('5. Test again after fixes');
  
  return results;
}

// Function to test specific API endpoints
function test400Endpoints() {
  console.log('🧪 TESTING SPECIFIC API ENDPOINTS FOR 400 ERRORS...');
  console.log('===================================================');
  
  // Common endpoints that might have 400 errors
  const testEndpoints = [
    'work_orders?select=*&status=eq.QUOTE',
    'work_orders?select=*&status=eq.COMPLETED', 
    'users?select=*',
    'business_settings?select=*',
    'integration_settings?select=*'
  ];
  
  console.log('🎯 Test these endpoints manually in Network tab:');
  testEndpoints.forEach((endpoint, index) => {
    console.log(`${index + 1}. GET /rest/v1/${endpoint}`);
  });
  
  console.log('');
  console.log('📝 How to test:');
  console.log('1. Navigate to different pages in the app');
  console.log('2. Watch Network tab for requests to these endpoints');
  console.log('3. Look for 400 status codes');
  console.log('4. Click on failed requests to see error details');
}

// Function to force error capture
function forceErrorCapture() {
  console.log('🔄 FORCING ERROR CAPTURE...');
  
  // Trigger a page refresh to capture errors on load
  console.log('1. Refreshing page to capture load errors...');
  
  // Set up error capture before refresh
  if (window.capturedErrors) {
    console.log(`📊 Current captured errors: ${window.capturedErrors.length}`);
  }
  
  // Manual refresh instruction
  console.log('');
  console.log('🔄 MANUAL REFRESH INSTRUCTIONS:');
  console.log('1. Keep DevTools open');
  console.log('2. Go to Network tab');
  console.log('3. Press F5 or Ctrl+R to refresh');
  console.log('4. Watch for 400 errors during page load');
  console.log('5. Run captureAll400Errors() again after refresh');
}

// Main execution
console.log('🚀 RUNNING MANUAL 400 ERROR CAPTURE...');
console.log('======================================');

// Make functions available globally
window.captureAll400Errors = captureAll400Errors;
window.test400Endpoints = test400Endpoints;
window.forceErrorCapture = forceErrorCapture;

// Auto-run the capture
const results = captureAll400Errors();

// Additional manual tests
console.log('');
console.log('🔧 ADDITIONAL MANUAL TESTS AVAILABLE:');
console.log('=====================================');
console.log('• captureAll400Errors() - Run error capture again');
console.log('• test400Endpoints() - Get endpoint testing guide');  
console.log('• forceErrorCapture() - Force refresh and capture');
console.log('• sendErrors() - Send current errors to server');

// Final instructions
console.log('');
console.log('🎯 IMMEDIATE ACTION REQUIRED:');
console.log('=============================');
console.log('1. Check the Network tab NOW for any red (failed) requests');
console.log('2. Look specifically for requests to supabase.co with 400 status');
console.log('3. Click on any 400 errors to see the exact error message');
console.log('4. Copy the error messages and share them for analysis');
console.log('5. Run sendErrors() to save current state to error_logs/');

console.log('');
console.log('✅ Manual 400 error capture script loaded and executed!');

// Return results for further analysis
results;
