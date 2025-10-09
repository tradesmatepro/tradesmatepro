// Direct test of the AI Fix Engine with marketplace issues
const fs = require('fs');
const path = require('path');

console.log('🧪 Running AI Fix Engine Test for Marketplace Issues');

// Simulate the issues by creating test data
const marketplaceIssues = [
  {
    type: "validator",
    validator: "Marketplace", 
    message: "Dashboard cards in marketplace are not clickable - onTabChange not working properly",
    stack: null,
    id: "marketplace_dashboard_cards",
    title: "Dashboard Card Clickability Issue",
    context: {
      component: "CustomerDashboard",
      file: "src/components/Marketplace/CustomerDashboard.js",
      userReport: "once when i click on marketplace and go to the dashboard the cards are supposed to be clickable and take me to what the card is talking about. it doesn't do that"
    }
  },
  {
    type: "validator", 
    validator: "Marketplace",
    message: "Form submission in open jobs section fails with errors - RPC endpoint missing",
    stack: null,
    id: "marketplace_form_submission",
    title: "Form Submission Error",
    context: {
      component: "InlineResponseForm", 
      file: "src/components/Marketplace/InlineResponseForm.js",
      userReport: "i go to open jobs i fill out the form and hit submit response and i get errors",
      endpoint: "rpc/submit_response_to_role"
    }
  }
];

// Import the fix engine components
async function runFixEngineTest() {
  try {
    console.log('🔧 Importing fix engine components...');
    
    // Create a mock core for the fix engine
    const mockCore = {
      addLog: (level, message, source) => {
        console.log(`[${level}] [${source}] ${message}`);
      },
      getState: () => ({
        errors: marketplaceIssues
      })
    };

    // Import and create fix executor
    const { FixExecutor } = await import('./src/devtools/fixEngine/fixExecutor.js');
    const executor = new FixExecutor(mockCore);

    console.log('🚀 Running fix cycle for marketplace issues...');
    
    const results = [];
    for (const issue of marketplaceIssues) {
      console.log(`🔧 Processing: ${issue.message}`);
      const result = await executor.runFixLoop(issue);
      results.push(result);
    }

    console.log('✅ Fix engine test completed!');
    console.log(`📊 Processed ${results.length} issues`);
    
    // Display results
    results.forEach((result, index) => {
      console.log(`\n📋 Result ${index + 1}:`);
      console.log(`   ID: ${result.id}`);
      console.log(`   Status: ${result.finalStatus}`);
      console.log(`   Attempts: ${result.attempts.length}`);
      
      result.attempts.forEach((attempt, attemptIndex) => {
        console.log(`   Attempt ${attemptIndex + 1}: ${attempt.reason}`);
        if (attempt.patchProposal) {
          console.log(`     Suggested file: ${attempt.patchProposal.file}`);
          console.log(`     Description: ${attempt.patchProposal.description}`);
        }
      });
    });

    return results;
    
  } catch (error) {
    console.error('❌ Fix engine test failed:', error);
    return null;
  }
}

// Check what files were generated
async function checkGeneratedFiles() {
  try {
    const response = await fetch('http://localhost:4000/list-files');
    if (response.ok) {
      const files = await response.json();
      console.log('\n📁 Generated files:');
      files.forEach(file => {
        if (file.includes('patch_proposal') || file.includes('fix_record')) {
          console.log(`   📄 ${file}`);
        }
      });
      return files;
    }
  } catch (error) {
    console.error('❌ Could not check generated files:', error);
  }
  return [];
}

// Main execution
async function main() {
  console.log('🚀 Starting AI Fix Engine Test');
  console.log('=' .repeat(50));
  
  const results = await runFixEngineTest();
  
  if (results) {
    console.log('\n⏳ Waiting for files to be written...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await checkGeneratedFiles();
    
    console.log('\n✅ Test completed! Check the error_logs directory for JSON files.');
    console.log('📝 These files can now be reviewed by Claude/ChatGPT to implement actual fixes.');
  }
}

// Run the test
main().catch(console.error);
