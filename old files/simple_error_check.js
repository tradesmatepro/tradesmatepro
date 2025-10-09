// Simple Runtime Error Check for TradeMate Pro
// Following How tos Guide #3 - Developer Tools and Automation
//
// INSTRUCTIONS:
// 1. Open browser to http://localhost:3001
// 2. Open Developer Tools (F12)
// 3. Go to Console tab
// 4. Copy and paste this entire script
// 5. Press Enter to run

console.log('🔍 SIMPLE RUNTIME ERROR CHECK');
console.log('===============================');
console.log('📋 Checking TradeMate Pro for runtime errors...');

// Check if we're in browser environment
if (typeof window !== 'undefined') {
  console.log('✅ Running in browser environment');
  
  // Step 1: Check error capture functions
  console.log('\n📋 STEP 1: Checking Error Capture Functions');
  
  if (window.getAllCapturedErrors) {
    console.log('✅ getAllCapturedErrors function available');
    
    try {
      const errors = window.getAllCapturedErrors();
      console.log('📊 Captured Errors Result:', errors);
      
      if (errors && errors.errors && errors.errors.length > 0) {
        console.log('🚨 FOUND RUNTIME ERRORS:');
        errors.errors.forEach((error, index) => {
          console.log(`   Error ${index + 1}:`, error);
        });
      } else {
        console.log('✅ No captured errors found');
      }
      
      if (errors && errors.warnings && errors.warnings.length > 0) {
        console.log('⚠️ FOUND WARNINGS:');
        errors.warnings.forEach((warning, index) => {
          console.log(`   Warning ${index + 1}:`, warning);
        });
      } else {
        console.log('✅ No captured warnings found');
      }
      
    } catch (error) {
      console.log('❌ Error calling getAllCapturedErrors:', error);
    }
  } else {
    console.log('❌ getAllCapturedErrors function not available');
  }
  
  if (window.analyzeErrors) {
    console.log('✅ analyzeErrors function available');
    
    try {
      const analysis = window.analyzeErrors();
      console.log('🔬 Error Analysis:', analysis);
    } catch (error) {
      console.log('❌ Error calling analyzeErrors:', error);
    }
  } else {
    console.log('❌ analyzeErrors function not available');
  }
  
  // Step 2: Check for common error indicators
  console.log('\n📋 STEP 2: Checking for Common Error Indicators');
  
  // Check for React error boundaries
  const errorBoundaries = document.querySelectorAll('[data-error-boundary]');
  if (errorBoundaries.length > 0) {
    console.log('🚨 Found active error boundaries:', errorBoundaries.length);
    errorBoundaries.forEach((boundary, index) => {
      console.log(`   Error Boundary ${index + 1}:`, boundary);
    });
  } else {
    console.log('✅ No active error boundaries found');
  }
  
  // Check for error messages in DOM
  const errorMessages = document.querySelectorAll('.error, .alert-error, [class*="error"]');
  if (errorMessages.length > 0) {
    console.log('⚠️ Found potential error elements in DOM:', errorMessages.length);
    errorMessages.forEach((element, index) => {
      if (element.textContent && element.textContent.trim()) {
        console.log(`   Error Element ${index + 1}:`, element.textContent.trim());
      }
    });
  } else {
    console.log('✅ No error elements found in DOM');
  }
  
  // Step 3: Check network requests
  console.log('\n📋 STEP 3: Monitoring Network Requests');
  
  // Override fetch to monitor for errors
  const originalFetch = window.fetch;
  let networkErrorCount = 0;
  
  window.fetch = function(...args) {
    return originalFetch.apply(this, args).then(response => {
      if (!response.ok) {
        networkErrorCount++;
        console.log(`🌐 NETWORK ERROR ${networkErrorCount}: ${response.status} ${response.statusText} - ${args[0]}`);
      }
      return response;
    }).catch(error => {
      networkErrorCount++;
      console.log(`🌐 NETWORK FAILURE ${networkErrorCount}: ${error.message} - ${args[0]}`);
      throw error;
    });
  };
  
  // Step 4: Set up error listeners
  console.log('\n📋 STEP 4: Setting Up Error Listeners');
  
  let runtimeErrorCount = 0;
  let promiseRejectionCount = 0;
  
  window.addEventListener('error', function(event) {
    runtimeErrorCount++;
    console.log(`🚨 RUNTIME ERROR ${runtimeErrorCount}:`, {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    });
  });
  
  window.addEventListener('unhandledrejection', function(event) {
    promiseRejectionCount++;
    console.log(`🚨 UNHANDLED PROMISE REJECTION ${promiseRejectionCount}:`, event.reason);
  });
  
  // Step 5: Test basic functionality
  console.log('\n📋 STEP 5: Testing Basic Functionality');
  
  setTimeout(() => {
    console.log('\n📊 FINAL RUNTIME ERROR SUMMARY:');
    console.log('================================');
    console.log(`- Runtime Errors: ${runtimeErrorCount}`);
    console.log(`- Promise Rejections: ${promiseRejectionCount}`);
    console.log(`- Network Errors: ${networkErrorCount}`);
    
    if (runtimeErrorCount === 0 && promiseRejectionCount === 0 && networkErrorCount === 0) {
      console.log('✅ NO NEW RUNTIME ERRORS DETECTED!');
    } else {
      console.log('🚨 RUNTIME ISSUES DETECTED - Check logs above');
    }
    
    // Try to get final captured errors
    if (window.getAllCapturedErrors) {
      try {
        const finalErrors = window.getAllCapturedErrors();
        console.log('\n📊 FINAL CAPTURED ERRORS:', finalErrors);
      } catch (error) {
        console.log('❌ Error getting final captured errors:', error);
      }
    }
    
  }, 3000);
  
  console.log('✅ Error monitoring initialized - waiting 3 seconds for results...');
  
} else {
  console.log('❌ Not running in browser environment');
  console.log('This script should be run in the browser console');
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.runErrorCheck = function() {
    // Re-run the error check
    console.log('🔄 Re-running error check...');
    
    if (window.getAllCapturedErrors) {
      const errors = window.getAllCapturedErrors();
      console.log('📊 Current Captured Errors:', errors);
      return errors;
    } else {
      console.log('❌ Error capture not available');
      return null;
    }
  };
  
  console.log('💡 TIP: Run window.runErrorCheck() to check for errors again');
}
