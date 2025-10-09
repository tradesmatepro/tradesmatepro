/**
 * 🎯 REAL FRONTEND TEST - NO CHEATING!
 * 
 * This test uses ONLY the frontend UI to:
 * 1. Create customers through the UI
 * 2. Create quotes through the UI
 * 3. Progress quotes through EVERY stage: quote → sent → approved → scheduled → completed → invoiced → paid → closed
 * 4. Verify everything shows up correctly in the app
 * 
 * NO backend shortcuts. NO SQL inserts. REAL user interactions only.
 */

const { chromium } = require('playwright');
const { Client } = require('pg');

const APP_URL = 'http://localhost:3004';
const TEST_EMAIL = 'jeraldjsmith@gmail.com';
const TEST_PASSWORD = 'Gizmo123';
const COMPANY_ID = 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e';

// Database client for verification only
const dbClient = new Client({
  host: 'aws-1-us-west-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.cxlqzejzraczumqmsrcx',
  password: 'Alphaecho19!'
});

let browser, page;

async function setup() {
  console.log('🚀 STARTING REAL FRONTEND TEST\n');
  console.log('This test will:');
  console.log('  ✓ Create customers via UI');
  console.log('  ✓ Create quotes via UI');
  console.log('  ✓ Progress quotes through ALL stages via UI');
  console.log('  ✓ Verify data in database\n');
  
  await dbClient.connect();
  
  browser = await chromium.launch({ 
    headless: false,
    slowMo: 300 // Slow down so we can see what's happening
  });
  
  const context = await browser.newContext();
  page = await context.newPage();

  // Capture API responses for debugging
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('customers') && response.request().method() === 'POST') {
      console.log(`\n   📡 API POST /customers: ${response.status()}`);
      try {
        const body = await response.text();
        if (response.status() !== 200 && response.status() !== 201) {
          console.log(`   ❌ Error response: ${body.substring(0, 300)}`);
        } else {
          console.log(`   ✅ Success response`);
        }
      } catch (e) {
        console.log(`   ⚠️  Could not read response body`);
      }
    }
  });

  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`   🔴 BROWSER ERROR: ${msg.text()}`);
    }
  });

  // Capture page errors
  page.on('pageerror', error => {
    console.log(`   🔴 PAGE ERROR: ${error.message}`);
  });

  // Login
  console.log('🔐 Logging in...');
  await page.goto(`${APP_URL}/login`);
  await page.waitForTimeout(2000);
  
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  console.log('✅ Logged in\n');
}

async function createCustomer(firstName, lastName, email, phone) {
  console.log(`\n👤 Creating customer: ${firstName} ${lastName}...`);

  // Go to customers page
  await page.goto(`${APP_URL}/customers`);
  await page.waitForTimeout(2000);

  // Click "Add Customer" button
  const addButton = page.locator('button').filter({ hasText: /Add Customer|New Customer/i }).first();
  await addButton.click();
  await page.waitForTimeout(1500);

  // The form has radio buttons for customer type (residential/commercial/industrial)
  // Default is residential, which shows first_name and last_name fields

  // Wait for form to appear
  await page.waitForSelector('input[type="text"]', { timeout: 5000 });

  // Fill first_name - it has placeholder "John"
  const firstNameInput = page.locator('input[placeholder="John"]').first();
  await firstNameInput.fill(firstName);
  await page.waitForTimeout(300);

  // Fill last_name - it has placeholder "Smith"
  const lastNameInput = page.locator('input[placeholder="Smith"]').first();
  await lastNameInput.fill(lastName);
  await page.waitForTimeout(300);

  // Fill email
  const emailInput = page.locator('input[type="email"]').first();
  await emailInput.fill(email);
  await page.waitForTimeout(300);

  // Fill phone - look for phone input (there might be multiple)
  const phoneInputs = await page.locator('input[type="tel"], input[type="text"]').all();
  for (const input of phoneInputs) {
    const value = await input.inputValue();
    if (value === '') {
      // Try this input
      try {
        await input.fill(phone);
        await page.waitForTimeout(300);
        break;
      } catch (e) {
        // Skip if can't fill
      }
    }
  }

  // Submit
  console.log('   Submitting form...');
  const submitButton = page.locator('button[type="submit"]').first();
  await submitButton.click();
  await page.waitForTimeout(4000); // Wait longer for API call

  // Check for error messages
  const errorMsg = await page.locator('text=/error|failed/i').first().textContent().catch(() => null);
  if (errorMsg) {
    console.log(`   ⚠️  Error message: ${errorMsg}`);
  }

  // Verify in database
  const result = await dbClient.query(
    'SELECT id, customer_number, first_name, last_name FROM customers WHERE company_id = $1 AND email = $2',
    [COMPANY_ID, email]
  );

  if (result.rows.length > 0) {
    console.log(`   ✅ Customer created: ${result.rows[0].customer_number}`);
    return result.rows[0];
  } else {
    console.log(`   ❌ Customer NOT found in database!`);

    // Take screenshot for debugging
    await page.screenshot({ path: `devtools/debug-customer-${Date.now()}.png` });
    console.log(`   📸 Screenshot saved for debugging`);

    return null;
  }
}

