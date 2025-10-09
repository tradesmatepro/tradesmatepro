/**
 * Test Export Functionality
 * 
 * This script tests if the export functions are working correctly
 * Run this in the browser console on /developer-tools page
 */

console.log('🧪 Testing Export Functionality...');

// Test 1: Check if export functions are available
console.log('\n📋 Test 1: Checking if export functions are available...');
const functions = ['exportAllErrors', 'startAutoExport', 'stopAutoExport', 'quickExport'];
functions.forEach(func => {
  if (typeof window[func] === 'function') {
    console.log(`✅ ${func} is available`);
  } else {
    console.log(`❌ ${func} is NOT available`);
  }
});

// Test 2: Check if error capture systems are working
console.log('\n📋 Test 2: Checking error capture systems...');
console.log(`capturedErrors: ${window.capturedErrors?.length || 0} items`);
console.log(`capturedWarnings: ${window.capturedWarnings?.length || 0} items`);
console.log(`capturedLogs: ${window.capturedLogs?.length || 0} items`);
console.log(`consoleErrorDetector: ${window.consoleErrorDetector ? 'Available' : 'Not available'}`);
console.log(`enhancedLogs: ${window.__capturedLogs?.length || 0} items`);

// Test 3: Generate some test data
console.log('\n📋 Test 3: Generating test data...');
console.log('This is a test log message');
console.warn('This is a test warning message');
console.error('This is a test error message');

// Test 4: Try a quick export
console.log('\n📋 Test 4: Testing quick export...');
if (typeof window.quickExport === 'function') {
  try {
    const result = window.quickExport();
    console.log(`✅ Export successful! Exported ${result.summary.totalErrors} errors, ${result.summary.totalWarnings} warnings, ${result.summary.totalLogs} logs`);
  } catch (error) {
    console.log(`❌ Export failed: ${error.message}`);
  }
} else {
  console.log('❌ quickExport function not available');
}

console.log('\n✅ Export functionality test complete!');
