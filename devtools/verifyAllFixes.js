/**
 * VERIFY ALL FIXES
 * 
 * Comprehensive verification after rebuild
 */

const { chromium } = require('playwright');

const APP_URL = 'http://localhost:3004';
const TEST_USER = {
  email: 'jeraldjsmith@gmail.com',
  password: 'Gizmo123'
};

async function verifyAllFixes() {
  console.log('\n🔍 VERIFYING ALL FIXES AFTER REBUILD');
  console.log('='.repeat(80));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 100
  });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  
  const results = {
    invoices: { expected: 4, actual: 0, status: '❌', errors: [] },
    workOrders: { expected: 10, actual: 0, status: '❌', errors: [] },
    scheduling: { expected: 12, actual: 0, status: '❌', errors: [] }
  };
  
  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (text.includes('invoice')) results.invoices.errors.push(text);
      if (text.includes('work_order') || text.includes('work-order')) results.workOrders.errors.push(text);
      if (text.includes('calendar') || text.includes('schedule')) results.scheduling.errors.push(text);
    }
  });
  
  // Capture network errors
  const networkErrors = [];
  page.on('response', response => {
    if (!response.ok() && response.url().includes('supabase')) {
      networkErrors.push(`${response.status()} - ${response.url()}`);
    }
  });
  
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
    
    // Test 1: Invoices Page
    console.log('📋 Test 1: Invoices Page...');
    await page.goto(`${APP_URL}/invoices`);
    await page.waitForTimeout(4000);
    
    let invCount = 0;
    try {
      invCount = await page.locator('table tbody tr').count();
      if (invCount === 0) {
        invCount = await page.locator('[class*="invoice-card"]').count();
      }
      if (invCount === 0) {
        invCount = await page.locator('[class*="invoice"]').count();
      }
    } catch (e) {}
    
    results.invoices.actual = invCount;
    results.invoices.status = invCount >= 4 ? '✅' : (invCount > 0 ? '🟡' : '❌');
    
    console.log(`   ${results.invoices.status} Found ${invCount} invoices (expected ~4)`);
    if (results.invoices.errors.length > 0) {
      console.log(`   ⚠️  ${results.invoices.errors.length} console errors`);
    }
    
    // Test 2: Work Orders Page
    console.log('\n📋 Test 2: Work Orders Page...');
    await page.goto(`${APP_URL}/work-orders`);
    await page.waitForTimeout(4000);
    
    let woCount = 0;
    try {
      woCount = await page.locator('table tbody tr').count();
      if (woCount === 0) {
        woCount = await page.locator('[class*="work-order-card"]').count();
      }
      if (woCount === 0) {
        woCount = await page.locator('[class*="card"]').count();
      }
    } catch (e) {}
    
    results.workOrders.actual = woCount;
    results.workOrders.status = woCount >= 10 ? '✅' : (woCount > 0 ? '🟡' : '❌');
    
    console.log(`   ${results.workOrders.status} Found ${woCount} work orders (expected ~10)`);
    if (results.workOrders.errors.length > 0) {
      console.log(`   ⚠️  ${results.workOrders.errors.length} console errors`);
    }
    
    // Test 3: Scheduling Calendar
    console.log('\n📋 Test 3: Scheduling Calendar...');
    await page.goto(`${APP_URL}/scheduling`);
    await page.waitForTimeout(5000);
    
    let eventCount = 0;
    try {
      eventCount = await page.locator('.fc-event').count();
      if (eventCount === 0) {
        eventCount = await page.locator('[class*="calendar-event"]').count();
      }
      if (eventCount === 0) {
        eventCount = await page.locator('[class*="event"]').count();
      }
    } catch (e) {}
    
    results.scheduling.actual = eventCount;
    results.scheduling.status = eventCount >= 10 ? '✅' : (eventCount > 0 ? '🟡' : '❌');
    
    console.log(`   ${results.scheduling.status} Found ${eventCount} calendar events (expected ~12)`);
    if (results.scheduling.errors.length > 0) {
      console.log(`   ⚠️  ${results.scheduling.errors.length} console errors`);
    }
    
    // Summary
    console.log('\n\n' + '='.repeat(80));
    console.log('📊 VERIFICATION SUMMARY');
    console.log('='.repeat(80));
    
    console.log(`\n${results.invoices.status} Invoices: ${results.invoices.actual}/${results.invoices.expected}`);
    console.log(`${results.workOrders.status} Work Orders: ${results.workOrders.actual}/${results.workOrders.expected}`);
    console.log(`${results.scheduling.status} Scheduling: ${results.scheduling.actual}/${results.scheduling.expected}`);
    
    const allPassed = results.invoices.status === '✅' && 
                      results.workOrders.status === '✅' && 
                      results.scheduling.status === '✅';
    
    if (allPassed) {
      console.log('\n🎉 ALL FIXES VERIFIED! Everything is working perfectly!');
    } else {
      console.log('\n⚠️  Some issues remain. Details:');
      
      if (results.invoices.status !== '✅') {
        console.log(`\n   Invoices (${results.invoices.actual}/${results.invoices.expected}):`);
        if (results.invoices.errors.length > 0) {
          console.log(`      Errors: ${results.invoices.errors[0].substring(0, 100)}`);
        }
      }
      
      if (results.workOrders.status !== '✅') {
        console.log(`\n   Work Orders (${results.workOrders.actual}/${results.workOrders.expected}):`);
        if (results.workOrders.errors.length > 0) {
          console.log(`      Errors: ${results.workOrders.errors[0].substring(0, 100)}`);
        }
      }
      
      if (results.scheduling.status !== '✅') {
        console.log(`\n   Scheduling (${results.scheduling.actual}/${results.scheduling.expected}):`);
        if (results.scheduling.errors.length > 0) {
          console.log(`      Errors: ${results.scheduling.errors[0].substring(0, 100)}`);
        }
      }
    }
    
    if (networkErrors.length > 0) {
      console.log(`\n🔴 Network Errors: ${networkErrors.length}`);
      networkErrors.slice(0, 3).forEach(err => {
        console.log(`   - ${err.substring(0, 100)}`);
      });
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
  verifyAllFixes().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { verifyAllFixes };

