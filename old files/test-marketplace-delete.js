// Test script to verify marketplace request deletion works properly
// Run this in browser console after logging in

window.testMarketplaceDelete = {
  async testDeleteRequest(requestId) {
    console.log(`🧪 Testing deletion of marketplace request: ${requestId}`);
    
    try {
      // First, check what exists before deletion
      console.log('📊 Before deletion - checking related data...');
      
      // Check responses
      const responsesQuery = `marketplace_responses?request_id=eq.${requestId}&select=*`;
      const responsesResponse = await fetch(`${window.SUPABASE_URL}/rest/v1/${responsesQuery}`, {
        headers: {
          'apikey': window.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (responsesResponse.ok) {
        const responses = await responsesResponse.json();
        console.log(`📊 Found ${responses.length} responses for this request`);
      }
      
      // Check request tags
      const tagsQuery = `marketplace_request_tags?request_id=eq.${requestId}&select=*`;
      const tagsResponse = await fetch(`${window.SUPABASE_URL}/rest/v1/${tagsQuery}`, {
        headers: {
          'apikey': window.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (tagsResponse.ok) {
        const tags = await tagsResponse.json();
        console.log(`📊 Found ${tags.length} tags for this request`);
      }
      
      // Now attempt deletion
      console.log('🗑️ Attempting to delete request...');
      
      const deleteResponse = await fetch(`${window.SUPABASE_URL}/rest/v1/marketplace_requests?id=eq.${requestId}`, {
        method: 'DELETE',
        headers: {
          'apikey': window.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`🔍 Delete response status: ${deleteResponse.status}`);
      
      if (deleteResponse.ok) {
        console.log('✅ Request deleted successfully!');
        
        // Verify cascade deletion worked
        console.log('🔍 Verifying cascade deletion...');
        
        const verifyResponsesResponse = await fetch(`${window.SUPABASE_URL}/rest/v1/${responsesQuery}`, {
          headers: {
            'apikey': window.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (verifyResponsesResponse.ok) {
          const remainingResponses = await verifyResponsesResponse.json();
          console.log(`📊 Remaining responses after deletion: ${remainingResponses.length}`);
          
          if (remainingResponses.length === 0) {
            console.log('✅ Cascade deletion worked - all responses were deleted');
          } else {
            console.warn('⚠️ Some responses still exist after request deletion');
          }
        }
        
        return true;
      } else {
        const errorText = await deleteResponse.text();
        console.error('❌ Delete failed:', deleteResponse.status, errorText);
        return false;
      }
      
    } catch (error) {
      console.error('❌ Error during delete test:', error);
      return false;
    }
  },

  async findTestableRequest() {
    console.log('🔍 Finding a request you can delete for testing...');
    
    try {
      const companyId = window.user?.company_id;
      if (!companyId) {
        console.error('❌ No company ID found. Please log in first.');
        return null;
      }
      
      // Find requests posted by this company
      const query = `marketplace_requests?company_id=eq.${companyId}&select=id,title,status,created_at&limit=5`;
      const response = await fetch(`${window.SUPABASE_URL}/rest/v1/${query}`, {
        headers: {
          'apikey': window.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const requests = await response.json();
        console.log(`📊 Found ${requests.length} requests you can delete:`);
        
        requests.forEach((req, index) => {
          console.log(`  ${index + 1}. ${req.title} (${req.status}) - ID: ${req.id}`);
        });
        
        if (requests.length > 0) {
          console.log(`💡 To test deletion, run: window.testMarketplaceDelete.testDeleteRequest('${requests[0].id}')`);
          return requests[0].id;
        } else {
          console.log('ℹ️ No requests found. Create a test request first.');
          return null;
        }
      } else {
        console.error('❌ Failed to fetch requests:', response.status);
        return null;
      }
      
    } catch (error) {
      console.error('❌ Error finding testable request:', error);
      return null;
    }
  }
};

// Auto-run to find testable requests
if (window.user?.company_id) {
  console.log('🧪 Marketplace delete tester loaded!');
  window.testMarketplaceDelete.findTestableRequest();
} else {
  console.log('ℹ️ Marketplace delete tester loaded. Log in first, then run window.testMarketplaceDelete.findTestableRequest()');
}
