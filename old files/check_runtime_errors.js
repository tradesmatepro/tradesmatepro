// Runtime Error Checker for TradeMate Pro
// Following How tos Guide #3 - Developer Tools and Logs

console.log('🔍 CHECKING FOR RUNTIME ERRORS...');

// Step 1: Check if error capture is working
if (typeof window !== 'undefined') {
  console.log('✅ Running in browser environment');
  
  // Check if error capture functions are available
  if (window.getAllCapturedErrors) {
    console.log('✅ getAllCapturedErrors function available');
    const errors = window.getAllCapturedErrors();
    console.log('📊 Captured Errors:', errors);
    
    if (errors && errors.length > 0) {
      console.log('🚨 FOUND RUNTIME ERRORS:');
      errors.forEach((error, index) => {
        console.log(`Error ${index + 1}:`, error);
      });
    } else {
      console.log('✅ No captured errors found');
    }
  } else {
    console.log('❌ getAllCapturedErrors function not available');
  }
  
  if (window.analyzeErrors) {
    console.log('✅ analyzeErrors function available');
    const analysis = window.analyzeErrors();
    console.log('🔬 Error Analysis:', analysis);
  } else {
    console.log('❌ analyzeErrors function not available');
  }
  
} else {
  console.log('❌ Not running in browser environment');
}

// Step 2: Check for common React errors
console.log('🔍 Checking for common React errors...');

// Check for unhandled promise rejections
window.addEventListener('unhandledrejection', function(event) {
  console.log('🚨 UNHANDLED PROMISE REJECTION:', event.reason);
});

// Check for general errors
window.addEventListener('error', function(event) {
  console.log('🚨 GENERAL ERROR:', event.error);
});

// Step 3: Check console for existing errors
console.log('🔍 Checking console for existing errors...');
const originalError = console.error;
const originalWarn = console.warn;

let errorCount = 0;
let warnCount = 0;

console.error = function(...args) {
  errorCount++;
  console.log(`🚨 CONSOLE ERROR #${errorCount}:`, ...args);
  originalError.apply(console, args);
};

console.warn = function(...args) {
  warnCount++;
  console.log(`⚠️ CONSOLE WARNING #${warnCount}:`, ...args);
  originalWarn.apply(console, args);
};

// Step 4: Test basic app functionality
setTimeout(() => {
  console.log('📊 RUNTIME ERROR SUMMARY:');
  console.log(`- Errors captured: ${errorCount}`);
  console.log(`- Warnings captured: ${warnCount}`);
  
  if (errorCount === 0 && warnCount === 0) {
    console.log('✅ No runtime errors detected!');
  } else {
    console.log('🚨 Runtime issues detected - check logs above');
  }
}, 2000);

console.log('🔍 Runtime error checker initialized');
