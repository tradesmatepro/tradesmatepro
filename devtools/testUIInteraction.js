/**
 * Test UI Interaction System
 * 
 * Quick test to verify the UI interaction system works
 * Run with: node devtools/testUIInteraction.js
 */

const { 
  navigate, 
  click, 
  fill, 
  checkElement, 
  screenshot, 
  runScenario,
  closeBrowser 
} = require('./uiInteractionController');

const { scenarios } = require('./uiTestScenarios');

async function runTests() {
  console.log('🧪 Testing UI Interaction System\n');
  console.log('='.repeat(60));
  
  try {
    // Test 1: Simple navigation
    console.log('\n📋 Test 1: Navigate to login page');
    const navResult = await navigate({ url: '/login' });
    console.log(navResult.status === 'success' ? '✅ PASS' : '❌ FAIL');
    console.log(`   URL: ${navResult.url}`);
    
    // Test 2: Screenshot
    console.log('\n📋 Test 2: Capture screenshot');
    const screenshotResult = await screenshot({ name: 'test-login-page' });
    console.log(screenshotResult.status === 'success' ? '✅ PASS' : '❌ FAIL');
    console.log(`   Path: ${screenshotResult.path}`);
    
    // Test 3: Check element
    console.log('\n📋 Test 3: Check for email input');
    const checkResult = await checkElement({ 
      selector: 'input[type="email"]',
      shouldExist: true,
      shouldBeVisible: true
    });
    console.log(checkResult.status === 'success' ? '✅ PASS' : '❌ FAIL');
    console.log(`   Exists: ${checkResult.exists}, Visible: ${checkResult.visible}`);
    
    // Test 4: Fill form
    console.log('\n📋 Test 4: Fill email field');
    const fillResult = await fill({ 
      selector: 'input[type="email"]',
      value: 'test@example.com'
    });
    console.log(fillResult.status === 'success' ? '✅ PASS' : '❌ FAIL');
    
    // Test 5: Navigate to dashboard (should redirect to login)
    console.log('\n📋 Test 5: Navigate to dashboard');
    const dashResult = await navigate({ url: '/dashboard' });
    console.log(dashResult.status === 'success' ? '✅ PASS' : '❌ FAIL');
    console.log(`   URL: ${dashResult.url}`);
    
    // Test 6: Run predefined scenario
    console.log('\n📋 Test 6: Run dashboard load scenario');
    const scenarioResult = await runScenario(scenarios.dashboardLoad);
    console.log(scenarioResult.status === 'success' ? '✅ PASS' : '❌ FAIL');
    console.log(`   Passed: ${scenarioResult.data.passed}, Failed: ${scenarioResult.data.failed}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests completed!');
    console.log('\nScreenshots saved to: devtools/screenshots/ai-tests/');
    console.log('Check them to verify the UI interaction works!\n');
    
  } catch (err) {
    console.error('\n❌ Test failed:', err.message);
    console.error(err.stack);
  } finally {
    // Close browser
    console.log('\n🧹 Cleaning up...');
    await closeBrowser();
    console.log('✅ Browser closed\n');
  }
}

// Run tests
if (require.main === module) {
  runTests().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { runTests };

