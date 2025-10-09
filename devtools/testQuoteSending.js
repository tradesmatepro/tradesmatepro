/**
 * Test Quote Sending Functionality
 * 
 * This test will:
 * 1. Navigate to quotes page
 * 2. Open the first quote
 * 3. Click Edit
 * 4. Click "Save and Send to Customer"
 * 5. Choose Email
 * 6. Click Send Quote
 * 7. Monitor for errors and functionality
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const config = require('../AIDevTools/aiBridgeConfig');

const APP_URL = 'http://localhost:3004';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots', 'quote-test');
const SCREENSHOT_API = config.ANALYSIS_ENDPOINT;

// Test credentials
const TEST_EMAIL = config.TEST_CREDENTIALS.email;
const TEST_PASSWORD = config.TEST_CREDENTIALS.password;

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

/**
 * Send screenshot to analysis API
 */
async function analyzeScreenshot(screenshotPath, context) {
  try {
    const imageBuffer = fs.readFileSync(screenshotPath);
    const imageBase64 = imageBuffer.toString('base64');

    const response = await axios.post(SCREENSHOT_API, {
      image_base64: imageBase64,
      context: context
    });

    if (response.data && response.data.analysis) {
      console.log(`   🔍 Analysis: ${response.data.analysis.summary}`);
      return response.data.analysis;
    }
  } catch (err) {
    console.log(`   ⚠️  Screenshot analysis unavailable: ${err.message}`);
    return null;
  }
}

