// Test for Runtime Errors in TradeMate Pro
// Following How tos Guide #3 - Developer Tools and Automation

const puppeteer = require('puppeteer');

async function testRuntimeErrors() {
  console.log('🔍 TESTING FOR RUNTIME ERRORS IN TRADEMATE PRO');
  
  let browser;
  let errors = [];
  let warnings = [];
  let networkErrors = [];
  
  try {
    browser = await puppeteer.launch({ 
      headless: false,
      devtools: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Capture console errors
    page.on('console', msg => {
      const text = msg.text();
      const type = msg.type();
      
      if (type === 'error') {
        errors.push({
          type: 'CONSOLE_ERROR',
          message: text,
          timestamp: new Date().toISOString()
        });
        console.log(`🚨 CONSOLE ERROR: ${text}`);
      } else if (type === 'warning') {
        warnings.push({
          type: 'CONSOLE_WARNING', 
          message: text,
          timestamp: new Date().toISOString()
        });
        console.log(`⚠️ CONSOLE WARNING: ${text}`);
      }
    });
    
    // Capture page errors
    page.on('pageerror', error => {
      errors.push({
        type: 'PAGE_ERROR',
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      console.log(`🚨 PAGE ERROR: ${error.message}`);
    });
    
    // Capture network failures
    page.on('requestfailed', request => {
      networkErrors.push({
        type: 'NETWORK_ERROR',
        url: request.url(),
        method: request.method(),
        failure: request.failure()?.errorText,
        timestamp: new Date().toISOString()
      });
      console.log(`🌐 NETWORK ERROR: ${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
    });
    
    console.log('📋 STEP 1: Loading TradeMate Pro...');
    
    // Navigate to the app
    await page.goto('http://localhost:3001', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    console.log('   ✅ App loaded, waiting for initialization...');
    await page.waitForTimeout(5000);
    
    console.log('📋 STEP 2: Checking for captured errors...');
    
    // Check if error capture functions are available
    const errorCaptureAvailable = await page.evaluate(() => {
      return {
        getAllCapturedErrors: typeof window.getAllCapturedErrors === 'function',
        analyzeErrors: typeof window.analyzeErrors === 'function',
        capturedErrors: window.capturedErrors ? window.capturedErrors.length : 0,
        capturedWarnings: window.capturedWarnings ? window.capturedWarnings.length : 0
      };
    });
    
    console.log('   📊 Error Capture Status:', errorCaptureAvailable);
    
    if (errorCaptureAvailable.getAllCapturedErrors) {
      const capturedErrors = await page.evaluate(() => {
        return window.getAllCapturedErrors();
      });
      
      console.log('   📊 Captured Errors:', capturedErrors);
      
      if (capturedErrors && capturedErrors.errors && capturedErrors.errors.length > 0) {
        console.log('🚨 FOUND CAPTURED RUNTIME ERRORS:');
        capturedErrors.errors.forEach((error, index) => {
          console.log(`   Error ${index + 1}:`, error);
          errors.push({
            type: 'CAPTURED_ERROR',
            ...error
          });
        });
      }
    }
    
    console.log('📋 STEP 3: Testing basic navigation...');
    
    // Try to navigate to different pages to trigger any errors
    const testPages = [
      '/dashboard',
      '/customers', 
      '/quotes',
      '/jobs',
      '/invoices',
      '/developer-tools'
    ];
    
    for (const testPage of testPages) {
      try {
        console.log(`   Testing page: ${testPage}`);
        await page.goto(`http://localhost:3001${testPage}`, { 
          waitUntil: 'domcontentloaded',
          timeout: 10000 
        });
        await page.waitForTimeout(2000);
      } catch (error) {
        console.log(`   ❌ Error loading ${testPage}: ${error.message}`);
        errors.push({
          type: 'NAVIGATION_ERROR',
          page: testPage,
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    console.log('📋 STEP 4: Final error check...');
    
    // Final check for any new captured errors
    if (errorCaptureAvailable.getAllCapturedErrors) {
      const finalCapturedErrors = await page.evaluate(() => {
        return window.getAllCapturedErrors();
      });
      
      if (finalCapturedErrors && finalCapturedErrors.errors) {
        const newErrors = finalCapturedErrors.errors.slice(errorCaptureAvailable.capturedErrors);
        if (newErrors.length > 0) {
          console.log('🚨 NEW ERRORS FOUND DURING TESTING:');
          newErrors.forEach((error, index) => {
            console.log(`   New Error ${index + 1}:`, error);
          });
        }
      }
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    errors.push({
      type: 'TEST_ERROR',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
  
  // Generate report
  console.log('\n📊 RUNTIME ERROR TEST RESULTS:');
  console.log(`- Total Errors: ${errors.length}`);
  console.log(`- Total Warnings: ${warnings.length}`);
  console.log(`- Network Errors: ${networkErrors.length}`);
  
  if (errors.length === 0 && warnings.length === 0 && networkErrors.length === 0) {
    console.log('✅ NO RUNTIME ERRORS DETECTED!');
    return { success: true, errors: [], warnings: [], networkErrors: [] };
  } else {
    console.log('🚨 RUNTIME ISSUES DETECTED:');
    
    if (errors.length > 0) {
      console.log('\n🚨 ERRORS:');
      errors.forEach((error, index) => {
        console.log(`${index + 1}. [${error.type}] ${error.message}`);
      });
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️ WARNINGS:');
      warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning.message}`);
      });
    }
    
    if (networkErrors.length > 0) {
      console.log('\n🌐 NETWORK ERRORS:');
      networkErrors.forEach((netError, index) => {
        console.log(`${index + 1}. ${netError.method} ${netError.url} - ${netError.failure}`);
      });
    }
    
    return { success: false, errors, warnings, networkErrors };
  }
}

// Run the test
if (require.main === module) {
  testRuntimeErrors().then(result => {
    process.exit(result.success ? 0 : 1);
  }).catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = testRuntimeErrors;
