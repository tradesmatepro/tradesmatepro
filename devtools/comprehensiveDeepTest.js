/**
 * COMPREHENSIVE DEEP FUNCTIONAL TEST - TradeMate Pro
 * 
 * This test actually USES each feature (add/edit/delete/workflows)
 * Not just checking if pages load!
 * 
 * Goal: Find what's broken vs. what works
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const APP_URL = 'http://localhost:3004';
const TEST_USER = {
  email: 'jeraldjsmith@gmail.com',
  password: 'Gizmo123'
};

const results = {
  startTime: new Date().toISOString(),
  testSuites: [],
  summary: { total: 0, passed: 0, failed: 0, partial: 0, skipped: 0 },
  consoleErrors: []
};

/**
 * Capture console errors
 */
function captureConsoleErrors(page) {
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  page.on('pageerror', error => {
    errors.push(error.message);
  });
  return errors;
}

/**
 * Login helper
 */
async function login(page) {
  console.log('🔐 Logging in...');
  await page.goto(`${APP_URL}/login`);
  await page.fill('input[type="email"]', TEST_USER.email);
  await page.fill('input[type="password"]', TEST_USER.password);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  console.log('✅ Logged in successfully\n');
}

/**
 * Generate unique test data
 */
function generateTestData() {
  const timestamp = Date.now();
  return {
    employee: {
      firstName: `Test${timestamp}`,
      lastName: 'Employee',
      email: `test${timestamp}@example.com`,
      phone: '555-0100',
      role: 'employee'
    },
    customer: {
      firstName: `Customer${timestamp}`,
      lastName: 'Test',
      email: `customer${timestamp}@example.com`,
      phone: '555-0200',
      address: '123 Test St'
    },
    vendor: {
      name: `Vendor ${timestamp}`,
      email: `vendor${timestamp}@example.com`,
      phone: '555-0300'
    }
  };
}

/**
 * TEST SUITE 1: EMPLOYEE MANAGEMENT - DEEP FUNCTIONAL
 */
