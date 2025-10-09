require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function testThemeSave() {
  console.log('🧪 Testing theme save to database...\n');
  
  // Get a user to test with
  const { data: profiles, error: fetchError } = await supabase
    .from('profiles')
    .select('user_id, preferences')
    .limit(1);
  
  if (fetchError) {
    console.error('❌ Error fetching profile:', fetchError);
    return;
  }
  
  if (!profiles || profiles.length === 0) {
    console.error('❌ No profiles found');
    return;
  }
  
  const testProfile = profiles[0];
  console.log('📝 Test profile:', testProfile.user_id);
  console.log('📝 Current preferences:', JSON.stringify(testProfile.preferences, null, 2));
  
  // Try to update theme
  const newPrefs = { ...(testProfile.preferences || {}), theme: 'dark', test_timestamp: new Date().toISOString() };
  console.log('\n🔄 Attempting to update preferences to:', JSON.stringify(newPrefs, null, 2));
  
  const { data, error } = await supabase
    .from('profiles')
    .update({ 
      preferences: newPrefs,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', testProfile.user_id)
    .select();
  
  if (error) {
    console.error('\n❌ UPDATE FAILED:', error);
    console.error('   Code:', error.code);
    console.error('   Message:', error.message);
    console.error('   Details:', error.details);
    console.error('   Hint:', error.hint);
  } else {
    console.log('\n✅ UPDATE SUCCEEDED');
    console.log('   Updated data:', JSON.stringify(data, null, 2));
  }
  
  // Verify the update
  const { data: verifyData, error: verifyError } = await supabase
    .from('profiles')
    .select('preferences')
    .eq('user_id', testProfile.user_id)
    .single();
  
  if (verifyError) {
    console.error('\n❌ VERIFICATION FAILED:', verifyError);
  } else {
    console.log('\n🔍 VERIFICATION - Current preferences in DB:');
    console.log(JSON.stringify(verifyData.preferences, null, 2));
    
    if (verifyData.preferences?.theme === 'dark') {
      console.log('\n✅✅✅ THEME SAVE WORKS! ✅✅✅');
    } else {
      console.log('\n❌❌❌ THEME NOT SAVED! ❌❌❌');
    }
  }
}

testThemeSave();

