/**
 * CHECK SETTINGS PAGES FOR ERRORS
 * 
 * Goes through all Settings pages and captures console errors
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const APP_URL = 'http://localhost:3004';
const TEST_USER = {
  email: 'jeraldjsmith@gmail.com',
  password: 'Gizmo123'
};

const SETTINGS_PAGES = [
  // Company & Business
  { name: 'Company Profile', path: '/settings?tab=company' },
  { name: 'Business Settings', path: '/settings?tab=business' },
  { name: 'Service Tags', path: '/settings?tab=tags' },
  { name: 'Rate Cards', path: '/settings?tab=rate-cards' },
  { name: 'Rates & Pricing', path: '/settings?tab=rates' },

  // Operations
  { name: 'Smart Scheduling', path: '/settings?tab=scheduling' },
  { name: 'Marketplace Settings', path: '/settings?tab=marketplace' },
  { name: 'Quote Acceptance', path: '/settings?tab=quote-acceptance' },
  { name: 'Invoicing', path: '/settings?tab=invoicing' },
  { name: 'Document Templates', path: '/settings?tab=documents' },
  { name: 'Org & Approvals', path: '/settings?tab=approvals' },

  // System & Security
  { name: 'Appearance', path: '/settings?tab=appearance' },
  { name: 'Notifications', path: '/settings?tab=notifications' },
  { name: 'Security', path: '/settings?tab=security' },
  { name: 'Integrations', path: '/settings?tab=integrations' },
];

async function checkSettingsPages() {
  console.log('\n🔍 CHECKING SETTINGS PAGES FOR ERRORS');
  console.log('='.repeat(80));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 100
  });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  
  const allErrors = [];
  const pageResults = [];
  
  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      allErrors.push({
        type: 'console',
        message: msg.text(),
        timestamp: new Date().toISOString()
      });
    }
  });
  
  // Capture page errors
  page.on('pageerror', error => {
    allErrors.push({
      type: 'page',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  });
  
  // Capture network errors
  page.on('response', response => {
    if (response.status() >= 400) {
      allErrors.push({
        type: 'network',
        status: response.status(),
        url: response.url(),
        timestamp: new Date().toISOString()
      });
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
    
    // Check each settings page
    for (const settingsPage of SETTINGS_PAGES) {
      console.log(`\n📋 Checking: ${settingsPage.name}`);
      console.log('-'.repeat(80));
      
      const pageErrorsBefore = allErrors.length;
      
      // Navigate to settings page
      await page.goto(`${APP_URL}${settingsPage.path}`);
      await page.waitForTimeout(3000);
      
      // Count errors for this page
      const pageErrorsAfter = allErrors.length;
      const errorsOnThisPage = allErrors.slice(pageErrorsBefore);
      
      // Categorize errors
      const consoleErrors = errorsOnThisPage.filter(e => e.type === 'console');
      const pageErrors = errorsOnThisPage.filter(e => e.type === 'page');
      const networkErrors = errorsOnThisPage.filter(e => e.type === 'network');
      
      const result = {
        name: settingsPage.name,
        path: settingsPage.path,
        totalErrors: errorsOnThisPage.length,
        consoleErrors: consoleErrors.length,
        pageErrors: pageErrors.length,
        networkErrors: networkErrors.length,
        errors: errorsOnThisPage
      };
      
      pageResults.push(result);
      
      // Display results
      if (errorsOnThisPage.length === 0) {
        console.log(`   ✅ No errors found`);
      } else {
        console.log(`   🔴 ${errorsOnThisPage.length} errors found:`);
        
        if (consoleErrors.length > 0) {
          console.log(`\n   Console Errors (${consoleErrors.length}):`);
          consoleErrors.forEach((err, i) => {
            console.log(`      ${i + 1}. ${err.message.substring(0, 100)}...`);
          });
        }
        
        if (pageErrors.length > 0) {
          console.log(`\n   Page Errors (${pageErrors.length}):`);
          pageErrors.forEach((err, i) => {
            console.log(`      ${i + 1}. ${err.message.substring(0, 100)}...`);
          });
        }
        
        if (networkErrors.length > 0) {
          console.log(`\n   Network Errors (${networkErrors.length}):`);
          networkErrors.forEach((err, i) => {
            const url = err.url.replace(APP_URL, '');
            console.log(`      ${i + 1}. ${err.status} - ${url.substring(0, 80)}...`);
          });
        }
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 SUMMARY');
    console.log('='.repeat(80));
    
    const totalErrors = allErrors.length;
    const pagesWithErrors = pageResults.filter(p => p.totalErrors > 0).length;
    const pagesWithoutErrors = pageResults.filter(p => p.totalErrors === 0).length;
    
    console.log(`\nTotal Pages Checked: ${SETTINGS_PAGES.length}`);
    console.log(`Pages with Errors: ${pagesWithErrors}`);
    console.log(`Pages without Errors: ${pagesWithoutErrors}`);
    console.log(`Total Errors: ${totalErrors}`);
    
    console.log('\n📋 Pages with Errors:');
    pageResults
      .filter(p => p.totalErrors > 0)
      .sort((a, b) => b.totalErrors - a.totalErrors)
      .forEach(p => {
        console.log(`   ${p.name}: ${p.totalErrors} errors`);
      });
    
    // Analyze error patterns
    console.log('\n🔍 Error Patterns:');
    
    const errorMessages = allErrors.map(e => e.message || e.url || '').join(' ');
    
    if (errorMessages.includes('404')) {
      console.log('   🔴 404 errors detected - Missing endpoints or resources');
    }
    if (errorMessages.includes('403')) {
      console.log('   🔴 403 errors detected - Permission/RLS issues');
    }
    if (errorMessages.includes('406')) {
      console.log('   🔴 406 errors detected - Profile/user data issues');
    }
    if (errorMessages.includes('500')) {
      console.log('   🔴 500 errors detected - Server errors');
    }
    if (errorMessages.toLowerCase().includes('undefined')) {
      console.log('   🔴 Undefined errors detected - Missing data/properties');
    }
    if (errorMessages.toLowerCase().includes('null')) {
      console.log('   🔴 Null errors detected - Missing data');
    }
    if (errorMessages.toLowerCase().includes('cannot read')) {
      console.log('   🔴 Property access errors detected - Null/undefined objects');
    }
    
    // Save detailed results
    const resultsPath = path.join(__dirname, 'logs', 'settings-pages-errors.json');
    fs.writeFileSync(resultsPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: {
        totalPages: SETTINGS_PAGES.length,
        pagesWithErrors,
        pagesWithoutErrors,
        totalErrors
      },
      pages: pageResults,
      allErrors
    }, null, 2));
    
    console.log(`\n💾 Detailed results saved: ${resultsPath}`);
    
    console.log('\n' + '='.repeat(80));
    console.log('🔍 SETTINGS PAGES CHECK COMPLETE');
    console.log('='.repeat(80));
    
    console.log('\nBrowser will stay open for 30 seconds for manual inspection...');
    await page.waitForTimeout(30000);
    
  } catch (err) {
    console.error('\n❌ ERROR:', err.message);
    console.error(err.stack);
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  checkSettingsPages().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { checkSettingsPages };

