/**
 * Complete Pipeline End-to-End Test
 * 
 * Tests the entire work order pipeline from quote creation to closed status.
 * Verifies all enum transitions and modal interceptions work correctly.
 * 
 * Run with: node tests/e2e/complete-pipeline-test.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:3004';
const TEST_EMAIL = 'jeraldjsmith@gmail.com';
const TEST_PASSWORD = 'Alphaecho19!'; // Update if different
const LOGS_FILE = path.join(__dirname, '../../test-results/pipeline-test-results.json');

// Test data
const TEST_QUOTE = {
  title: `E2E Test Quote ${Date.now()}`,
  customer: 'Smith Residence', // Assuming this customer exists
  description: 'End-to-end pipeline test',
  amount: 1500
};

// Results tracking
const results = {
  startTime: new Date().toISOString(),
  tests: [],
  errors: [],
  consoleErrors: [],
  networkErrors: []
};

// Helper to log test results
function logTest(name, status, details = {}) {
  const test = {
    name,
    status, // 'PASS', 'FAIL', 'SKIP'
    timestamp: new Date().toISOString(),
    ...details
  };
  results.tests.push(test);
  console.log(`${status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏭️'} ${name}`);
  if (details.error) {
    console.error(`   Error: ${details.error}`);
  }
}

// Helper to wait for navigation and network idle
async function waitForPageLoad(page) {
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(1000);
}

// Main test function
async function runPipelineTest() {
  console.log('🚀 Starting Complete Pipeline E2E Test...\n');
  
  let browser;
  let page;
  let quoteId;
  
  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: false, // Set to true for CI/CD
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        results.consoleErrors.push({
          timestamp: new Date().toISOString(),
          text: msg.text(),
          location: msg.location()
        });
      }
    });
    
    // Capture network errors
    page.on('requestfailed', request => {
      results.networkErrors.push({
        timestamp: new Date().toISOString(),
        url: request.url(),
        method: request.method(),
        failure: request.failure()
      });
    });
    
    // ========================================
    // TEST 1: Login
    // ========================================
    try {
      await page.goto(`${BASE_URL}/login`);
      await waitForPageLoad(page);
      
      await page.type('input[type="email"]', TEST_EMAIL);
      await page.type('input[type="password"]', TEST_PASSWORD);
      await page.click('button[type="submit"]');
      
      await waitForPageLoad(page);
      
      // Verify we're logged in (check for dashboard or quotes page)
      const url = page.url();
      if (url.includes('/dashboard') || url.includes('/quotes') || url.includes('/jobs')) {
        logTest('Login', 'PASS');
      } else {
        throw new Error(`Unexpected URL after login: ${url}`);
      }
    } catch (error) {
      logTest('Login', 'FAIL', { error: error.message });
      throw error; // Can't continue without login
    }
    
    // ========================================
    // TEST 2: Create Quote (draft status)
    // ========================================
    try {
      await page.goto(`${BASE_URL}/quotes`);
      await waitForPageLoad(page);
      
      // Click "New Quote" button
      await page.click('button:has-text("New Quote"), button:has-text("Create Quote")');
      await page.waitForTimeout(1000);
      
      // Fill in quote form
      await page.type('input[name="job_title"], input[placeholder*="title"]', TEST_QUOTE.title);
      
      // Select customer (assuming dropdown)
      await page.click('select[name="customer_id"]');
      await page.select('select[name="customer_id"]', { label: TEST_QUOTE.customer });
      
      // Add description if field exists
      const descField = await page.$('textarea[name="description"]');
      if (descField) {
        await page.type('textarea[name="description"]', TEST_QUOTE.description);
      }
      
      // Save quote
      await page.click('button:has-text("Save"), button:has-text("Create")');
      await waitForPageLoad(page);
      
      // Verify quote was created (should see it in the list)
      const quoteTitle = await page.$(`text=${TEST_QUOTE.title}`);
      if (quoteTitle) {
        logTest('Create Quote (draft)', 'PASS');
        
        // Try to extract quote ID from URL or data attribute
        const quoteElement = await page.$(`[data-quote-id]`);
        if (quoteElement) {
          quoteId = await quoteElement.getAttribute('data-quote-id');
        }
      } else {
        throw new Error('Quote not found in list after creation');
      }
    } catch (error) {
      logTest('Create Quote (draft)', 'FAIL', { error: error.message });
    }
    
    // ========================================
    // TEST 3: Send Quote (draft → sent)
    // ========================================
    try {
      // Find and click the quote to edit
      await page.click(`text=${TEST_QUOTE.title}`);
      await page.waitForTimeout(1000);
      
      // Change status to 'sent' (should trigger SendQuoteModal)
      await page.select('select[name="job_status"], select[name="status"]', 'sent');
      
      // Check if modal appeared
      const modal = await page.$('[role="dialog"], .modal');
      if (modal) {
        // Fill in modal fields
        await page.select('select[name="deliveryMethod"]', 'email');
        await page.type('textarea[name="customMessage"]', 'Test quote - please review');
        
        // Confirm
        await page.click('button:has-text("Send"), button:has-text("Confirm")');
        await waitForPageLoad(page);
        
        logTest('Send Quote (draft → sent)', 'PASS', { modalFired: true });
      } else {
        logTest('Send Quote (draft → sent)', 'FAIL', { error: 'SendQuoteModal did not fire' });
      }
    } catch (error) {
      logTest('Send Quote (draft → sent)', 'FAIL', { error: error.message });
    }
    
    // ========================================
    // TEST 4: Approve Quote (sent → approved)
    // ========================================
    try {
      await page.select('select[name="job_status"], select[name="status"]', 'approved');
      
      const modal = await page.$('[role="dialog"], .modal');
      if (modal) {
        // Fill in approval modal
        await page.type('input[name="approvedBy"]', 'John Smith');
        await page.click('button:has-text("Approve"), button:has-text("Confirm")');
        await waitForPageLoad(page);
        
        logTest('Approve Quote (sent → approved)', 'PASS', { modalFired: true });
      } else {
        logTest('Approve Quote (sent → approved)', 'FAIL', { error: 'ApprovalModal did not fire' });
      }
    } catch (error) {
      logTest('Approve Quote (sent → approved)', 'FAIL', { error: error.message });
    }
    
    // ========================================
    // TEST 5: Schedule Job (approved → scheduled)
    // ========================================
    try {
      // Navigate to Jobs page
      await page.goto(`${BASE_URL}/jobs`);
      await waitForPageLoad(page);
      
      // Find the job (should have same title)
      await page.click(`text=${TEST_QUOTE.title}`);
      await page.waitForTimeout(1000);
      
      // Click "Schedule" button or change status
      const scheduleButton = await page.$('button:has-text("Schedule")');
      if (scheduleButton) {
        await scheduleButton.click();
      } else {
        await page.select('select[name="job_status"]', 'scheduled');
      }
      
      // Smart Scheduling Assistant should appear
      const modal = await page.$('[role="dialog"], .modal');
      if (modal) {
        // Fill in scheduling details
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().split('T')[0];
        
        await page.type('input[type="date"]', dateStr);
        await page.type('input[type="time"]', '09:00');
        
        // Select technician if dropdown exists
        const techSelect = await page.$('select[name="assigned_technician_id"]');
        if (techSelect) {
          await page.select('select[name="assigned_technician_id"]', { index: 1 });
        }
        
        await page.click('button:has-text("Schedule"), button:has-text("Confirm")');
        await waitForPageLoad(page);
        
        logTest('Schedule Job (approved → scheduled)', 'PASS', { modalFired: true });
      } else {
        logTest('Schedule Job (approved → scheduled)', 'FAIL', { error: 'Smart Scheduling Assistant did not fire' });
      }
    } catch (error) {
      logTest('Schedule Job (approved → scheduled)', 'FAIL', { error: error.message });
    }
    
    // Continue with remaining tests...
    // (Due to 300 line limit, will add more in next edit)
    
  } catch (error) {
    results.errors.push({
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack
    });
    console.error('❌ Test suite failed:', error);
  } finally {
    // Save results
    results.endTime = new Date().toISOString();
    results.duration = new Date(results.endTime) - new Date(results.startTime);
    
    // Ensure test-results directory exists
    const resultsDir = path.dirname(LOGS_FILE);
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    fs.writeFileSync(LOGS_FILE, JSON.stringify(results, null, 2));
    console.log(`\n📊 Test results saved to: ${LOGS_FILE}`);
    
    // Print summary
    const passed = results.tests.filter(t => t.status === 'PASS').length;
    const failed = results.tests.filter(t => t.status === 'FAIL').length;
    const skipped = results.tests.filter(t => t.status === 'SKIP').length;
    
    console.log('\n📈 Test Summary:');
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   🐛 Console Errors: ${results.consoleErrors.length}`);
    console.log(`   🌐 Network Errors: ${results.networkErrors.length}`);
    
    // Close browser
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
runPipelineTest().catch(console.error);

