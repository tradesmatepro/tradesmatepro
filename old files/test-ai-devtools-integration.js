/**
 * AI Dev Tools Integration Test
 * Tests the complete integration between AI assistant and TradeMate Pro dev tools
 */

const aiDevToolsService = require('./src/services/AIDevToolsService.js').default;

async function testAIDevToolsIntegration() {
  console.log('🧪 Testing AI Dev Tools Integration...\n');

  const results = {
    tests: [],
    passed: 0,
    failed: 0,
    startTime: new Date().toISOString()
  };

  // Test 1: System Status Check
  console.log('📊 Test 1: System Status Check');
  try {
    const systemStatus = await aiDevToolsService.getSystemStatus();
    console.log(`✅ System Status: ${systemStatus.status}`);
    console.log(`   Components: ${Object.keys(systemStatus.components).length}`);
    console.log(`   Error Count: ${systemStatus.logs.count}`);
    console.log(`   Summary: ${systemStatus.summary}\n`);
    
    results.tests.push({
      name: 'System Status Check',
      status: 'passed',
      details: systemStatus
    });
    results.passed++;
  } catch (error) {
    console.log(`❌ System Status Check Failed: ${error.message}\n`);
    results.tests.push({
      name: 'System Status Check',
      status: 'failed',
      error: error.message
    });
    results.failed++;
  }

  // Test 2: Error Logs Analysis
  console.log('📋 Test 2: Error Logs Analysis');
  try {
    const errorLogs = await aiDevToolsService.getErrorLogs();
    console.log(`✅ Error Logs Retrieved: ${errorLogs.count} errors`);
    console.log(`   Categories: ${Object.keys(errorLogs.categories).join(', ') || 'None'}`);
    console.log(`   Severity: ${errorLogs.severity}`);
    console.log(`   Last Updated: ${errorLogs.lastUpdated}\n`);
    
    results.tests.push({
      name: 'Error Logs Analysis',
      status: 'passed',
      details: errorLogs
    });
    results.passed++;
  } catch (error) {
    console.log(`❌ Error Logs Analysis Failed: ${error.message}\n`);
    results.tests.push({
      name: 'Error Logs Analysis',
      status: 'failed',
      error: error.message
    });
    results.failed++;
  }

  // Test 3: Health Check
  console.log('🏥 Test 3: Health Check');
  try {
    const health = await aiDevToolsService.checkHealth();
    console.log(`✅ Health Status: ${health.status}`);
    console.log(`   Response Time: ${health.responseTime}ms`);
    console.log(`   Features: ${health.data?.features?.length || 0}`);
    console.log(`   Last Check: ${health.lastCheck}\n`);
    
    results.tests.push({
      name: 'Health Check',
      status: 'passed',
      details: health
    });
    results.passed++;
  } catch (error) {
    console.log(`❌ Health Check Failed: ${error.message}\n`);
    results.tests.push({
      name: 'Health Check',
      status: 'failed',
      error: error.message
    });
    results.failed++;
  }

  // Test 4: Database Status
  console.log('🗄️ Test 4: Database Status');
  try {
    const dbStatus = await aiDevToolsService.checkDatabaseStatus();
    console.log(`✅ Database Status: ${dbStatus.status}`);
    console.log(`   Features: ${dbStatus.features?.length || 0}`);
    console.log(`   Version: ${dbStatus.version}`);
    console.log(`   Last Check: ${dbStatus.lastCheck}\n`);
    
    results.tests.push({
      name: 'Database Status',
      status: 'passed',
      details: dbStatus
    });
    results.passed++;
  } catch (error) {
    console.log(`❌ Database Status Failed: ${error.message}\n`);
    results.tests.push({
      name: 'Database Status',
      status: 'failed',
      error: error.message
    });
    results.failed++;
  }

  // Test 5: Comprehensive Diagnostics
  console.log('🔧 Test 5: Comprehensive Diagnostics');
  try {
    const diagnostics = await aiDevToolsService.runDiagnostics();
    console.log(`✅ Diagnostics Complete: ${diagnostics.overallStatus}`);
    console.log(`   Tests Run: ${diagnostics.tests.length}`);
    console.log(`   Issues Found: ${diagnostics.issues.length}`);
    console.log(`   Recommendations: ${diagnostics.recommendations.length}`);
    
    if (diagnostics.issues.length > 0) {
      console.log('   Issues:');
      diagnostics.issues.forEach(issue => console.log(`     - ${issue}`));
    }
    
    if (diagnostics.recommendations.length > 0) {
      console.log('   Recommendations:');
      diagnostics.recommendations.forEach(rec => console.log(`     - ${rec}`));
    }
    console.log('');
    
    results.tests.push({
      name: 'Comprehensive Diagnostics',
      status: 'passed',
      details: diagnostics
    });
    results.passed++;
  } catch (error) {
    console.log(`❌ Comprehensive Diagnostics Failed: ${error.message}\n`);
    results.tests.push({
      name: 'Comprehensive Diagnostics',
      status: 'failed',
      error: error.message
    });
    results.failed++;
  }

  // Test 6: AI Integration
  console.log('🤖 Test 6: AI Integration');
  try {
    const testData = {
      message: 'Test AI integration',
      timestamp: new Date().toISOString(),
      source: 'integration_test'
    };
    
    const aiResponse = await aiDevToolsService.sendToAI(testData, 'integration_test');
    console.log(`✅ AI Integration: ${aiResponse.status}`);
    console.log(`   Response: ${aiResponse.message || aiResponse.fallback}`);
    console.log(`   Request ID: ${aiResponse.requestId || 'N/A'}\n`);
    
    results.tests.push({
      name: 'AI Integration',
      status: 'passed',
      details: aiResponse
    });
    results.passed++;
  } catch (error) {
    console.log(`❌ AI Integration Failed: ${error.message}\n`);
    results.tests.push({
      name: 'AI Integration',
      status: 'failed',
      error: error.message
    });
    results.failed++;
  }

  // Test 7: AI-Ready Data Format
  console.log('📊 Test 7: AI-Ready Data Format');
  try {
    const aiReadyData = await aiDevToolsService.getAIReadyData();
    console.log(`✅ AI-Ready Data Generated`);
    console.log(`   System Status: ${aiReadyData.system.status}`);
    console.log(`   Diagnostics Status: ${aiReadyData.diagnostics.overallStatus}`);
    console.log(`   Capabilities: ${aiReadyData.capabilities.length}`);
    console.log(`   Instructions: ${Object.keys(aiReadyData.instructions).length}\n`);
    
    results.tests.push({
      name: 'AI-Ready Data Format',
      status: 'passed',
      details: { 
        systemStatus: aiReadyData.system.status,
        diagnosticsStatus: aiReadyData.diagnostics.overallStatus,
        capabilitiesCount: aiReadyData.capabilities.length
      }
    });
    results.passed++;
  } catch (error) {
    console.log(`❌ AI-Ready Data Format Failed: ${error.message}\n`);
    results.tests.push({
      name: 'AI-Ready Data Format',
      status: 'failed',
      error: error.message
    });
    results.failed++;
  }

  // Final Results
  results.endTime = new Date().toISOString();
  results.duration = new Date(results.endTime) - new Date(results.startTime);
  
  console.log('🎯 Test Results Summary:');
  console.log(`   Total Tests: ${results.tests.length}`);
  console.log(`   Passed: ${results.passed}`);
  console.log(`   Failed: ${results.failed}`);
  console.log(`   Success Rate: ${Math.round((results.passed / results.tests.length) * 100)}%`);
  console.log(`   Duration: ${results.duration}ms`);
  
  if (results.failed === 0) {
    console.log('\n🎉 All tests passed! AI Dev Tools integration is fully operational.');
    console.log('✅ Ready for AI teammate integration!');
  } else {
    console.log(`\n⚠️ ${results.failed} test(s) failed. Review the issues above.`);
  }
  
  return results;
}

// Run the test if called directly
if (require.main === module) {
  testAIDevToolsIntegration()
    .then(results => {
      process.exit(results.failed === 0 ? 0 : 1);
    })
    .catch(error => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = { testAIDevToolsIntegration };
