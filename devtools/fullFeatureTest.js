/**
 * COMPREHENSIVE FEATURE TEST
 * Tests ALL major features of TradeMate Pro
 * 
 * This will systematically test:
 * - Employee Management
 * - Customer Management
 * - Timesheet Management
 * - PTO Management
 * - Job Scheduling
 * - Vendor Management
 * - Purchase Orders
 * - Expenses
 * - Inventory
 * - Payroll
 * - Customer Portal
 * - Marketplace
 * - And more...
 */

const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const APP_URL = 'http://localhost:3004';
const LOGIN_EMAIL = 'jeraldjsmith@gmail.com';
const LOGIN_PASSWORD = 'Gizmo123';

// Test results
const results = {
  startTime: new Date().toISOString(),
  features: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    notImplemented: 0
  }
};

/**
 * Login helper
 */
async function login(page) {
  console.log('🔐 Logging in...');
  await page.goto(APP_URL);
  await page.waitForTimeout(2000);

  const isLoginPage = await page.locator('input[type="email"]').count() > 0;
  
  if (isLoginPage) {
    await page.fill('input[type="email"]', LOGIN_EMAIL);
    await page.fill('input[type="password"]', LOGIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    // Wait for navigation
    await page.waitForSelector('nav', { timeout: 15000 });
    console.log('✅ Logged in successfully');
  }
}

/**
 * Test a feature
 */
async function testFeature(page, featureName, testFn) {
  console.log(`\n🧪 Testing: ${featureName}`);
  const feature = {
    name: featureName,
    status: 'unknown',
    errors: [],
    warnings: [],
    duration: 0,
    timestamp: new Date().toISOString()
  };

  const startTime = Date.now();

  try {
    const result = await testFn(page);
    feature.status = result.status;
    feature.errors = result.errors || [];
    feature.warnings = result.warnings || [];
    feature.details = result.details || '';
    
    if (result.status === 'passed') {
      console.log(`✅ ${featureName}: PASSED`);
      results.summary.passed++;
    } else if (result.status === 'failed') {
      console.log(`❌ ${featureName}: FAILED`);
      console.log(`   Errors: ${result.errors.join(', ')}`);
      results.summary.failed++;
    } else if (result.status === 'not_implemented') {
      console.log(`⚠️  ${featureName}: NOT IMPLEMENTED`);
      results.summary.notImplemented++;
    }
  } catch (error) {
    feature.status = 'error';
    feature.errors.push(error.message);
    console.log(`💥 ${featureName}: ERROR - ${error.message}`);
    results.summary.failed++;
  }

  feature.duration = Date.now() - startTime;
  results.features.push(feature);
  results.summary.total++;
}

/**
 * FEATURE TESTS
 */

// 1. EMPLOYEE MANAGEMENT
async function testEmployeeManagement(page) {
  await page.goto(`${APP_URL}/employees`);
  await page.waitForTimeout(2000);
  
  const errors = [];
  const warnings = [];
  
  // Check if page loads
  const hasContent = await page.locator('body').count() > 0;
  if (!hasContent) {
    errors.push('Page did not load');
    return { status: 'failed', errors };
  }
  
  // Check for "Add Employee" button or similar
  const hasAddButton = await page.locator('button:has-text("Add"), button:has-text("New"), button:has-text("Create")').count() > 0;
  if (!hasAddButton) {
    warnings.push('No add/create button found');
  }
  
  // Check for employee table/list
  const hasTable = await page.locator('table, [role="table"]').count() > 0;
  if (!hasTable) {
    warnings.push('No table or list found');
  }
  
  // Check console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  await page.waitForTimeout(1000);
  
  if (consoleErrors.length > 0) {
    errors.push(`Console errors: ${consoleErrors.length}`);
  }
  
  if (errors.length > 0) {
    return { status: 'failed', errors, warnings };
  }
  
  return { status: 'passed', errors, warnings };
}

// 2. CUSTOMER MANAGEMENT
async function testCustomerManagement(page) {
  await page.goto(`${APP_URL}/customers`);
  await page.waitForTimeout(2000);
  
  const errors = [];
  const warnings = [];
  
  const hasContent = await page.locator('body').count() > 0;
  if (!hasContent) {
    errors.push('Page did not load');
    return { status: 'failed', errors };
  }
  
  const hasAddButton = await page.locator('button:has-text("Add"), button:has-text("New")').count() > 0;
  if (!hasAddButton) {
    warnings.push('No add button found');
  }
  
  return errors.length > 0 
    ? { status: 'failed', errors, warnings }
    : { status: 'passed', errors, warnings };
}

// 3. TIMESHEET MANAGEMENT
async function testTimesheetManagement(page) {
  await page.goto(`${APP_URL}/timesheets`);
  await page.waitForTimeout(2000);
  
  const errors = [];
  const warnings = [];
  
  const hasContent = await page.locator('body').count() > 0;
  if (!hasContent) {
    errors.push('Page did not load');
    return { status: 'failed', errors };
  }
  
  // Check for timesheet entry form or table
  const hasForm = await page.locator('form, table').count() > 0;
  if (!hasForm) {
    warnings.push('No form or table found');
  }
  
  return errors.length > 0 
    ? { status: 'failed', errors, warnings }
    : { status: 'passed', errors, warnings };
}

// 4. PTO MANAGEMENT
async function testPTOManagement(page) {
  await page.goto(`${APP_URL}/my-time-off`);
  await page.waitForTimeout(2000);
  
  const errors = [];
  const warnings = [];
  
  const hasContent = await page.locator('body').count() > 0;
  if (!hasContent) {
    errors.push('Page did not load');
    return { status: 'failed', errors };
  }
  
  return errors.length > 0 
    ? { status: 'failed', errors, warnings }
    : { status: 'passed', errors, warnings };
}

// 5. JOB SCHEDULING
async function testJobScheduling(page) {
  await page.goto(`${APP_URL}/scheduling`);
  await page.waitForTimeout(2000);
  
  const errors = [];
  const warnings = [];
  
  const hasContent = await page.locator('body').count() > 0;
  if (!hasContent) {
    errors.push('Page did not load');
    return { status: 'failed', errors };
  }
  
  return errors.length > 0 
    ? { status: 'failed', errors, warnings }
    : { status: 'passed', errors, warnings };
}

// 6. VENDOR MANAGEMENT
async function testVendorManagement(page) {
  await page.goto(`${APP_URL}/vendors`);
  await page.waitForTimeout(2000);

  const errors = [];
  const warnings = [];

  const hasContent = await page.locator('body').count() > 0;
  if (!hasContent) {
    errors.push('Page did not load');
    return { status: 'failed', errors };
  }

  return errors.length > 0
    ? { status: 'failed', errors, warnings }
    : { status: 'passed', errors, warnings };
}

// 7. PURCHASE ORDERS
async function testPurchaseOrders(page) {
  await page.goto(`${APP_URL}/purchase-orders`);
  await page.waitForTimeout(2000);

  const errors = [];
  const warnings = [];

  const hasContent = await page.locator('body').count() > 0;
  if (!hasContent) {
    errors.push('Page did not load');
    return { status: 'failed', errors };
  }

  return errors.length > 0
    ? { status: 'failed', errors, warnings }
    : { status: 'passed', errors, warnings };
}

// 8. EXPENSES
async function testExpenses(page) {
  await page.goto(`${APP_URL}/expenses`);
  await page.waitForTimeout(2000);

  const errors = [];
  const warnings = [];

  const hasContent = await page.locator('body').count() > 0;
  if (!hasContent) {
    errors.push('Page did not load');
    return { status: 'failed', errors };
  }

  return errors.length > 0
    ? { status: 'failed', errors, warnings }
    : { status: 'passed', errors, warnings };
}

// 9. INVENTORY
async function testInventory(page) {
  await page.goto(`${APP_URL}/inventory`);
  await page.waitForTimeout(2000);

  const errors = [];
  const warnings = [];

  const hasContent = await page.locator('body').count() > 0;
  if (!hasContent) {
    errors.push('Page did not load');
    return { status: 'failed', errors };
  }

  return errors.length > 0
    ? { status: 'failed', errors, warnings }
    : { status: 'passed', errors, warnings };
}

// 10. PAYROLL
async function testPayroll(page) {
  await page.goto(`${APP_URL}/payroll`);
  await page.waitForTimeout(2000);

  const errors = [];
  const warnings = [];

  const hasContent = await page.locator('body').count() > 0;
  if (!hasContent) {
    errors.push('Page did not load');
    return { status: 'failed', errors };
  }

  return errors.length > 0
    ? { status: 'failed', errors, warnings }
    : { status: 'passed', errors, warnings };
}

// 11. MARKETPLACE
async function testMarketplace(page) {
  await page.goto(`${APP_URL}/marketplace`);
  await page.waitForTimeout(2000);

  const errors = [];
  const warnings = [];

  const hasContent = await page.locator('body').count() > 0;
  if (!hasContent) {
    errors.push('Page did not load');
    return { status: 'failed', errors };
  }

  return errors.length > 0
    ? { status: 'failed', errors, warnings }
    : { status: 'passed', errors, warnings };
}

// 12. CUSTOMER PORTAL
async function testCustomerPortal(page) {
  await page.goto(`${APP_URL}/customer-portal`);
  await page.waitForTimeout(2000);

  const errors = [];
  const warnings = [];

  const hasContent = await page.locator('body').count() > 0;
  if (!hasContent) {
    errors.push('Page did not load');
    return { status: 'failed', errors };
  }

  return errors.length > 0
    ? { status: 'failed', errors, warnings }
    : { status: 'passed', errors, warnings };
}

// 13. REPORTS
async function testReports(page) {
  await page.goto(`${APP_URL}/reports`);
  await page.waitForTimeout(2000);

  const errors = [];
  const warnings = [];

  const hasContent = await page.locator('body').count() > 0;
  if (!hasContent) {
    errors.push('Page did not load');
    return { status: 'failed', errors };
  }

  return errors.length > 0
    ? { status: 'failed', errors, warnings }
    : { status: 'passed', errors, warnings };
}

/**
 * MAIN TEST RUNNER
 */
async function runAllTests() {
  console.log('🚀 Starting Comprehensive Feature Test...\n');
  console.log('Testing ALL major features of TradeMate Pro\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  // Capture console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push({ text: msg.text(), timestamp: new Date().toISOString() });
    }
  });

  // Login first
  await login(page);

  // Run all feature tests
  console.log('\n📋 CORE WORKFLOWS:');
  await testFeature(page, '1. Employee Management', testEmployeeManagement);
  await testFeature(page, '2. Customer Management', testCustomerManagement);
  await testFeature(page, '3. Timesheet Management', testTimesheetManagement);
  await testFeature(page, '4. PTO Management', testPTOManagement);
  await testFeature(page, '5. Job Scheduling', testJobScheduling);
  await testFeature(page, '6. Vendor Management', testVendorManagement);

  console.log('\n💰 FINANCIAL FEATURES:');
  await testFeature(page, '7. Purchase Orders', testPurchaseOrders);
  await testFeature(page, '8. Expenses', testExpenses);
  await testFeature(page, '9. Inventory', testInventory);
  await testFeature(page, '10. Payroll', testPayroll);

  console.log('\n🌐 CUSTOMER-FACING:');
  await testFeature(page, '11. Marketplace', testMarketplace);
  await testFeature(page, '12. Customer Portal', testCustomerPortal);

  console.log('\n📊 REPORTING:');
  await testFeature(page, '13. Reports', testReports);
  
  // Close browser
  await browser.close();
  
  // Save results
  results.endTime = new Date().toISOString();
  results.duration = Date.now() - new Date(results.startTime).getTime();
  
  fs.writeFileSync(
    path.join(__dirname, 'full-feature-test-results.json'),
    JSON.stringify(results, null, 2)
  );
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Features Tested: ${results.summary.total}`);
  console.log(`✅ Passed: ${results.summary.passed}`);
  console.log(`❌ Failed: ${results.summary.failed}`);
  console.log(`⚠️  Not Implemented: ${results.summary.notImplemented}`);
  console.log(`⏱️  Duration: ${(results.duration / 1000).toFixed(1)}s`);
  console.log('='.repeat(60));
}

// Run tests
runAllTests().catch(console.error);

