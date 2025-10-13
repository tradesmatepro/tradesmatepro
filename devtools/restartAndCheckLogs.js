/**
 * Restart dev server and check console logs automatically
 */

const { exec } = require('child_process');
const puppeteer = require('puppeteer');

async function restartAndCheckLogs() {
  console.log('🔄 Restarting dev server and checking logs...\n');

  // Kill any existing process on port 3004
  console.log('Step 1: Killing existing server...');
  await new Promise((resolve) => {
    exec('npx kill-port 3004', (err) => {
      if (err) console.log('  ⚠️ No server running on 3004');
      else console.log('  ✅ Server killed');
      resolve();
    });
  });

  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Start new server
  console.log('\nStep 2: Starting new server...');
  const serverProcess = exec('npm start', { cwd: 'd:\\TradeMate Pro Webapp' });
  
  // Wait for server to start
  console.log('  ⏳ Waiting for server to start...');
  await new Promise(resolve => setTimeout(resolve, 15000));
  console.log('  ✅ Server should be running\n');

  // Launch browser and check console
  console.log('Step 3: Checking console logs...');
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Capture console messages
  const consoleMessages = [];
  const errors = [];

  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push(text);
    
    // Check for specific errors
    if (text.includes('406')) {
      errors.push('❌ 406 error: ' + text);
    }
    if (text.includes('ERR_CONNECTION_REFUSED')) {
      errors.push('❌ ERR_CONNECTION_REFUSED: ' + text);
    }
    if (text.includes('inventory_stock') && text.includes('company_id')) {
      errors.push('❌ Inventory stock error: ' + text);
    }
  });

  page.on('pageerror', error => {
    errors.push('❌ Page error: ' + error.message);
  });

  page.on('requestfailed', request => {
    const failure = request.failure();
    if (failure) {
      errors.push(`❌ Request failed: ${request.url()} - ${failure.errorText}`);
    }
  });

  // Navigate to app
  console.log('  📱 Loading app...');
  try {
    await page.goto('http://localhost:3004', { waitUntil: 'networkidle2', timeout: 30000 });
  } catch (err) {
    console.log('  ⚠️ Timeout waiting for page load (this is normal)');
  }

  // Wait a bit for console messages
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Report results
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📊 CONSOLE LOG ANALYSIS');
  console.log('═══════════════════════════════════════════════════════\n');

  if (errors.length === 0) {
    console.log('🎉 NO ERRORS FOUND!');
    console.log('✅ Console is clean!');
  } else {
    console.log(`❌ Found ${errors.length} errors:\n`);
    errors.forEach((err, i) => {
      console.log(`${i + 1}. ${err}`);
    });
  }

  console.log('\n📋 Total console messages:', consoleMessages.length);
  console.log('\n═══════════════════════════════════════════════════════');

  // Keep browser open for manual inspection
  console.log('\n🔍 Browser will stay open for 30 seconds for manual inspection...');
  await new Promise(resolve => setTimeout(resolve, 30000));

  await browser.close();
  serverProcess.kill();

  process.exit(errors.length > 0 ? 1 : 0);
}

// Run it
restartAndCheckLogs().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});

