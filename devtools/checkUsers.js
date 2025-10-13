/**
 * CHECK USERS
 * 
 * Find the actual user ID for the logged-in user
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://cxlqzejzraczumqmsrcx.supabase.co';
const SUPABASE_SERVICE_KEY = 'sb_secret_hPS1mDFURu9aQulTRNE7EQ_zczVFhxR';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function checkUsers() {
  console.log('\n🔍 CHECKING USERS');
  console.log('='.repeat(80));
  
  const companyId = 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e';
  const testEmail = 'jeraldjsmith@gmail.com';
  
  try {
    // Check users table
    console.log('\n📋 Checking users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .eq('company_id', companyId);
    
    if (usersError) {
      console.log(`   ❌ Error: ${usersError.message}`);
    } else {
      console.log(`   ✅ Found ${users.length} users in company`);
      users.forEach(u => {
        console.log(`      - ${u.email || u.name} (${u.id})`);
      });
    }
    
    // Check auth.users (via admin API)
    console.log('\n📋 Checking auth users...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log(`   ❌ Error: ${authError.message}`);
    } else {
      console.log(`   ✅ Found ${authUsers.users.length} auth users`);
      const testUser = authUsers.users.find(u => u.email === testEmail);
      if (testUser) {
        console.log(`\n   ✅ Found test user:`);
        console.log(`      Email: ${testUser.email}`);
        console.log(`      ID: ${testUser.id}`);
        console.log(`      Created: ${testUser.created_at}`);
      } else {
        console.log(`   ⚠️  Test user ${testEmail} not found in auth.users`);
      }
    }
    
    // Check profiles
    console.log('\n📋 Checking profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(10);
    
    if (profilesError) {
      console.log(`   ❌ Error: ${profilesError.message}`);
    } else {
      console.log(`   ✅ Found ${profiles.length} profiles`);
      profiles.forEach(p => {
        console.log(`      - User ID: ${p.user_id}`);
      });
    }
    
    console.log('\n' + '='.repeat(80));
    
  } catch (err) {
    console.error('\n❌ FATAL ERROR:', err);
  }
}

if (require.main === module) {
  checkUsers().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { checkUsers };