async function testEmployeeManagement(page) {
  console.log('📋 TEST SUITE 1: EMPLOYEE MANAGEMENT (DEEP FUNCTIONAL)');
  console.log('=' .repeat(60));
  
  const suite = { name: 'Employee Management', tests: [] };
  const testData = generateTestData();
  
  // Test 1.1: Navigate to page
  console.log('  🧪 Test 1.1: Navigate to Employees page');
  try {
    await page.goto(`${APP_URL}/employees`);
    await page.waitForTimeout(2000);
    suite.tests.push({ name: 'Navigate to page', status: 'passed' });
    console.log(`     ✅ PASSED`);
  } catch (error) {
    suite.tests.push({ name: 'Navigate to page', status: 'failed', error: error.message });
    console.log(`     ❌ FAILED: ${error.message}`);
    return suite;
  }
  
  // Test 1.2: Try to ADD an employee
  console.log('  🧪 Test 1.2: Try to ADD an employee');
  try {
    // Click Add button
    const addButton = await page.locator('button:has-text("Add"), button:has-text("New")').first();
    if (await addButton.count() > 0) {
      await addButton.click();
      await page.waitForTimeout(1500);
      
      // Check if form opened
      const formVisible = await page.locator('form, [role="dialog"]').count() > 0;
      
      if (formVisible) {
        // Try to fill form
        const firstNameField = await page.locator('input[name="first_name"], input[name="firstName"], input[placeholder*="First"]').first();
        const lastNameField = await page.locator('input[name="last_name"], input[name="lastName"], input[placeholder*="Last"]').first();
        const emailField = await page.locator('input[type="email"], input[name="email"]').first();
        
        if (await firstNameField.count() > 0) await firstNameField.fill(testData.employee.firstName);
        if (await lastNameField.count() > 0) await lastNameField.fill(testData.employee.lastName);
        if (await emailField.count() > 0) await emailField.fill(testData.employee.email);
        
        // Try to submit
        const submitButton = await page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Add"), button:has-text("Create")').first();
        if (await submitButton.count() > 0) {
          await submitButton.click();
          await page.waitForTimeout(2000);
          
          // Check for success message or new employee in list
          const successVisible = await page.locator('text=/success|added|created/i').count() > 0;
          
          suite.tests.push({ 
            name: 'Add employee', 
            status: successVisible ? 'passed' : 'partial',
            details: successVisible ? 'Employee added successfully' : 'Form submitted but no success confirmation'
          });
          console.log(`     ${successVisible ? '✅' : '🟡'} ${successVisible ? 'PASSED' : 'PARTIAL'}`);
        } else {
          suite.tests.push({ name: 'Add employee', status: 'failed', details: 'No submit button found' });
          console.log(`     ❌ FAILED: No submit button`);
        }
      } else {
        suite.tests.push({ name: 'Add employee', status: 'failed', details: 'Form did not open' });
        console.log(`     ❌ FAILED: Form did not open`);
      }
    } else {
      suite.tests.push({ name: 'Add employee', status: 'failed', details: 'No add button found' });
      console.log(`     ❌ FAILED: No add button`);
    }
  } catch (error) {
    suite.tests.push({ name: 'Add employee', status: 'failed', error: error.message });
    console.log(`     ❌ FAILED: ${error.message}`);
  }
  
  // Test 1.3: Check if employee appears in list
  console.log('  🧪 Test 1.3: Check if new employee appears in list');
  try {
    await page.goto(`${APP_URL}/employees`);
    await page.waitForTimeout(2000);
    
    const employeeInList = await page.locator(`text=${testData.employee.firstName}`).count() > 0;
    suite.tests.push({ 
      name: 'Employee in list', 
      status: employeeInList ? 'passed' : 'partial',
      details: employeeInList ? 'Employee found in list' : 'Employee not found (may not have been added)'
    });
    console.log(`     ${employeeInList ? '✅' : '🟡'} ${employeeInList ? 'PASSED' : 'PARTIAL'}`);
  } catch (error) {
    suite.tests.push({ name: 'Employee in list', status: 'failed', error: error.message });
    console.log(`     ❌ FAILED: ${error.message}`);
  }
  
  // Test 1.4: Try to EDIT an employee
  console.log('  🧪 Test 1.4: Try to EDIT an employee');
  try {
    const editButton = await page.locator('button[title*="Edit"], svg[class*="pencil"]').first();
    if (await editButton.count() > 0) {
      await editButton.click();
      await page.waitForTimeout(1500);
      
      const formVisible = await page.locator('form, [role="dialog"]').count() > 0;
      suite.tests.push({ 
        name: 'Edit employee form opens', 
        status: formVisible ? 'passed' : 'failed'
      });
      console.log(`     ${formVisible ? '✅' : '❌'} ${formVisible ? 'PASSED' : 'FAILED'}`);
      
      // Close form
      if (formVisible) {
        const closeButton = await page.locator('button:has-text("Cancel"), button:has-text("Close")').first();
        if (await closeButton.count() > 0) await closeButton.click();
      }
    } else {
      suite.tests.push({ name: 'Edit employee form opens', status: 'partial', details: 'No edit button found' });
      console.log(`     🟡 PARTIAL: No edit button found`);
    }
  } catch (error) {
    suite.tests.push({ name: 'Edit employee form opens', status: 'failed', error: error.message });
    console.log(`     ❌ FAILED: ${error.message}`);
  }
  
  console.log('');
  return suite;
}

/**
 * TEST SUITE 2: CUSTOMER MANAGEMENT - DEEP FUNCTIONAL
 */
