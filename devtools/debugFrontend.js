/**
 * 🔍 DEBUG FRONTEND - Capture actual API calls and responses
 * 
 * This will show us EXACTLY what the frontend is sending to the API
 * and what responses it's getting back.
 */

const { chromium } = require('playwright');

const APP_URL = 'http://localhost:3004';
const TEST_EMAIL = 'jeraldjsmith@gmail.com';
const TEST_PASSWORD = 'Gizmo123';

async function debugFrontend() {
  console.log('🔍 DEBUGGING FRONTEND API CALLS\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Capture all network requests
  page.on('request', request => {
    if (request.url().includes('supabase') || request.url().includes('customers')) {
      console.log(`\n📤 REQUEST: ${request.method()} ${request.url()}`);
      if (request.postData()) {
        console.log(`   Body: ${request.postData()}`);
      }
    }
  });
  
  // Capture all network responses
  page.on('response', async response => {
    if (response.url().includes('supabase') || response.url().includes('customers')) {
      console.log(`\n📥 RESPONSE: ${response.status()} ${response.url()}`);
      try {
        const body = await response.text();
        console.log(`   Body: ${body.substring(0, 500)}`);
      } catch (e) {
        console.log(`   (Could not read body)`);
      }
    }
  });
  
  // Capture console logs
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`\n❌ CONSOLE ERROR: ${msg.text()}`);
    }
  });
  
  try {
    // Login
    console.log('🔐 Logging in...');
    await page.goto(`${APP_URL}/login`);
    await page.waitForTimeout(2000);
    
    const emailInput = await page.locator('input[type="email"]').count();
    if (emailInput > 0) {
      await page.fill('input[type="email"]', TEST_EMAIL);
      await page.fill('input[type="password"]', TEST_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
    }
    console.log('✅ Logged in\n');
    
    // Go to customers page
    console.log('📍 Navigating to customers page...');
    await page.goto(`${APP_URL}/customers`);
    await page.waitForTimeout(2000);
    
    // Click Add Customer
    console.log('📍 Clicking Add Customer button...\n');
    const addBtn = await page.locator('button:has-text("Add Customer"), button:has-text("New Customer")').first();
    if (await addBtn.count() > 0) {
      await addBtn.click();
      await page.waitForTimeout(2000);
      
      // Fill form - use first_name and last_name for residential customer
      console.log('📍 Filling customer form...\n');

      // Wait for form to appear
      await page.waitForSelector('input', { timeout: 5000 });

      // Fill first name
      const firstNameInput = await page.locator('input').filter({ hasText: '' }).first();
      await firstNameInput.fill('Debug');
      await page.waitForTimeout(500);

      // Try to find and fill last name
      const inputs = await page.locator('input[type="text"]').all();
      if (inputs.length > 1) {
        await inputs[1].fill('TestCustomer');
      }
      await page.waitForTimeout(500);

      // Fill email
      const emailInput = await page.locator('input[type="email"]').first();
      if (await emailInput.count() > 0) {
        await emailInput.fill('debug@test.com');
      }
      await page.waitForTimeout(500);

      // Fill phone
      const phoneInputs = await page.locator('input').all();
      for (const input of phoneInputs) {
        const placeholder = await input.getAttribute('placeholder');
        if (placeholder && placeholder.includes('555')) {
          await input.fill('+15559999999');
          break;
        }
      }

      // Submit
      console.log('📍 Submitting form...\n');
      const submitBtn = await page.locator('button[type="submit"]').first();
      await submitBtn.click();
      await page.waitForTimeout(5000);
      
      console.log('\n✅ Form submitted. Check the API calls above to see what happened!');
      console.log('\n⏸️  Keeping browser open for 30 seconds so you can inspect...');
      await page.waitForTimeout(30000);
      
    } else {
      console.log('❌ Add Customer button not found!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

debugFrontend();

