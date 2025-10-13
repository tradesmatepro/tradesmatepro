/**
 * FULL AUTO TEST: Quote Labor Line Items
 * 
 * This script does EVERYTHING automatically:
 * 1. Starts servers
 * 2. Logs into app
 * 3. Creates test quote with labor
 * 4. Captures logs
 * 5. Analyzes results
 * 6. Reports findings
 * 
 * NO MANUAL INTERVENTION REQUIRED!
 * 
 * Usage: node devtools/full_auto_quote_labor_test.js
 */

const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  frontendUrl: 'http://localhost:3004', // ✅ Updated to match actual port
  errorServerUrl: 'http://localhost:4000',
  smartLogsUrl: 'http://localhost:4000/smart-logs',
  testEmail: 'brad@ghvac.com',
  testPassword: 'Alphaecho19!',
  waitForServers: 15000, // 15 seconds
  waitForLogin: 5000,
  waitForNavigation: 3000,
  waitForSave: 5000,
  skipServerStart: true // ✅ Servers already running
};

let errorServer = null;
let frontendServer = null;
let browser = null;

// Helper: Start error server
async function startErrorServer() {
  console.log('\n📡 Starting error server...');
  
  return new Promise((resolve) => {
    errorServer = spawn('node', ['server.js'], {
      cwd: path.join(__dirname, '..'),
      shell: true
    });
    
    errorServer.stdout.on('data', (data) => {
      console.log(`[Error Server] ${data.toString().trim()}`);
    });
    
    errorServer.stderr.on('data', (data) => {
      console.error(`[Error Server ERROR] ${data.toString().trim()}`);
    });
    
    // Wait for server to start
    setTimeout(() => {
      console.log('✅ Error server started');
      resolve();
    }, 3000);
  });
}

// Helper: Start frontend server
async function startFrontendServer() {
  console.log('\n🚀 Starting frontend server...');
  
  return new Promise((resolve) => {
    frontendServer = spawn('npm', ['run', 'dev-main'], {
      cwd: path.join(__dirname, '..'),
      shell: true
    });
    
    frontendServer.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`[Frontend] ${output.trim()}`);
      
      // Check if server is ready
      if (output.includes('webpack compiled') || output.includes('Compiled successfully')) {
        console.log('✅ Frontend server ready');
        resolve();
      }
    });
    
    frontendServer.stderr.on('data', (data) => {
      console.error(`[Frontend ERROR] ${data.toString().trim()}`);
    });
    
    // Fallback timeout
    setTimeout(() => {
      console.log('✅ Frontend server started (timeout)');
      resolve();
    }, CONFIG.waitForServers);
  });
}

// Helper: Wait for server to be ready
async function waitForServer(url, maxAttempts = 30) {
  console.log(`\n⏳ Waiting for ${url} to be ready...`);
  
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(url);
      if (response.ok || response.status === 404) {
        console.log(`✅ ${url} is ready!`);
        return true;
      }
    } catch (err) {
      // Server not ready yet
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  throw new Error(`Server ${url} did not start in time`);
}

// Helper: Login to app
async function loginToApp(page) {
  console.log('\n🔐 Logging in...');
  
  await page.goto(CONFIG.frontendUrl);
  await page.waitForTimeout(2000);
  
  // Fill login form
  await page.fill('input[type="email"]', CONFIG.testEmail);
  await page.fill('input[type="password"]', CONFIG.testPassword);
  
  // Click login button
  await page.click('button[type="submit"]');
  
  // Wait for redirect to dashboard
  await page.waitForTimeout(CONFIG.waitForLogin);
  
  console.log('✅ Logged in successfully');
}

// Helper: Navigate to Quotes page
async function navigateToQuotes(page) {
  console.log('\n📋 Navigating to Quotes page...');

  try {
    // Try clicking Quotes in navigation
    await page.click('text=Quotes', { timeout: 5000 });
    await page.waitForTimeout(CONFIG.waitForNavigation);
  } catch (err) {
    console.log('⚠️  Could not find Quotes link, navigating directly to URL...');
    // Fallback: Navigate directly to quotes page
    await page.goto(`${CONFIG.frontendUrl}/quotes`);
    await page.waitForTimeout(CONFIG.waitForNavigation);
  }

  console.log('✅ On Quotes page');
}