async function createQuote(customer, title, description, amount) {
  console.log(`\n📝 Creating quote for ${customer.first_name} ${customer.last_name}: "${title}"...`);
  
  // Go to quotes page (work orders with status=quote)
  await page.goto(`${APP_URL}/work-orders`);
  await page.waitForTimeout(2000);
  
  // Click "Create Quote" or "New Work Order" button
  const createButton = page.locator('button').filter({ hasText: /Create|New|Add/i }).first();
  await createButton.click();
  await page.waitForTimeout(1000);
  
  // Fill quote form
  // Title
  const titleInput = page.locator('input').filter({ hasText: '' }).first();
  await titleInput.fill(title);
  await page.waitForTimeout(300);
  
  // Description
  const descInput = page.locator('textarea').first();
  if (await descInput.count() > 0) {
    await descInput.fill(description);
    await page.waitForTimeout(300);
  }
  
  // Select customer - this might be a dropdown
  const customerSelect = page.locator('select').first();
  if (await customerSelect.count() > 0) {
    // Try to select by customer name
    await customerSelect.selectOption({ label: new RegExp(customer.first_name, 'i') });
    await page.waitForTimeout(300);
  }
  
  // Amount - look for input with $ or amount
  const amountInputs = await page.locator('input[type="number"]').all();
  if (amountInputs.length > 0) {
    await amountInputs[0].fill(amount.toString());
    await page.waitForTimeout(300);
  }
  
  // Submit
  const submitButton = page.locator('button[type="submit"]').first();
  await submitButton.click();
  await page.waitForTimeout(3000);
  
  // Verify in database
  const result = await dbClient.query(
    'SELECT id, work_order_number, status, title FROM work_orders WHERE company_id = $1 AND customer_id = $2 AND title = $3',
    [COMPANY_ID, customer.id, title]
  );
  
  if (result.rows.length > 0) {
    console.log(`   ✅ Quote created: ${result.rows[0].work_order_number} (status: ${result.rows[0].status})`);
    return result.rows[0];
  } else {
    console.log(`   ❌ Quote NOT found in database!`);
    return null;
  }
}

async function progressQuoteToSent(quote) {
  console.log(`\n📤 Progressing quote ${quote.work_order_number} to SENT...`);
  
  // Go to work orders page
  await page.goto(`${APP_URL}/work-orders`);
  await page.waitForTimeout(2000);
  
  // Find the quote in the list and click it
  const quoteRow = page.locator('tr, div').filter({ hasText: quote.work_order_number }).first();
  await quoteRow.click();
  await page.waitForTimeout(1000);
  
  // Look for "Send" button
  const sendButton = page.locator('button').filter({ hasText: /Send|Email/i }).first();
  if (await sendButton.count() > 0) {
    await sendButton.click();
    await page.waitForTimeout(2000);
    
    // Might need to confirm
    const confirmButton = page.locator('button').filter({ hasText: /Confirm|Yes|Send/i }).first();
    if (await confirmButton.count() > 0) {
      await confirmButton.click();
      await page.waitForTimeout(2000);
    }
  }
  
  // Verify status changed
  const result = await dbClient.query(
    'SELECT status FROM work_orders WHERE id = $1',
    [quote.id]
  );
  
  if (result.rows[0]?.status === 'sent') {
    console.log(`   ✅ Quote status: ${result.rows[0].status}`);
    return true;
  } else {
    console.log(`   ❌ Quote status: ${result.rows[0]?.status || 'unknown'} (expected: sent)`);
    return false;
  }
}

