/**
 * CHECK CONSOLE ERRORS
 * 
 * Capture browser console errors to diagnose why pages show no data
 */

const { chromium } = require('playwright');

const APP_URL = 'http://localhost:3004';
const TEST_USER = {
  email: 'jeraldjsmith@gmail.com',
  password: 'Gizmo123'
};

async function checkConsoleErrors() {
  console.log('\n🔍 CHECKING CONSOLE ERRORS');
  console.log('='.repeat(80));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 100
  });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  
  const consoleMessages = [];
  const errors = [];
  const warnings = [];
  const networkErrors = [];
  
  // Capture console messages
  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push({ type: msg.type(), text });
    
    if (msg.type() === 'error') {
      errors.push(text);
      console.log(`   ❌ ERROR: ${text}`);
    } else if (msg.type() === 'warning') {
      warnings.push(text);
    }
  });
  
  // Capture network errors
  page.on('response', response => {
    if (!response.ok() && response.url().includes('supabase')) {
      const error = `${response.status()} ${response.statusText()} - ${response.url()}`;
      networkErrors.push(error);
      console.log(`   🔴 NETWORK ERROR: ${error}`);
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
    await page.goto(`${APP_URL}/work-orders`);
    await page.waitForTimeout(5000);
    
    // Test Scheduling Page
    console.log('\n📋 Checking Scheduling Page...\n');
    await page.goto(`${APP_URL}/scheduling`);
    await page.waitForTimeout(5000);
    
    // Test Invoices Page
    console.log('\n📋 Checking Invoices Page...\n');
    await page.goto(`${APP_URL}/invoices`);
    await page.waitForTimeout(5000);
    
    // Summary
    console.log('\n\n' + '='.repeat(80));
    console.log('📊 CONSOLE ERROR SUMMARY');
    console.log('='.repeat(80));
    
    console.log(`\n❌ Errors: ${errors.length}`);
    if (errors.length > 0) {
      console.log('\nTop errors:');
      errors.slice(0, 5).forEach((err, i) => {
        console.log(`   ${i + 1}. ${err.substring(0, 100)}`);
      });
    }
    
    console.log(`\n⚠️  Warnings: ${warnings.length}`);
    if (warnings.length > 0 && warnings.length < 10) {
      console.log('\nWarnings:');
      warnings.forEach((warn, i) => {
        console.log(`   ${i + 1}. ${warn.substring(0, 100)}`);
      });
    }
    
    console.log(`\n🔴 Network Errors: ${networkErrors.length}`);
    if (networkErrors.length > 0) {
      console.log('\nNetwork errors:');
      networkErrors.forEach((err, i) => {
        console.log(`   ${i + 1}. ${err}`);
      });
    }
    
    // Check for specific patterns
    const hasRLSError = errors.some(e => e.toLowerCase().includes('rls') || e.toLowerCase().includes('policy'));
    const hasAuthError = errors.some(e => e.toLowerCase().includes('auth') || e.toLowerCase().includes('unauthorized'));
    const has404Error = networkErrors.some(e => e.includes('404'));
    const has403Error = networkErrors.some(e => e.includes('403'));
    
    console.log('\n🔍 Pattern Analysis:');
    console.log(`   ${hasRLSError ? '🔴' : '✅'} RLS/Policy errors: ${hasRLSError ? 'YES' : 'NO'}`);
    console.log(`   ${hasAuthError ? '🔴' : '✅'} Auth errors: ${hasAuthError ? 'YES' : 'NO'}`);
    console.log(`   ${has404Error ? '🔴' : '✅'} 404 errors: ${has404Error ? 'YES' : 'NO'}`);
    console.log(`   ${has403Error ? '🔴' : '✅'} 403 errors: ${has403Error ? 'YES' : 'NO'}`);
    
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
  checkConsoleErrors().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { checkConsoleErrors };

