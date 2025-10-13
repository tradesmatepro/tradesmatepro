/**
 * VERIFY SCHEMA FIX
 * 
 * Quick verification that the schema migration fixed all the errors
 */

const { chromium } = require('playwright');

async function verifyFix() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Capture console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push({
        text: msg.text(),
        location: msg.location()
      });
    }
  });

  try {
    console.log('\n🔍 VERIFYING SCHEMA FIX');
    console.log('='.repeat(80));

    // Login
    console.log('\n🔐 Logging in...');
    await page.goto('http://localhost:3004/login');
    await page.fill('input[type="email"]', 'owner@company.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    console.log('✅ Logged in\n');

    // Test Company Profile Settings
    console.log('📋 Testing Company Profile Settings...');
    await page.goto('http://localhost:3004/settings?tab=company');
    await page.waitForTimeout(2000);
    
    const companyErrors = errors.filter(e => 
      e.text.includes('licenses') || 
      e.text.includes('company')
    );
    
    if (companyErrors.length === 0) {
      console.log('✅ Company Profile: No errors!');
    } else {
      console.log(`❌ Company Profile: ${companyErrors.length} errors`);
      companyErrors.forEach(e => console.log(`   - ${e.text}`));
    }

    // Test Rate Cards Settings
    console.log('\n📋 Testing Rate Cards Settings...');
    errors.length = 0; // Clear errors
    await page.goto('http://localhost:3004/settings?tab=rate-cards');
    await page.waitForTimeout(2000);
    
    const rateCardErrors = errors.filter(e => 
      e.text.includes('service_name') || 
      e.text.includes('rate_cards') ||
      e.text.includes('sort_order')
    );
    
    if (rateCardErrors.length === 0) {
      console.log('✅ Rate Cards: No errors!');
    } else {
      console.log(`❌ Rate Cards: ${rateCardErrors.length} errors`);
      rateCardErrors.forEach(e => console.log(`   - ${e.text}`));
    }

    // Test Smart Scheduling Settings
    console.log('\n📋 Testing Smart Scheduling Settings...');
    errors.length = 0; // Clear errors
    await page.goto('http://localhost:3004/settings?tab=scheduling');
    await page.waitForTimeout(2000);
    
    const schedulingErrors = errors.filter(e => 
      e.text.includes('buffer') || 
      e.text.includes('business_hours') ||
      e.text.includes('scheduling')
    );
    
    if (schedulingErrors.length === 0) {
      console.log('✅ Smart Scheduling: No errors!');
    } else {
      console.log(`❌ Smart Scheduling: ${schedulingErrors.length} errors`);
      schedulingErrors.forEach(e => console.log(`   - ${e.text}`));
    }

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 VERIFICATION SUMMARY');
    console.log('='.repeat(80));
    
    const totalErrors = companyErrors.length + rateCardErrors.length + schedulingErrors.length;
    
    if (totalErrors === 0) {
      console.log('\n🎉 SUCCESS! All schema drift issues are FIXED!');
      console.log('\n✅ Company Profile Settings: Working');
      console.log('✅ Rate Cards Settings: Working');
      console.log('✅ Smart Scheduling Settings: Working');
    } else {
      console.log(`\n⚠️  Still have ${totalErrors} errors to fix`);
    }

    console.log('\n🚀 NEXT: Rebuild the app to see all fixes take effect!');
    console.log('   Ctrl+C then npm start\n');

    // Keep browser open for inspection
    console.log('Browser will stay open for 15 seconds for manual inspection...\n');
    await page.waitForTimeout(15000);

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  } finally {
    await browser.close();
  }
}

verifyFix();

