/**
 * Simple script to check captured errors
 * Run this in browser console to see what errors have been captured
 */

function checkCapturedErrors() {
  console.log('=== CAPTURED ERRORS REPORT ===');
  
  if (window.capturedErrors && window.capturedErrors.length > 0) {
    console.log(`Found ${window.capturedErrors.length} captured errors:`);
    window.capturedErrors.forEach((error, index) => {
      console.log(`\n--- ERROR ${index + 1} ---`);
      console.log(`Time: ${error.timestamp}`);
      console.log(`Message: ${error.message}`);
      console.log(`Stack: ${error.stack}`);
    });
  } else {
    console.log('No errors captured yet');
  }
  
  if (window.capturedWarnings && window.capturedWarnings.length > 0) {
    console.log(`\nFound ${window.capturedWarnings.length} captured warnings:`);
    window.capturedWarnings.forEach((warning, index) => {
      console.log(`\n--- WARNING ${index + 1} ---`);
      console.log(`Time: ${warning.timestamp}`);
      console.log(`Message: ${warning.message}`);
    });
  } else {
    console.log('No warnings captured yet');
  }
  
  if (window.capturedLogs && window.capturedLogs.length > 0) {
    console.log(`\nFound ${window.capturedLogs.length} captured logs (showing last 10):`);
    const recentLogs = window.capturedLogs.slice(-10);
    recentLogs.forEach((log, index) => {
      console.log(`${log.timestamp}: ${log.message}`);
    });
  }
  
  console.log('\n=== END REPORT ===');
  
  // Return data for programmatic access
  return {
    errors: window.capturedErrors || [],
    warnings: window.capturedWarnings || [],
    logs: window.capturedLogs || []
  };
}

// Make it globally available
window.checkCapturedErrors = checkCapturedErrors;

// Auto-run on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(checkCapturedErrors, 2000); // Wait 2 seconds for app to load
  });
} else {
  setTimeout(checkCapturedErrors, 2000);
}
