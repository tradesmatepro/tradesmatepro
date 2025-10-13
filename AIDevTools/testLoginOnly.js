#!/usr/bin/env node

/**
 * Test Login Only - Debug login issues
 */

const puppeteer = require('puppeteer');

const APP_URL = 'http://localhost:3005';
const LOGIN_EMAIL = 'jeraldjsmith@gmail.com';
const LOGIN_PASSWORD = 'Gizmo123';

async function testLogin() {
  console.log('🔐 Testing Login...\n');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1920, height: 1080 },
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();

  // Capture ALL console messages
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    console.log(`[${type.toUpperCase()}] ${text}`);
  });

  // Capture network responses
  page.on('response', async response => {
    const url = response.url();
    const status = response.status();
    
    if (status >= 400) {
      console.log(`\n🌐 NETWORK ERROR:`);
      console.log(`   Status: ${status}`);
      console.log(`   URL: ${url}`);
      
      try {
        const body = await response.text();
        console.log(`   Response: ${body.substring(0, 500)}`);
      } catch (e) {
        console.log(`   (Could not read response body)`);
      }
      console.log('');
    }
  });

  // Capture page errors
  page.on('pageerror', error => {
    console.log(`\n💥 PAGE ERROR: ${error.message}\n`);
  });

  try {
    console.log('1. Navigating to login page...');
    await page.goto(`${APP_URL}/login`, { waitUntil: 'domcontentloaded' });
    console.log('   ✅ Page loaded\n');

    console.log('2. Waiting for login form...');
    await page.waitForSelector('input[name="email"]', { timeout: 10000 });
    console.log('   ✅ Form found\n');

    console.log('3. Entering credentials...');
    await page.type('input[name="email"]', LOGIN_EMAIL, { delay: 50 });
    await page.type('input[name="password"]', LOGIN_PASSWORD, { delay: 50 });
    console.log('   ✅ Credentials entered\n');

    console.log('4. Clicking login button...');
    await page.click('button[type="submit"]');
    console.log('   ✅ Button clicked\n');

    console.log('5. Waiting for response (10 seconds)...\n');
    await new Promise(resolve => setTimeout(resolve, 10000));

    const url = page.url();
    console.log(`\n📍 Current URL: ${url}\n`);

    if (url.includes('dashboard')) {
      console.log('✅ LOGIN SUCCESSFUL!\n');
    } else {
      console.log('❌ LOGIN FAILED - Still on login page\n');
      
      // Check for error message
      const errorText = await page.evaluate(() => {
        const errorEl = document.querySelector('[class*="red"]');
        return errorEl ? errorEl.textContent : 'No error message found';
      });
      console.log(`Error message: ${errorText}\n`);
    }

    console.log('Taking screenshot...');
    await page.screenshot({ path: 'AIDevTools/login-test.png', fullPage: true });
    console.log('   ✅ Screenshot saved to AIDevTools/login-test.png\n');

    console.log('Browser will close in 10 seconds...');
    await new Promise(resolve => setTimeout(resolve, 10000));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testLogin();

