/**
 * Check Existing Quotes in Database
 * 
 * This will show us:
 * 1. Do quotes exist with customer_id?
 * 2. Do quotes exist without customer_id?
 * 3. Do any quotes have line items?
 * 4. Do any quotes have labor line items specifically?
 */

const { chromium } = require('playwright');

const APP_URL = 'http://localhost:3004';
const TEST_USER = {
  email: 'jeraldjsmith@gmail.com',
  password: 'Gizmo123'
};

async function checkExistingQuotes() {
  console.log('\n🔍 CHECKING EXISTING QUOTES IN DATABASE\n');
  console.log('='.repeat(80));
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Capture network requests to see what data is loaded
  const quotesData = [];
  
  page.on('response', async response => {
    if (response.url().includes('work_orders') && response.url().includes('status=in.(draft')) {
      try {
        const data = await response.json();
        quotesData.push(...data);
        console.log(`\n📊 Loaded ${data.length} quotes from API`);
      } catch (err) {
        // Not JSON
      }
    }
  });
  
  try {
    // Login
    console.log('\n🔐 Logging in...');
    await page.goto(`${APP_URL}/login`);
    await page.waitForSelector('input[type="email"]');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    console.log('✅ Logged in');
    
    // Go to quotes page
    console.log('\n📋 Loading Quotes page...');
    await page.goto(`${APP_URL}/quotes`);
    await page.waitForTimeout(5000); // Wait for data to load
    
    // Check how many quotes are displayed
    const quoteCards = await page.locator('[class*="quote"]').count();
    const quoteRows = await page.locator('tr').count();
    
    console.log(`\n📊 UI Shows:`);
    console.log(`   Quote cards: ${quoteCards}`);
    console.log(`   Table rows: ${quoteRows}`);
    
    // Analyze the loaded data
    console.log(`\n📊 API Data Analysis:`);
    console.log(`   Total quotes loaded: ${quotesData.length}`);
    
    if (quotesData.length > 0) {
      const withCustomer = quotesData.filter(q => q.customer_id).length;
      const withoutCustomer = quotesData.filter(q => !q.customer_id).length;
      
      console.log(`   Quotes WITH customer_id: ${withCustomer}`);
      console.log(`   Quotes WITHOUT customer_id: ${withoutCustomer}`);
      
      // Show sample quotes
      console.log(`\n📋 Sample Quotes:`);
      quotesData.slice(0, 5).forEach((quote, i) => {
        console.log(`\n   Quote ${i + 1}:`);
        console.log(`      ID: ${quote.id}`);
        console.log(`      Title: ${quote.title || 'NO TITLE'}`);
        console.log(`      Customer ID: ${quote.customer_id || 'NONE'}`);
        console.log(`      Status: ${quote.status}`);
        console.log(`      Total: $${quote.total_amount || quote.grand_total || 0}`);
      });
    }
    
    // Try to click on a quote to see its details
    if (quotesData.length > 0) {
      console.log(`\n🔍 Clicking on first quote to see details...`);
      
      // Try multiple selectors to find a quote to click
      const selectors = [
        'tr:has-text("Quote")',
        '[class*="quote-card"]',
        '[class*="quote-row"]',
        'button:has-text("Edit")',
        'a:has-text("Edit")'
      ];
      
      for (const selector of selectors) {
        try {
          const count = await page.locator(selector).count();
          if (count > 0) {
            console.log(`   Found ${count} elements with selector: ${selector}`);
            await page.locator(selector).first().click();
            await page.waitForTimeout(3000);
            
            // Take screenshot of the quote details
            await page.screenshot({ path: 'devtools/screenshots/quote-details.png' });
            console.log(`   📸 Screenshot saved: devtools/screenshots/quote-details.png`);
            break;
          }
        } catch (err) {
          // Try next selector
        }
      }
    }
    
    console.log(`\n✅ Analysis complete!`);
    console.log(`\n🔍 Check the screenshots and console output above.`);
    console.log(`\nPress Ctrl+C to close browser.\n`);
    
    // Keep browser open
    await new Promise(() => {});
    
  } catch (err) {
    console.error('\n❌ ERROR:', err);
    await browser.close();
  }
}

if (require.main === module) {
  checkExistingQuotes().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { checkExistingQuotes };

