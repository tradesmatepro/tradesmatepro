const https = require('https');

const url = 'https://cxlqzejzraczumqmsrcx.supabase.co/rest/v1/rpc/pgrst_reload_schema';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bHF6ZWp6cmFjenVtcW1zcmN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODk4NTQ0MywiZXhwIjoyMDc0NTYxNDQzfQ.lNQuV8WoSo7RiHeg2IKhY7xDLipYR5-39OpajF5nTOM';

const options = {
  method: 'POST',
  headers: {
    'apikey': serviceKey,
    'Authorization': `Bearer ${serviceKey}`,
    'Content-Type': 'application/json'
  }
};

const req = https.request(url, options, (res) => {
  console.log(`✅ PostgREST schema cache reload: ${res.statusCode}`);
  res.on('data', (d) => {
    process.stdout.write(d);
  });
});

req.on('error', (e) => {
  console.error(`❌ Error: ${e.message}`);
});

req.end();

