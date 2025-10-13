/**
 * Comprehensive Test for ALL Quote Types with Labor Line Items
 * 
 * Tests:
 * 1. Time & Materials
 * 2. Fixed Price
 * 3. Percentage-based
 * 4. Recurring
 * 5. Any other quote types
 */

const { chromium } = require('playwright');
const fs = require('fs');

const APP_URL = 'http://localhost:3004';
const TEST_USER = {
  email: 'jeraldjsmith@gmail.com',
  password: 'Gizmo123'
};

const QUOTE_TYPES = [
  { name: 'Time & Materials', value: 'TIME_MATERIALS' },
  { name: 'Fixed Price', value: 'FIXED_PRICE' },
  { name: 'Percentage', value: 'PERCENTAGE' },
  { name: 'Recurring', value: 'RECURRING' }
];

const testResults = [];

async function testQuoteType(page, quoteType) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🧪 TESTING: ${quoteType.name}`);
  console.log('='.repeat(80));
  
  const result = {
    quoteType: quoteType.name,
    success: false,
    laborConversionCalled: false,
    laborItemsConverted: 0,
    errors: []
  };
  
  const consoleLogs = [];
  
  // Capture console logs for this test
  const logHandler = (msg) => {
    const log = {
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString()
    };
    consoleLogs.push(log);
    
    // Check for labor conversion
    if (msg.text().includes('prepareQuoteDataWithLabor called')) {
      result.laborConversionCalled = true;
      console.log('   ✅ Labor conversion called');
    }
    
    if (msg.text().includes('laborQuoteItems.length:')) {
      const match = msg.text().match(/laborQuoteItems\.length: (\d+)/);
      if (match) {
        result.laborItemsConverted = parseInt(match[1]);
        console.log(`   ✅ Labor items converted: ${result.laborItemsConverted}`);
      }
    }
    
    if (msg.type() === 'error' && msg.text().includes('labor')) {
      result.errors.push(msg.text());
      console.log(`   ❌ Error: ${msg.text()}`);
    }
  };
  
  page.on('console', logHandler);
  
  try {
    // Navigate to quotes
    console.log('\n📋 Step 1: Going to Quotes page...');
    await page.goto(`${APP_URL}/quotes`);
    await page.waitForTimeout(2000);
    
    // Click Create Quote
    console.log('➕ Step 2: Clicking "Create Quote"...');
    await page.click('button:has-text("Create Quote")');
    await page.waitForTimeout(2000);
    
    // Fill title
    console.log('📝 Step 3: Filling form...');
    await page.fill('input[placeholder*="HVAC"]', `TEST ${quoteType.name} - Labor`);
    console.log('   ✅ Filled title');
    
    // Select customer
    try {
      const customerInput = page.locator('input[placeholder*="customer"]').first();
      await customerInput.fill('arlie');
      await page.waitForTimeout(1000);
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      console.log('   ✅ Selected customer');
    } catch (err) {
      console.log('   ⚠️  Could not select customer, continuing...');
    }
    
    await page.waitForTimeout(1000);
    
    // Select quote type (if there's a dropdown)
    try {
      const pricingModelSelect = page.locator('select[name="pricing_model"]');
      const exists = await pricingModelSelect.count() > 0;
      
      if (exists) {
        await pricingModelSelect.selectOption(quoteType.value);
        console.log(`   ✅ Selected pricing model: ${quoteType.name}`);
        await page.waitForTimeout(1000);
      } else {
        console.log('   ℹ️  No pricing model selector found (may be default)');
      }
    } catch (err) {
      console.log(`   ⚠️  Could not select pricing model: ${err.message}`);
    }
    
    // Verify labor table exists
    const laborTableExists = await page.locator('table').count() > 0;
    console.log(`   Labor table exists: ${laborTableExists}`);
    
    // Click "Create & Send to Customer"
    console.log('\n🚀 Step 4: Clicking "Create & Send to Customer"...');
    await page.click('button:has-text("Create & Send to Customer")');
    await page.waitForTimeout(5000);
    
    // Close send modal if it appears
    try {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
    } catch (err) {
      // No modal
    }
    
    // Check results
    if (result.laborConversionCalled && result.laborItemsConverted > 0) {
      result.success = true;
      console.log(`\n✅ SUCCESS for ${quoteType.name}!`);
    } else {
      console.log(`\n❌ FAILED for ${quoteType.name}`);
      console.log(`   Labor conversion called: ${result.laborConversionCalled}`);
      console.log(`   Labor items converted: ${result.laborItemsConverted}`);
    }
    
    // Save logs for this quote type
    fs.writeFileSync(
      `devtools/logs/quote-type-${quoteType.value.toLowerCase()}.json`,
      JSON.stringify(consoleLogs, null, 2)
    );
    
  } catch (err) {
    result.errors.push(err.message);
    console.log(`\n❌ ERROR testing ${quoteType.name}: ${err.message}`);
  } finally {
    page.off('console', logHandler);
  }
  
  return result;
}

async function runAllTests() {
  console.log('\n🧪 COMPREHENSIVE QUOTE TYPE TESTING\n');
  console.log('='.repeat(80));
  console.log('\nTesting labor line items with ALL quote types:\n');
  QUOTE_TYPES.forEach((qt, i) => {
    console.log(`   ${i + 1}. ${qt.name} (${qt.value})`);
  });
  console.log('\n' + '='.repeat(80));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 50
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Login once
    console.log('\n🔐 Logging in...');
    await page.goto(`${APP_URL}/login`);
    await page.waitForSelector('input[type="email"]');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    console.log('✅ Logged in');
    
    // Test each quote type
    for (const quoteType of QUOTE_TYPES) {
      const result = await testQuoteType(page, quoteType);
      testResults.push(result);
      
      // Wait between tests
      await page.waitForTimeout(2000);
    }
    
    // Print summary
    console.log('\n\n' + '='.repeat(80));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(80));
    
    const passed = testResults.filter(r => r.success).length;
    const failed = testResults.filter(r => !r.success).length;
    
    console.log(`\n✅ Passed: ${passed}/${testResults.length}`);
    console.log(`❌ Failed: ${failed}/${testResults.length}`);
    
    console.log('\n📋 Detailed Results:\n');
    testResults.forEach((result, i) => {
      const icon = result.success ? '✅' : '❌';
      console.log(`${icon} ${i + 1}. ${result.quoteType}`);
      console.log(`   Labor conversion called: ${result.laborConversionCalled}`);
      console.log(`   Labor items converted: ${result.laborItemsConverted}`);
      if (result.errors.length > 0) {
        console.log(`   Errors: ${result.errors.length}`);
        result.errors.forEach(err => console.log(`      - ${err}`));
      }
      console.log('');
    });
    
    // Save summary
    fs.writeFileSync(
      'devtools/logs/quote-types-test-summary.json',
      JSON.stringify({
        timestamp: new Date().toISOString(),
        totalTests: testResults.length,
        passed,
        failed,
        results: testResults
      }, null, 2)
    );
    
    console.log('='.repeat(80));
    console.log('\n📁 Logs saved:');
    console.log('   - devtools/logs/quote-types-test-summary.json');
    QUOTE_TYPES.forEach(qt => {
      console.log(`   - devtools/logs/quote-type-${qt.value.toLowerCase()}.json`);
    });
    
    if (passed === testResults.length) {
      console.log('\n🎉 ALL QUOTE TYPES PASSED! Labor line items work everywhere! 🎉\n');
    } else {
      console.log(`\n⚠️  ${failed} quote type(s) failed. Check logs for details.\n`);
    }
    
    console.log('Press Ctrl+C to close browser.\n');
    
    // Keep browser open
    await new Promise(() => {});
    
  } catch (err) {
    console.error('\n❌ FATAL ERROR:', err);
    await browser.close();
    process.exit(1);
  }
}

if (require.main === module) {
  runAllTests().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { runAllTests, testQuoteType };

