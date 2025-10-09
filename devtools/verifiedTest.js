/**
 * ✅ VERIFIED TEST - Actually checks database after each operation
 *
 * This test:
 * 1. Uses the frontend UI to create data
 * 2. Waits for the operation to complete
 * 3. Queries the database to VERIFY the data was actually saved
 * 4. Reports TRUE success/failure based on database state
 *
 * This will reveal if the frontend is lying about success!
 */

const { chromium } = require('playwright');
const { Client } = require('pg');
const fs = require('fs');

const APP_URL = 'http://localhost:3004';
const TEST_EMAIL = 'jeraldjsmith@gmail.com';
const TEST_PASSWORD = 'Gizmo123';
const COMPANY_ID = 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e';

// Database connection
const dbClient = new Client({
  host: 'aws-1-us-west-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.cxlqzejzraczumqmsrcx',
  password: 'Alphaecho19!',
  ssl: { rejectUnauthorized: false }
});

const results = {
  startTime: new Date().toISOString(),
  customers: { attempted: 0, verified: 0, failed: [] },
  employees: { attempted: 0, verified: 0, failed: [] },
  quotes: { attempted: 0, verified: 0, failed: [] },
  errors: []
};

async function login(page) {
  console.log('🔐 Logging in...');
  await page.goto(`${APP_URL}/login`);
  await page.waitForTimeout(2000);

  const emailInput = await page.locator('input[type="email"]').count();
  if (emailInput > 0) {
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    console.log('✅ Logged in');
  } else {
    console.log('✅ Already logged in');
  }
}

async function verifyCustomerInDB(name) {
  const result = await dbClient.query(
    'SELECT id, name FROM customers WHERE company_id = $1 AND name = $2',
    [COMPANY_ID, name]
  );
  return result.rows.length > 0;
}

async function verifyEmployeeInDB(firstName, lastName) {
  const result = await dbClient.query(
    'SELECT id, first_name, last_name FROM employees WHERE company_id = $1 AND first_name = $2 AND last_name = $3',
    [COMPANY_ID, firstName, lastName]
  );
  return result.rows.length > 0;
}

async function verifyQuoteInDB(title) {
  const result = await dbClient.query(
    'SELECT id, title FROM work_orders WHERE company_id = $1 AND title = $2',
    [COMPANY_ID, title]
  );
  return result.rows.length > 0;
}

async function fillField(page, fieldNames, value) {
  for (const name of fieldNames) {
    const field = await page.locator(`input[name="${name}"], input[placeholder*="${name}" i], textarea[name="${name}"]`).first();
    if (await field.count() > 0) {
      await field.fill(value);
      return true;
    }
  }
  return false;
}

async function createAndVerifyCustomer(page, customer) {
  results.customers.attempted++;
  console.log(`\n  Attempting: ${customer.name}...`);

  try {
    await page.goto(`${APP_URL}/customers`);
    await page.waitForTimeout(1500);

    const addBtn = await page.locator('button:has-text("Add Customer"), button:has-text("New Customer")').first();
    if (await addBtn.count() === 0) {
      throw new Error('Add Customer button not found');
    }

    await addBtn.click();
    await page.waitForTimeout(1500);

    await fillField(page, ['name', 'customer_name'], customer.name);
    await fillField(page, ['phone', 'phone_number'], customer.phone);
    await fillField(page, ['email'], customer.email);
    await fillField(page, ['street_address', 'address'], customer.address);
    await fillField(page, ['city'], customer.city);
    await fillField(page, ['state'], customer.state);
    await fillField(page, ['zip_code', 'zip'], customer.zip);

    await page.click('button[type="submit"]:has-text("Save"), button[type="submit"]:has-text("Create")');
    await page.waitForTimeout(3000); // Wait for save

    // VERIFY in database
    const verified = await verifyCustomerInDB(customer.name);

    if (verified) {
      results.customers.verified++;
      console.log(`    ✅ VERIFIED in database: ${customer.name}`);
      return true;
    } else {
      results.customers.failed.push({ name: customer.name, reason: 'Not found in database after creation' });
      console.log(`    ❌ NOT IN DATABASE: ${customer.name}`);
      return false;
    }

  } catch (error) {
    results.customers.failed.push({ name: customer.name, reason: error.message });
    console.log(`    ❌ ERROR: ${error.message}`);
    return false;
  }
}