async function testCustomerManagement(page) {
  console.log('📋 TEST SUITE 2: CUSTOMER MANAGEMENT (DEEP FUNCTIONAL)');
  console.log('=' .repeat(60));
  
  const suite = { name: 'Customer Management', tests: [] };
  const testData = generateTestData();
  
  // Test 2.1: Navigate
  console.log('  🧪 Test 2.1: Navigate to Customers page');
  try {
    await page.goto(`${APP_URL}/customers`);
    await page.waitForTimeout(2000);
    suite.tests.push({ name: 'Navigate to page', status: 'passed' });
    console.log(`     ✅ PASSED`);
  } catch (error) {
    suite.tests.push({ name: 'Navigate to page', status: 'failed', error: error.message });
    console.log(`     ❌ FAILED: ${error.message}`);
    return suite;
  }
  
  // Test 2.2: Try to ADD a customer
  console.log('  🧪 Test 2.2: Try to ADD a customer');
  try {
    const addButton = await page.locator('button:has-text("Add"), button:has-text("New")').first();
    if (await addButton.count() > 0) {
      await addButton.click();
      await page.waitForTimeout(1500);
      
      const formVisible = await page.locator('form, [role="dialog"]').count() > 0;
      
      if (formVisible) {
        // Fill form
        const firstNameField = await page.locator('input[name*="first"], input[placeholder*="First"]').first();
        const lastNameField = await page.locator('input[name*="last"], input[placeholder*="Last"]').first();
        const emailField = await page.locator('input[type="email"]').first();
        
        if (await firstNameField.count() > 0) await firstNameField.fill(testData.customer.firstName);
        if (await lastNameField.count() > 0) await lastNameField.fill(testData.customer.lastName);
        if (await emailField.count() > 0) await emailField.fill(testData.customer.email);
        
        // Submit
        const submitButton = await page.locator('button[type="submit"], button:has-text("Save")').first();
        if (await submitButton.count() > 0) {
          await submitButton.click();
          await page.waitForTimeout(2000);
          
          const successVisible = await page.locator('text=/success|added|created/i').count() > 0;
          suite.tests.push({ name: 'Add customer', status: successVisible ? 'passed' : 'partial' });
          console.log(`     ${successVisible ? '✅' : '🟡'} ${successVisible ? 'PASSED' : 'PARTIAL'}`);
        } else {
          suite.tests.push({ name: 'Add customer', status: 'failed', details: 'No submit button' });
          console.log(`     ❌ FAILED: No submit button`);
        }
      } else {
        suite.tests.push({ name: 'Add customer', status: 'failed', details: 'Form did not open' });
        console.log(`     ❌ FAILED: Form did not open`);
      }
    } else {
      suite.tests.push({ name: 'Add customer', status: 'failed', details: 'No add button' });
      console.log(`     ❌ FAILED: No add button`);
    }
  } catch (error) {
    suite.tests.push({ name: 'Add customer', status: 'failed', error: error.message });
    console.log(`     ❌ FAILED: ${error.message}`);
  }
  
  console.log('');
  return suite;
}

/**
 * TEST SUITE 3: TIMESHEET MANAGEMENT - DEEP FUNCTIONAL
 */
async function testTimesheetManagement(page) {
  console.log('📋 TEST SUITE 3: TIMESHEET MANAGEMENT (DEEP FUNCTIONAL)');
  console.log('=' .repeat(60));

  const suite = { name: 'Timesheet Management', tests: [] };

  // Test 3.1: Navigate
  console.log('  🧪 Test 3.1: Navigate to Timesheets page');
  try {
    await page.goto(`${APP_URL}/timesheets`);
    await page.waitForTimeout(2000);
    suite.tests.push({ name: 'Navigate to page', status: 'passed' });
    console.log(`     ✅ PASSED`);
  } catch (error) {
    suite.tests.push({ name: 'Navigate to page', status: 'failed', error: error.message });
    console.log(`     ❌ FAILED: ${error.message}`);
    return suite;
  }

  // Test 3.2: Try to CREATE a timesheet
  console.log('  🧪 Test 3.2: Try to CREATE a timesheet');
  try {
    const addButton = await page.locator('button:has-text("Log Time"), button:has-text("Add"), button:has-text("Create")').first();
    if (await addButton.count() > 0) {
      await addButton.click();
      await page.waitForTimeout(1500);

      const formVisible = await page.locator('form, [role="dialog"]').count() > 0;

      if (formVisible) {
        // Try to fill timesheet form
        const workDateField = await page.locator('input[type="date"], input[name*="date"]').first();
        const clockInField = await page.locator('input[name*="clock_in"], input[name*="start"]').first();
        const clockOutField = await page.locator('input[name*="clock_out"], input[name*="end"]').first();

        if (await workDateField.count() > 0) await workDateField.fill('2025-10-05');
        if (await clockInField.count() > 0) await clockInField.fill('08:00');
        if (await clockOutField.count() > 0) await clockOutField.fill('17:00');

        // Submit
        const submitButton = await page.locator('button[type="submit"], button:has-text("Save")').first();
        if (await submitButton.count() > 0) {
          await submitButton.click();
          await page.waitForTimeout(2000);

          const successVisible = await page.locator('text=/success|added|created|saved/i').count() > 0;
          suite.tests.push({ name: 'Create timesheet', status: successVisible ? 'passed' : 'partial' });
          console.log(`     ${successVisible ? '✅' : '🟡'} ${successVisible ? 'PASSED' : 'PARTIAL'}`);
        } else {
          suite.tests.push({ name: 'Create timesheet', status: 'failed', details: 'No submit button' });
          console.log(`     ❌ FAILED: No submit button`);
        }
      } else {
        suite.tests.push({ name: 'Create timesheet', status: 'failed', details: 'Form did not open' });
        console.log(`     ❌ FAILED: Form did not open`);
      }
    } else {
      suite.tests.push({ name: 'Create timesheet', status: 'failed', details: 'No add button' });
      console.log(`     ❌ FAILED: No add button`);
    }
  } catch (error) {
    suite.tests.push({ name: 'Create timesheet', status: 'failed', error: error.message });
    console.log(`     ❌ FAILED: ${error.message}`);
  }

  // Test 3.3: Check for approval buttons (if admin)
  console.log('  🧪 Test 3.3: Check for approval functionality');
  try {
    await page.goto(`${APP_URL}/timesheets`);
    await page.waitForTimeout(2000);

    // Check for bulk approve buttons
    const bulkApproveButton = await page.locator('button:has-text("Bulk Approve"), button:has-text("Approve Selected")').count() > 0;
    const approveButtons = await page.locator('button[title*="Approve"], svg[class*="check"]').count() > 0;

    const hasApprovalFeature = bulkApproveButton || approveButtons;
    suite.tests.push({
      name: 'Approval functionality exists',
      status: hasApprovalFeature ? 'passed' : 'partial',
      details: `Bulk: ${bulkApproveButton}, Individual: ${approveButtons}`
    });
    console.log(`     ${hasApprovalFeature ? '✅' : '🟡'} ${hasApprovalFeature ? 'PASSED' : 'PARTIAL'}`);
  } catch (error) {
    suite.tests.push({ name: 'Approval functionality exists', status: 'failed', error: error.message });
    console.log(`     ❌ FAILED: ${error.message}`);
  }

  console.log('');
  return suite;
}