// Helper: Create test quote with labor
async function createTestQuote(page) {
  console.log('\n📝 Creating test quote with labor...');

  // Take screenshot for debugging
  await page.screenshot({ path: 'devtools/screenshots/quotes-page.png' });
  console.log('📸 Screenshot saved: devtools/screenshots/quotes-page.png');

  // Try multiple selectors for Create Quote button
  let clicked = false;
  const selectors = [
    'button:has-text("Create Quote")',
    'button:has-text("New Quote")',
    'button:has-text("Create")',
    'a:has-text("Create Quote")',
    '[data-testid="create-quote-button"]'
  ];

  for (const selector of selectors) {
    try {
      await page.click(selector, { timeout: 3000 });
      clicked = true;
      console.log(`✅ Clicked button with selector: ${selector}`);
      break;
    } catch (err) {
      console.log(`⚠️  Selector not found: ${selector}`);
    }
  }

  if (!clicked) {
    throw new Error('Could not find Create Quote button with any selector');
  }

  await page.waitForTimeout(2000);
  
  // Fill quote details
  await page.fill('input[name="title"]', 'AUTO TEST - Labor Line Items');
  
  // Select customer (first one in dropdown)
  await page.click('select[name="customer_id"]');
  await page.selectOption('select[name="customer_id"]', { index: 1 });
  
  // Select pricing model: TIME_MATERIALS
  await page.click('select[name="pricing_model"]');
  await page.selectOption('select[name="pricing_model"]', 'time_materials');
  
  await page.waitForTimeout(1000);
  
  // Add labor
  console.log('  Adding labor: 1 employee × 8 hours...');
  
  // Find labor table and add row
  await page.click('button:has-text("Add Labor")');
  await page.waitForTimeout(500);
  
  // Fill labor details
  await page.fill('input[name="employees"]', '1');
  await page.fill('input[name="hours_per_day"]', '8');
  await page.fill('input[name="days"]', '1');
  
  await page.waitForTimeout(500);
  
  // Add material item
  console.log('  Adding material item...');
  
  await page.click('button:has-text("Add Line Item")');
  await page.waitForTimeout(500);
  
  await page.fill('input[name="item_name"]', 'Test Material');
  await page.fill('input[name="quantity"]', '1');
  await page.fill('input[name="rate"]', '50');
  
  await page.waitForTimeout(500);
  
  // Save quote
  console.log('  Saving quote...');
  
  await page.click('button:has-text("Save Quote")');
  await page.waitForTimeout(CONFIG.waitForSave);
  
  console.log('✅ Quote created');
}

// Helper: Get smart logs
async function getSmartLogs() {
  console.log('\n📊 Fetching smart logs...');
  
  try {
    const response = await fetch(CONFIG.smartLogsUrl);
    const data = await response.json();
    
    console.log(`✅ Retrieved ${data.totalLogs} logs`);
    
    return data;
  } catch (err) {
    console.error('❌ Failed to fetch smart logs:', err.message);
    return null;
  }
}

// Helper: Analyze logs
async function analyzeLogs(logs) {
  console.log('\n🔍 Analyzing logs...');
  
  const analysis = {
    laborRowsFound: false,
    laborRowsEmpty: false,
    laborConversionCalled: false,
    laborQuoteItemsCreated: false,
    laborQuoteItemsEmpty: false,
    combinedItemsIncludeLabor: false,
    saveQuoteItemsCalled: false,
    databaseInsertAttempted: false,
    databaseInsertSuccessful: false,
    errors: []
  };
  
  const allLogs = [
    ...(logs.categorizedLogs?.labor || []),
    ...(logs.categorizedLogs?.quote || []),
    ...(logs.categorizedLogs?.lineItems || [])
  ];
  
  allLogs.forEach(log => {
    const msg = log.message.toLowerCase();
    
    if (msg.includes('laborrows')) {
      analysis.laborRowsFound = true;
      if (msg.includes('laborrows: []') || msg.includes('laborrows.length: 0')) {
        analysis.laborRowsEmpty = true;
      }
    }
    
    if (msg.includes('convertlaborrowstoquoteitems')) {
      analysis.laborConversionCalled = true;
    }
    
    if (msg.includes('laborquoteitems')) {
      analysis.laborQuoteItemsCreated = true;
      if (msg.includes('laborquoteitems: []') || msg.includes('laborquoteitems.length: 0')) {
        analysis.laborQuoteItemsEmpty = true;
      }
    }
    
    if (msg.includes('combinedquoteitems')) {
      const hasLabor = msg.includes('item_type: \'labor\'') || msg.includes('item_type: "labor"');
      if (hasLabor) {
        analysis.combinedItemsIncludeLabor = true;
      }
    }
    
    if (msg.includes('saving line items')) {
      analysis.saveQuoteItemsCalled = true;
    }
    
    if (msg.includes('insert') && msg.includes('work_order_line_items')) {
      analysis.databaseInsertAttempted = true;
    }
    
    if (msg.includes('line items saved successfully')) {
      analysis.databaseInsertSuccessful = true;
    }
    
    if (log.level === 'error') {
      analysis.errors.push(log.message);
    }
  });
  
  return analysis;
}

