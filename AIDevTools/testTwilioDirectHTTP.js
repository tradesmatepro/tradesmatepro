// Test Twilio Edge Function via direct HTTP call
// This bypasses the Supabase JS client to see raw errors

const https = require('https');

const SUPABASE_URL = 'https://cxlqzejzraczumqmsrcx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_62eAoe6DcrOweYtnzfhHmQ_aYY4JZSG';
const TEST_PHONE = '+18557921682';

console.log('🧪 Testing Twilio Edge Function (Direct HTTP)...\n');

const postData = JSON.stringify({
  to: TEST_PHONE,
  message: 'Test SMS from TradeMate Pro AI DevTools! 🤖 Direct HTTP test.',
  companyId: 'test-company-id'
});

const options = {
  hostname: 'cxlqzejzraczumqmsrcx.supabase.co',
  port: 443,
  path: '/functions/v1/send-sms',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'apikey': SUPABASE_ANON_KEY
  }
};

console.log('📤 Sending request to:', `${SUPABASE_URL}/functions/v1/send-sms`);
console.log('📋 Request body:', postData);
console.log('');

const req = https.request(options, (res) => {
  console.log('📥 Response status:', res.statusCode);
  console.log('📋 Response headers:', JSON.stringify(res.headers, null, 2));
  console.log('');

  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('📥 Response body:', data);
    console.log('');

    try {
      const jsonData = JSON.parse(data);
      console.log('📊 Parsed response:', JSON.stringify(jsonData, null, 2));
      
      if (jsonData.success) {
        console.log('\n✅ SMS SENT SUCCESSFULLY!');
        console.log(`   Message SID: ${jsonData.messageSid}`);
        console.log(`   Status: ${jsonData.status}`);
        console.log(`   Cost: ${jsonData.cost || 'N/A'}`);
        process.exit(0);
      } else {
        console.log('\n❌ SMS FAILED:');
        console.log(`   Error: ${jsonData.error || 'Unknown error'}`);
        process.exit(1);
      }
    } catch (err) {
      console.log('⚠️  Response is not JSON or parsing failed');
      console.log('Raw response:', data);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error);
  process.exit(1);
});

req.write(postData);
req.end();