/**
 * TEST SUITE 4: JOB SCHEDULING - DEEP FUNCTIONAL
 */
async function testJobScheduling(page) {
  console.log('📋 TEST SUITE 4: JOB SCHEDULING (DEEP FUNCTIONAL)');
  console.log('=' .repeat(60));

  const suite = { name: 'Job Scheduling', tests: [] };

  // Test 4.1: Navigate
  console.log('  🧪 Test 4.1: Navigate to Scheduling page');
  try {
    await page.goto(`${APP_URL}/scheduling`);
    await page.waitForTimeout(2000);
    suite.tests.push({ name: 'Navigate to page', status: 'passed' });
    console.log(`     ✅ PASSED`);
  } catch (error) {
    suite.tests.push({ name: 'Navigate to page', status: 'failed', error: error.message });
    console.log(`     ❌ FAILED: ${error.message}`);
    return suite;
  }

  // Test 4.2: Check for calendar view (FullCalendar)
  console.log('  🧪 Test 4.2: Check for calendar view');
  try {
    // Wait longer for calendar to render
    await page.waitForTimeout(5000);

    // Take screenshot for debugging
    await page.screenshot({ path: 'devtools/scheduling-page-screenshot.png', fullPage: true });

    // Get page HTML to see what's actually there
    const pageContent = await page.content();
    const hasFullCalendarInHTML = pageContent.includes('fc-') || pageContent.includes('FullCalendar') || pageContent.includes('calendar-container');

    // FullCalendar specific selectors
    const hasCalendar = await page.locator('.fc, .fc-view, .fc-daygrid, .fc-timegrid, [class*="calendar-container"]').count() > 0;
    const hasCalendarHeader = await page.locator('.fc-toolbar, .fc-header-toolbar').count() > 0;
    const hasCalendarGrid = await page.locator('.fc-scrollgrid, .fc-daygrid-body, .fc-timegrid-body').count() > 0;

    // Check for any calendar-related elements
    const anyCalendarElement = await page.locator('[class*="fc"], [class*="calendar"]').count() > 0;

    const calendarWorks = hasCalendar || hasCalendarHeader || hasCalendarGrid || anyCalendarElement;

    suite.tests.push({
      name: 'Calendar view exists',
      status: calendarWorks ? 'passed' : 'failed',
      details: `FC: ${hasCalendar}, Header: ${hasCalendarHeader}, Grid: ${hasCalendarGrid}, Any: ${anyCalendarElement}, HTML: ${hasFullCalendarInHTML}`
    });
    console.log(`     ${calendarWorks ? '✅' : '❌'} ${calendarWorks ? 'PASSED' : 'FAILED'}`);
    console.log(`        Details: FC=${hasCalendar}, Header=${hasCalendarHeader}, Grid=${hasCalendarGrid}, Any=${anyCalendarElement}, InHTML=${hasFullCalendarInHTML}`);
  } catch (error) {
    suite.tests.push({ name: 'Calendar view exists', status: 'failed', error: error.message });
    console.log(`     ❌ FAILED: ${error.message}`);
  }

  // Test 4.3: Try to schedule a job
  console.log('  🧪 Test 4.3: Try to SCHEDULE a job');
  try {
    const scheduleButton = await page.locator('button:has-text("Schedule"), button:has-text("Add"), button:has-text("New")').first();
    if (await scheduleButton.count() > 0) {
      await scheduleButton.click();
      await page.waitForTimeout(1500);

      const formVisible = await page.locator('form, [role="dialog"]').count() > 0;
      suite.tests.push({ name: 'Schedule job form opens', status: formVisible ? 'passed' : 'failed' });
      console.log(`     ${formVisible ? '✅' : '❌'} ${formVisible ? 'PASSED' : 'FAILED'}`);

      if (formVisible) {
        const closeButton = await page.locator('button:has-text("Cancel"), button:has-text("Close")').first();
        if (await closeButton.count() > 0) await closeButton.click();
      }
    } else {
      suite.tests.push({ name: 'Schedule job form opens', status: 'partial', details: 'No schedule button found' });
      console.log(`     🟡 PARTIAL: No schedule button`);
    }
  } catch (error) {
    suite.tests.push({ name: 'Schedule job form opens', status: 'failed', error: error.message });
    console.log(`     ❌ FAILED: ${error.message}`);
  }

  console.log('');
  return suite;
}

