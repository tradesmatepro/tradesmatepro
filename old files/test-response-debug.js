// Debug script for marketplace response loading issue
// Run this in browser console on marketplace page

window.testResponseDebug = {
  async debugResponseQuery(requestId) {
    console.log('🔍 === DEBUGGING RESPONSE QUERY ===');
    console.log('🔍 Request ID:', requestId);
    
    const supabaseUrl = 'https://amgtktrwpdsigcomavlg.supabase.co';
    const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64';
    
    // Test 1: Query responses without join
    console.log('🔍 Test 1: Query responses without join');
    try {
      const response1 = await fetch(`${supabaseUrl}/rest/v1/marketplace_responses?request_id=eq.${requestId}&order=created_at.desc`, {
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('🔍 Response 1 status:', response1.status);
      if (response1.ok) {
        const data1 = await response1.json();
        console.log('📨 Response 1 data:', data1);
        console.log('📊 Response 1 count:', data1.length);
      } else {
        console.error('❌ Response 1 error:', await response1.text());
      }
    } catch (error) {
      console.error('❌ Response 1 network error:', error);
    }
    
    // Test 2: Query responses with companies join
    console.log('🔍 Test 2: Query responses with companies join');
    try {
      const response2 = await fetch(`${supabaseUrl}/rest/v1/marketplace_responses?select=*,companies(id,name,email,phone,avg_rating,rating_count)&request_id=eq.${requestId}&order=created_at.desc`, {
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('🔍 Response 2 status:', response2.status);
      if (response2.ok) {
        const data2 = await response2.json();
        console.log('📨 Response 2 data:', data2);
        console.log('📊 Response 2 count:', data2.length);
      } else {
        console.error('❌ Response 2 error:', await response2.text());
      }
    } catch (error) {
      console.error('❌ Response 2 network error:', error);
    }
    
    // Test 3: Query the specific request to see response_count
    console.log('🔍 Test 3: Query request to see response_count');
    try {
      const response3 = await fetch(`${supabaseUrl}/rest/v1/marketplace_requests?id=eq.${requestId}&select=*`, {
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('🔍 Response 3 status:', response3.status);
      if (response3.ok) {
        const data3 = await response3.json();
        console.log('📨 Response 3 data:', data3);
        if (data3.length > 0) {
          console.log('📊 Request response_count:', data3[0].response_count);
        }
      } else {
        console.error('❌ Response 3 error:', await response3.text());
      }
    } catch (error) {
      console.error('❌ Response 3 network error:', error);
    }
    
    // Test 4: Check if companies table exists and has data
    console.log('🔍 Test 4: Check companies table');
    try {
      const response4 = await fetch(`${supabaseUrl}/rest/v1/companies?limit=5&select=id,name,email,phone`, {
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('🔍 Response 4 status:', response4.status);
      if (response4.ok) {
        const data4 = await response4.json();
        console.log('📨 Response 4 data (first 5 companies):', data4);
        console.log('📊 Companies count:', data4.length);
      } else {
        console.error('❌ Response 4 error:', await response4.text());
      }
    } catch (error) {
      console.error('❌ Response 4 network error:', error);
    }
    
    console.log('🔍 === DEBUG COMPLETE ===');
  },
  
  // Quick test with the request ID from console logs
  async quickTest() {
    const requestId = '66fd7ec6-eabd-497f-a258-397819eb45e2'; // From console logs
    await this.debugResponseQuery(requestId);
  }
};

console.log('🔧 Response debug tools loaded. Run:');
console.log('   window.testResponseDebug.quickTest()');
console.log('   window.testResponseDebug.debugResponseQuery("your-request-id")');
