const puppeteer = require('puppeteer');

async function simpleTest() {
  console.log('🛠️ Simple Developer Tools Test...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });

  try {
    const page = await browser.newPage();
    
    // Enable console logging
    page.on('console', msg => {
      console.log(`Browser Console [${msg.type()}]: ${msg.text()}`);
    });

    // Track page errors
    page.on('pageerror', error => {
      console.log(`❌ Page Error: ${error.message}`);
    });

    console.log('📋 Step 1: Navigate to TradeMate Pro login...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    
    // Login
    console.log('📋 Step 2: Logging in...');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.type('input[type="email"]', 'jeraldjsmith@gmail.com');
    await page.type('input[type="password"]', 'Gizmo123');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    console.log('📋 Step 3: Waiting for dashboard...');
    await page.waitForSelector('[data-testid="dashboard"], .dashboard, h1', { timeout: 15000 });
    
    console.log('📋 Step 4: Navigate to Developer Tools...');
    await page.goto('http://localhost:3000/developer-tools', { waitUntil: 'networkidle0' });
    
    // Take a screenshot to see what's happening
    await page.screenshot({ path: 'developer-tools-debug.png', fullPage: true });
    console.log('📸 Screenshot saved as developer-tools-debug.png');
    
    // Check what's actually on the page
    const pageTitle = await page.title();
    console.log(`📋 Page title: ${pageTitle}`);
    
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log(`📋 Page content preview: ${bodyText.substring(0, 200)}...`);
    
    // Check if there are any error messages
    const errorElements = await page.$$('.error, .alert-error, [role="alert"]');
    if (errorElements.length > 0) {
      console.log(`❌ Found ${errorElements.length} error elements on page`);
      for (let i = 0; i < errorElements.length; i++) {
        const errorText = await errorElements[i].evaluate(el => el.textContent);
        console.log(`  Error ${i + 1}: ${errorText}`);
      }
    }
    
    // Check if the main heading exists
    const headingExists = await page.$('h1');
    if (headingExists) {
      const headingText = await headingExists.evaluate(el => el.textContent);
      console.log(`📋 Found heading: ${headingText}`);
    } else {
      console.log('❌ No h1 heading found');
    }
    
    // Check for any div with developer-tools class
    const devToolsDiv = await page.$('.developer-tools');
    if (devToolsDiv) {
      console.log('✅ Found .developer-tools div');
    } else {
      console.log('❌ No .developer-tools div found');
    }
    
    // Check for data-testid
    const testIdDiv = await page.$('[data-testid="developer-tools"]');
    if (testIdDiv) {
      console.log('✅ Found [data-testid="developer-tools"] div');
    } else {
      console.log('❌ No [data-testid="developer-tools"] div found');
    }
    
    // Wait a bit longer to see if it loads
    console.log('📋 Waiting 5 more seconds...');
    await page.waitForTimeout(5000);
    
    // Check again
    const devToolsDiv2 = await page.$('.developer-tools');
    if (devToolsDiv2) {
      console.log('✅ Found .developer-tools div after waiting');
      return { success: true };
    } else {
      console.log('❌ Still no .developer-tools div found');
      return { success: false, error: 'Developer Tools div not found' };
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return { success: false, error: error.message };
  } finally {
    // Keep browser open for manual inspection
    console.log('🔍 Browser left open for manual inspection. Close manually when done.');
    // await browser.close();
  }
}

// Run the test
simpleTest().then(result => {
  console.log('📋 Test Results:', result);
}).catch(error => {
  console.error('❌ Test script failed:', error);
});