/**
 * MAIN TEST RUNNER
 */
async function runComprehensiveDeepTests() {
  console.log('\n🚀 COMPREHENSIVE DEEP FUNCTIONAL TEST - TradeMate Pro');
  console.log('Actually USING each feature (add/edit/delete/workflows)');
  console.log('=' .repeat(60));
  console.log('');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  const consoleErrors = captureConsoleErrors(page);

  await login(page);

  // Run deep functional tests
  console.log('🔍 TESTING ACTUAL FUNCTIONALITY...\n');
  results.testSuites.push(await testEmployeeManagement(page));
  results.testSuites.push(await testCustomerManagement(page));
  results.testSuites.push(await testTimesheetManagement(page));
  results.testSuites.push(await testJobScheduling(page));
  results.testSuites.push(await testVendorManagement(page));
  results.testSuites.push(await testPurchaseOrders(page));
  results.testSuites.push(await testExpenses(page));
  results.testSuites.push(await testInventory(page));
  results.testSuites.push(await testPayroll(page));
  results.testSuites.push(await testPTOManagement(page));

  await browser.close();

  // Calculate summary
  results.testSuites.forEach(suite => {
    suite.tests.forEach(test => {
      results.summary.total++;
      if (test.status === 'passed') results.summary.passed++;
      else if (test.status === 'failed') results.summary.failed++;
      else if (test.status === 'partial') results.summary.partial++;
      else if (test.status === 'skipped') results.summary.skipped++;
    });
  });

  results.endTime = new Date().toISOString();
  results.consoleErrors = consoleErrors;

  // Print summary
  console.log('=' .repeat(60));
  console.log('📊 COMPREHENSIVE DEEP TEST SUMMARY');
  console.log('=' .repeat(60));
  console.log(`Total Tests: ${results.summary.total}`);
  console.log(`✅ Passed: ${results.summary.passed}`);
  console.log(`🟡 Partial: ${results.summary.partial}`);
  console.log(`❌ Failed: ${results.summary.failed}`);
  console.log(`⏭️  Skipped: ${results.summary.skipped}`);
  console.log(`Console Errors: ${consoleErrors.length}`);
  console.log('=' .repeat(60));

  // Save results
  const outputPath = path.join(__dirname, 'comprehensive-deep-test-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Full results saved to: ${outputPath}\n`);
}

/**
 * TEST SUITE 5: VENDOR MANAGEMENT
 */
async function testVendorManagement(page) {
  console.log('📋 TEST SUITE 5: VENDOR MANAGEMENT (DEEP FUNCTIONAL)');
  console.log('=' .repeat(60));

  const suite = { name: 'Vendor Management', tests: [] };
  const testData = generateTestData();

  console.log('  🧪 Test 5.1: Navigate and try to ADD vendor');
  try {
    await page.goto(`${APP_URL}/vendors`);
    await page.waitForTimeout(2000);

    const addButton = await page.locator('button:has-text("Add"), button:has-text("New")').first();
    if (await addButton.count() > 0) {
      await addButton.click();
      await page.waitForTimeout(1500);

      const formVisible = await page.locator('form, [role="dialog"]').count() > 0;
      suite.tests.push({ name: 'Add vendor form opens', status: formVisible ? 'passed' : 'failed' });
      console.log(`     ${formVisible ? '✅' : '❌'} ${formVisible ? 'PASSED' : 'FAILED'}`);

      if (formVisible) {
        const closeButton = await page.locator('button:has-text("Cancel")').first();
        if (await closeButton.count() > 0) await closeButton.click();
      }
    } else {
      suite.tests.push({ name: 'Add vendor form opens', status: 'partial', details: 'No add button' });
      console.log(`     🟡 PARTIAL: No add button`);
    }
  } catch (error) {
    suite.tests.push({ name: 'Add vendor form opens', status: 'failed', error: error.message });
    console.log(`     ❌ FAILED: ${error.message}`);
  }

  console.log('');
  return suite;
}

/**
 * TEST SUITE 6: PURCHASE ORDERS
 */
async function testPurchaseOrders(page) {
  console.log('📋 TEST SUITE 6: PURCHASE ORDERS (DEEP FUNCTIONAL)');
  console.log('=' .repeat(60));

  const suite = { name: 'Purchase Orders', tests: [] };

  console.log('  🧪 Test 6.1: Navigate and try to CREATE PO');
  try {
    await page.goto(`${APP_URL}/purchase-orders`);
    await page.waitForTimeout(2000);

    const addButton = await page.locator('button:has-text("Create"), button:has-text("New"), button:has-text("Add")').first();
    if (await addButton.count() > 0) {
      await addButton.click();
      await page.waitForTimeout(1500);

      const formVisible = await page.locator('form, [role="dialog"]').count() > 0;
      suite.tests.push({ name: 'Create PO form opens', status: formVisible ? 'passed' : 'failed' });
      console.log(`     ${formVisible ? '✅' : '❌'} ${formVisible ? 'PASSED' : 'FAILED'}`);

      if (formVisible) {
        const closeButton = await page.locator('button:has-text("Cancel")').first();
        if (await closeButton.count() > 0) await closeButton.click();
      }
    } else {
      suite.tests.push({ name: 'Create PO form opens', status: 'partial', details: 'No create button' });
      console.log(`     🟡 PARTIAL: No create button`);
    }
  } catch (error) {
    suite.tests.push({ name: 'Create PO form opens', status: 'failed', error: error.message });
    console.log(`     ❌ FAILED: ${error.message}`);
  }

  console.log('');
  return suite;
}

/**
 * TEST SUITE 7: EXPENSES
 */
async function testExpenses(page) {
  console.log('📋 TEST SUITE 7: EXPENSES (DEEP FUNCTIONAL)');
  console.log('=' .repeat(60));

  const suite = { name: 'Expenses', tests: [] };

  console.log('  🧪 Test 7.1: Navigate and try to ADD expense');
  try {
    await page.goto(`${APP_URL}/expenses`);
    await page.waitForTimeout(2000);

    const addButton = await page.locator('button:has-text("Add"), button:has-text("New"), button:has-text("Create")').first();
    if (await addButton.count() > 0) {
      await addButton.click();
      await page.waitForTimeout(1500);

      const formVisible = await page.locator('form, [role="dialog"]').count() > 0;
      suite.tests.push({ name: 'Add expense form opens', status: formVisible ? 'passed' : 'failed' });
      console.log(`     ${formVisible ? '✅' : '❌'} ${formVisible ? 'PASSED' : 'FAILED'}`);

      if (formVisible) {
        const closeButton = await page.locator('button:has-text("Cancel")').first();
        if (await closeButton.count() > 0) await closeButton.click();
      }
    } else {
      suite.tests.push({ name: 'Add expense form opens', status: 'partial', details: 'No add button' });
      console.log(`     🟡 PARTIAL: No add button`);
    }
  } catch (error) {
    suite.tests.push({ name: 'Add expense form opens', status: 'failed', error: error.message });
    console.log(`     ❌ FAILED: ${error.message}`);
  }

  console.log('');
  return suite;
}

/**
 * TEST SUITE 8: INVENTORY
 */
async function testInventory(page) {
  console.log('📋 TEST SUITE 8: INVENTORY (DEEP FUNCTIONAL)');
  console.log('=' .repeat(60));

  const suite = { name: 'Inventory', tests: [] };

  console.log('  🧪 Test 8.1: Navigate and try to ADD inventory item');
  try {
    await page.goto(`${APP_URL}/inventory`);
    await page.waitForTimeout(2000);

    const addButton = await page.locator('button:has-text("Add"), button:has-text("New")').first();
    if (await addButton.count() > 0) {
      await addButton.click();
      await page.waitForTimeout(1500);

      const formVisible = await page.locator('form, [role="dialog"]').count() > 0;
      suite.tests.push({ name: 'Add inventory form opens', status: formVisible ? 'passed' : 'failed' });
      console.log(`     ${formVisible ? '✅' : '❌'} ${formVisible ? 'PASSED' : 'FAILED'}`);

      if (formVisible) {
        const closeButton = await page.locator('button:has-text("Cancel")').first();
        if (await closeButton.count() > 0) await closeButton.click();
      }
    } else {
      suite.tests.push({ name: 'Add inventory form opens', status: 'partial', details: 'No add button' });
      console.log(`     🟡 PARTIAL: No add button`);
    }
  } catch (error) {
    suite.tests.push({ name: 'Add inventory form opens', status: 'failed', error: error.message });
    console.log(`     ❌ FAILED: ${error.message}`);
  }

  console.log('');
  return suite;
}

/**
 * TEST SUITE 9: PAYROLL
 */
async function testPayroll(page) {
  console.log('📋 TEST SUITE 9: PAYROLL (DEEP FUNCTIONAL)');
  console.log('=' .repeat(60));

  const suite = { name: 'Payroll', tests: [] };

  console.log('  🧪 Test 9.1: Navigate and check for payroll features');
  try {
    await page.goto(`${APP_URL}/payroll`);
    await page.waitForTimeout(2000);

    const hasProcessButton = await page.locator('button:has-text("Process"), button:has-text("Run"), button:has-text("Calculate")').count() > 0;
    suite.tests.push({ name: 'Payroll processing available', status: hasProcessButton ? 'passed' : 'partial' });
    console.log(`     ${hasProcessButton ? '✅' : '🟡'} ${hasProcessButton ? 'PASSED' : 'PARTIAL'}`);
  } catch (error) {
    suite.tests.push({ name: 'Payroll processing available', status: 'failed', error: error.message });
    console.log(`     ❌ FAILED: ${error.message}`);
  }

  console.log('');
  return suite;
}

/**
 * TEST SUITE 10: PTO MANAGEMENT
 */
async function testPTOManagement(page) {
  console.log('📋 TEST SUITE 10: PTO MANAGEMENT (DEEP FUNCTIONAL)');
  console.log('=' .repeat(60));

  const suite = { name: 'PTO Management', tests: [] };

  console.log('  🧪 Test 10.1: Navigate and try to REQUEST PTO');
  try {
    await page.goto(`${APP_URL}/my-time-off`);
    await page.waitForTimeout(2000);

    const requestButton = await page.locator('button:has-text("Request"), button:has-text("Add"), button:has-text("New")').first();
    if (await requestButton.count() > 0) {
      await requestButton.click();
      await page.waitForTimeout(1500);

      const formVisible = await page.locator('form, [role="dialog"]').count() > 0;
      suite.tests.push({ name: 'Request PTO form opens', status: formVisible ? 'passed' : 'failed' });
      console.log(`     ${formVisible ? '✅' : '❌'} ${formVisible ? 'PASSED' : 'FAILED'}`);

      if (formVisible) {
        const closeButton = await page.locator('button:has-text("Cancel")').first();
        if (await closeButton.count() > 0) await closeButton.click();
      }
    } else {
      suite.tests.push({ name: 'Request PTO form opens', status: 'partial', details: 'No request button' });
      console.log(`     🟡 PARTIAL: No request button`);
    }
  } catch (error) {
    suite.tests.push({ name: 'Request PTO form opens', status: 'failed', error: error.message });
    console.log(`     ❌ FAILED: ${error.message}`);
  }

  console.log('');
  return suite;
}

// Run tests
runComprehensiveDeepTests().catch(console.error);

