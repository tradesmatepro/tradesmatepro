// Test script to verify the corrected PostgREST join syntax
// Run this in browser console on marketplace page

window.testJoinSyntax = {
  async testCorrectJoinSyntax() {
    console.log('🔍 === TESTING CORRECTED JOIN SYNTAX ===');
    
    const supabaseUrl = 'https://amgtktrwpdsigcomavlg.supabase.co';
    const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64';
    const companyId = 'ba643da1-c16f-468e-8fcb-f347e7929597';
    
    // Test 1: Old failing syntax (should fail with HTTP 300)
    console.log('🔍 Test 1: Old failing syntax with !inner');
    try {
      const oldQuery = `marketplace_responses?select=*,marketplace_requests!inner(*)&marketplace_requests.company_id=eq.${companyId}&response_status=in.(INTERESTED,PENDING_QUOTE,OFFERED)&order=created_at.desc&limit=5`;
      const oldResponse = await fetch(`${supabaseUrl}/rest/v1/${oldQuery}`, {
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📊 Old syntax status:', oldResponse.status);
      if (oldResponse.status === 300) {
        console.log('❌ Old syntax still fails with HTTP 300 (expected)');
      } else if (oldResponse.ok) {
        const data = await oldResponse.json();
        console.log('✅ Old syntax works:', data.length, 'records');
      }
    } catch (error) {
      console.error('❌ Old syntax error:', error);
    }
    
    // Test 2: New corrected syntax (should work)
    console.log('🔍 Test 2: New corrected syntax without !inner');
    try {
      const newQuery = `marketplace_responses?select=*,marketplace_requests(*)&marketplace_requests.company_id=eq.${companyId}&response_status=in.(INTERESTED,PENDING_QUOTE,OFFERED)&order=created_at.desc&limit=5`;
      const newResponse = await fetch(`${supabaseUrl}/rest/v1/${newQuery}`, {
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📊 New syntax status:', newResponse.status);
      if (newResponse.ok) {
        const data = await newResponse.json();
        console.log('✅ New syntax works:', data.length, 'records');
        if (data.length > 0) {
          console.log('📋 Sample data:', data[0]);
        }
      } else {
        console.log('❌ New syntax failed:', newResponse.status);
        const text = await newResponse.text();
        console.log('📨 Error response:', text);
      }
    } catch (error) {
      console.error('❌ New syntax error:', error);
    }
    
    // Test 3: Company join syntax
    console.log('🔍 Test 3: Company join syntax');
    const requestId = '66fd7ec6-eabd-497f-a258-397819eb45e2';
    try {
      const companyQuery = `marketplace_responses?select=*,companies(id,name,email,phone,avg_rating,rating_count)&request_id=eq.${requestId}&order=created_at.desc`;
      const companyResponse = await fetch(`${supabaseUrl}/rest/v1/${companyQuery}`, {
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📊 Company join status:', companyResponse.status);
      if (companyResponse.ok) {
        const data = await companyResponse.json();
        console.log('✅ Company join works:', data.length, 'records');
        if (data.length > 0) {
          console.log('📋 Sample with company data:', data[0]);
        }
      } else {
        console.log('❌ Company join failed:', companyResponse.status);
        const text = await companyResponse.text();
        console.log('📨 Error response:', text);
      }
    } catch (error) {
      console.error('❌ Company join error:', error);
    }
    
    // Test 4: Simple responses query (baseline)
    console.log('🔍 Test 4: Simple responses query (baseline)');
    try {
      const simpleQuery = `marketplace_responses?request_id=eq.${requestId}&order=created_at.desc`;
      const simpleResponse = await fetch(`${supabaseUrl}/rest/v1/${simpleQuery}`, {
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📊 Simple query status:', simpleResponse.status);
      if (simpleResponse.ok) {
        const data = await simpleResponse.json();
        console.log('✅ Simple query works:', data.length, 'records');
        if (data.length > 0) {
          console.log('📋 Response statuses found:', data.map(r => r.response_status));
          console.log('📋 Company IDs found:', data.map(r => r.company_id));
        }
      }
    } catch (error) {
      console.error('❌ Simple query error:', error);
    }
  },
  
  async testModalAfterFix() {
    console.log('🔧 === TESTING MODAL AFTER JOIN FIX ===');
    
    // Run the join syntax tests first
    await this.testCorrectJoinSyntax();
    
    console.log('💡 Now try opening the response modal to see if it works');
    console.log('💡 Look for a request card and click on it');
    
    // Try to find and click a request card
    setTimeout(() => {
      const requestCards = document.querySelectorAll('div[class*="cursor-pointer"]');
      console.log('🔍 Found clickable cards:', requestCards.length);
      
      const targetCard = Array.from(requestCards).find(card => 
        card.textContent.includes('response') || 
        card.textContent.includes('Response') ||
        card.textContent.includes('fix leaky sink')
      );
      
      if (targetCard) {
        console.log('🔍 Found target card, clicking...');
        targetCard.click();
        
        setTimeout(() => {
          const modal = document.querySelector('div[class*="fixed"][class*="inset-0"]');
          if (modal && modal.textContent.includes('Responses to')) {
            console.log('✅ Modal opened!');
            if (modal.textContent.includes('0 contractor')) {
              console.log('❌ Still showing 0 contractors');
            } else if (modal.textContent.includes('contractor')) {
              console.log('✅ Modal shows contractor responses!');
            }
          }
        }, 1500);
      }
    }, 1000);
  },
  
  async quickTest() {
    console.log('🔧 === QUICK JOIN SYNTAX TEST ===');
    await this.testCorrectJoinSyntax();
    console.log('💡 If the new syntax works, run:');
    console.log('   window.testJoinSyntax.testModalAfterFix()');
  }
};

console.log('🔧 Join syntax test tools loaded. Run:');
console.log('   window.testJoinSyntax.quickTest()');
console.log('   window.testJoinSyntax.testModalAfterFix()');
