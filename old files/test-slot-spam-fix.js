// Test to verify the SLOT ADDED spam is fixed
const fs = require('fs');
const path = require('path');

async function testSlotSpamFix() {
  try {
    console.log('🧪 TESTING SLOT SPAM FIX');
    console.log('This test will help verify the infinite SLOT ADDED messages are stopped.\n');
    
    // Clear error logs first
    const latestPath = path.join(__dirname, 'error_logs', 'latest.json');
    fs.writeFileSync(latestPath, JSON.stringify([], null, 2));
    console.log('✅ Cleared error logs\n');
    
    console.log('📝 TESTING STEPS:');
    console.log('1. Open browser and go to: http://localhost:3006');
    console.log('2. Open browser console (F12)');
    console.log('3. Look for "SLOT ADDED" messages - there should be NONE or very few');
    console.log('4. Navigate around the app, especially:');
    console.log('   → Calendar page');
    console.log('   → Scheduling features');
    console.log('   → Customer scheduling');
    console.log('   → Any time-related functionality');
    console.log('5. Check console again - should still be clean');
    console.log('');
    console.log('🔍 WHAT TO EXPECT:');
    console.log('   ✅ BEFORE FIX: Hundreds/thousands of "✅ SLOT ADDED" messages');
    console.log('   ✅ AFTER FIX: No "SLOT ADDED" messages (unless DEBUG_SCHEDULING is enabled)');
    console.log('');
    console.log('🛠️  TO ENABLE DEBUG MODE (if needed):');
    console.log('   → In browser console, type: window.DEBUG_SCHEDULING = true');
    console.log('   → Then you should see controlled logging');
    console.log('');
    console.log('📊 CAPTURE ANY REMAINING ISSUES:');
    console.log('   → If you still see spam, run: sendErrors() in browser console');
    console.log('   → This will capture the actual error data for further analysis');
    console.log('');
    console.log('⏳ Waiting 90 seconds for you to test...');
    console.log('   (Press Ctrl+C if you need more time)');
    
    // Wait 90 seconds for manual testing
    await new Promise(resolve => setTimeout(resolve, 90000));
    
    console.log('\n📊 CHECKING FOR CAPTURED ERRORS...');
    
    // Check what errors were captured
    if (fs.existsSync(latestPath)) {
      const errors = JSON.parse(fs.readFileSync(latestPath, 'utf8'));
      
      if (errors.length === 0) {
        console.log('✅ No errors captured - this is GOOD!');
        console.log('   → The SLOT ADDED spam should be fixed');
        console.log('   → Console should be clean');
      } else {
        console.log(`⚠️  Captured ${errors.length} errors:`);
        
        let slotSpamFound = false;
        errors.forEach((error, index) => {
          console.log(`\n🔍 Error ${index + 1}:`);
          console.log(`   Type: ${error.type}`);
          console.log(`   Message: ${error.message}`);
          
          if (error.message.includes('SLOT ADDED') || error.message.includes('slot')) {
            console.log('   🚨 SLOT SPAM STILL PRESENT - fix needs more work');
            slotSpamFound = true;
          }
        });
        
        if (!slotSpamFound) {
          console.log('\n✅ No slot-related spam found in errors - fix appears successful!');
        }
      }
    } else {
      console.log('❌ No error log file found');
    }
    
    console.log('\n🎯 SUMMARY:');
    console.log('The fix applied:');
    console.log('   → Wrapped SLOT ADDED logging in DEBUG_SCHEDULING check');
    console.log('   → Wrapped CONFLICT DETECTED logging in DEBUG_SCHEDULING check');
    console.log('   → This prevents excessive console spam during normal operation');
    console.log('');
    console.log('If spam persists, there may be other sources of slot generation');
    console.log('that need similar fixes.');
    
    console.log('\n✅ Test complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSlotSpamFix();
