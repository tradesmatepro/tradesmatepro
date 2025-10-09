const fetch = require('node-fetch');

// Supabase configuration
const SUPABASE_URL = "https://amgtktrwpdsigcomavlg.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64";

async function addColumnViaAPI() {
  console.log('🔧 Attempting to add preferred_time_option column via REST API...');
  
  try {
    // Try to execute SQL via the REST API
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
      body: JSON.stringify({
        sql: `
          ALTER TABLE public.marketplace_requests 
          ADD COLUMN IF NOT EXISTS preferred_time_option TEXT DEFAULT 'anytime' 
          CHECK (preferred_time_option IN ('anytime', 'soonest', 'this_week', 'weekend_only', 'specific'));
        `
      })
    });

    const result = await response.text();
    console.log('📡 API Response:', response.status, result);

    if (response.ok) {
      console.log('✅ Column added successfully via REST API');
      return true;
    } else {
      console.error('❌ REST API failed:', result);
      return false;
    }
  } catch (error) {
    console.error('❌ API error:', error);
    return false;
  }
}

// Run the API call
addColumnViaAPI()
  .then(success => {
    if (success) {
      console.log('🎉 Column addition completed!');
      process.exit(0);
    } else {
      console.log('💥 Column addition failed!');
      console.log('');
      console.log('🔧 Manual Steps Required:');
      console.log('1. Open Supabase Dashboard: https://supabase.com/dashboard/project/amgtktrwpdsigcomavlg');
      console.log('2. Go to SQL Editor');
      console.log('3. Run this SQL command:');
      console.log('');
      console.log('ALTER TABLE public.marketplace_requests');
      console.log("ADD COLUMN IF NOT EXISTS preferred_time_option TEXT DEFAULT 'anytime'");
      console.log("CHECK (preferred_time_option IN ('anytime', 'soonest', 'this_week', 'weekend_only', 'specific'));");
      console.log('');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });
