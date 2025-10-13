/**
 * CHECK ACTUAL QUERIES
 * 
 * Intercept network requests to see what queries are being made
 */

const { chromium } = require('playwright');

const APP_URL = 'http://localhost:3004';
const TEST_USER = {
  email: 'jeraldjsmith@gmail.com',
  password: 'Gizmo123'
};

async function checkActualQueries() {
  console.log('\n🔍 CHECKING ACTUAL QUERIES');
  console.log('='.repeat(80));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 100
  });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  
  const queries = {
    workOrders: [],
    scheduling: [],
    invoices: []
  };
  
  let currentPage = '';
  
  // Intercept network requests
  page.on('request', request => {
    const url = request.url();
    if (url.includes('supabase.co/rest/v1/')) {
      const query = url.split('/rest/v1/')[1];
      
      if (currentPage === 'work-orders' && query.includes('work_orders')) {
        queries.workOrders.push({ url: query, method: request.method() });
      } else if (currentPage === 'scheduling' && (query.includes('work_orders') || query.includes('schedule_events'))) {
        queries.scheduling.push({ url: query, method: request.method() });
      } else if (currentPage === 'invoices' && query.includes('invoices')) {
        queries.invoices.push({ url: query, method: request.method() });
      }
    }
  });
  
  // Capture responses
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('supabase.co/rest/v1/')) {
      const query = url.split('/rest/v1/')[1];
      
      if (currentPage === 'work-orders' && query.includes('work_orders') && response.ok()) {
        try {
          const data = await response.json();
          console.log(`   ✅ Work Orders query returned ${Array.isArray(data) ? data.length : 0} results`);
        } catch (e) {}
      } else if (currentPage === 'scheduling' && (query.includes('work_orders') || query.includes('schedule_events')) && response.ok()) {
        try {
          const data = await response.json();
          console.log(`   ✅ Scheduling query returned ${Array.isArray(data) ? data.length : 0} results`);
        } catch (e) {}
      }
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
    
    // Test Work Orders Page
    console.log('📋 Checking Work Orders Page...\n');
    currentPage = 'work-orders';
    await page.goto(`${APP_URL}/work-orders`);
    await page.waitForTimeout(5000);
    
    // Test Scheduling Page
    console.log('\n📋 Checking Scheduling Page...\n');
    currentPage = 'scheduling';
    await page.goto(`${APP_URL}/scheduling`);
    await page.waitForTimeout(5000);
    
    // Test Invoices Page
    console.log('\n📋 Checking Invoices Page...\n');
    currentPage = 'invoices';
    await page.goto(`${APP_URL}/invoices`);
    await page.waitForTimeout(5000);
    
    // Summary
    console.log('\n\n' + '='.repeat(80));
    console.log('📊 QUERY SUMMARY');
    console.log('='.repeat(80));
    
    console.log(`\n📋 Work Orders Queries: ${queries.workOrders.length}`);
    queries.workOrders.forEach((q, i) => {
      console.log(`   ${i + 1}. ${q.method} ${decodeURIComponent(q.url).substring(0, 150)}`);
    });
    
    console.log(`\n📋 Scheduling Queries: ${queries.scheduling.length}`);
    queries.scheduling.forEach((q, i) => {
      console.log(`   ${i + 1}. ${q.method} ${decodeURIComponent(q.url).substring(0, 150)}`);
    });
    
    console.log(`\n📋 Invoices Queries: ${queries.invoices.length}`);
    queries.invoices.forEach((q, i) => {
      console.log(`   ${i + 1}. ${q.method} ${decodeURIComponent(q.url).substring(0, 150)}`);
    });
    
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
  checkActualQueries().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { checkActualQueries };

