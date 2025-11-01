const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cxlqzejzraczumqmsrcx.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bHF6ZWp6cmFjenVtcW1zcmN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODk4NTQ0MywiZXhwIjoyMDc0NTYxNDQzfQ.lNQuV8WoSo7RiHeg2IKhY7xDLipYR5-39OpajF5nTOM';

const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function cleanupOrphanedAuthUser() {
  console.log('🔍 Checking for orphaned auth user: arlie@tradesmatepro.com');
  
  // Check if public.users record exists
  const { data: publicUser, error: publicError } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', 'arlie@tradesmatepro.com')
    .maybeSingle();
  
  if (publicError) {
    console.error('❌ Error checking public.users:', publicError.message);
    return;
  }
  
  if (publicUser) {
    console.log('✅ public.users record exists, skipping cleanup');
    return;
  }
  
  // No public.users record, find and delete auth user
  const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  
  if (listError) {
    console.error('❌ Error listing auth users:', listError.message);
    return;
  }
  
  const orphanedUser = authUsers.users.find(u => u.email === 'arlie@tradesmatepro.com');
  
  if (!orphanedUser) {
    console.log('✅ No orphaned auth user found');
    return;
  }
  
  console.log('🗑️  Deleting orphaned auth user:', orphanedUser.id);
  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(orphanedUser.id);
  
  if (deleteError) {
    console.error('❌ Error deleting auth user:', deleteError.message);
    return;
  }
  
  console.log('✅ Orphaned auth user deleted successfully');
}

cleanupOrphanedAuthUser().then(() => process.exit(0)).catch(err => {
  console.error('❌ Cleanup failed:', err);
  process.exit(1);
});

