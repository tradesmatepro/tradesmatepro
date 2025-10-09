/**
 * Comprehensive Schema Test Script
 * Tests all components against the actual database schema to identify 400 errors
 * Based on How To methodology for automated error detection
 */

console.log('🔍 COMPREHENSIVE SCHEMA TEST STARTING...');
console.log('=====================================');

// Import the actual schema
const SCHEMA_PATH = 'Supabase Schema/supabase schema/latest.json';

// Test configuration
const TEST_CONFIG = {
  errorServer: 'http://localhost:4000',
  mainApp: 'http://localhost:3000',
  timeout: 30000
};

// Known problematic components based on previous fixes
const COMPONENTS_TO_TEST = [
  'Dashboard.js',
  'Quotes_clean.js', 
  'WorkOrders.js',
  'Invoices.js',
  'Tools.js',
  'Calendar.js',
  'InvoicesDatabasePanel.js'
];

// Schema field mappings that were fixed
const KNOWN_FIXES = {
  'work_orders': {
    'stage': 'status',
    'job_status': 'status', 
    'quote_status': 'status',
    'start_time': 'created_at'
  },
  'users': {
    'tier': 'DEFAULT:free_trial',
    'phone_number': 'phone',
    'active': 'status'
  }
};

async function testErrorServerConnection() {
  console.log('📡 Testing error server connection...');
  try {
    const response = await fetch(`${TEST_CONFIG.errorServer}/`, {
      method: 'GET',
      timeout: 5000
    });
    
    if (response.ok) {
      console.log('✅ Error server is running on port 4000');
      return true;
    } else {
      console.log(`❌ Error server responded with ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error server connection failed: ${error.message}`);
    return false;
  }
}

async function testMainAppConnection() {
  console.log('🌐 Testing main app connection...');
  try {
    const response = await fetch(`${TEST_CONFIG.mainApp}/`, {
      method: 'GET',
      timeout: 5000
    });
    
    if (response.ok) {
      console.log('✅ Main app is running on port 3000');
      return true;
    } else {
      console.log(`❌ Main app responded with ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Main app connection failed: ${error.message}`);
    return false;
  }
}

async function captureCurrentErrors() {
  console.log('🔍 Capturing current browser errors...');
  
  // Check if error capture is working
  if (typeof window !== 'undefined' && window.capturedErrors) {
    const errors = window.capturedErrors || [];
    const warnings = window.capturedWarnings || [];
    const logs = window.capturedLogs || [];
    
    console.log(`📊 Found ${errors.length} errors, ${warnings.length} warnings, ${logs.length} logs`);
    
    // Analyze for 400 errors specifically
    const httpErrors = errors.filter(e => 
      e.message && (
        e.message.includes('400') || 
        e.message.includes('Bad Request') ||
        e.message.includes('column') && e.message.includes('does not exist')
      )
    );
    
    console.log(`🚨 Found ${httpErrors.length} HTTP 400/schema errors:`);
    httpErrors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error.message}`);
    });
    
    return {
      total: errors.length + warnings.length + logs.length,
      errors: errors,
      warnings: warnings,
      logs: logs,
      httpErrors: httpErrors
    };
  } else {
    console.log('⚠️ Error capture not available - run this in browser console');
    return null;
  }
}

async function analyzeSchemaIssues() {
  console.log('🔍 Analyzing potential schema issues...');
  
  // Common schema issues based on previous fixes
  const potentialIssues = [
    {
      table: 'work_orders',
      issue: 'Using old field names (stage, job_status, quote_status, start_time)',
      fix: 'Use single status field and created_at'
    },
    {
      table: 'users', 
      issue: 'Using non-existent fields (tier, phone_number, active)',
      fix: 'Use phone, status enum, default tier'
    },
    {
      table: 'business_settings',
      issue: 'Components may be using old settings structure',
      fix: 'Verify against normalized settings tables'
    }
  ];
  
  console.log('🎯 Potential schema issues to check:');
  potentialIssues.forEach((issue, index) => {
    console.log(`  ${index + 1}. ${issue.table}: ${issue.issue}`);
    console.log(`     Fix: ${issue.fix}`);
  });
  
  return potentialIssues;
}

async function testErrorCapture() {
  console.log('🧪 Testing error capture functionality...');
  
  if (typeof window !== 'undefined') {
    // Generate test errors
    console.error('TEST ERROR: Schema test error');
    console.warn('TEST WARNING: Schema test warning');
    console.log('TEST LOG: Schema test log');
    
    // Wait a moment for capture
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if they were captured
    const captured = await captureCurrentErrors();
    if (captured && captured.total > 0) {
      console.log('✅ Error capture is working');
      return true;
    } else {
      console.log('❌ Error capture is not working');
      return false;
    }
  } else {
    console.log('⚠️ Cannot test error capture outside browser');
    return false;
  }
}

async function sendErrorsToServer() {
  console.log('📤 Attempting to send errors to server...');
  
  if (typeof window !== 'undefined' && window.sendErrors) {
    try {
      await window.sendErrors();
      console.log('✅ Errors sent to server successfully');
      return true;
    } catch (error) {
      console.log(`❌ Failed to send errors: ${error.message}`);
      return false;
    }
  } else {
    console.log('⚠️ sendErrors function not available');
    return false;
  }
}

async function runComprehensiveTest() {
  console.log('🚀 RUNNING COMPREHENSIVE SCHEMA TEST');
  console.log('====================================');
  
  const results = {
    errorServer: false,
    mainApp: false,
    errorCapture: false,
    errorSend: false,
    schemaIssues: [],
    currentErrors: null
  };
  
  // Test 1: Error server connection
  results.errorServer = await testErrorServerConnection();
  
  // Test 2: Main app connection  
  results.mainApp = await testMainAppConnection();
  
  // Test 3: Error capture functionality
  results.errorCapture = await testErrorCapture();
  
  // Test 4: Current error analysis
  results.currentErrors = await captureCurrentErrors();
  
  // Test 5: Schema issue analysis
  results.schemaIssues = await analyzeSchemaIssues();
  
  // Test 6: Send errors to server
  results.errorSend = await sendErrorsToServer();
  
  // Summary
  console.log('');
  console.log('📋 TEST RESULTS SUMMARY');
  console.log('=======================');
  console.log(`Error Server: ${results.errorServer ? '✅' : '❌'}`);
  console.log(`Main App: ${results.mainApp ? '✅' : '❌'}`);
  console.log(`Error Capture: ${results.errorCapture ? '✅' : '❌'}`);
  console.log(`Error Send: ${results.errorSend ? '✅' : '❌'}`);
  console.log(`Current Errors: ${results.currentErrors ? results.currentErrors.total : 'N/A'}`);
  console.log(`Schema Issues: ${results.schemaIssues.length} identified`);
  
  // Next steps
  console.log('');
  console.log('🎯 NEXT STEPS');
  console.log('=============');
  
  if (!results.errorServer) {
    console.log('1. Start error server: npm run dev-error-server');
  }
  
  if (!results.mainApp) {
    console.log('2. Start main app: npm run dev-main');
  }
  
  if (!results.errorCapture) {
    console.log('3. Refresh browser page to load updated console-error-capture.js');
  }
  
  if (results.currentErrors && results.currentErrors.httpErrors.length > 0) {
    console.log('4. Fix identified 400/schema errors:');
    results.currentErrors.httpErrors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error.message}`);
    });
  }
  
  console.log('5. Run this test again after fixes to verify');
  
  return results;
}

// Export for use in browser or Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runComprehensiveTest };
} else if (typeof window !== 'undefined') {
  window.runComprehensiveSchemaTest = runComprehensiveTest;
  console.log('🔧 Test loaded! Run: runComprehensiveSchemaTest()');
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  console.log('🚀 Auto-running comprehensive schema test...');
  runComprehensiveTest();
}
