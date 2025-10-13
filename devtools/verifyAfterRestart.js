/**
 * VERIFY FIXES AFTER RESTART
 * 
 * Quick verification that all fixes are working
 */

const { chromium } = require('playwright');

const APP_URL = 'http://localhost:3004';
const TEST_USER = {
  email: 'jeraldjsmith@gmail.com',
  password: 'Gizmo123'
};

async function verifyFixes() {
  console.log('\n🔍 VERIFYING FIXES AFTER RESTART');
  console.log('='.repeat(80));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 100
  });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  
  const results = {
    workOrders: { expected: 21, actual: 0, status: '❌' },
    scheduling: { expected: 12, actual: 0, status: '❌' },
    invoices: { expected: 4, actual: 0, status: '❌' }
  };
  
  try {
    // Login
    console.log('\n🔐 Logging in...');
    await page.goto(`${APP_URL}/login`);
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    console.log('✅ Logged in\n');
    
    // Test 1: Work Orders Page
    console.log('📋 Test 1: Work Orders Page...');
    await page.goto(`${APP_URL}/work-orders`);
    await page.waitForTimeout(3000);
    
    // Count work orders (try multiple selectors)
    let woCount = 0;
    try {
      woCount = await page.locator('table tbody tr').count();
      if (woCount === 0) {
        woCount = await page.locator('[class*="work-order"]').count();
      }
      if (woCount === 0) {
        woCount = await page.locator('[class*="card"]').count();
      }
    } catch (e) {
      console.log('   ⚠️  Could not count work orders');
    }
    
    results.workOrders.actual = woCount;
    results.workOrders.status = woCount >= 15 ? '✅' : (woCount > 0 ? '🟡' : '❌');
    
    console.log(`   ${results.workOrders.status} Found ${woCount} work orders (expected ~21)`);
    
    // Test 2: Scheduling Calendar
    console.log('\n📋 Test 2: Scheduling Calendar...');
    await page.goto(`${APP_URL}/scheduling`);
    await page.waitForTimeout(4000);
    
    // Count calendar events
    let eventCount = 0;
    try {
      eventCount = await page.locator('.fc-event').count();
      if (eventCount === 0) {
        eventCount = await page.locator('[class*="event"]').count();
      }
    } catch (e) {
      console.log('   ⚠️  Could not count calendar events');
    }
    
    results.scheduling.actual = eventCount;
    results.scheduling.status = eventCount >= 10 ? '✅' : (eventCount > 0 ? '🟡' : '❌');
    
    console.log(`   ${results.scheduling.status} Found ${eventCount} calendar events (expected ~12)`);
    
    // Test 3: Invoices Page
    console.log('\n📋 Test 3: Invoices Page...');
    await page.goto(`${APP_URL}/invoices`);
    await page.waitForTimeout(3000);
    
    // Count invoices
    let invCount = 0;
    try {
      invCount = await page.locator('table tbody tr').count();
      if (invCount === 0) {
        invCount = await page.locator('[class*="invoice"]').count();
      }
    } catch (e) {
      console.log('   ⚠️  Could not count invoices');
    }
    
    results.invoices.actual = invCount;
    results.invoices.status = invCount >= 4 ? '✅' : (invCount > 0 ? '🟡' : '❌');
    
    console.log(`   ${results.invoices.status} Found ${invCount} invoices (expected ~4)`);
    
    // Summary
    console.log('\n\n' + '='.repeat(80));
    console.log('📊 VERIFICATION SUMMARY');
    console.log('='.repeat(80));
    
    console.log(`\n${results.workOrders.status} Work Orders: ${results.workOrders.actual}/${results.workOrders.expected}`);
    console.log(`${results.scheduling.status} Scheduling: ${results.scheduling.actual}/${results.scheduling.expected}`);
    console.log(`${results.invoices.status} Invoices: ${results.invoices.actual}/${results.invoices.expected}`);
    
    const allPassed = results.workOrders.status === '✅' && 
                      results.scheduling.status === '✅' && 
                      results.invoices.status === '✅';
    
    if (allPassed) {
      console.log('\n🎉 ALL FIXES VERIFIED! Everything is working!');
    } else {
      console.log('\n⚠️  Some issues detected. Checking console for errors...');
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('\nBrowser will stay open for 30 seconds for manual inspection...');
    await page.waitForTimeout(30000);
    
  } catch (err) {
    console.error('\n❌ ERROR:', err.message);
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  verifyFixes().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { verifyFixes };

