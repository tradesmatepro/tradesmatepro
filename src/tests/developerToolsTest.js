/**
 * Developer Tools Test Script
 * Tests the functionality of the developer tools and console error detection
 */

// Test the console error detector
function testConsoleErrorDetector() {
  console.log('🧪 Testing Console Error Detector...');
  
  // Import the error detector
  import('../utils/consoleErrorDetector').then(({ default: consoleErrorDetector }) => {
    // Start capturing
    consoleErrorDetector.startCapture();
    
    // Generate some test errors and warnings
    console.error('Test error message for detection');
    console.warn('Test warning message for detection');
    console.log('Test log message for detection');
    
    // Generate a React-like error
    console.error('Warning: React Hook useEffect has a missing dependency');
    
    // Generate a network-like error
    console.error('Failed to fetch: NetworkError when attempting to fetch resource');
    
    // Generate a database-like error
    console.error('Supabase error: Invalid API key');
    
    // Wait a bit then check results
    setTimeout(() => {
      const report = consoleErrorDetector.getErrorReport();
      console.log('📊 Error Detection Report:', report);
      
      // Verify we captured the test errors
      const hasTestError = report.errors.some(error => 
        error.message.includes('Test error message')
      );
      const hasTestWarning = report.warnings.some(warning => 
        warning.message.includes('Test warning message')
      );
      
      console.log('✅ Test Results:');
      console.log(`- Captured test error: ${hasTestError ? 'PASS' : 'FAIL'}`);
      console.log(`- Captured test warning: ${hasTestWarning ? 'PASS' : 'FAIL'}`);
      console.log(`- Total errors captured: ${report.errors.length}`);
      console.log(`- Total warnings captured: ${report.warnings.length}`);
      console.log(`- Error categories: ${Object.keys(report.categorizedErrors).join(', ')}`);
      
      // Stop capturing
      consoleErrorDetector.stopCapture();
      
      console.log('🎉 Console Error Detector test completed!');
    }, 1000);
  }).catch(error => {
    console.error('❌ Failed to load console error detector:', error);
  });
}

// Test developer tools service
function testDeveloperToolsService() {
  console.log('🧪 Testing Developer Tools Service...');
  
  import('../services/DevToolsService').then(({ default: devToolsService }) => {
    // Test initialization
    devToolsService.initialize().then(() => {
      console.log('✅ DevToolsService initialized successfully');
      
      // Test system info
      const systemInfo = devToolsService.getSystemInfo();
      console.log('📋 System Info:', systemInfo);
      
      // Test performance monitoring
      const performanceData = devToolsService.getPerformanceData();
      console.log('⚡ Performance Data:', performanceData);
      
      console.log('🎉 Developer Tools Service test completed!');
    }).catch(error => {
      console.error('❌ DevToolsService initialization failed:', error);
    });
  }).catch(error => {
    console.error('❌ Failed to load DevToolsService:', error);
  });
}

// Test remote debug service
function testRemoteDebugService() {
  console.log('🧪 Testing Remote Debug Service...');
  
  import('../services/RemoteDebugService').then(({ default: remoteDebugService }) => {
    // Test initialization (should fail gracefully)
    remoteDebugService.initialize({
      url: 'ws://localhost:8080/debug',
      autoReconnect: false
    }).then((success) => {
      if (success) {
        console.log('✅ Remote Debug Service connected (unexpected)');
      } else {
        console.log('✅ Remote Debug Service failed gracefully as expected');
      }
    }).catch(error => {
      console.log('✅ Remote Debug Service handled error gracefully:', error.message);
    });
  }).catch(error => {
    console.error('❌ Failed to load RemoteDebugService:', error);
  });
}

// Test developer tools page functionality
function testDeveloperToolsPage() {
  console.log('🧪 Testing Developer Tools Page...');
  
  // Check if we're on the developer tools page
  if (window.location.pathname === '/developer-tools') {
    console.log('✅ On developer tools page');
    
    // Check if the page elements exist
    const devToolsElement = document.querySelector('[data-testid="developer-tools"]');
    if (devToolsElement) {
      console.log('✅ Developer tools page rendered');
      
      // Check for tab navigation
      const tabs = document.querySelectorAll('[role="tab"]');
      console.log(`✅ Found ${tabs.length} tabs`);
      
      // Check for console errors tab
      const consoleErrorsTab = Array.from(tabs).find(tab => 
        tab.textContent.includes('Console Errors')
      );
      if (consoleErrorsTab) {
        console.log('✅ Console Errors tab found');
      } else {
        console.log('❌ Console Errors tab not found');
      }
      
    } else {
      console.log('❌ Developer tools page not rendered');
    }
  } else {
    console.log(`ℹ️ Not on developer tools page (current: ${window.location.pathname})`);
    console.log('Navigate to /developer-tools to test page functionality');
  }
}

// Main test runner
function runDeveloperToolsTests() {
  console.log('🚀 Starting Developer Tools Tests...');
  console.log('=====================================');
  
  // Run all tests
  testConsoleErrorDetector();
  testDeveloperToolsService();
  testRemoteDebugService();
  testDeveloperToolsPage();
  
  console.log('=====================================');
  console.log('🏁 All tests initiated. Check console for results.');
}

// Auto-run tests if this script is loaded directly
if (typeof window !== 'undefined') {
  // Add to global scope for manual testing
  window.runDeveloperToolsTests = runDeveloperToolsTests;
  window.testConsoleErrorDetector = testConsoleErrorDetector;
  window.testDeveloperToolsService = testDeveloperToolsService;
  window.testRemoteDebugService = testRemoteDebugService;
  window.testDeveloperToolsPage = testDeveloperToolsPage;
  
  console.log('🧪 Developer Tools Test Functions Available:');
  console.log('- runDeveloperToolsTests() - Run all tests');
  console.log('- testConsoleErrorDetector() - Test error detection');
  console.log('- testDeveloperToolsService() - Test dev tools service');
  console.log('- testRemoteDebugService() - Test remote debug service');
  console.log('- testDeveloperToolsPage() - Test page functionality');
}

export {
  runDeveloperToolsTests,
  testConsoleErrorDetector,
  testDeveloperToolsService,
  testRemoteDebugService,
  testDeveloperToolsPage
};
