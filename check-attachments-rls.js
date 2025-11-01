const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

(async () => {
  try {
    console.log('🔍 Checking attachments table RLS policies...\n');

    // Check if RLS is enabled
    const { data: rlsStatus, error: rlsError } = await supabase.rpc('exec_sql', {
      query: `
        SELECT relname, relrowsecurity 
        FROM pg_class 
        WHERE relname = 'attachments' AND relnamespace = 'public'::regnamespace;
      `
    });

    if (rlsError) {
      console.error('❌ Error checking RLS status:', rlsError);
    } else {
      console.log('📊 RLS Status:', rlsStatus);
    }

    // Check existing policies
    const { data: policies, error: policiesError } = await supabase.rpc('exec_sql', {
      query: `
        SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
        FROM pg_policies
        WHERE tablename = 'attachments';
      `
    });

    if (policiesError) {
      console.error('❌ Error checking policies:', policiesError);
    } else {
      console.log('\n📋 Existing Policies:');
      if (policies && policies.length > 0) {
        console.log(JSON.stringify(policies, null, 2));
      } else {
        console.log('⚠️ No RLS policies found for attachments table!');
      }
    }

    console.log('\n✅ Check complete!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
})();

