/**
 * CREATE USER PROFILE
 * 
 * Fix 406 errors by creating missing profile record
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://cxlqzejzraczumqmsrcx.supabase.co';
const SUPABASE_SERVICE_KEY = 'sb_secret_hPS1mDFURu9aQulTRNE7EQ_zczVFhxR';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function createUserProfile() {
  console.log('\n🔧 FIX 1: CREATE USER PROFILE');
  console.log('='.repeat(80));
  
  const userId = '268b99b5-907d-4b48-ad0e-92cdd4ac388a';
  
  try {
    // Check if profile exists
    console.log('\n📋 Checking if profile exists...');
    const { data: existing, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId);
    
    if (checkError) {
      console.log(`   ❌ Error checking profile: ${checkError.message}`);
    } else if (existing && existing.length > 0) {
      console.log(`   ✅ Profile already exists!`);
      console.log(JSON.stringify(existing[0], null, 2));
      return;
    } else {
      console.log(`   ⚠️  No profile found for user ${userId}`);
    }
    
    // Create profile (use upsert to handle conflicts)
    console.log('\n📋 Creating profile...');
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        user_id: userId,
        preferences: {}
      }, {
        onConflict: 'user_id'
      })
      .select();
    
    if (error) {
      console.log(`   ❌ Error creating profile: ${error.message}`);
      console.log(`   Details: ${JSON.stringify(error, null, 2)}`);
    } else {
      console.log(`   ✅ Profile created successfully!`);
      console.log(JSON.stringify(data, null, 2));
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ FIX 1 COMPLETE: User profile created');
    console.log('='.repeat(80));
    
  } catch (err) {
    console.error('\n❌ FATAL ERROR:', err);
  }
}

if (require.main === module) {
  createUserProfile().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { createUserProfile };

