#!/usr/bin/env node

/**
 * Full Auto RLS Test
 * Automatically clicks through all pages and captures RLS errors
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const APP_URL = 'http://localhost:3005'; // Adjust port if needed
const LOGIN_EMAIL = 'jeraldjsmith@gmail.com'; // Your email
const LOGIN_PASSWORD = 'Gizmo123'; // Your password

// All pages to test
const PAGES_TO_TEST = [
  { name: 'Dashboard', url: '/admin-dashboard' },
  { name: 'My Dashboard', url: '/my-dashboard' },
  { name: 'Customers', url: '/customers' },
  { name: 'Quotes', url: '/quotes' },
  { name: 'Jobs', url: '/jobs' },
  { name: 'Jobs History', url: '/jobs-history' },
  { name: 'Scheduling', url: '/scheduling' },
  { name: 'Invoices', url: '/invoices' },
  { name: 'Timesheets', url: '/timesheets' },
  { name: 'Payroll', url: '/payroll' },
  { name: 'Inventory', url: '/inventory' },
  { name: 'Vendors', url: '/vendors' },
  { name: 'Expenses', url: '/expenses' },
  { name: 'Reports', url: '/reports' },
  { name: 'Messages', url: '/messages' },
  { name: 'Settings', url: '/settings' },
  { name: 'Employees', url: '/employees' },
  { name: 'Tools', url: '/tools' },
  { name: 'Marketplace', url: '/marketplace' },
  { name: 'Purchase Orders', url: '/purchase-orders' },
  { name: 'My Profile', url: '/my-profile' },
];

// Error categories
const errorCategories = {
  rls: [],
  network: [],
  javascript: [],
  other: []
};

let browser;
let page;

async function setupBrowser() {
  console.log('🚀 Launching browser...\n');
  
  browser = await puppeteer.launch({
    headless: false, // Show browser so you can see what's happening
    defaultViewport: { width: 1920, height: 1080 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  page = await browser.newPage();

  // Capture console logs
  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    
    if (type === 'error' || text.includes('❌') || text.includes('Error')) {
      console.log(`   ❌ Console Error: ${text}`);
      
      // Categorize error
      if (text.includes('row-level security') || text.includes('RLS') || text.includes('policy')) {
        errorCategories.rls.push({ page: currentPage, error: text });
      } else if (text.includes('Failed to load') || text.includes('fetch')) {
        errorCategories.network.push({ page: currentPage, error: text });
      } else {
        errorCategories.javascript.push({ page: currentPage, error: text });
      }
    }
  });

  // Capture network errors
  page.on('response', response => {
    const status = response.status();
    const url = response.url();
    
    if (status === 406 || status === 403 || status === 401) {
      const error = `${status} error on ${url}`;
      console.log(`   🌐 Network Error: ${error}`);
      errorCategories.network.push({ page: currentPage, error });
    }
  });

  // Capture page errors
  page.on('pageerror', error => {
    console.log(`   💥 Page Error: ${error.message}`);
    errorCategories.javascript.push({ page: currentPage, error: error.message });
  });

  console.log('✅ Browser launched\n');
}

let currentPage = 'Login';

async function login() {
  console.log('🔐 Logging in...\n');
  currentPage = 'Login';

  try {
    await page.goto(`${APP_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('   📄 Login page loaded');

    // Wait for login form
    await page.waitForSelector('input[name="email"]', { timeout: 10000 });
    console.log('   ✅ Login form found');

    // Fill in credentials
    await page.type('input[name="email"]', LOGIN_EMAIL, { delay: 50 });
    await page.type('input[name="password"]', LOGIN_PASSWORD, { delay: 50 });
    console.log('   ✅ Credentials entered');

    // Click login button and wait for navigation
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000 }),
      page.click('button[type="submit"]')
    ]);

    console.log('   ✅ Navigation complete');

    // Wait a bit for auth to settle
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Check if we're on the dashboard
    const url = page.url();
    if (url.includes('admin-dashboard') || url.includes('my-dashboard')) {
      console.log('✅ Login successful\n');
      return true;
    } else {
      console.log(`❌ Login failed - redirected to: ${url}\n`);
      return false;
    }
  } catch (error) {
    console.error('❌ Login failed:', error.message);

    // Take screenshot for debugging
    try {
      await page.screenshot({ path: path.join(__dirname, 'login-error.png') });
      console.log('   📸 Screenshot saved to AIDevTools/login-error.png');
    } catch (e) {
      // Ignore screenshot errors
    }

    return false;
  }
}

async function testPage(pageInfo) {
  currentPage = pageInfo.name;
  console.log(`📄 Testing: ${pageInfo.name}`);

  try {
    // Navigate to page
    await page.goto(`${APP_URL}${pageInfo.url}`, {
      waitUntil: 'domcontentloaded',
      timeout: 20000
    });

    // Wait for any async data loading
    await new Promise(resolve => setTimeout(resolve, 4000));

    // Try to interact with the page (scroll to trigger lazy loading)
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2);
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Scroll to bottom
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log(`   ✅ Page loaded\n`);
    return true;
  } catch (error) {
    console.log(`   ❌ Error loading page: ${error.message}\n`);
    errorCategories.other.push({ page: pageInfo.name, error: error.message });
    return false;
  }
}

async function generateReport() {
  console.log('\n============================================================');
  console.log('📊 RLS ERROR REPORT');
  console.log('============================================================\n');

  const totalErrors = 
    errorCategories.rls.length + 
    errorCategories.network.length + 
    errorCategories.javascript.length + 
    errorCategories.other.length;

  console.log(`Total Errors Found: ${totalErrors}\n`);

  // RLS Errors
  if (errorCategories.rls.length > 0) {
    console.log('🔐 RLS ERRORS:');
    console.log('─'.repeat(60));
    errorCategories.rls.forEach((err, i) => {
      console.log(`${i + 1}. Page: ${err.page}`);
      console.log(`   Error: ${err.error}\n`);
    });
  } else {
    console.log('✅ No RLS errors found!\n');
  }

  // Network Errors
  if (errorCategories.network.length > 0) {
    console.log('🌐 NETWORK ERRORS (403/406/401):');
    console.log('─'.repeat(60));
    errorCategories.network.forEach((err, i) => {
      console.log(`${i + 1}. Page: ${err.page}`);
      console.log(`   Error: ${err.error}\n`);
    });
  } else {
    console.log('✅ No network errors found!\n');
  }

  // JavaScript Errors
  if (errorCategories.javascript.length > 0) {
    console.log('💥 JAVASCRIPT ERRORS:');
    console.log('─'.repeat(60));
    errorCategories.javascript.forEach((err, i) => {
      console.log(`${i + 1}. Page: ${err.page}`);
      console.log(`   Error: ${err.error}\n`);
    });
  } else {
    console.log('✅ No JavaScript errors found!\n');
  }

  // Other Errors
  if (errorCategories.other.length > 0) {
    console.log('⚠️  OTHER ERRORS:');
    console.log('─'.repeat(60));
    errorCategories.other.forEach((err, i) => {
      console.log(`${i + 1}. Page: ${err.page}`);
      console.log(`   Error: ${err.error}\n`);
    });
  }

  // Save report to file
  const reportPath = path.join(__dirname, 'RLS_TEST_REPORT.json');
  fs.writeFileSync(reportPath, JSON.stringify(errorCategories, null, 2));
  console.log(`\n📁 Full report saved to: ${reportPath}\n`);

  // Generate summary
  console.log('============================================================');
  console.log('📈 SUMMARY');
  console.log('============================================================');
  console.log(`Pages Tested: ${PAGES_TO_TEST.length}`);
  console.log(`RLS Errors: ${errorCategories.rls.length}`);
  console.log(`Network Errors: ${errorCategories.network.length}`);
  console.log(`JavaScript Errors: ${errorCategories.javascript.length}`);
  console.log(`Other Errors: ${errorCategories.other.length}`);
  console.log(`Total Errors: ${totalErrors}`);
  console.log('============================================================\n');
}

async function main() {
  console.log('🤖 FULL AUTO RLS TEST\n');
  console.log('This will automatically:');
  console.log('1. Login to the app');
  console.log('2. Visit all pages');
  console.log('3. Capture all errors');
  console.log('4. Generate a report\n');
  console.log('Starting in 3 seconds...\n');

  await new Promise(resolve => setTimeout(resolve, 3000));

  try {
    // Setup browser
    await setupBrowser();

    // Login
    const loginSuccess = await login();
    if (!loginSuccess) {
      console.error('❌ Cannot proceed without login');
      await browser.close();
      process.exit(1);
    }

    // Test all pages
    console.log('🔍 Testing all pages...\n');
    for (const pageInfo of PAGES_TO_TEST) {
      await testPage(pageInfo);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay between pages
    }

    // Generate report
    await generateReport();

    // Close browser
    console.log('🏁 Test complete! Closing browser in 5 seconds...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));
    await browser.close();

  } catch (error) {
    console.error('❌ Test failed:', error);
    if (browser) await browser.close();
    process.exit(1);
  }
}

main();