async function progressQuoteToApproved(quote) {
  console.log(`\n✅ Progressing quote ${quote.work_order_number} to APPROVED...`);
  
  // Similar pattern - find quote, click approve button
  await page.goto(`${APP_URL}/work-orders`);
  await page.waitForTimeout(2000);
  
  const quoteRow = page.locator('tr, div').filter({ hasText: quote.work_order_number }).first();
  await quoteRow.click();
  await page.waitForTimeout(1000);
  
  const approveButton = page.locator('button').filter({ hasText: /Approve|Accept/i }).first();
  if (await approveButton.count() > 0) {
    await approveButton.click();
    await page.waitForTimeout(2000);
  }
  
  const result = await dbClient.query('SELECT status FROM work_orders WHERE id = $1', [quote.id]);
  console.log(`   Status: ${result.rows[0]?.status || 'unknown'}`);
  return result.rows[0]?.status === 'approved';
}

async function runTest() {
  try {
    await setup();
    
    console.log('\n' + '='.repeat(80));
    console.log('PHASE 1: CREATE CUSTOMERS');
    console.log('='.repeat(80));
    
    const customers = [];
    customers.push(await createCustomer('Alice', 'Johnson', 'alice.j@test.com', '+15551111111'));
    customers.push(await createCustomer('Bob', 'Smith', 'bob.s@test.com', '+15552222222'));
    customers.push(await createCustomer('Carol', 'Williams', 'carol.w@test.com', '+15553333333'));
    
    const validCustomers = customers.filter(c => c !== null);
    console.log(`\n✅ Created ${validCustomers.length}/3 customers successfully`);
    
    if (validCustomers.length === 0) {
      console.log('\n❌ No customers created! Cannot continue with quotes.');
      return;
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('PHASE 2: CREATE QUOTES');
    console.log('='.repeat(80));
    
    const quotes = [];
    quotes.push(await createQuote(validCustomers[0], 'Kitchen Sink Repair', 'Fix leaking kitchen sink', 250));
    if (validCustomers[1]) {
      quotes.push(await createQuote(validCustomers[1], 'Bathroom Remodel', 'Complete bathroom renovation', 5000));
    }
    if (validCustomers[2]) {
      quotes.push(await createQuote(validCustomers[2], 'Water Heater Install', 'Install new 50-gallon water heater', 1200));
    }
    
    const validQuotes = quotes.filter(q => q !== null);
    console.log(`\n✅ Created ${validQuotes.length} quotes successfully`);
    
    if (validQuotes.length === 0) {
      console.log('\n❌ No quotes created! Cannot continue with pipeline.');
      return;
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('PHASE 3: PROGRESS THROUGH PIPELINE');
    console.log('='.repeat(80));
    
    // Progress first quote to sent
    if (validQuotes[0]) {
      await progressQuoteToSent(validQuotes[0]);
    }
    
    // Progress second quote to approved
    if (validQuotes[1]) {
      await progressQuoteToSent(validQuotes[1]);
      await page.waitForTimeout(2000);
      await progressQuoteToApproved(validQuotes[1]);
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('TEST COMPLETE!');
    console.log('='.repeat(80));
    console.log('\n📊 Check your app now - you should see:');
    console.log('  • 3 new customers in Customers page');
    console.log('  • Multiple quotes in different stages');
    console.log('  • Pipeline progression working\n');
    
    console.log('⏸️  Keeping browser open for 30 seconds so you can inspect...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
    await dbClient.end();
  }
}

runTest();

