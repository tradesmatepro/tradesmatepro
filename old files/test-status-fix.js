// Test script to verify the status mapping fix
// Run this in browser console on marketplace page

window.testStatusFix = {
  async checkExistingResponses(requestId = '66fd7ec6-eabd-497f-a258-397819eb45e2') {
    console.log('🔍 === CHECKING EXISTING RESPONSES FOR STATUS ISSUES ===');
    
    const supabaseUrl = 'https://amgtktrwpdsigcomavlg.supabase.co';
    const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64';
    
    // Check for responses with INTERESTED status (these might be the "missing" responses)
    console.log('🔍 Checking for INTERESTED responses...');
    try {
      const interestedResponse = await fetch(`${supabaseUrl}/rest/v1/marketplace_responses?request_id=eq.${requestId}&response_status=eq.INTERESTED&select=*`, {
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (interestedResponse.ok) {
        const interestedData = await interestedResponse.json();
        console.log('📨 INTERESTED responses found:', interestedData.length);
        
        if (interestedData.length > 0) {
          console.log('🎯 FOUND THE MISSING RESPONSES!');
          console.log('📋 INTERESTED responses:', interestedData);
          console.log('💡 These responses were saved with INTERESTED status instead of ACCEPTED');
          console.log('💡 The ResponseManagementModal should now show these responses');
          
          return interestedData;
        }
      }
    } catch (error) {
      console.error('❌ Error checking INTERESTED responses:', error);
    }
    
    // Also check for any responses with old status values
    console.log('🔍 Checking for legacy status values...');
    const legacyStatuses = ['accepted', 'declined', 'counter', 'pending'];
    
    for (const status of legacyStatuses) {
      try {
        const legacyResponse = await fetch(`${supabaseUrl}/rest/v1/marketplace_responses?request_id=eq.${requestId}&response_status=eq.${status}&select=*`, {
          headers: {
            'apikey': apiKey,
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (legacyResponse.ok) {
          const legacyData = await legacyResponse.json();
          if (legacyData.length > 0) {
            console.log(`📨 Legacy ${status} responses:`, legacyData.length, legacyData);
          }
        }
      } catch (error) {
        console.warn(`⚠️ Error checking legacy ${status}:`, error);
      }
    }
    
    return null;
  },
  
  async testModalAfterFix(requestId = '66fd7ec6-eabd-497f-a258-397819eb45e2') {
    console.log('🔧 === TESTING MODAL AFTER STATUS FIX ===');
    
    // First check if there are INTERESTED responses
    const interestedResponses = await this.checkExistingResponses(requestId);
    
    if (interestedResponses && interestedResponses.length > 0) {
      console.log('✅ Found INTERESTED responses - modal should now show them');
      console.log('💡 Try clicking on the request card to open the modal');
      console.log('💡 The modal should now show the responses instead of "0 contractors"');
    } else {
      console.log('❌ No INTERESTED responses found - the issue might be elsewhere');
    }
    
    // Look for the request card and try to click it
    setTimeout(() => {
      const requestCards = document.querySelectorAll('div[class*="cursor-pointer"]');
      console.log('🔍 Found clickable cards:', requestCards.length);
      
      // Look for a card that mentions the request title or has response count
      const targetCard = Array.from(requestCards).find(card => 
        card.textContent.includes('fix leaky sink') || 
        card.textContent.includes('response') ||
        card.textContent.includes('Response')
      );
      
      if (targetCard) {
        console.log('🔍 Found target card, clicking...');
        targetCard.click();
        
        // Wait for modal to open
        setTimeout(() => {
          const modal = document.querySelector('div[class*="fixed"][class*="inset-0"]');
          if (modal && modal.textContent.includes('Responses to')) {
            console.log('✅ Modal opened!');
            if (modal.textContent.includes('0 contractor')) {
              console.log('❌ Still showing 0 contractors - fix may not be complete');
            } else if (modal.textContent.includes('contractor')) {
              console.log('✅ Modal shows contractor responses!');
            }
          }
        }, 1500);
      } else {
        console.log('⚠️ Could not find target request card');
      }
    }, 1000);
  },
  
  async fixExistingResponseStatuses(requestId = '66fd7ec6-eabd-497f-a258-397819eb45e2') {
    console.log('🔧 === FIXING EXISTING RESPONSE STATUSES ===');
    console.log('⚠️ This will update INTERESTED responses to ACCEPTED status');
    console.log('⚠️ Only run this if you are sure the INTERESTED responses should be ACCEPTED');
    
    const supabaseUrl = 'https://amgtktrwpdsigcomavlg.supabase.co';
    const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64';
    
    try {
      // First, get the INTERESTED responses
      const getResponse = await fetch(`${supabaseUrl}/rest/v1/marketplace_responses?request_id=eq.${requestId}&response_status=eq.INTERESTED&select=*`, {
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (getResponse.ok) {
        const responses = await getResponse.json();
        console.log('📊 Found INTERESTED responses to update:', responses.length);
        
        if (responses.length > 0) {
          // Update them to ACCEPTED status
          const updateResponse = await fetch(`${supabaseUrl}/rest/v1/marketplace_responses?request_id=eq.${requestId}&response_status=eq.INTERESTED`, {
            method: 'PATCH',
            headers: {
              'apikey': apiKey,
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              response_status: 'ACCEPTED'
            })
          });
          
          if (updateResponse.ok) {
            console.log('✅ Successfully updated response statuses to ACCEPTED');
            console.log('🔄 Please refresh the page to see the changes');
          } else {
            console.error('❌ Failed to update response statuses:', updateResponse.status);
          }
        } else {
          console.log('📊 No INTERESTED responses found to update');
        }
      }
    } catch (error) {
      console.error('❌ Error fixing response statuses:', error);
    }
  },
  
  async quickTest() {
    console.log('🔧 === QUICK STATUS FIX TEST ===');
    await this.checkExistingResponses();
    console.log('💡 If INTERESTED responses were found, run:');
    console.log('   window.testStatusFix.testModalAfterFix()');
    console.log('💡 To fix the statuses permanently, run:');
    console.log('   window.testStatusFix.fixExistingResponseStatuses()');
  }
};

console.log('🔧 Status fix test tools loaded. Run:');
console.log('   window.testStatusFix.quickTest()');
console.log('   window.testStatusFix.testModalAfterFix()');
console.log('   window.testStatusFix.fixExistingResponseStatuses() // CAUTION: Updates database');
