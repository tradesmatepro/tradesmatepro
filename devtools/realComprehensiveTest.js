/**
 * REAL COMPREHENSIVE FUNCTIONAL TEST
 * 
 * This test checks if DATA ACTUALLY DISPLAYS on each page
 * Not just if forms open!
 * 
 * Checks:
 * - Do customers display?
 * - Do employees display?
 * - Do timesheets display?
 * - Do invoices display?
 * - Do closed jobs display?
 * - Does inventory display?
 * - Does payroll display?
 * - Does PTO display?
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const APP_URL = 'http://localhost:3004';
const TEST_USER = {
  email: 'jeraldjsmith@gmail.com',
  password: 'Gizmo123'
};

const results = {
  startTime: new Date().toISOString(),
  pages: [],
  summary: { total: 0, hasData: 0, noData: 0, error: 0 }
};

async function login(page) {
  console.log('🔐 Logging in...');
  await page.goto(`${APP_URL}/login`);
  await page.fill('input[type="email"]', TEST_USER.email);
  await page.fill('input[type="password"]', TEST_USER.password);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  console.log('✅ Logged in\n');
}

async function checkPageForData(page, pageName, url, dataSelectors) {
  console.log(`\n📋 CHECKING: ${pageName}`);
  console.log('=' .repeat(60));
  
  const pageResult = {
    name: pageName,
    url: url,
    checks: []
  };
  
  try {
    await page.goto(`${APP_URL}${url}`);
    await page.waitForTimeout(3000);
    
    // Take screenshot
    await page.screenshot({ path: `devtools/screenshots/${pageName.replace(/\s+/g, '-').toLowerCase()}.png` });
    
    // Check for data
    for (const check of dataSelectors) {
      console.log(`  🔍 Checking: ${check.name}`);
      
      try {
        const count = await page.locator(check.selector).count();
        const hasData = count > 0;
        
        // Also check for "no data" messages
        const noDataMessages = await page.locator('text=/no.*found|empty|no.*yet|get started/i').count();
        const hasNoDataMessage = noDataMessages > 0;
        
        // Get actual text content for debugging
        let sampleText = '';
        if (hasData) {
          const firstElement = await page.locator(check.selector).first();
          sampleText = await firstElement.textContent().catch(() => '');
        }
        
        pageResult.checks.push({
          name: check.name,
          selector: check.selector,
          count: count,
          hasData: hasData,
          hasNoDataMessage: hasNoDataMessage,
          sampleText: sampleText.substring(0, 100)
        });
        
        if (hasData) {
          console.log(`     ✅ FOUND DATA: ${count} items`);
          if (sampleText) console.log(`        Sample: "${sampleText.substring(0, 50)}..."`);
        } else if (hasNoDataMessage) {
          console.log(`     🟡 NO DATA: Empty state message found`);
        } else {
          console.log(`     ❌ NO DATA: No items found, no empty state`);
        }
      } catch (error) {
        pageResult.checks.push({
          name: check.name,
          selector: check.selector,
          error: error.message
        });
        console.log(`     ❌ ERROR: ${error.message}`);
      }
    }
    
  } catch (error) {
    pageResult.error = error.message;
    console.log(`  ❌ PAGE ERROR: ${error.message}`);
  }
  
  return pageResult;
}

async function runRealComprehensiveTest() {
  console.log('\n🚀 REAL COMPREHENSIVE FUNCTIONAL TEST');
  console.log('Checking if DATA ACTUALLY DISPLAYS on each page');
  console.log('=' .repeat(60));
  
  // Create screenshots directory
  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  
  await login(page);
  
  // Test each page for actual data
  const pagesToTest = [
    {
      name: 'Dashboard',
      url: '/dashboard',
      checks: [
        { name: 'Stat cards', selector: '[class*="stat"], [class*="card"]' },
        { name: 'Recent activity', selector: 'table tbody tr, [class*="activity"]' }
      ]
    },
    {
      name: 'Customers',
      url: '/customers',
      checks: [
        { name: 'Customer list', selector: 'table tbody tr' },
        { name: 'Customer cards', selector: '[class*="customer"]' }
      ]
    },
    {
      name: 'Employees',
      url: '/employees',
      checks: [
        { name: 'Employee list', selector: 'table tbody tr' },
        { name: 'Employee cards', selector: '[class*="employee"]' }
      ]
    },
    {
      name: 'Timesheets',
      url: '/timesheets',
      checks: [
        { name: 'Timesheet list', selector: 'table tbody tr' },
        { name: 'Timesheet data', selector: '[class*="timesheet"]' }
      ]
    },
    {
      name: 'PTO/Time Off',
      url: '/my-time-off',
      checks: [
        { name: 'PTO requests', selector: 'table tbody tr' },
        { name: 'PTO balance', selector: 'text=/balance|hours|days/i' }
      ]
    },
    {
      name: 'Scheduling',
      url: '/scheduling',
      checks: [
        { name: 'Calendar events', selector: '.fc-event, [class*="event"]' },
        { name: 'Scheduled jobs', selector: 'table tbody tr' }
      ]
    },
    {
      name: 'Work Orders (All)',
      url: '/work-orders',
      checks: [
        { name: 'Work order list', selector: 'table tbody tr' },
        { name: 'Work order cards', selector: '[class*="work-order"], [class*="job"]' }
      ]
    },
    {
      name: 'Quotes',
      url: '/quotes',
      checks: [
        { name: 'Quote list', selector: 'table tbody tr' },
        { name: 'Quote cards', selector: '[class*="quote"]' }
      ]
    },
    {
      name: 'Invoices',
      url: '/invoices',
      checks: [
        { name: 'Invoice list', selector: 'table tbody tr' },
        { name: 'Invoice cards', selector: '[class*="invoice"]' }
      ]
    },
    {
      name: 'Vendors',
      url: '/vendors',
      checks: [
        { name: 'Vendor list', selector: 'table tbody tr' },
        { name: 'Vendor cards', selector: '[class*="vendor"]' }
      ]
    },
    {
      name: 'Purchase Orders',
      url: '/purchase-orders',
      checks: [
        { name: 'PO list', selector: 'table tbody tr' },
        { name: 'PO cards', selector: '[class*="purchase"]' }
      ]
    },
    {
      name: 'Expenses',
      url: '/expenses',
      checks: [
        { name: 'Expense list', selector: 'table tbody tr' },
        { name: 'Expense cards', selector: '[class*="expense"]' }
      ]
    },
    {
      name: 'Inventory',
      url: '/inventory',
      checks: [
        { name: 'Inventory list', selector: 'table tbody tr' },
        { name: 'Inventory items', selector: '[class*="inventory"], [class*="item"]' }
      ]
    },
    {
      name: 'Payroll',
      url: '/payroll',
      checks: [
        { name: 'Payroll runs', selector: 'table tbody tr' },
        { name: 'Payroll data', selector: '[class*="payroll"]' }
      ]
    }
  ];
  
  for (const pageTest of pagesToTest) {
    const result = await checkPageForData(page, pageTest.name, pageTest.url, pageTest.checks);
    results.pages.push(result);
    
    // Count results
    const hasAnyData = result.checks.some(c => c.hasData);
    const hasAllEmpty = result.checks.every(c => !c.hasData);
    
    if (result.error) {
      results.summary.error++;
    } else if (hasAnyData) {
      results.summary.hasData++;
    } else if (hasAllEmpty) {
      results.summary.noData++;
    }
    
    results.summary.total++;
  }
  
  await browser.close();
  
  results.endTime = new Date().toISOString();
  
  // Print summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 REAL COMPREHENSIVE TEST SUMMARY');
  console.log('=' .repeat(60));
  console.log(`Total Pages Tested: ${results.summary.total}`);
  console.log(`✅ Pages with Data: ${results.summary.hasData}`);
  console.log(`🟡 Pages with No Data: ${results.summary.noData}`);
  console.log(`❌ Pages with Errors: ${results.summary.error}`);
  console.log('=' .repeat(60));
  
  // Detailed breakdown
  console.log('\n📋 DETAILED BREAKDOWN:\n');
  results.pages.forEach(page => {
    const hasData = page.checks.some(c => c.hasData);
    const icon = hasData ? '✅' : '🟡';
    console.log(`${icon} ${page.name}: ${page.checks.filter(c => c.hasData).length}/${page.checks.length} checks found data`);
  });
  
  // Save results
  const outputPath = path.join(__dirname, 'real-comprehensive-test-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Full results saved to: ${outputPath}`);
  console.log(`📸 Screenshots saved to: ${screenshotsDir}\n`);
}

runRealComprehensiveTest().catch(console.error);

