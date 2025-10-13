// Test Twilio Edge Function
// This script tests the deployed send-sms Edge Function

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://cxlqzejzraczumqmsrcx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_62eAoe6DcrOweYtnzfhHmQ_aYY4JZSG';

// Test phone number (replace with your actual phone number to receive SMS)
const TEST_PHONE = '+18557921682'; // Using the Twilio trial number as test

console.log('🧪 Testing Twilio Edge Function...\n');

async function testEdgeFunction() {
  try {
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Login first (Edge Functions require authentication)
    console.log('🔐 Logging in to Supabase...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'jeraldjsmith@gmail.com',
      password: 'Gizmo123'
    });

    if (authError) {
      console.error('❌ Login failed:', authError.message);
      process.exit(1);
    }

    console.log('✅ Logged in successfully\n');

    console.log('📤 Calling send-sms Edge Function...');
    console.log(`   To: ${TEST_PHONE}`);
    console.log(`   Message: Test SMS from TradeMate Pro AI DevTools!\n`);
    
    // Call Edge Function
    const response = await supabase.functions.invoke('send-sms', {
      body: {
        to: TEST_PHONE,
        message: 'Test SMS from TradeMate Pro AI DevTools! 🤖 Your Twilio integration is working!',
        companyId: 'test-company-id'
      }
    });

    console.log('📥 Raw response:', JSON.stringify(response, null, 2));

    const { data, error } = response;

    if (error) {
      console.error('❌ Edge Function Error:');
      console.error(JSON.stringify(error, null, 2));
      
      if (error.message && error.message.includes('credentials not configured')) {
        console.error('\n⚠️  ISSUE: Twilio credentials not set in Supabase secrets');
        console.error('📝 FIX: The deployment script should have set them, but they may not be active yet.');
        console.error('⏳ Wait 30 seconds and try again, or check Supabase dashboard.');
      }
      
      process.exit(1);
    }
    
    if (data && data.success) {
      console.log('✅ SMS SENT SUCCESSFULLY!\n');
      console.log('📊 Response:');
      console.log(`   Message SID: ${data.messageSid}`);
      console.log(`   Status: ${data.status}`);
      console.log(`   Cost: ${data.cost || 'N/A'}\n`);
      
      console.log('🎉 TWILIO INTEGRATION IS WORKING!\n');
      console.log('📱 Check your phone for the SMS message.');
      console.log('📋 Next: Test sending a quote via SMS from the Quotes page.\n');
      
      process.exit(0);
    } else if (data && !data.success) {
      console.error('❌ SMS FAILED:');
      console.error(`   Error: ${data.error || 'Unknown error'}\n`);
      
      if (data.error && data.error.includes('Rate limit')) {
        console.error('⚠️  ISSUE: Rate limit exceeded (max 10 SMS/minute)');
        console.error('📝 FIX: Wait 1 minute and try again.');
      } else if (data.error && data.error.includes('Invalid phone')) {
        console.error('⚠️  ISSUE: Invalid phone number format');
        console.error('📝 FIX: Use E.164 format (+15551234567)');
      }
      
      process.exit(1);
    } else {
      console.error('❌ Unexpected response:');
      console.error(JSON.stringify(data, null, 2));
      process.exit(1);
    }
    
  } catch (err) {
    console.error('❌ Exception:');
    console.error(err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

testEdgeFunction();

