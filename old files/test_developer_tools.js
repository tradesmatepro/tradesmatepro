const puppeteer = require('puppeteer');

async function testDeveloperTools() {
  console.log('🛠️ Starting Developer Tools Test...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });

  try {
    const page = await browser.newPage();
    
    // Enable console logging
    page.on('console', msg => {
      const type = msg.type();
      if (type === 'error') {
        console.log(`❌ Console Error: ${msg.text()}`);
      } else if (type === 'warn') {
        console.log(`⚠️ Console Warning: ${msg.text()}`);
      }
    });

    // Track network errors
    const networkErrors = [];
    page.on('response', response => {
      if (response.status() >= 400) {
        networkErrors.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
      }
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
    
    // Wait for Developer Tools to load
    console.log('📋 Step 5: Checking Developer Tools interface...');
    await page.waitForSelector('.developer-tools, [data-testid="developer-tools"]', { timeout: 10000 });
    
    // Test each tab
    const tabs = ['logs-tab', 'database-tab', 'auth-tab', 'health-tab', 'export-tab'];
    
    for (const tabId of tabs) {
      try {
        console.log(`📋 Step 6.${tabs.indexOf(tabId) + 1}: Testing ${tabId}...`);
        
        // Click tab if it exists
        const tabButton = await page.$(`#${tabId}, [data-tab="${tabId}"], button:contains("${tabId.replace('-tab', '')}")`);
        if (tabButton) {
          await tabButton.click();
          await page.waitForTimeout(1000);
          console.log(`✅ ${tabId} loaded successfully`);
        } else {
          console.log(`⚠️ ${tabId} not found, checking for alternative selectors...`);
        }
      } catch (error) {
        console.log(`❌ Error testing ${tabId}: ${error.message}`);
      }
    }
    
    // Test console log capture
    console.log('📋 Step 7: Testing console log capture...');
    await page.evaluate(() => {
      console.log('Test log message from Developer Tools test');
      console.warn('Test warning message from Developer Tools test');
      console.error('Test error message from Developer Tools test');
    });
    
    await page.waitForTimeout(2000);
    
    // Check if logs are captured
    const logElements = await page.$$('.log-entry, .console-log, [data-testid="log-entry"]');
    console.log(`📋 Found ${logElements.length} log entries`);
    
    // Test database connection
    console.log('📋 Step 8: Testing database connection...');
    try {
      const dbTestButton = await page.$('button:contains("Test Connection"), [data-testid="test-db-connection"]');
      if (dbTestButton) {
        await dbTestButton.click();
        await page.waitForTimeout(3000);
        console.log('✅ Database connection test triggered');
      }
    } catch (error) {
      console.log(`⚠️ Database test button not found: ${error.message}`);
    }
    
    // Test export functionality
    console.log('📋 Step 9: Testing export functionality...');
    try {
      const exportButton = await page.$('button:contains("Export"), [data-testid="export-debug-data"]');
      if (exportButton) {
        await exportButton.click();
        await page.waitForTimeout(2000);
        console.log('✅ Export functionality triggered');
      }
    } catch (error) {
      console.log(`⚠️ Export button not found: ${error.message}`);
    }
    
    // Generate some errors to test error capture
    console.log('📋 Step 10: Testing error capture by navigating to problematic pages...');
    
    const testPages = [
      '/dashboard',
      '/customers', 
      '/quotes',
      '/work-orders',
      '/inventory'
    ];
    
    for (const testPage of testPages) {
      try {
        console.log(`📋 Testing page: ${testPage}`);
        await page.goto(`http://localhost:3000${testPage}`, { waitUntil: 'networkidle0', timeout: 10000 });
        await page.waitForTimeout(2000);
        
        // Go back to developer tools to check captured errors
        await page.goto('http://localhost:3000/developer-tools', { waitUntil: 'networkidle0' });
        await page.waitForTimeout(1000);
        
      } catch (error) {
        console.log(`❌ Error testing page ${testPage}: ${error.message}`);
      }
    }
    
    // Final check of captured data
    console.log('📋 Step 11: Final check of captured data...');
    
    const finalLogCount = await page.$$eval('.log-entry, .console-log, [data-testid="log-entry"]', 
      elements => elements.length
    ).catch(() => 0);
    
    console.log(`📋 Final log count: ${finalLogCount}`);
    console.log(`📋 Network errors detected: ${networkErrors.length}`);
    
    if (networkErrors.length > 0) {
      console.log('❌ Network Errors Found:');
      networkErrors.forEach(error => {
        console.log(`  - ${error.status} ${error.statusText}: ${error.url}`);
      });
    }
    
    // Take a screenshot
    await page.screenshot({ path: 'developer-tools-test.png', fullPage: true });
    console.log('📸 Screenshot saved as developer-tools-test.png');
    
    console.log('🎉 Developer Tools test completed!');
    
    return {
      success: true,
      logsCaptured: finalLogCount,
      networkErrors: networkErrors.length,
      screenshot: 'developer-tools-test.png'
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return {
      success: false,
      error: error.message
    };
  } finally {
    await browser.close();
  }
}

// Run the test
testDeveloperTools().then(result => {
  console.log('📋 Test Results:', result);
  process.exit(result.success ? 0 : 1);
}).catch(error => {
  console.error('❌ Test script failed:', error);
  process.exit(1);
});
