// Comprehensive database sync debugging script
// Run this in browser console on marketplace page

window.testDatabaseSync = {
  async debugRequestResponseSync(requestId = '66fd7ec6-eabd-497f-a258-397819eb45e2') {
    console.log('🔍 === DEBUGGING REQUEST-RESPONSE SYNC ===');
    console.log('🔍 Request ID:', requestId);
    
    const supabaseUrl = 'https://amgtktrwpdsigcomavlg.supabase.co';
    const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64';
    
    // Step 1: Check the request details including response_count
    console.log('🔍 Step 1: Checking request details...');
    try {
      const requestResponse = await fetch(`${supabaseUrl}/rest/v1/marketplace_requests?id=eq.${requestId}&select=*`, {
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (requestResponse.ok) {
        const requestData = await requestResponse.json();
        console.log('📨 Request data:', requestData);
        
        if (requestData.length > 0) {
          const request = requestData[0];
          console.log('📊 Request response_count:', request.response_count);
          console.log('📊 Request status:', request.status);
          console.log('📊 Request title:', request.title);
          console.log('📊 Request company_id:', request.company_id);
        } else {
          console.error('❌ Request not found!');
          return;
        }
      } else {
        console.error('❌ Failed to load request:', requestResponse.status);
        return;
      }
    } catch (error) {
      console.error('❌ Error loading request:', error);
      return;
    }
    
    // Step 2: Check all responses for this request (no filters)
    console.log('🔍 Step 2: Checking all responses for this request...');
    try {
      const allResponsesResponse = await fetch(`${supabaseUrl}/rest/v1/marketplace_responses?request_id=eq.${requestId}&select=*`, {
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (allResponsesResponse.ok) {
        const allResponsesData = await allResponsesResponse.json();
        console.log('📨 All responses data:', allResponsesData);
        console.log('📊 Actual response count:', allResponsesData.length);
        
        if (allResponsesData.length > 0) {
          allResponsesData.forEach((response, index) => {
            console.log(`📋 Response ${index + 1}:`, {
              id: response.id,
              company_id: response.company_id,
              response_status: response.response_status,
              created_at: response.created_at,
              message: response.message?.substring(0, 50) + '...'
            });
          });
        } else {
          console.log('📊 No responses found in database');
        }
      } else {
        console.error('❌ Failed to load responses:', allResponsesResponse.status);
      }
    } catch (error) {
      console.error('❌ Error loading responses:', error);
    }
    
    // Step 3: Check if there are responses with different statuses
    console.log('🔍 Step 3: Checking responses by status...');
    const dbStatuses = ['INTERESTED', 'PENDING_QUOTE', 'OFFERED', 'REJECTED', 'ACCEPTED'];
    const oldStatuses = ['accepted', 'declined', 'counter', 'pending']; // Old status values that might exist

    console.log('🔍 Checking database enum statuses...');
    for (const status of dbStatuses) {
      try {
        const statusResponse = await fetch(`${supabaseUrl}/rest/v1/marketplace_responses?request_id=eq.${requestId}&response_status=eq.${status}&select=*`, {
          headers: {
            'apikey': apiKey,
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });

        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          if (statusData.length > 0) {
            console.log(`📊 ${status} responses:`, statusData.length, statusData);
          }
        }
      } catch (error) {
        console.warn(`⚠️ Error checking ${status} responses:`, error);
      }
    }

    console.log('🔍 Checking old/legacy status values...');
    for (const status of oldStatuses) {
      try {
        const statusResponse = await fetch(`${supabaseUrl}/rest/v1/marketplace_responses?request_id=eq.${requestId}&response_status=eq.${status}&select=*`, {
          headers: {
            'apikey': apiKey,
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });

        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          if (statusData.length > 0) {
            console.log(`📊 LEGACY ${status} responses:`, statusData.length, statusData);
            console.log('🔧 FOUND LEGACY STATUS! This explains the disconnect.');
          }
        }
      } catch (error) {
        console.warn(`⚠️ Error checking legacy ${status} responses:`, error);
      }
    }
    
    // Step 4: Check if the response_count field needs to be recalculated
    console.log('🔍 Step 4: Checking if response_count needs recalculation...');
    try {
      const countResponse = await fetch(`${supabaseUrl}/rest/v1/marketplace_responses?request_id=eq.${requestId}&select=id`, {
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (countResponse.ok) {
        const countData = await countResponse.json();
        const actualCount = countData.length;
        
        console.log('📊 Actual response count from database:', actualCount);
        console.log('💡 If this differs from the request.response_count, the field is out of sync');
        
        if (actualCount === 0) {
          console.log('🔧 DIAGNOSIS: No responses exist in database, but response_count shows 1');
          console.log('🔧 POSSIBLE CAUSES:');
          console.log('   1. Response was deleted but response_count not updated');
          console.log('   2. Response was created in different table/schema');
          console.log('   3. Database trigger failed to decrement count on delete');
          console.log('   4. Response exists but with different request_id');
        }
      }
    } catch (error) {
      console.error('❌ Error counting responses:', error);
    }
    
    // Step 5: Search for orphaned responses that might belong to this request
    console.log('🔍 Step 5: Searching for orphaned responses...');
    try {
      const orphanResponse = await fetch(`${supabaseUrl}/rest/v1/marketplace_responses?select=*&limit=10&order=created_at.desc`, {
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (orphanResponse.ok) {
        const orphanData = await orphanResponse.json();
        console.log('📨 Recent responses (checking for orphans):', orphanData.slice(0, 5));
        
        const possibleMatches = orphanData.filter(response => 
          response.request_id !== requestId && 
          response.created_at > '2024-09-18' // Recent responses
        );
        
        if (possibleMatches.length > 0) {
          console.log('🔍 Possible orphaned responses:', possibleMatches);
        }
      }
    } catch (error) {
      console.error('❌ Error searching for orphaned responses:', error);
    }
    
    console.log('🔍 === DEBUG COMPLETE ===');
  },
  
  async fixResponseCount(requestId = '66fd7ec6-eabd-497f-a258-397819eb45e2') {
    console.log('🔧 === FIXING RESPONSE COUNT ===');
    
    const supabaseUrl = 'https://amgtktrwpdsigcomavlg.supabase.co';
    const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64';
    
    try {
      // Count actual responses
      const countResponse = await fetch(`${supabaseUrl}/rest/v1/marketplace_responses?request_id=eq.${requestId}&select=id`, {
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (countResponse.ok) {
        const countData = await countResponse.json();
        const actualCount = countData.length;
        
        console.log('📊 Actual response count:', actualCount);
        
        // Update the response_count field
        const updateResponse = await fetch(`${supabaseUrl}/rest/v1/marketplace_requests?id=eq.${requestId}`, {
          method: 'PATCH',
          headers: {
            'apikey': apiKey,
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            response_count: actualCount
          })
        });
        
        if (updateResponse.ok) {
          console.log('✅ Response count updated successfully');
          console.log('🔄 Please refresh the page to see the changes');
        } else {
          console.error('❌ Failed to update response count:', updateResponse.status);
        }
      }
    } catch (error) {
      console.error('❌ Error fixing response count:', error);
    }
  },
  
  async quickDiagnosis() {
    console.log('🔧 === QUICK DIAGNOSIS ===');
    await this.debugRequestResponseSync();
    console.log('💡 Run window.testDatabaseSync.fixResponseCount() to fix the count if needed');
  }
};

console.log('🔧 Database sync debugging tools loaded. Run:');
console.log('   window.testDatabaseSync.quickDiagnosis()');
console.log('   window.testDatabaseSync.fixResponseCount()');