async function createAndVerifyEmployee(page, employee) {
  results.employees.attempted++;
  console.log(`\n  Attempting: ${employee.firstName} ${employee.lastName}...`);

  try {
    await page.goto(`${APP_URL}/employees`);
    await page.waitForTimeout(1500);

    const addBtn = await page.locator('button:has-text("Add Employee"), button:has-text("New Employee")').first();
    if (await addBtn.count() === 0) {
      throw new Error('Add Employee button not found');
    }

    await addBtn.click();
    await page.waitForTimeout(1500);

    await fillField(page, ['first_name', 'firstName'], employee.firstName);
    await fillField(page, ['last_name', 'lastName'], employee.lastName);
    await fillField(page, ['email'], employee.email);
    await fillField(page, ['phone'], employee.phone);
    await fillField(page, ['hourly_rate', 'rate'], employee.hourlyRate.toString());

    const roleSelect = await page.locator('select[name="role"]').count();
    if (roleSelect > 0) {
      await page.selectOption('select[name="role"]', employee.role);
    }

    await page.click('button[type="submit"]:has-text("Save"), button[type="submit"]:has-text("Create")');
    await page.waitForTimeout(3000);

    // VERIFY in database
    const verified = await verifyEmployeeInDB(employee.firstName, employee.lastName);

    if (verified) {
      results.employees.verified++;
      console.log(`    ✅ VERIFIED in database: ${employee.firstName} ${employee.lastName}`);
      return true;
    } else {
      results.employees.failed.push({ name: `${employee.firstName} ${employee.lastName}`, reason: 'Not found in database after creation' });
      console.log(`    ❌ NOT IN DATABASE: ${employee.firstName} ${employee.lastName}`);
      return false;
    }

  } catch (error) {
    results.employees.failed.push({ name: `${employee.firstName} ${employee.lastName}`, reason: error.message });
    console.log(`    ❌ ERROR: ${error.message}`);
    return false;
  }
}

async function runVerifiedTest() {
  console.log('🔍 STARTING VERIFIED TEST\n');
  console.log('This test ACTUALLY checks the database after each operation!\n');

  // Connect to database
  await dbClient.connect();
  console.log('✅ Connected to database\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 100
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await login(page);

    // Test 3 customers
    console.log('\n👥 Testing Customer Creation (3 samples)...');
    const customers = [
      { name: 'Test Customer 1', phone: '+15551111111', email: 'test1@test.com', address: '123 Test St', city: 'Portland', state: 'OR', zip: '97201' },
      { name: 'Test Customer 2', phone: '+15552222222', email: 'test2@test.com', address: '456 Test Ave', city: 'Portland', state: 'OR', zip: '97202' },
      { name: 'Test Customer 3', phone: '+15553333333', email: 'test3@test.com', address: '789 Test Rd', city: 'Portland', state: 'OR', zip: '97203' }
    ];

    for (const customer of customers) {
      await createAndVerifyCustomer(page, customer);
    }

    // Test 2 employees
    console.log('\n\n👷 Testing Employee Creation (2 samples)...');
    const employees = [
      { firstName: 'Test', lastName: 'Employee1', email: 'emp1@test.com', phone: '+15554444444', role: 'technician', hourlyRate: 45 },
      { firstName: 'Test', lastName: 'Employee2', email: 'emp2@test.com', phone: '+15555555555', role: 'technician', hourlyRate: 45 }
    ];

    for (const employee of employees) {
      await createAndVerifyEmployee(page, employee);
    }

    results.endTime = new Date().toISOString();
    fs.writeFileSync('devtools/verified-test-results.json', JSON.stringify(results, null, 2));

    console.log('\n\n📊 VERIFIED TEST RESULTS:\n');
    console.log(`Customers:`);
    console.log(`  - Attempted: ${results.customers.attempted}`);
    console.log(`  - Verified in DB: ${results.customers.verified}`);
    console.log(`  - Failed: ${results.customers.failed.length}`);
    console.log(`  - Success Rate: ${Math.round((results.customers.verified / results.customers.attempted) * 100)}%`);

    console.log(`\nEmployees:`);
    console.log(`  - Attempted: ${results.employees.attempted}`);
    console.log(`  - Verified in DB: ${results.employees.verified}`);
    console.log(`  - Failed: ${results.employees.failed.length}`);
    console.log(`  - Success Rate: ${Math.round((results.employees.verified / results.employees.attempted) * 100)}%`);

    if (results.customers.failed.length > 0 || results.employees.failed.length > 0) {
      console.log('\n❌ FAILURES:');
      [...results.customers.failed, ...results.employees.failed].forEach(f => {
        console.log(`  - ${f.name}: ${f.reason}`);
      });
    }

    console.log('\n📄 Results saved to: devtools/verified-test-results.json');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    results.errors.push({ type: 'fatal', error: error.message, stack: error.stack });
  } finally {
    await browser.close();
    await dbClient.end();
  }
}

runVerifiedTest();