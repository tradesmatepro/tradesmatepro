// Debug script to verify marketplace response status enum handling
// Run this in browser console to check for enum mismatches

window.debugResponseStatusEnum = {
  async checkDatabaseValues() {
    console.log('🔍 Checking marketplace_responses status values in database...');
    
    try {
      // Get all unique response_status values from database
      const response = await fetch(`${window.SUPABASE_URL}/rest/v1/marketplace_responses?select=response_status&limit=1000`, {
        headers: {
          'apikey': window.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const statusValues = [...new Set(data.map(r => r.response_status))].filter(Boolean);
      
      console.log('📊 Found response_status values in database:', statusValues);
      
      // Check against expected enum values
      const expectedValues = ['INTERESTED', 'PENDING_QUOTE', 'OFFERED', 'REJECTED', 'ACCEPTED'];
      const unexpectedValues = statusValues.filter(v => !expectedValues.includes(v));
      const missingValues = expectedValues.filter(v => !statusValues.includes(v));
      
      if (unexpectedValues.length > 0) {
        console.warn('⚠️ Found unexpected status values:', unexpectedValues);
      }
      
      if (missingValues.length > 0) {
        console.log('ℹ️ Expected values not found in data:', missingValues);
      }
      
      if (unexpectedValues.length === 0) {
        console.log('✅ All status values match expected enum values');
      }
      
      return {
        found: statusValues,
        expected: expectedValues,
        unexpected: unexpectedValues,
        missing: missingValues
      };
      
    } catch (error) {
      console.error('❌ Error checking database values:', error);
      return null;
    }
  },

  async checkSpecificRequest(requestId) {
    console.log(`🔍 Checking responses for request ${requestId}...`);
    
    try {
      const response = await fetch(`${window.SUPABASE_URL}/rest/v1/marketplace_responses?request_id=eq.${requestId}&select=*`, {
        headers: {
          'apikey': window.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      console.log(`📊 Found ${data.length} responses for request ${requestId}:`);
      data.forEach((resp, index) => {
        console.log(`  ${index + 1}. Status: "${resp.response_status}" | Company: ${resp.company_id} | Created: ${resp.created_at}`);
      });
      
      return data;
      
    } catch (error) {
      console.error('❌ Error checking specific request:', error);
      return null;
    }
  },

  async checkFilterQuery(companyId) {
    console.log(`🔍 Testing filter query for company ${companyId}...`);
    
    const queries = [
      // Test individual status filters
      `marketplace_responses?select=*&response_status=eq.INTERESTED&limit=5`,
      `marketplace_responses?select=*&response_status=eq.PENDING_QUOTE&limit=5`,
      `marketplace_responses?select=*&response_status=eq.OFFERED&limit=5`,
      `marketplace_responses?select=*&response_status=eq.REJECTED&limit=5`,
      `marketplace_responses?select=*&response_status=eq.ACCEPTED&limit=5`,
      
      // Test the combined filter used in CustomerDashboard
      `marketplace_responses?select=*&response_status=in.(INTERESTED,PENDING_QUOTE,OFFERED)&limit=10`,
      
      // Test with company filter
      `marketplace_responses?select=*,marketplace_requests!marketplace_responses_request_id_fkey(*)&marketplace_requests.company_id=eq.${companyId}&response_status=in.(INTERESTED,PENDING_QUOTE,OFFERED)&limit=10`
    ];
    
    for (const query of queries) {
      try {
        console.log(`🔍 Testing: ${query}`);
        
        const response = await fetch(`${window.SUPABASE_URL}/rest/v1/${query}`, {
          headers: {
            'apikey': window.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        console.log(`  ✅ Status ${response.status}: Found ${Array.isArray(data) ? data.length : 'N/A'} results`);
        
        if (Array.isArray(data) && data.length > 0) {
          const statuses = [...new Set(data.map(r => r.response_status))];
          console.log(`  📊 Status values: ${statuses.join(', ')}`);
        }
        
      } catch (error) {
        console.error(`  ❌ Error: ${error.message}`);
      }
    }
  },

  async runFullDiagnostic(companyId) {
    console.log('🚀 Running full response status diagnostic...');
    console.log('='.repeat(50));
    
    await this.checkDatabaseValues();
    console.log('');
    
    await this.checkFilterQuery(companyId);
    console.log('');
    
    console.log('✅ Diagnostic complete!');
  }
};

// Auto-run if company ID is available
if (window.user?.company_id) {
  console.log('🔍 Auto-running response status diagnostic...');
  window.debugResponseStatusEnum.runFullDiagnostic(window.user.company_id);
} else {
  console.log('ℹ️ Response status enum debugger loaded. Run window.debugResponseStatusEnum.runFullDiagnostic(companyId) to test.');
}
