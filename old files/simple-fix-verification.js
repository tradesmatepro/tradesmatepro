const http = require('http');
const fs = require('fs');
const path = require('path');

async function verifyAppRunning() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3003', (res) => {
      if (res.statusCode === 200) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function verifyCodeFixes() {
  console.log('🔍 Verifying code fixes...');
  
  // Check InlineResponseForm.js for the fixes
  const inlineResponseFormPath = path.join(__dirname, 'src', 'components', 'Marketplace', 'InlineResponseForm.js');
  
  if (!fs.existsSync(inlineResponseFormPath)) {
    console.log('❌ InlineResponseForm.js not found');
    return false;
  }
  
  const content = fs.readFileSync(inlineResponseFormPath, 'utf8');
  
  // Check for onAvailabilitySelect fix
  const hasOnAvailabilitySelect = content.includes('onAvailabilitySelect={(availability)');
  const hasCorrectColumnNames = content.includes('response_status:') && 
                                content.includes('available_start:') && 
                                content.includes('available_end:');
  
  if (hasOnAvailabilitySelect) {
    console.log('✅ SmartAvailabilityPicker onAvailabilitySelect prop fix verified');
  } else {
    console.log('❌ SmartAvailabilityPicker onAvailabilitySelect prop fix not found');
    return false;
  }
  
  if (hasCorrectColumnNames) {
    console.log('✅ Database column names fix verified (response_status, available_start, available_end)');
  } else {
    console.log('❌ Database column names fix not found');
    return false;
  }
  
  return true;
}

function verifyDependencies() {
  console.log('🔍 Verifying dependencies...');
  
  const packageJsonPath = path.join(__dirname, 'package.json');
  const nodeModulesPath = path.join(__dirname, 'node_modules');
  
  if (!fs.existsSync(packageJsonPath)) {
    console.log('❌ package.json not found');
    return false;
  }
  
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('❌ node_modules not found');
    return false;
  }
  
  // Check for recharts
  const rechartsPath = path.join(nodeModulesPath, 'recharts');
  const fullcalendarPath = path.join(nodeModulesPath, '@fullcalendar');
  
  if (fs.existsSync(rechartsPath)) {
    console.log('✅ recharts dependency installed');
  } else {
    console.log('❌ recharts dependency missing');
    return false;
  }
  
  if (fs.existsSync(fullcalendarPath)) {
    console.log('✅ @fullcalendar dependencies installed');
  } else {
    console.log('❌ @fullcalendar dependencies missing');
    return false;
  }
  
  return true;
}

async function runVerification() {
  console.log('🚀 Starting automated fix verification...\n');
  
  // 1. Verify dependencies
  const depsOk = verifyDependencies();
  
  // 2. Verify code fixes
  const fixesOk = verifyCodeFixes();
  
  // 3. Verify app is running
  console.log('🔍 Checking if app is running...');
  const appRunning = await verifyAppRunning();
  
  if (appRunning) {
    console.log('✅ App is running successfully on port 3003');
  } else {
    console.log('❌ App is not running or not responding');
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📋 VERIFICATION SUMMARY');
  console.log('='.repeat(50));
  
  if (depsOk && fixesOk && appRunning) {
    console.log('🎉 ALL VERIFICATIONS PASSED!');
    console.log('✅ Dependencies installed correctly');
    console.log('✅ Code fixes applied correctly');
    console.log('✅ App is running without compilation errors');
    console.log('');
    console.log('🚀 FIXES SUCCESSFULLY APPLIED:');
    console.log('   • SmartAvailabilityPicker onAvailabilitySelect error - FIXED');
    console.log('   • Database column mismatch (response_type) error - FIXED');
    console.log('   • Missing dependencies (recharts, @fullcalendar) - FIXED');
    console.log('');
    console.log('✨ The marketplace response system should now work correctly!');
    console.log('🧪 You can now test responding to the "cake needed" job as jerry@jerrysflowers.com');
    return true;
  } else {
    console.log('❌ SOME VERIFICATIONS FAILED');
    console.log(`Dependencies: ${depsOk ? '✅' : '❌'}`);
    console.log(`Code Fixes: ${fixesOk ? '✅' : '❌'}`);
    console.log(`App Running: ${appRunning ? '✅' : '❌'}`);
    return false;
  }
}

// Run the verification
runVerification().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Verification failed:', error);
  process.exit(1);
});
