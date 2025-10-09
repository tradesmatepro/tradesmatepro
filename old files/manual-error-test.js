// Manual test to trigger error capture and see current errors
const fetch = require('node-fetch');

async function manualErrorTest() {
  try {
    console.log('🧪 Manual Error Test Starting...');
    
    // Step 1: Clear any old errors by sending empty array
    console.log('📝 Step 1: Clearing old errors...');
    const clearResponse = await fetch('http://localhost:4000/save-errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([])
    });
    
    if (clearResponse.ok) {
      console.log('✅ Old errors cleared');
    } else {
      console.log('❌ Failed to clear old errors');
      return;
    }
    
    // Step 2: Wait for user to navigate and reproduce issues
    console.log('📝 Step 2: Now navigate to the app and reproduce the issues:');
    console.log('   1. Go to http://localhost:3006');
    console.log('   2. Navigate to Marketplace → Providing mode');
    console.log('   3. Try clicking the dashboard cards (My Responses, Open Requests, Messages)');
    console.log('   4. Try submitting a response form');
    console.log('   5. Open browser console (F12) and run: sendErrors()');
    console.log('');
    console.log('⏳ Waiting 60 seconds for you to reproduce the issues...');
    
    // Wait for user to reproduce issues
    await new Promise(resolve => setTimeout(resolve, 60000));
    
    // Step 3: Check what errors were captured
    console.log('📝 Step 3: Checking captured errors...');
    const fs = require('fs');
    const path = require('path');
    
    const latestPath = path.join(__dirname, 'error_logs', 'latest.json');
    if (fs.existsSync(latestPath)) {
      const errors = JSON.parse(fs.readFileSync(latestPath, 'utf8'));
      console.log(`✅ Found ${errors.length} errors in latest.json:`);
      
      errors.forEach((error, index) => {
        console.log(`\n🔍 Error ${index + 1}:`);
        console.log(`   Type: ${error.type}`);
        console.log(`   Message: ${error.message}`);
        console.log(`   Time: ${error.timestamp}`);
        if (error.stack) {
          console.log(`   Stack: ${error.stack.split('\n')[0]}`);
        }
      });
    } else {
      console.log('❌ No latest.json found - errors not being captured');
    }
    
  } catch (error) {
    console.error('❌ Manual test failed:', error.message);
  }
}

manualErrorTest();
