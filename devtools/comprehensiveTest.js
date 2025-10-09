const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

/**
 * Comprehensive Error Detection Test
 * Navigates through all pages and captures console errors
 */

const APP_URL = 'http://localhost:3004';
const CREDENTIALS = {
  email: 'jeraldjsmith@gmail.com',
  password: 'Gizmo123'
};

const PAGES_TO_TEST = [
  { name: 'Dashboard', path: '/dashboard', selector: 'text=Dashboard' },
  { name: 'Admin Dashboard', path: '/admin-dashboard', selector: 'text=Admin Dashboard' },
  { name: 'Jobs', path: '/jobs', selector: 'text=Jobs' },
  { name: 'Quotes', path: '/quotes', selector: 'text=Quotes' },
  { name: 'Invoices', path: '/invoices', selector: 'text=Invoices' },
  { name: 'Customers', path: '/customers', selector: 'text=Customers' },
  { name: 'Employees', path: '/employees', selector: 'text=Employees' },
  { name: 'Timesheets', path: '/timesheets', selector: 'text=Timesheets' },
  { name: 'Schedule', path: '/schedule', selector: 'text=Schedule' },
  { name: 'Marketplace', path: '/marketplace', selector: 'text=Marketplace' },
];

async function runComprehensiveTest() {
  const results = {
    startTime: new Date().toISOString(),
    pages: [],
    errors: [],
    warnings: [],
    totalErrors: 0,
    totalWarnings: 0
  };

  let browser;
  let page;

  try {
    console.log('🚀 Starting comprehensive error detection test...\n');

    // Launch browser
    browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    page = await context.newPage();

    // Capture console messages
    const consoleMessages = [];
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      const location = msg.location();

      consoleMessages.push({
        type,
        text,
        location,
        timestamp: new Date().toISOString()
      });

      if (type === 'error') {
        results.totalErrors++;
        results.errors.push({ text, location, timestamp: new Date().toISOString() });
        console.log(`❌ ERROR: ${text}`);
      } else if (type === 'warning') {
        results.totalWarnings++;
        results.warnings.push({ text, location, timestamp: new Date().toISOString() });
        console.log(`⚠️  WARNING: ${text}`);
      }
    });



    // Capture page errors
    page.on('pageerror', error => {
      results.totalErrors++;
      results.errors.push({
        text: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      console.log(`❌ PAGE ERROR: ${error.message}`);
    });

    // Capture network failures and 4xx/5xx responses
    const networkEvents = [];
    page.on('requestfailed', req => {
      const entry = { type: 'requestfailed', url: req.url(), method: req.method(), failure: req.failure(), ts: new Date().toISOString() };
      networkEvents.push(entry);
      results.errors.push({ text: `requestfailed ${req.method()} ${req.url()} ${JSON.stringify(req.failure())}` });
      console.log(`🌐 requestfailed ${req.method()} ${req.url()} -> ${req.failure()?.errorText}`);
    });
    page.on('response', async (resp) => {
      const status = resp.status();
      if (status >= 400) {
        const url = resp.url();
        const entry = { type: 'response', url, status, ts: new Date().toISOString() };
        networkEvents.push(entry);
        console.log(`🌐 ${status} ${url}`);
      }
    });

    // Navigate to app
    console.log(`📍 Navigating to ${APP_URL}...`);
    await page.goto(APP_URL);
    await page.waitForTimeout(2000);

    // Login
    console.log('🔐 Logging in...');
    const isLoginPage = await page.locator('input[type="email"]').count() > 0;
    
    if (isLoginPage) {
      await page.fill('input[type="email"]', CREDENTIALS.email);
      await page.fill('input[type="password"]', CREDENTIALS.password);
      await page.click('button[type="submit"]');
      await page.waitForSelector('nav', { timeout: 15000 });
      console.log('✅ Logged in successfully\n');
    }

    await page.waitForTimeout(2000);

    // Test each page
    for (const pageInfo of PAGES_TO_TEST) {
      console.log(`\n📄 Testing page: ${pageInfo.name}`);
      
      const pageResult = {
        name: pageInfo.name,
        path: pageInfo.path,
        errors: [],
        warnings: [],
        loadTime: 0,
        status: 'pending'
      };

      const startTime = Date.now();

      try {
        // Click navigation link
        const navLink = page.locator(pageInfo.selector).first();
        const isVisible = await navLink.isVisible({ timeout: 5000 }).catch(() => false);
        
        if (!isVisible) {
          console.log(`⚠️  Navigation link not visible for ${pageInfo.name}, trying direct navigation...`);
          await page.goto(`${APP_URL}${pageInfo.path}`);
        } else {
          await navLink.click();
        }

        // Wait for page to load
        await page.waitForTimeout(3000);

        // Check for specific error indicators
        const hasErrorText = await page.locator('text=Error').count() > 0;
        const has404 = await page.locator('text=404').count() > 0;
        const hasNotFound = await page.locator('text=Not Found').count() > 0;

        if (hasErrorText || has404 || hasNotFound) {
          pageResult.errors.push({
            text: 'Page shows error message',
            timestamp: new Date().toISOString()
          });
          console.log(`❌ ${pageInfo.name}: Page shows error message`);
        }

        // Capture errors specific to this page
        const pageErrors = consoleMessages.filter(msg => 
          msg.type === 'error' && 
          new Date(msg.timestamp) > new Date(startTime)
        );

        const pageWarnings = consoleMessages.filter(msg => 
          msg.type === 'warning' && 
          new Date(msg.timestamp) > new Date(startTime)
        );

        pageResult.errors = pageErrors;
        pageResult.warnings = pageWarnings;
        pageResult.loadTime = Date.now() - startTime;
        pageResult.status = pageErrors.length > 0 ? 'failed' : 'passed';

        console.log(`${pageResult.status === 'passed' ? '✅' : '❌'} ${pageInfo.name}: ${pageErrors.length} errors, ${pageWarnings.length} warnings (${pageResult.loadTime}ms)`);

      } catch (error) {
        pageResult.status = 'error';
        pageResult.errors.push({
          text: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        });
        console.log(`❌ ${pageInfo.name}: Test failed - ${error.message}`);
      }

      results.pages.push(pageResult);
      await page.waitForTimeout(1000);
    }

  } catch (error) {
    console.error('❌ Test execution failed:', error);
    results.errors.push({
      text: `Test execution failed: ${error.message}`,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  results.endTime = new Date().toISOString();
  results.duration = new Date(results.endTime) - new Date(results.startTime);

  // Save results
  const resultsPath = path.join(__dirname, 'comprehensive-test-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 COMPREHENSIVE TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Pages Tested: ${results.pages.length}`);
  console.log(`Pages Passed: ${results.pages.filter(p => p.status === 'passed').length}`);
  console.log(`Pages Failed: ${results.pages.filter(p => p.status === 'failed').length}`);
  console.log(`Total Errors: ${results.totalErrors}`);
  console.log(`Total Warnings: ${results.totalWarnings}`);
  console.log(`Duration: ${results.duration}ms`);
  console.log(`Results saved to: ${resultsPath}`);
  console.log('='.repeat(60));

  // Print top errors
  if (results.errors.length > 0) {
    console.log('\n🔴 TOP ERRORS:');
    const uniqueErrors = [...new Set(results.errors.map(e => e.text))];
    uniqueErrors.slice(0, 10).forEach((error, index) => {
      const count = results.errors.filter(e => e.text === error).length;
      console.log(`${index + 1}. [${count}x] ${error.substring(0, 100)}${error.length > 100 ? '...' : ''}`);
    });
  }

  return results;
}

// Run the test
runComprehensiveTest()
  .then(() => {
    console.log('\n✅ Test completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });

