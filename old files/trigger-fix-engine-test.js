// Test script to trigger the AI Fix Engine with the specific marketplace issues
console.log('🚀 Triggering AI Fix Engine Test for Marketplace Issues');

// Simulate the exact issues the user reported
function simulateMarketplaceIssues() {
  // Initialize error capture arrays if they don't exist
  if (!window.capturedErrors) window.capturedErrors = [];
  if (!window.__VALIDATOR_RESULTS__) window.__VALIDATOR_RESULTS__ = [];
  if (!window.__CAPTURED_ERRORS__) window.__CAPTURED_ERRORS__ = [];

  // Issue 1: Dashboard cards not clickable
  const dashboardIssue = {
    type: 'UI_ERROR',
    message: 'Dashboard cards in marketplace are not clickable - onTabChange not working',
    timestamp: new Date().toISOString(),
    context: {
      component: 'CustomerDashboard',
      file: 'src/components/Marketplace/CustomerDashboard.js',
      issue: 'dashboard_cards_not_clickable',
      userReport: 'once when i click on marketplace and go to the dashboard the cards are supposed to be clickable and take me to what the card is talking about. it doesn\'t do that'
    }
  };

  // Issue 2: Form submission errors
  const formSubmissionIssue = {
    type: 'API_ERROR', 
    message: 'Form submission in open jobs section fails with errors',
    timestamp: new Date().toISOString(),
    context: {
      component: 'InlineResponseForm',
      file: 'src/components/Marketplace/InlineResponseForm.js',
      issue: 'form_submission_errors',
      userReport: 'i go to open jobs i fill out the form and hit submit response and i get errors',
      endpoint: 'rpc/submit_response_to_role'
    }
  };

  // Add to captured errors
  window.capturedErrors.push(dashboardIssue, formSubmissionIssue);
  window.__CAPTURED_ERRORS__.push(dashboardIssue, formSubmissionIssue);

  // Create validator results that would detect these issues
  window.__VALIDATOR_RESULTS__ = [
    {
      validator: 'Marketplace',
      results: [
        {
          id: 'marketplace_dashboard_cards',
          title: 'Dashboard Card Clickability',
          pass: false,
          errors: ['Dashboard cards missing proper click handlers or navigation']
        },
        {
          id: 'marketplace_form_submission', 
          title: 'Form Submission Functionality',
          pass: false,
          errors: ['Form submission fails - RPC endpoint may be missing or misconfigured']
        }
      ]
    }
  ];

  console.log('✅ Simulated marketplace issues added to error capture');
  console.log('📊 Captured Errors:', window.capturedErrors.length);
  console.log('📊 Validator Results:', window.__VALIDATOR_RESULTS__.length);
}

// Function to trigger the AI Fix Engine
async function triggerFixEngine() {
  console.log('🛠️ Triggering AI Fix Engine...');
  
  // First simulate the issues
  simulateMarketplaceIssues();
  
  // Wait a moment for the issues to be registered
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Try to trigger the fix engine
  if (window.runAutoFix) {
    console.log('🚀 Running AI Fix Engine via window.runAutoFix()');
    await window.runAutoFix();
  } else if (document.querySelector('button:contains("Generate Fix Proposals")')) {
    console.log('🚀 Clicking Generate Fix Proposals button');
    document.querySelector('button:contains("Generate Fix Proposals")').click();
  } else {
    console.log('⚠️ AI Fix Engine not accessible - trying manual trigger');
    
    // Manual trigger by importing and running the fix cycle
    try {
      // This would normally be imported, but we'll try to access it globally
      if (window.runFixCycle) {
        const results = await window.runFixCycle();
        console.log('🎯 Fix Engine Results:', results);
      } else {
        console.error('❌ Cannot access fix engine functions');
      }
    } catch (error) {
      console.error('❌ Error running fix engine:', error);
    }
  }
}

// Function to check for generated JSON files
async function checkGeneratedFiles() {
  console.log('📁 Checking for generated JSON files...');
  
  try {
    // Try to list files in error_logs directory via server
    const response = await fetch('http://localhost:4000/list-files', {
      method: 'GET'
    });
    
    if (response.ok) {
      const files = await response.json();
      console.log('📄 Generated files:', files);
      
      // Look for patch proposals
      const patchFiles = files.filter(f => f.includes('patch_proposal'));
      const recordFiles = files.filter(f => f.includes('fix_record'));
      
      console.log(`🔧 Found ${patchFiles.length} patch proposals`);
      console.log(`📋 Found ${recordFiles.length} fix records`);
      
      return { patchFiles, recordFiles };
    } else {
      console.warn('⚠️ Could not list files from server');
      return null;
    }
  } catch (error) {
    console.error('❌ Error checking files:', error);
    return null;
  }
}

// Main test function
async function runFullTest() {
  console.log('🧪 Starting Full AI Fix Engine Test');
  console.log('=' .repeat(50));
  
  try {
    // Step 1: Simulate issues
    console.log('Step 1: Simulating marketplace issues...');
    simulateMarketplaceIssues();
    
    // Step 2: Trigger fix engine
    console.log('Step 2: Triggering AI Fix Engine...');
    await triggerFixEngine();
    
    // Step 3: Wait for processing
    console.log('Step 3: Waiting for processing...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 4: Check results
    console.log('Step 4: Checking generated files...');
    const files = await checkGeneratedFiles();
    
    if (files && (files.patchFiles.length > 0 || files.recordFiles.length > 0)) {
      console.log('✅ AI Fix Engine test completed successfully!');
      console.log('📄 JSON files generated for external review');
      return true;
    } else {
      console.log('⚠️ AI Fix Engine ran but no files were generated');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Full test failed:', error);
    return false;
  }
}

// Export functions for manual use
window.simulateMarketplaceIssues = simulateMarketplaceIssues;
window.triggerFixEngine = triggerFixEngine;
window.checkGeneratedFiles = checkGeneratedFiles;
window.runFullTest = runFullTest;

// Auto-run if in developer tools context
if (window.location.pathname.includes('developer') || window.devLogger) {
  console.log('🔧 Developer context detected - running test automatically in 2 seconds');
  setTimeout(runFullTest, 2000);
} else {
  console.log('💡 Run window.runFullTest() to execute the AI Fix Engine test');
}
