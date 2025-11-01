const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRLS() {
  // Check RLS status and policies for companies table
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT 
        schemaname,
        tablename,
        rowsecurity as rls_enabled
      FROM pg_tables 
      WHERE schemaname = 'public' 
        AND tablename IN ('companies', 'settings');
    `
  });

  if (error) {
    console.log('⚠️ RPC not available, trying direct query...');
    
    // Try getting policies directly
    const { data: policies, error: polErr } = await supabase
      .from('pg_policies')
      .select('*')
      .in('tablename', ['companies', 'settings']);
    
    if (polErr) {
      console.error('❌ Cannot query policies:', polErr);
    } else {
      console.log('\n📋 RLS Policies:');
      console.log(JSON.stringify(policies, null, 2));
    }
  } else {
    console.log('\n📊 RLS Status:');
    console.log(JSON.stringify(data, null, 2));
  }

  // Check if user can actually update
  console.log('\n🧪 Testing authenticated user access...');
  
  // Get a real user session (you'll need to provide actual credentials)
  console.log('⚠️ To test authenticated access, we need a real user session.');
  console.log('Please check browser console for: window.__lastSupaFetchError');
}

checkRLS();