// Helper: Generate report
function generateReport(analysis) {
  console.log('\n' + '='.repeat(80));
  console.log('📋 TEST RESULTS');
  console.log('='.repeat(80));
  
  console.log('\n✅ EXECUTION FLOW:\n');
  console.log(`  1. laborRows found:              ${analysis.laborRowsFound ? '✅ YES' : '❌ NO'}`);
  console.log(`  2. laborRows empty:              ${analysis.laborRowsEmpty ? '❌ YES (PROBLEM!)' : '✅ NO'}`);
  console.log(`  3. Labor conversion called:      ${analysis.laborConversionCalled ? '✅ YES' : '❌ NO'}`);
  console.log(`  4. laborQuoteItems created:      ${analysis.laborQuoteItemsCreated ? '✅ YES' : '❌ NO'}`);
  console.log(`  5. laborQuoteItems empty:        ${analysis.laborQuoteItemsEmpty ? '❌ YES (PROBLEM!)' : '✅ NO'}`);
  console.log(`  6. Combined items include labor: ${analysis.combinedItemsIncludeLabor ? '✅ YES' : '❌ NO (PROBLEM!)'}`);
  console.log(`  7. saveQuoteItems called:        ${analysis.saveQuoteItemsCalled ? '✅ YES' : '❌ NO'}`);
  console.log(`  8. Database INSERT attempted:    ${analysis.databaseInsertAttempted ? '✅ YES' : '❌ NO'}`);
  console.log(`  9. Database INSERT successful:   ${analysis.databaseInsertSuccessful ? '✅ YES' : '❌ NO (PROBLEM!)'}`);
  
  // Determine if test passed
  const testPassed = analysis.databaseInsertSuccessful && 
                     analysis.combinedItemsIncludeLabor &&
                     !analysis.laborRowsEmpty &&
                     !analysis.laborQuoteItemsEmpty;
  
  console.log('\n' + '='.repeat(80));
  if (testPassed) {
    console.log('✅ TEST PASSED - Labor line items are working!');
  } else {
    console.log('❌ TEST FAILED - Labor line items are NOT being saved');
  }
  console.log('='.repeat(80));
  
  return testPassed;
}

// Main test function
async function runFullAutoTest() {
  console.log('\n🤖 FULL AUTO TEST: Quote Labor Line Items');
  console.log('='.repeat(80));
  console.log('\nThis test will run COMPLETELY AUTOMATICALLY:');
  console.log('  1. Start servers');
  console.log('  2. Login to app');
  console.log('  3. Create test quote');
  console.log('  4. Analyze logs');
  console.log('  5. Report results');
  console.log('\nNO MANUAL INTERVENTION REQUIRED!\n');
  
  try {
    // Step 1: Start servers (skip if already running)
    if (!CONFIG.skipServerStart) {
      await startErrorServer();
      await startFrontendServer();

      // Wait for servers to be ready
      await waitForServer(CONFIG.errorServerUrl + '/health');
      await waitForServer(CONFIG.frontendUrl);
    } else {
      console.log('\n⏭️  Skipping server start (servers already running)');
      console.log('✅ Using existing servers:');
      console.log(`   - Frontend: ${CONFIG.frontendUrl}`);
      console.log(`   - Error Server: ${CONFIG.errorServerUrl}`);
    }
    
    // Step 2: Launch browser
    console.log('\n🌐 Launching browser...');
    browser = await chromium.launch({ headless: false }); // Set to true for headless
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Step 3: Login
    await loginToApp(page);
    
    // Step 4: Navigate to Quotes
    await navigateToQuotes(page);
    
    // Step 5: Create test quote
    await createTestQuote(page);
    
    // Step 6: Wait for logs to be exported
    console.log('\n⏳ Waiting for logs to be exported...');
    await page.waitForTimeout(10000); // Wait 10 seconds for logs
    
    // Step 7: Get smart logs
    const logs = await getSmartLogs();
    
    if (!logs) {
      throw new Error('Failed to retrieve smart logs');
    }
    
    // Step 8: Analyze logs
    const analysis = await analyzeLogs(logs);
    
    // Step 9: Generate report
    const testPassed = generateReport(analysis);
    
    // Step 10: Save results
    const reportPath = path.join(__dirname, 'full_auto_test_results.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      testPassed,
      analysis,
      logs: logs.categorizedLogs
    }, null, 2));
    
    console.log(`\n📁 Full results saved to: ${reportPath}\n`);
    
    // Close browser
    await browser.close();
    
    return testPassed;
    
  } catch (err) {
    console.error('\n❌ TEST FAILED WITH ERROR:', err);
    
    if (browser) {
      await browser.close();
    }
    
    return false;
  } finally {
    // Cleanup: Kill servers (only if we started them)
    if (!CONFIG.skipServerStart) {
      console.log('\n🧹 Cleaning up...');

      if (errorServer) {
        errorServer.kill();
        console.log('✅ Error server stopped');
      }

      if (frontendServer) {
        frontendServer.kill();
        console.log('✅ Frontend server stopped');
      }
    } else {
      console.log('\n✅ Test complete (servers left running)');
    }
  }
}

// Run the test
runFullAutoTest().then(passed => {
  process.exit(passed ? 0 : 1);
});

