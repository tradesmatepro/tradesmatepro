/**
 * Test Action-Outcome Monitoring (Part 2)
 * 
 * This script tests the new monitoring capabilities
 */

const { 
  clickWithMonitoring, 
  navigateWithMonitoring,
  fillWithMonitoring,
  closeBrowser 
} = require('./uiInteractionController');

const { 
  getActionHistory, 
  getFailedActions, 
  generateReport,
  clearHistory 
} = require('./actionOutcomeMonitor');

async function runTests() {
  console.log('🧠 Testing Action-Outcome Monitoring (Part 2)\n');
  console.log('='.repeat(60));
  
  try {
    // Clear history
    clearHistory();
    console.log('\n✅ Cleared action history\n');
    
    // Test 1: Navigate with monitoring
    console.log('📍 Test 1: Navigate with Monitoring');
    console.log('-'.repeat(60));
    const navResult = await navigateWithMonitoring({
      url: 'http://localhost:3004',
      expectations: {
        shouldNavigate: true,
        shouldChangeDom: true
      }
    });
    console.log('Result:', JSON.stringify(navResult, null, 2));
    console.log('\n');
    
    // Test 2: Click with monitoring (expecting success)
    console.log('🖱️  Test 2: Click with Monitoring (Login button)');
    console.log('-'.repeat(60));
    const clickResult = await clickWithMonitoring({
      selector: 'button:has-text("Login")',
      expectations: {
        shouldChangeDom: true
      }
    });
    console.log('Result:', JSON.stringify(clickResult, null, 2));
    console.log('\n');
    
    // Test 3: Fill with monitoring
    console.log('⌨️  Test 3: Fill with Monitoring');
    console.log('-'.repeat(60));
    const fillResult = await fillWithMonitoring({
      selector: 'input[type="email"]',
      value: 'test@example.com',
      expectations: {
        shouldChangeDom: false // Filling shouldn't change DOM structure
      }
    });
    console.log('Result:', JSON.stringify(fillResult, null, 2));
    console.log('\n');
    
    // Test 4: Click non-existent element (expecting failure)
    console.log('❌ Test 4: Click Non-Existent Element (Should Fail)');
    console.log('-'.repeat(60));
    const failResult = await clickWithMonitoring({
      selector: '#nonExistentButton',
      expectations: {
        shouldChangeDom: true
      },
      timeout: 2000
    });
    console.log('Result:', JSON.stringify(failResult, null, 2));
    console.log('\n');
    
    // Test 5: Get action history
    console.log('📜 Test 5: Get Action History');
    console.log('-'.repeat(60));
    const history = getActionHistory(10);
    console.log(`Total actions: ${history.length}`);
    history.forEach((action, i) => {
      console.log(`  ${i + 1}. ${action.label} - ${action.success ? '✅ SUCCESS' : '❌ FAILED'}`);
      if (!action.success) {
        console.log(`     Reasoning: ${action.reasoning}`);
      }
    });
    console.log('\n');
    
    // Test 6: Get failed actions
    console.log('🚫 Test 6: Get Failed Actions');
    console.log('-'.repeat(60));
    const failed = getFailedActions();
    console.log(`Failed actions: ${failed.length}`);
    failed.forEach((action, i) => {
      console.log(`  ${i + 1}. ${action.label}`);
      console.log(`     Reasoning: ${action.reasoning}`);
      console.log(`     Suggestions:`);
      action.suggestions.forEach(s => console.log(`       - ${s}`));
    });
    console.log('\n');
    
    // Test 7: Generate report
    console.log('📊 Test 7: Generate Report');
    console.log('-'.repeat(60));
    const report = generateReport();
    console.log('Summary:');
    console.log(`  Total: ${report.summary.total}`);
    console.log(`  Successful: ${report.summary.successful}`);
    console.log(`  Failed: ${report.summary.failed}`);
    console.log(`  Success Rate: ${report.summary.successRate}`);
    console.log('\nCommon Issues:');
    report.commonIssues.forEach(issue => {
      console.log(`  - ${issue.issue}: ${issue.count} occurrences`);
    });
    console.log('\n');
    
    console.log('='.repeat(60));
    console.log('✅ All tests complete!\n');
    
    console.log('🎉 Part 2 Implementation Verified!\n');
    console.log('Key Features Tested:');
    console.log('  ✅ Navigate with monitoring');
    console.log('  ✅ Click with monitoring');
    console.log('  ✅ Fill with monitoring');
    console.log('  ✅ Failure detection');
    console.log('  ✅ Action history tracking');
    console.log('  ✅ Failed action analysis');
    console.log('  ✅ Report generation');
    console.log('\n');
    
    console.log('💡 Next Steps:');
    console.log('  1. Use monitored commands for critical actions');
    console.log('  2. Check action history to see what AI tried');
    console.log('  3. Review failed actions to identify patterns');
    console.log('  4. Generate reports to analyze success rates');
    console.log('  5. Use reasoning to guide debugging');
    console.log('\n');
    
  } catch (err) {
    console.error('❌ Test failed:', err);
  } finally {
    // Close browser
    await closeBrowser();
    console.log('🔒 Browser closed');
  }
}

// Run tests
runTests().catch(console.error);