async function testQuoteSending() {
  let browser;
  let page;
  
  const results = {
    timestamp: new Date().toISOString(),
    steps: [],
    errors: [],
    screenshots: [],
    success: false
  };

  try {
    console.log('🚀 Starting Quote Sending Test...');
    console.log('═'.repeat(60));

    // Step 1: Launch browser
    console.log('\n📋 Step 1: Launching browser...');
    browser = await chromium.launch({
      headless: false,
      slowMo: 500 // Slow down to see what's happening
    });
    page = await browser.newPage();
    
    // Set up console listener to capture errors
    const consoleMessages = [];
    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push({
        type: msg.type(),
        text: text,
        timestamp: new Date().toISOString()
      });
      
      if (msg.type() === 'error') {
        console.log(`   ❌ Console Error: ${text}`);
        results.errors.push({
          type: 'console',
          message: text,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Set up network listener to capture failed requests
    page.on('requestfailed', request => {
      const failure = {
        url: request.url(),
        method: request.method(),
        failure: request.failure().errorText,
        timestamp: new Date().toISOString()
      };
      
      console.log(`   ❌ Network Error: ${request.method()} ${request.url()} - ${request.failure().errorText}`);
      results.errors.push({
        type: 'network',
        ...failure
      });
    });

    results.steps.push({ step: 1, action: 'Launch browser', status: 'success' });

    // Step 2: Login
    console.log('\n📋 Step 2: Logging in...');
    await page.goto(`${APP_URL}/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Fill login form
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);

    const screenshot1 = path.join(SCREENSHOTS_DIR, '01-login-page.png');
    await page.screenshot({ path: screenshot1, fullPage: true });
    results.screenshots.push(screenshot1);
    console.log(`   📸 Screenshot saved: ${screenshot1}`);
    await analyzeScreenshot(screenshot1, 'login-page');

    // Click login button
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    const screenshot2 = path.join(SCREENSHOTS_DIR, '02-after-login.png');
    await page.screenshot({ path: screenshot2, fullPage: true });
    results.screenshots.push(screenshot2);
    console.log(`   📸 Screenshot saved: ${screenshot2}`);
    await analyzeScreenshot(screenshot2, 'after-login');

    // Verify login succeeded
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.log('   ❌ Login failed - still on login page');
      results.errors.push({
        type: 'auth',
        message: 'Login failed - credentials may be incorrect',
        timestamp: new Date().toISOString()
      });
      throw new Error('Login failed');
    }

    console.log(`   ✅ Login successful - redirected to ${currentUrl}`);
    results.steps.push({ step: 2, action: 'Login', status: 'success' });

    // Step 3: Navigate to quotes page
    console.log('\n📋 Step 3: Navigating to quotes page...');
    await page.goto(`${APP_URL}/quotes`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const screenshot3 = path.join(SCREENSHOTS_DIR, '03-quotes-page.png');
    await page.screenshot({ path: screenshot3, fullPage: true });
    results.screenshots.push(screenshot3);
    console.log(`   📸 Screenshot saved: ${screenshot3}`);
    await analyzeScreenshot(screenshot3, 'quotes-page');

    results.steps.push({ step: 3, action: 'Navigate to quotes page', status: 'success' });

    // Step 4: Find and click the first quote
    console.log('\n📋 Step 4: Finding first quote...');

    // Wait for table to load - look for tbody with rows
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    // Check if there are any quotes
    const quoteRows = await page.locator('table tbody tr').count();
    console.log(`   Found ${quoteRows} rows in table`);

    if (quoteRows === 0) {
      throw new Error('No quotes found in table');
    }

    // Click the first quote row (skip if it's the "no quotes" message)
    const firstRow = page.locator('table tbody tr').first();
    const hasQuoteData = await firstRow.locator('td').count() > 1;

    if (!hasQuoteData) {
      throw new Error('First row does not contain quote data');
    }

    await firstRow.click();
    await page.waitForTimeout(1000);

    const screenshot4 = path.join(SCREENSHOTS_DIR, '04-quote-clicked.png');
    await page.screenshot({ path: screenshot4, fullPage: true });
    results.screenshots.push(screenshot4);
    console.log(`   📸 Screenshot saved: ${screenshot4}`);
    await analyzeScreenshot(screenshot4, 'quote-clicked');

    results.steps.push({ step: 4, action: 'Click first quote', status: 'success' });

    // Step 5: Wait for context drawer to open and click Send button
    console.log('\n📋 Step 5: Waiting for context drawer and clicking Send...');

    // Wait for the drawer to slide in
    await page.waitForTimeout(1000);

    // Look for the Send button in the drawer
    const sendButton = await page.locator('button:has-text("Send")').first();

    await sendButton.click();
    await page.waitForTimeout(2000);

    const screenshot5 = path.join(SCREENSHOTS_DIR, '05-send-modal-opened.png');
    await page.screenshot({ path: screenshot5, fullPage: true });
    results.screenshots.push(screenshot5);
    console.log(`   📸 Screenshot saved: ${screenshot5}`);
    await analyzeScreenshot(screenshot5, 'send-modal');

    results.steps.push({ step: 5, action: 'Click Send button in drawer', status: 'success' });

    // Step 6: Select Email option
    console.log('\n📋 Step 6: Selecting Email option...');

    // Wait for modal to appear - look for the modal backdrop
    await page.waitForSelector('.fixed.inset-0.bg-black', { timeout: 5000 });

    // Click Email label (the radio button is hidden with sr-only)
    const emailLabel = await page.locator('label:has-text("Email")').first();

    await emailLabel.click();
    await page.waitForTimeout(1000);

    const screenshot6 = path.join(SCREENSHOTS_DIR, '06-email-selected.png');
    await page.screenshot({ path: screenshot6, fullPage: true });
    results.screenshots.push(screenshot6);
    console.log(`   📸 Screenshot saved: ${screenshot6}`);
    await analyzeScreenshot(screenshot6, 'email-selected');

    results.steps.push({ step: 6, action: 'Select Email option', status: 'success' });

    // Step 7: Click Send Quote button
    console.log('\n📋 Step 7: Clicking Send Quote button...');

    // Clear errors before sending
    const errorsBefore = results.errors.length;

    // Click the "Send Quote" button (not the "Send" button in the drawer)
    const sendQuoteButton = await page.locator('button:has-text("Send Quote")').first();

    await sendQuoteButton.click();

    // Wait for response
    await page.waitForTimeout(3000);

    const screenshot7 = path.join(SCREENSHOTS_DIR, '07-after-send.png');
    await page.screenshot({ path: screenshot7, fullPage: true });
    results.screenshots.push(screenshot7);
    console.log(`   📸 Screenshot saved: ${screenshot7}`);
    await analyzeScreenshot(screenshot7, 'after-send');

    // Check for new errors
    const errorsAfter = results.errors.length;
    const newErrors = errorsAfter - errorsBefore;

    if (newErrors > 0) {
      console.log(`   ❌ ${newErrors} new errors detected during send`);
      results.steps.push({
        step: 7,
        action: 'Click Send Quote',
        status: 'failed',
        errors: newErrors
      });
    } else {
      console.log(`   ✅ No errors detected`);
      results.steps.push({ step: 7, action: 'Click Send Quote', status: 'success' });
    }

    // Step 8: Check for success/error messages
    console.log('\n📋 Step 8: Checking for success/error messages...');
    
    await page.waitForTimeout(2000);
    
    // Look for success message
    const successMessage = await page.locator('.success, .alert-success, [role="alert"]:has-text("success")').count();
    const errorMessage = await page.locator('.error, .alert-error, [role="alert"]:has-text("error")').count();
    
    if (successMessage > 0) {
      console.log(`   ✅ Success message found`);
      results.success = true;
    } else if (errorMessage > 0) {
      console.log(`   ❌ Error message found`);
      results.success = false;
    } else {
      console.log(`   ⚠️  No success or error message found`);
    }

    const screenshot8 = path.join(SCREENSHOTS_DIR, '08-final-state.png');
    await page.screenshot({ path: screenshot8, fullPage: true });
    results.screenshots.push(screenshot8);
    console.log(`   📸 Screenshot saved: ${screenshot8}`);
    await analyzeScreenshot(screenshot8, 'final-state');

    // Determine overall success
    if (results.errors.length === 0 && results.success) {
      console.log('\n✅ TEST PASSED - Quote sent successfully with no errors');
    } else if (results.errors.length > 0) {
      console.log(`\n❌ TEST FAILED - ${results.errors.length} errors detected`);
    } else {
      console.log('\n⚠️  TEST INCONCLUSIVE - No errors but no success confirmation');
    }

  } catch (err) {
    console.error('\n❌ TEST ERROR:', err.message);
    results.errors.push({
      type: 'test',
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });
    
    // Take error screenshot
    if (page) {
      try {
        const errorScreenshot = path.join(SCREENSHOTS_DIR, '99-error.png');
        await page.screenshot({ path: errorScreenshot, fullPage: true });
        results.screenshots.push(errorScreenshot);
        console.log(`   📸 Error screenshot saved: ${errorScreenshot}`);
      } catch (screenshotErr) {
        console.error('   Failed to capture error screenshot:', screenshotErr.message);
      }
    }
  } finally {
    // Save results
    const resultsPath = path.join(SCREENSHOTS_DIR, 'test-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    console.log(`\n💾 Results saved to: ${resultsPath}`);

    // Print summary
    console.log('\n═'.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('═'.repeat(60));
    console.log(`Steps Completed: ${results.steps.length}`);
    console.log(`Errors Detected: ${results.errors.length}`);
    console.log(`Screenshots Captured: ${results.screenshots.length}`);
    console.log(`Overall Success: ${results.success ? '✅ YES' : '❌ NO'}`);
    
    if (results.errors.length > 0) {
      console.log('\n🔍 ERRORS FOUND:');
      results.errors.forEach((err, idx) => {
        console.log(`\n${idx + 1}. [${err.type.toUpperCase()}]`);
        console.log(`   ${err.message || err.failure}`);
        if (err.url) console.log(`   URL: ${err.url}`);
      });
    }
    
    console.log('\n📸 Screenshots saved to:', SCREENSHOTS_DIR);
    console.log('═'.repeat(60));

    // Close browser
    if (browser) {
      await browser.close();
    }

    // Exit with appropriate code
    process.exit(results.errors.length === 0 && results.success ? 0 : 1);
  }
}

// Run the test
testQuoteSending();

