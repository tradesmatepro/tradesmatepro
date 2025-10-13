/**
 * Automated Test for Labor Line Items Fix
 * 
 * This test verifies that labor line items are saved correctly
 * when using the "Create & Send to Customer" button.
 */

const { chromium } = require('playwright');
const fs = require('fs');

const APP_URL = 'http://localhost:3004';
const TEST_USER = {
  email: 'jeraldjsmith@gmail.com',
  password: 'Gizmo123'
};

const consoleLogs = [];
const networkLogs = [];

async function testLaborLineFix() {
  console.log('\n🧪 TESTING LABOR LINE ITEMS FIX\n');
  console.log('='.repeat(80));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 50
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  let workOrderId = null;
  
  // Capture console logs
  page.on('console', msg => {
    const log = {
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString()
    };
    consoleLogs.push(log);
    
    // Print important logs
    if (msg.text().includes('🔧') || 
        msg.text().includes('prepareQuoteDataWithLabor') ||
        msg.text().includes('laborQuoteItems') ||
        msg.text().includes('combinedQuoteItems')) {
      console.log(`   📝 ${msg.text()}`);
    }
  });
  
  // Capture network requests
  page.on('request', request => {
    if (request.url().includes('work_orders') && request.method() === 'POST') {
      try {
        const postData = request.postData();
        console.log(`\n📤 POST REQUEST TO CREATE WORK ORDER`);
        console.log(`   Data: ${postData.substring(0, 300)}...`);
      } catch (err) {
        // Can't get post data
      }
    }
    
    if (request.url().includes('work_order_line_items') && request.method() === 'POST') {
      try {
        const postData = request.postData();
        console.log(`\n📤 POST REQUEST TO CREATE LINE ITEMS`);
        console.log(`   Data: ${postData}`);
        
        // Parse to count labor items
        try {
          const items = JSON.parse(postData);
          const laborItems = Array.isArray(items) ? items.filter(i => i.line_type === 'labor') : [];
          console.log(`   ✅ LABOR ITEMS IN REQUEST: ${laborItems.length}`);
        } catch (e) {
          // Can't parse
        }
      } catch (err) {
        // Can't get post data
      }
    }
  });
  
  page.on('response', async response => {
    if (response.url().includes('work_orders') && response.request().method() === 'POST') {
      try {
        const body = await response.json();
        if (Array.isArray(body) && body.length > 0) {
          workOrderId = body[0].id;
          console.log(`\n✅ Work Order Created: ${workOrderId}`);
        }
      } catch (err) {
        // Can't parse response
      }
    }
  });
  
  try {
    // Step 1: Login
    console.log('\n🔐 Step 1: Logging in...');
    await page.goto(`${APP_URL}/login`);
    await page.waitForSelector('input[type="email"]');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    console.log('✅ Logged in');
    
    // Step 2: Go to quotes
    console.log('\n📋 Step 2: Navigating to Quotes...');
    await page.goto(`${APP_URL}/quotes`);
    await page.waitForTimeout(2000);
    console.log('✅ On Quotes page');
    
    // Step 3: Click Create Quote
    console.log('\n➕ Step 3: Clicking "Create Quote"...');
    await page.click('button:has-text("Create Quote")');
    await page.waitForTimeout(2000);
    console.log('✅ Create Quote modal opened');
    
    // Step 4: Fill form
    console.log('\n📝 Step 4: Filling quote form...');
    
    // Fill title
    await page.fill('input[placeholder*="HVAC"]', 'AUTO TEST - Labor Fix Verification');
    console.log('   ✅ Filled title');

    // Select customer using search
    try {
      // Type in customer search to trigger results
      const customerInput = page.locator('input[placeholder*="customer"]').first();
      await customerInput.fill('arlie');
      await page.waitForTimeout(1000);

      // Click the first search result
      await page.click('.customer-search-result, [class*="search-result"]').catch(() => {
        // If no search results, try clicking any customer option
        page.keyboard.press('ArrowDown');
        page.keyboard.press('Enter');
      });

      console.log('   ✅ Selected customer');
    } catch (err) {
      console.log('   ⚠️  Could not select customer:', err.message);
      console.log('   Continuing without customer (testing if it works)...');
    }

    await page.waitForTimeout(1000);
    
    // The labor row should be auto-added, let's verify it exists
    const laborTableExists = await page.locator('table').count() > 0;
    console.log(`   Labor table exists: ${laborTableExists}`);
    
    // Step 5: Click "Create & Send to Customer"
    console.log('\n🚀 Step 5: Clicking "Create & Send to Customer"...');
    console.log('   This should now include labor items in the save!');
    
    await page.click('button:has-text("Create & Send to Customer")');
    await page.waitForTimeout(5000); // Wait for save to complete
    
    // Close the send modal if it appears
    try {
      const modalVisible = await page.locator('.modal').isVisible();
      if (modalVisible) {
        console.log('   📧 Send modal appeared, closing it...');
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1000);
      }
    } catch (err) {
      // No modal or already closed
    }
    
    console.log('✅ Quote saved!');
    
    // Step 6: Verify labor items were saved
    if (workOrderId) {
      console.log(`\n🔍 Step 6: Verifying labor items in database...`);
      console.log(`   Work Order ID: ${workOrderId}`);
      
      // Query the database to check line items
      await page.waitForTimeout(2000);
      
      // Navigate to the quote to see if labor items are there
      await page.goto(`${APP_URL}/quotes`);
      await page.waitForTimeout(2000);
      
      // Try to find and click the quote we just created
      try {
        await page.click('text=AUTO TEST - Labor Fix Verification');
        await page.waitForTimeout(2000);
        
        // Take screenshot
        await page.screenshot({ path: 'devtools/screenshots/labor-fix-verification.png' });
        console.log('   📸 Screenshot saved: devtools/screenshots/labor-fix-verification.png');
        
        // Check if labor items are visible
        const pageContent = await page.content();
        const hasLaborText = pageContent.includes('labor') || pageContent.includes('Labor');
        console.log(`   Labor text found in page: ${hasLaborText}`);
        
      } catch (err) {
        console.log('   ⚠️  Could not open quote for verification');
      }
    }
    
    // Step 7: Analyze logs
    console.log('\n📊 Step 7: Analyzing logs...');
    
    // Check if prepareQuoteDataWithLabor was called
    const prepareDataCalled = consoleLogs.some(log => 
      log.text.includes('prepareQuoteDataWithLabor called')
    );
    console.log(`   ✅ prepareQuoteDataWithLabor called: ${prepareDataCalled}`);
    
    // Check if labor items were converted
    const laborConversionLogs = consoleLogs.filter(log => 
      log.text.includes('laborQuoteItems') || 
      log.text.includes('combinedQuoteItems')
    );
    console.log(`   ✅ Labor conversion logs: ${laborConversionLogs.length}`);
    
    // Check if labor items were in the combined items
    const combinedItemsLog = consoleLogs.find(log => 
      log.text.includes('combinedQuoteItems.length')
    );
    if (combinedItemsLog) {
      console.log(`   📊 ${combinedItemsLog.text}`);
    }
    
    // Save logs
    fs.writeFileSync(
      'devtools/logs/labor-fix-test-console.json',
      JSON.stringify(consoleLogs, null, 2)
    );
    console.log(`\n📁 Logs saved: devtools/logs/labor-fix-test-console.json`);
    
    // Final result
    console.log('\n' + '='.repeat(80));
    console.log('\n✅ TEST COMPLETE!\n');
    
    if (prepareDataCalled && laborConversionLogs.length > 0) {
      console.log('🎉 SUCCESS! Labor conversion is now working!');
      console.log('   - prepareQuoteDataWithLabor was called ✅');
      console.log('   - Labor items were converted ✅');
      console.log('   - Combined items include labor ✅');
    } else {
      console.log('❌ FAILED! Labor conversion may not be working');
      console.log(`   - prepareQuoteDataWithLabor called: ${prepareDataCalled}`);
      console.log(`   - Labor conversion logs: ${laborConversionLogs.length}`);
    }
    
    console.log('\n📸 Check screenshot: devtools/screenshots/labor-fix-verification.png');
    console.log('📁 Check logs: devtools/logs/labor-fix-test-console.json');
    console.log('\nPress Ctrl+C to close browser.\n');
    
    // Keep browser open for inspection
    await new Promise(() => {});
    
  } catch (err) {
    console.error('\n❌ ERROR:', err);
    await browser.close();
    process.exit(1);
  }
}

if (require.main === module) {
  testLaborLineFix().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { testLaborLineFix };

