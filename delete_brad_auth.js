// Manual script to delete Brad's auth user
// Run with: node delete_brad_auth.js

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://cxlqzejzraczumqmsrcx.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bHF6ZWp6cmFjenVtcW1zcmN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODk4NTQ0MywiZXhwIjoyMDc0NTYxNDQzfQ.lNQuV8WoSo7RiHeg2IKhY7xDLipYR5-39OpajF5nTOM';

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function deleteBradAuth() {
  try {
    console.log('🔍 Finding Brad\'s auth user by email...');
    
    // Get Brad's auth user by email
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listing users:', listError);
      return;
    }
    
    console.log(`📋 Found ${users.users.length} total auth users`);
    
    const bradUser = users.users.find(u => u.email === 'brad@cgrenewables.com');
    
    if (!bradUser) {
      console.log('✅ Brad\'s auth user not found - already deleted or never existed');
      return;
    }
    
    console.log('🔍 Found Brad\'s auth user:');
    console.log('   ID:', bradUser.id);
    console.log('   Email:', bradUser.email);
    console.log('   Created:', bradUser.created_at);
    
    console.log('\n🗑️ Deleting Brad\'s auth user...');
    
    const { data: deleteData, error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(bradUser.id);
    
    if (deleteError) {
      console.error('❌ Error deleting auth user:', deleteError);
      return;
    }
    
    console.log('✅ Brad\'s auth user deleted successfully!');
    console.log('✅ Delete result:', deleteData);
    console.log('\n🎉 You can now recreate Brad in the app!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

deleteBradAuth();

