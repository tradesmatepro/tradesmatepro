const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = "https://amgtktrwpdsigcomavlg.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function testPreferredTimeField() {
  console.log('🧪 Testing preferred_time_option field in marketplace_requests...');
  
  try {
    // Test data with preferred_time_option field
    const testData = {
      company_id: 'test-company-' + Date.now(),
      title: 'Test Smart Scheduler Request',
      description: 'Testing if preferred_time_option field works',
      request_type: 'STANDARD',
      service_mode: 'onsite',
      pricing_type: 'negotiable',
      pricing_preference: 'NEGOTIABLE',
      preferred_time_option: 'this_week', // This is the field we're testing
      status: 'available'
    };

    console.log('📊 Test data:', testData);

    // Try to insert the test data
    const { data: newRequest, error: requestError } = await supabase
      .from('marketplace_requests')
      .insert([testData])
      .select()
      .single();

    if (requestError) {
      console.error('❌ Insert failed:', requestError);
      
      if (requestError.message.includes('preferred_time_option')) {
        console.log('🔍 The preferred_time_option field does not exist in the database');
        console.log('💡 Need to add this column to the marketplace_requests table');
      }
      
      return false;
    }

    console.log('✅ Insert successful! Request created:', newRequest);
    
    // Clean up - delete the test record
    const { error: deleteError } = await supabase
      .from('marketplace_requests')
      .delete()
      .eq('id', newRequest.id);

    if (deleteError) {
      console.warn('⚠️ Could not clean up test record:', deleteError);
    } else {
      console.log('🧹 Test record cleaned up');
    }

    return true;
  } catch (error) {
    console.error('❌ Test error:', error);
    return false;
  }
}

// Run the test
testPreferredTimeField()
  .then(success => {
    if (success) {
      console.log('🎉 preferred_time_option field exists and works!');
      process.exit(0);
    } else {
      console.log('💥 preferred_time_option field test failed!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });
