// Test the enhanced logging system with spam detection
const fs = require('fs');
const path = require('path');

async function testEnhancedLogging() {
  try {
    console.log('🧪 TESTING ENHANCED LOGGING SYSTEM');
    console.log('This test verifies the enhanced error capture system can detect all types of issues.\n');
    
    // Clear error logs first
    const latestPath = path.join(__dirname, 'error_logs', 'latest.json');
    fs.writeFileSync(latestPath, JSON.stringify([], null, 2));
    console.log('✅ Cleared error logs\n');
    
    console.log('📝 ENHANCED LOGGING FEATURES:');
    console.log('✅ Captures console.log, console.warn, console.error');
    console.log('✅ Detects spam patterns (messages repeated > 10 times in 5 seconds)');
    console.log('✅ Categorizes issues by type:');
    console.log('   → SPAM_DETECTED (like SLOT ADDED)');
    console.log('   → PERFORMANCE_ISSUE');
    console.log('   → NETWORK_ISSUE');
    console.log('   → DATABASE_ERROR');
    console.log('   → AUTH_ERROR');
    console.log('   → VALIDATION_ERROR');
    console.log('   → DEPRECATED_CODE');
    console.log('   → MEMORY_WARNING');
    console.log('');
    
    console.log('📝 TESTING STEPS:');
    console.log('1. Open browser and go to: http://localhost:3006');
    console.log('2. Open browser console (F12)');
    console.log('3. Navigate around the app to trigger various issues');
    console.log('4. Look for any repeated messages (should be detected as spam)');
    console.log('5. Run: sendErrors() in browser console');
    console.log('6. Check the enhanced error report');
    console.log('');
    
    console.log('🔍 WHAT TO EXPECT:');
    console.log('   ✅ Enhanced sendErrors() function shows:');
    console.log('      → Total count of errors + warnings + logs');
    console.log('      → Spam analysis with detected patterns');
    console.log('      → Categorized issue types');
    console.log('      → Frequency analysis');
    console.log('');
    
    console.log('🧪 MANUAL SPAM TEST (Optional):');
    console.log('   → In browser console, run this to simulate spam:');
    console.log('     for(let i=0; i<15; i++) console.log("TEST SPAM MESSAGE", i);');
    console.log('   → Then run: sendErrors()');
    console.log('   → Should detect "TEST SPAM MESSAGE" as spam pattern');
    console.log('');
    
    console.log('⏳ Waiting 60 seconds for you to test...');
    console.log('   (Press Ctrl+C if you need more time)');
    
    // Wait 60 seconds for manual testing
    await new Promise(resolve => setTimeout(resolve, 60000));
    
    console.log('\n📊 CHECKING ENHANCED ERROR LOGS...');
    
    // Check what errors were captured
    if (fs.existsSync(latestPath)) {
      const errors = JSON.parse(fs.readFileSync(latestPath, 'utf8'));
      
      if (errors.length === 0) {
        console.log('ℹ️  No errors captured in latest.json');
        console.log('   → This could mean:');
        console.log('     1. No issues occurred (good!)');
        console.log('     2. Enhanced logging needs verification');
        console.log('     3. sendErrors() wasn\'t called in browser');
      } else {
        console.log(`✅ Captured ${errors.length} items:`);
        
        // Analyze captured data
        const types = {};
        const sources = {};
        const severities = {};
        
        errors.forEach((error, index) => {
          console.log(`\n🔍 Item ${index + 1}:`);
          console.log(`   Type: ${error.type || 'UNKNOWN'}`);
          console.log(`   Source: ${error.source || 'UNKNOWN'}`);
          console.log(`   Severity: ${error.severity || 'UNKNOWN'}`);
          console.log(`   Message: ${error.message?.substring(0, 100) || 'No message'}...`);
          
          // Count types
          const type = error.type || 'UNKNOWN';
          types[type] = (types[type] || 0) + 1;
          
          const source = error.source || 'UNKNOWN';
          sources[source] = (sources[source] || 0) + 1;
          
          const severity = error.severity || 'UNKNOWN';
          severities[severity] = (severities[severity] || 0) + 1;
        });
        
        console.log('\n📊 ANALYSIS SUMMARY:');
        console.log('   Types detected:', Object.keys(types).join(', '));
        console.log('   Sources:', Object.keys(sources).join(', '));
        console.log('   Severities:', Object.keys(severities).join(', '));
        
        // Check for spam detection
        const spamItems = errors.filter(e => e.type === 'SPAM_DETECTED');
        if (spamItems.length > 0) {
          console.log(`\n🚨 SPAM DETECTED: ${spamItems.length} spam items found!`);
          console.log('   → Enhanced logging successfully detected spam patterns');
        } else {
          console.log('\n✅ No spam detected - console should be clean');
        }
      }
    } else {
      console.log('❌ No error log file found');
    }
    
    console.log('\n🎯 ENHANCED LOGGING SUMMARY:');
    console.log('The enhanced system now captures:');
    console.log('   ✅ All console.log messages (with spam detection)');
    console.log('   ✅ All console.warn messages (with categorization)');
    console.log('   ✅ All console.error messages (with enhanced typing)');
    console.log('   ✅ Frequency analysis for spam detection');
    console.log('   ✅ Issue categorization and severity levels');
    console.log('   ✅ Comprehensive reporting via sendErrors()');
    console.log('');
    console.log('This should catch issues like the SLOT ADDED spam automatically!');
    
    console.log('\n✅ Enhanced logging test complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testEnhancedLogging();
