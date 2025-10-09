// Create patch proposals for the marketplace issues reported by the user
const fs = require('fs');
const path = require('path');

console.log('🔧 Creating AI Fix Engine Patch Proposals for Marketplace Issues');

// Issue 1: Dashboard cards not clickable
const dashboardCardIssue = {
  issue_id: `issue_${Date.now()}_1`,
  issue_type: 'UI_ERROR',
  issue_message: 'Dashboard cards in marketplace are not clickable - onTabChange not working properly',
  severity: 'high',
  context: {
    component: 'CustomerDashboard',
    file: 'src/components/Marketplace/CustomerDashboard.js',
    userReport: 'once when i click on marketplace and go to the dashboard the cards are supposed to be clickable and take me to what the card is talking about. it doesn\'t do that',
    location: 'http://localhost:3005/marketplace',
    test: 'dashboard_card_clicks'
  },
  suggested_file: 'src/components/Marketplace/CustomerDashboard.js',
  patch_proposal: {
    description: 'Fix dashboard card click handlers to properly navigate between tabs',
    before: `// Current implementation may have issues with onTabChange prop passing or event handling
<div
  className="bg-white border border-gray-200 rounded-lg p-6 cursor-pointer hover:shadow-md transition-shadow"
  onClick={() => onTabChange('jobs')}
>`,
    after: `// Fixed implementation with proper event handling and debugging
<div
  className="bg-white border border-gray-200 rounded-lg p-6 cursor-pointer hover:shadow-md transition-shadow"
  onClick={(e) => {
    e.preventDefault();
    console.log('Dashboard card clicked: jobs');
    if (typeof onTabChange === 'function') {
      onTabChange('jobs');
    } else {
      console.error('onTabChange is not a function:', onTabChange);
    }
  }}
>`,
    reasoning: 'The issue appears to be that onTabChange may not be properly passed as a prop or the click events are not firing. Adding event prevention, logging, and function type checking will help debug and fix the issue.'
  },
  timestamp: new Date().toISOString(),
  status: 'pending_review'
};

// Issue 2: Form submission errors
const formSubmissionIssue = {
  issue_id: `issue_${Date.now()}_2`,
  issue_type: 'API_ERROR',
  issue_message: 'Form submission in open jobs section fails with errors - RPC endpoint missing or misconfigured',
  severity: 'high',
  context: {
    component: 'InlineResponseForm',
    file: 'src/components/Marketplace/InlineResponseForm.js',
    userReport: 'i go to open jobs i fill out the form and hit submit response and i get errors',
    endpoint: 'rpc/submit_response_to_role',
    location: 'http://localhost:3005/marketplace',
    test: 'form_submission'
  },
  suggested_file: 'src/components/Marketplace/InlineResponseForm.js',
  patch_proposal: {
    description: 'Fix form submission by adding proper error handling and fallback for missing RPC endpoint',
    before: `// Current implementation assumes RPC endpoint exists
const response = await supaFetch(
  'rpc/submit_response_to_role',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(responseData)
  },
  user.company_id
);`,
    after: `// Fixed implementation with error handling and fallback
try {
  const response = await supaFetch(
    'rpc/submit_response_to_role',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(responseData)
    },
    user.company_id
  );
  
  if (!response.ok) {
    // If RPC endpoint doesn't exist, fall back to direct table insert
    if (response.status === 404) {
      console.warn('RPC endpoint not found, falling back to direct insert');
      const fallbackResponse = await supaFetch(
        'marketplace_responses',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            request_id: responseData.p_request_id,
            role_id: responseData.p_role_id,
            company_id: responseData.p_company_id,
            response_type: responseData.p_response_type,
            pricing_type: responseData.p_pricing_type,
            quantity_fulfilled: responseData.p_quantity_fulfilled,
            proposed_start_time: responseData.p_proposed_start_time,
            proposed_end_time: responseData.p_proposed_end_time,
            proposed_amount: responseData.p_proposed_amount,
            message: responseData.p_message
          })
        },
        user.company_id
      );
      return fallbackResponse;
    }
    throw new Error(\`API Error: \${response.status} \${response.statusText}\`);
  }
  
  return response;
} catch (error) {
  console.error('Form submission error:', error);
  throw error;
}`,
    reasoning: 'The RPC function submit_response_to_role may not exist in the database. Adding a fallback to direct table insertion and better error handling will resolve the form submission issues.'
  },
  timestamp: new Date().toISOString(),
  status: 'pending_review'
};

// Create the patch proposal files
async function createPatchFiles() {
  const logDir = path.join(process.cwd(), 'error_logs');
  
  // Ensure directory exists
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  // Save patch proposals
  const dashboardFile = path.join(logDir, `patch_proposal_${dashboardCardIssue.issue_id}.json`);
  const formFile = path.join(logDir, `patch_proposal_${formSubmissionIssue.issue_id}.json`);
  
  fs.writeFileSync(dashboardFile, JSON.stringify(dashboardCardIssue, null, 2));
  fs.writeFileSync(formFile, JSON.stringify(formSubmissionIssue, null, 2));
  
  console.log(`✅ Created patch proposal: ${path.basename(dashboardFile)}`);
  console.log(`✅ Created patch proposal: ${path.basename(formFile)}`);
  
  // Create a summary fix record
  const fixRecord = {
    timestamp: new Date().toISOString(),
    total_issues: 2,
    results: [
      {
        id: `FIX-${Date.now()}-1`,
        issue: {
          type: 'UI_ERROR',
          message: dashboardCardIssue.issue_message,
          validator: 'Marketplace'
        },
        attempts: [{
          attempt: 1,
          success: false,
          reason: 'JSON handoff mode - patch proposal created',
          patchProposal: dashboardCardIssue.patch_proposal,
          timestamp: dashboardCardIssue.timestamp
        }],
        finalStatus: 'patch_created'
      },
      {
        id: `FIX-${Date.now()}-2`,
        issue: {
          type: 'API_ERROR',
          message: formSubmissionIssue.issue_message,
          validator: 'Marketplace'
        },
        attempts: [{
          attempt: 1,
          success: false,
          reason: 'JSON handoff mode - patch proposal created',
          patchProposal: formSubmissionIssue.patch_proposal,
          timestamp: formSubmissionIssue.timestamp
        }],
        finalStatus: 'patch_created'
      }
    ],
    summary: {
      patches_created: 2,
      failed: 0,
      errors: 0
    }
  };
  
  const recordFile = path.join(logDir, 'fix_record_latest.json');
  fs.writeFileSync(recordFile, JSON.stringify(fixRecord, null, 2));
  
  console.log(`✅ Created fix record: ${path.basename(recordFile)}`);
  
  return { dashboardFile, formFile, recordFile };
}

// Main execution
async function main() {
  console.log('🚀 Creating Marketplace Issue Patch Proposals');
  console.log('=' .repeat(60));
  
  const files = await createPatchFiles();
  
  console.log('\n📋 Summary:');
  console.log('   🔧 Issue 1: Dashboard cards not clickable');
  console.log('   🔧 Issue 2: Form submission errors in open jobs');
  console.log('\n📁 Files created in error_logs/:');
  Object.values(files).forEach(file => {
    console.log(`   📄 ${path.basename(file)}`);
  });
  
  console.log('\n✅ Patch proposals ready for Claude review!');
  console.log('🤖 Claude can now review these JSON files and implement the actual fixes.');
  
  return files;
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, createPatchFiles };
