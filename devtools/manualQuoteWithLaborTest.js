/**
 * Manual Quote with Labor Test
 * 
 * This will:
 * 1. Open the browser
 * 2. Login
 * 3. Go to quotes
 * 4. Click Create Quote
 * 5. WAIT for you to manually fill the form and add labor
 * 6. Capture ALL console logs and network requests
 * 7. Show you exactly what happens when you click Save
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const APP_URL = 'http://localhost:3004';
const TEST_USER = {
  email: 'jeraldjsmith@gmail.com',
  password: 'Gizmo123'
};

const consoleLogs = [];
const networkLogs = [];

async function manualTest() {
  console.log('\n🧪 MANUAL QUOTE WITH LABOR TEST\n');
  console.log('='.repeat(80));
  console.log('\nThis test will:');
  console.log('  1. Login for you');
  console.log('  2. Navigate to Quotes');
  console.log('  3. Click "Create Quote"');
  console.log('  4. WAIT for YOU to:');
  console.log('     - Fill in the quote details');
  console.log('     - Add labor line items');
  console.log('     - Click SAVE');
  console.log('  5. Capture EVERYTHING that happens');
  console.log('  6. Show you the results\n');
  console.log('='.repeat(80));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 100
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Capture console logs
  page.on('console', msg => {
    const log = {
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString()
    };
    consoleLogs.push(log);
    
    // Print important logs in real-time
    if (msg.type() === 'error' || 
        msg.text().includes('🔧') || 
        msg.text().includes('labor') ||
        msg.text().includes('Submitting') ||
        msg.text().includes('onSubmit')) {
      console.log(`   📝 [${msg.type()}] ${msg.text()}`);
    }
  });
  
  // Capture network requests
  page.on('request', request => {
    const log = {
      type: 'request',
      method: request.method(),
      url: request.url(),
      timestamp: new Date().toISOString()
    };
    
    // Capture POST data for work_orders
    if (request.url().includes('work_orders') && request.method() === 'POST') {
      try {
        log.postData = request.postData();
        console.log(`\n📤 POST REQUEST TO CREATE WORK ORDER:`);
        console.log(`   URL: ${request.url()}`);
        console.log(`   Data: ${request.postData()}`);
      } catch (err) {
        // Can't get post data
      }
    }
    
    networkLogs.push(log);
  });
  
  page.on('response', async response => {
    const log = {
      type: 'response',
      status: response.status(),
      url: response.url(),
      timestamp: new Date().toISOString()
    };
    
    // Capture response for work_orders
    if (response.url().includes('work_orders') && response.request().method() === 'POST') {
      try {
        const body = await response.text();
        log.body = body;
        console.log(`\n📥 RESPONSE FROM CREATE WORK ORDER:`);
        console.log(`   Status: ${response.status()}`);
        console.log(`   Body: ${body.substring(0, 500)}`);
      } catch (err) {
        // Can't get response body
      }
    }
    
    networkLogs.push(log);
  });
  
  try {
    // Login
    console.log('\n🔐 Step 1: Logging in...');
    await page.goto(`${APP_URL}/login`);
    await page.waitForSelector('input[type="email"]');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    console.log('✅ Logged in');
    
    // Go to quotes
    console.log('\n📋 Step 2: Navigating to Quotes...');
    await page.goto(`${APP_URL}/quotes`);
    await page.waitForTimeout(2000);
    console.log('✅ On Quotes page');
    
    // Click Create Quote
    console.log('\n➕ Step 3: Clicking "Create Quote"...');
    await page.click('button:has-text("Create Quote")');
    await page.waitForTimeout(2000);
    console.log('✅ Create Quote modal opened');
    
    // Now wait for user
    console.log('\n⏸️  Step 4: YOUR TURN!');
    console.log('='.repeat(80));
    console.log('\n👉 Please do the following:');
    console.log('   1. Fill in the quote title');
    console.log('   2. Select a customer');
    console.log('   3. Add labor line items (use the labor table)');
    console.log('   4. Click SAVE');
    console.log('\n📊 I will capture everything that happens!');
    console.log('\n⏳ Waiting for you to click SAVE...\n');
    console.log('='.repeat(80));
    
    // Wait for the save to happen (detect when modal closes or network request)
    let saveDetected = false;
    const startTime = Date.now();
    
    while (!saveDetected && (Date.now() - startTime) < 300000) { // 5 minute timeout
      await page.waitForTimeout(1000);
      
      // Check if a POST to work_orders happened
      const postRequest = networkLogs.find(log => 
        log.type === 'request' && 
        log.method === 'POST' && 
        log.url.includes('work_orders') &&
        new Date(log.timestamp).getTime() > startTime
      );
      
      if (postRequest) {
        saveDetected = true;
        console.log('\n✅ SAVE DETECTED!');
        await page.waitForTimeout(3000); // Wait for response
        break;
      }
    }
    
    // Analyze results
    console.log('\n📊 ANALYSIS:');
    console.log('='.repeat(80));
    
    // Save all logs
    fs.writeFileSync(
      'devtools/logs/manual-test-console.json',
      JSON.stringify(consoleLogs, null, 2)
    );
    fs.writeFileSync(
      'devtools/logs/manual-test-network.json',
      JSON.stringify(networkLogs, null, 2)
    );
    
    console.log(`\n📁 Logs saved:`);
    console.log(`   - devtools/logs/manual-test-console.json (${consoleLogs.length} logs)`);
    console.log(`   - devtools/logs/manual-test-network.json (${networkLogs.length} requests)`);
    
    // Find labor-related logs
    const laborLogs = consoleLogs.filter(log => 
      log.text.toLowerCase().includes('labor') ||
      log.text.includes('🔧')
    );
    
    console.log(`\n📊 Labor-related logs: ${laborLogs.length}`);
    
    if (laborLogs.length > 0) {
      console.log(`\n🔍 Key Labor Logs:`);
      laborLogs.slice(-10).forEach(log => {
        console.log(`   [${log.type}] ${log.text}`);
      });
    }
    
    // Find POST requests
    const postRequests = networkLogs.filter(log => 
      log.type === 'request' && 
      log.method === 'POST' &&
      log.url.includes('work_orders')
    );
    
    console.log(`\n📤 POST requests to work_orders: ${postRequests.length}`);
    
    if (postRequests.length > 0) {
      console.log(`\n✅ Quote was submitted to API!`);
      postRequests.forEach((req, i) => {
        console.log(`\n   Request ${i + 1}:`);
        console.log(`      URL: ${req.url}`);
        if (req.postData) {
          console.log(`      Data: ${req.postData.substring(0, 200)}...`);
        }
      });
    } else {
      console.log(`\n❌ No POST request detected - quote was NOT submitted!`);
    }
    
    console.log('\n='.repeat(80));
    console.log('\n✅ Test complete! Browser will stay open for inspection.');
    console.log('   Press Ctrl+C to close.\n');
    
    // Keep browser open
    await new Promise(() => {});
    
  } catch (err) {
    console.error('\n❌ ERROR:', err);
    await browser.close();
  }
}

if (require.main === module) {
  manualTest().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { manualTest };

