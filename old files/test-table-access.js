// Test script to debug table access issues
// Run this in browser console on marketplace page

window.testTableAccess = {
  async testDirectTableAccess() {
    console.log('🔍 === TESTING DIRECT TABLE ACCESS ===');
    
    const supabaseUrl = 'https://amgtktrwpdsigcomavlg.supabase.co';
    const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64';
    
    // Test 1: Basic table access
    console.log('🔍 Test 1: Basic marketplace_responses table access');
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/marketplace_responses?limit=1`, {
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📊 Basic access status:', response.status);
      console.log('📊 Basic access headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.status === 300) {
        console.log('❌ HTTP 300 on basic table access - RLS or permissions issue');
        const text = await response.text();
        console.log('📨 Response body:', text);
      } else if (response.ok) {
        const data = await response.json();
        console.log('✅ Basic table access works, found records:', data.length);
      }
    } catch (error) {
      console.error('❌ Basic table access error:', error);
    }
    
    // Test 2: Test other tables that work
    console.log('🔍 Test 2: Testing working tables for comparison');
    const workingTables = ['companies', 'marketplace_requests', 'work_orders'];
    
    for (const table of workingTables) {
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/${table}?limit=1`, {
          headers: {
            'apikey': apiKey,
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`📊 ${table} status:`, response.status);
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ ${table} works, found records:`, data.length);
        }
      } catch (error) {
        console.warn(`⚠️ ${table} error:`, error);
      }
    }
    
    // Test 3: Test the specific failing query
    console.log('🔍 Test 3: Testing the specific failing query');
    const requestId = '66fd7ec6-eabd-497f-a258-397819eb45e2';
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/marketplace_responses?request_id=eq.${requestId}`, {
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📊 Specific query status:', response.status);
      if (response.status === 300) {
        console.log('❌ HTTP 300 on specific query');
        const text = await response.text();
        console.log('📨 Response body:', text);
      } else if (response.ok) {
        const data = await response.json();
        console.log('✅ Specific query works, found records:', data.length);
        if (data.length > 0) {
          console.log('📋 Found responses:', data);
        }
      }
    } catch (error) {
      console.error('❌ Specific query error:', error);
    }
    
    // Test 4: Test if table exists in schema
    console.log('🔍 Test 4: Checking if marketplace_responses table exists');
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/?select=*`, {
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Available endpoints/tables:', data);
      }
    } catch (error) {
      console.warn('⚠️ Schema check error:', error);
    }
  },
  
  async testRLSPolicies() {
    console.log('🔍 === TESTING RLS POLICIES ===');
    
    const supabaseUrl = 'https://amgtktrwpdsigcomavlg.supabase.co';
    const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64';
    
    // Test with different auth contexts
    console.log('🔍 Testing with service role key (should bypass RLS)');
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/marketplace_responses?limit=5`, {
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      });
      
      console.log('📊 Service role status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Service role works, total responses in DB:', data.length);
        if (data.length > 0) {
          console.log('📋 Sample responses:', data.slice(0, 2));
        }
      } else {
        console.log('❌ Service role failed');
        const text = await response.text();
        console.log('📨 Error response:', text);
      }
    } catch (error) {
      console.error('❌ Service role test error:', error);
    }
  },
  
  async testCompanyScoping() {
    console.log('🔍 === TESTING COMPANY SCOPING ===');
    
    // Check if the issue is with company_id filtering
    const companyId = 'ba643da1-c16f-468e-8fcb-f347e7929597'; // From the error logs
    const supabaseUrl = 'https://amgtktrwpdsigcomavlg.supabase.co';
    const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64';
    
    console.log('🔍 Testing company-scoped queries');
    console.log('🔍 Company ID:', companyId);
    
    // Test the failing query from the error logs
    const failingQuery = `marketplace_responses?select=*,marketplace_requests!inner(*)&marketplace_requests.company_id=eq.${companyId}&response_status=in.(INTERESTED,PENDING_QUOTE,OFFERED)&order=created_at.desc&limit=5`;
    
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/${failingQuery}`, {
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📊 Failing query status:', response.status);
      console.log('📊 Failing query URL:', `${supabaseUrl}/rest/v1/${failingQuery}`);
      
      if (response.status === 300) {
        console.log('❌ HTTP 300 on company-scoped query');
        const text = await response.text();
        console.log('📨 Response body:', text);
        console.log('💡 This suggests an issue with the inner join or company filtering');
      } else if (response.ok) {
        const data = await response.json();
        console.log('✅ Company-scoped query works, found records:', data.length);
      }
    } catch (error) {
      console.error('❌ Company-scoped query error:', error);
    }
  },
  
  async runFullDiagnosis() {
    console.log('🔧 === RUNNING FULL TABLE ACCESS DIAGNOSIS ===');
    await this.testDirectTableAccess();
    await this.testRLSPolicies();
    await this.testCompanyScoping();
    console.log('🔧 === DIAGNOSIS COMPLETE ===');
  }
};

console.log('🔧 Table access debugging tools loaded. Run:');
console.log('   window.testTableAccess.runFullDiagnosis()');
console.log('   window.testTableAccess.testDirectTableAccess()');
console.log('   window.testTableAccess.testCompanyScoping()');
