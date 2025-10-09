// Test the BookingForm fix after adding preferred_time_option column
const { createClient } = require('@supabase/supabase-js');

async function testBookingFormFix() {
  try {
    console.log('🧪 TESTING BOOKING FORM FIX');
    console.log('This test verifies the preferred_time_option column fix works.\n');
    
    // Setup Supabase client
    const supabaseUrl = 'https://amgtktrwpdsigcomavlg.supabase.co';
    const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('📊 STEP 1: Testing marketplace_requests insert with preferred_time_option...');
    
    // Test data that matches what BookingForm.js sends
    const testRequestData = {
      company_id: null, // Customer request
      title: 'Test Request - Preferred Time Option Fix',
      description: 'Testing if preferred_time_option column works after database fix',
      request_type: 'STANDARD',
      service_mode: 'onsite',
      pricing_type: 'negotiable',
      pricing_preference: 'NEGOTIABLE',
      budget: null,
      flat_rate: null,
      hourly_rate: null,
      hourly_rate_limit: null,
      max_responses: 5,
      requires_inspection: false,
      preferred_time_option: 'this_week', // This was causing the error
      start_time: null,
      end_time: null
    };
    
    console.log('📊 Test data:', JSON.stringify(testRequestData, null, 2));
    
    // Try to insert the test data (this was failing before)
    const { data: newRequest, error: requestError } = await supabase
      .from('marketplace_requests')
      .insert([testRequestData])
      .select()
      .single();
    
    if (requestError) {
      console.error('❌ INSERT STILL FAILING:', requestError);
      
      if (requestError.message.includes('preferred_time_option')) {
        console.log('\n🚨 COLUMN STILL MISSING!');
        console.log('You need to run this SQL in Supabase SQL Editor:');
        console.log('');
        console.log('ALTER TABLE public.marketplace_requests');
        console.log('ADD COLUMN IF NOT EXISTS preferred_time_option TEXT DEFAULT \'anytime\'');
        console.log('CHECK (preferred_time_option IN (\'anytime\', \'soonest\', \'this_week\', \'weekend_only\', \'specific\'));');
        console.log('');
      }
      
      return false;
    }
    
    console.log('✅ INSERT SUCCESSFUL! Request created:', newRequest.id);
    console.log('   preferred_time_option value:', newRequest.preferred_time_option);
    
    console.log('\n📊 STEP 2: Testing different preferred_time_option values...');
    
    const timeOptions = ['anytime', 'soonest', 'this_week', 'weekend_only', 'specific'];
    const testResults = [];
    
    for (const option of timeOptions) {
      const testData = {
        ...testRequestData,
        title: `Test Request - ${option}`,
        preferred_time_option: option,
        start_time: option === 'specific' ? new Date().toISOString() : null,
        end_time: option === 'specific' ? new Date(Date.now() + 2*60*60*1000).toISOString() : null
      };
      
      const { data: testRequest, error: testError } = await supabase
        .from('marketplace_requests')
        .insert([testData])
        .select()
        .single();
      
      if (testError) {
        console.log(`❌ ${option}: ${testError.message}`);
        testResults.push({ option, success: false, error: testError.message });
      } else {
        console.log(`✅ ${option}: Created successfully`);
        testResults.push({ option, success: true, id: testRequest.id });
      }
    }
    
    console.log('\n📊 STEP 3: Cleaning up test records...');
    
    // Clean up all test records
    const { error: cleanupError } = await supabase
      .from('marketplace_requests')
      .delete()
      .like('title', 'Test Request - %');
    
    if (cleanupError) {
      console.warn('⚠️ Could not clean up test records:', cleanupError.message);
    } else {
      console.log('🧹 Test records cleaned up');
    }
    
    console.log('\n🎯 TEST RESULTS SUMMARY:');
    const successCount = testResults.filter(r => r.success).length;
    console.log(`✅ Successful: ${successCount}/${testResults.length} time options`);
    
    if (successCount === testResults.length) {
      console.log('🎉 ALL TESTS PASSED! BookingForm fix is working correctly.');
      console.log('\n📋 What this means:');
      console.log('   ✅ preferred_time_option column exists and works');
      console.log('   ✅ All time preference values are accepted');
      console.log('   ✅ BookingForm submissions should work now');
      console.log('   ✅ Smart scheduling should work properly');
      return true;
    } else {
      console.log('❌ Some tests failed. Check the errors above.');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

console.log('🚨 IMPORTANT: Before running this test, make sure you have executed this SQL in Supabase:');
console.log('ALTER TABLE public.marketplace_requests ADD COLUMN IF NOT EXISTS preferred_time_option TEXT DEFAULT \'anytime\';');
console.log('');
console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...');

setTimeout(() => {
  testBookingFormFix().then(success => {
    if (success) {
      console.log('\n🎯 NEXT STEPS:');
      console.log('1. Test BookingForm in browser - should work without errors');
      console.log('2. Test smart scheduling features');
      console.log('3. Verify marketplace request submissions work');
    } else {
      console.log('\n🚨 MANUAL ACTION STILL REQUIRED:');
      console.log('The database column may not have been added correctly.');
      console.log('Please run the SQL command manually in Supabase SQL Editor.');
    }
  });
}, 5000);
