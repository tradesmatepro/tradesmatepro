const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  'https://cxlqzejzraczumqmsrcx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bHF6ZWp6cmFjenVtcW1zcmN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTU0MzI2NCwiZXhwIjoyMDQ1MTE5MjY0fQ.sb_secret_hPS1mDFURu9aQulTRNE7EQ_zczVFhxR'
);

async function deploy() {
  console.log('\n🚀 Deploying notification trigger fix...\n');
  
  const sql = fs.readFileSync('migrations/2025-10-23_add_quote_approval_notifications.sql', 'utf8');
  
  const { data, error } = await supabase.rpc('exec_sql', { sql });
  
  if (error) {
    console.error('❌ Error:', error.message);
    console.log('\n📝 Please deploy manually via Supabase SQL Editor');
    console.log('   File: migrations/2025-10-23_add_quote_approval_notifications.sql');
  } else {
    console.log('✅ Notification trigger deployed successfully!');
  }
}

deploy();

