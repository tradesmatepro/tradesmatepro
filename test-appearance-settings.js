const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://cxlqzejzraczumqmsrcx.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bHF6ZWp6cmFjenVtcW1zcmN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODk4NTQ0MywiZXhwIjoyMDc0NTYxNDQzfQ.lNQuV8WoSo7RiHeg2IKhY7xDLipYR5-39OpajF5nTOM';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function testAppearanceSettings() {
  console.log('🔍 TESTING APPEARANCE SETTINGS PERSISTENCE\n');
  console.log('=' .repeat(80));
  
  // 1. Check profiles table schema
  console.log('\n📋 STEP 1: Check profiles table schema');
  console.log('-'.repeat(80));
  
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .limit(5);
  
  if (profilesError) {
    console.error('❌ Error querying profiles:', profilesError);
    return;
  }
  
  console.log(`Total profiles: ${profiles.length}`);
  if (profiles.length > 0) {
    console.log('\n📊 First profile structure:');
    console.log('Columns:', Object.keys(profiles[0]));
    console.log('\nSample profile:');
    console.log(JSON.stringify(profiles[0], null, 2));
  }
  
  // 2. Check if preferences column exists and has theme data
  console.log('\n\n📋 STEP 2: Check theme preferences in profiles');
  console.log('-'.repeat(80));
  
  profiles.forEach((profile, idx) => {
    console.log(`\n${idx + 1}. User ID: ${profile.user_id}`);
    console.log(`   Preferences: ${JSON.stringify(profile.preferences)}`);
    console.log(`   Has theme? ${profile.preferences?.theme ? `YES (${profile.preferences.theme})` : 'NO'}`);
  });
  
  // 3. Test saving theme preference
  console.log('\n\n📋 STEP 3: Test saving theme preference');
  console.log('-'.repeat(80));
  
  if (profiles.length > 0) {
    const testProfile = profiles[0];
    console.log(`\nTesting with user_id: ${testProfile.user_id}`);
    
    // Try to save dark theme
    const newPrefs = { 
      ...(testProfile.preferences || {}), 
      theme: 'dark',
      test_timestamp: new Date().toISOString()
    };
    
    console.log('Attempting to save:', JSON.stringify(newPrefs, null, 2));
    
    const { data: updateData, error: updateError } = await supabase
      .from('profiles')
      .update({ preferences: newPrefs })
      .eq('user_id', testProfile.user_id)
      .select();
    
    if (updateError) {
      console.error('❌ Error updating:', updateError);
    } else {
      console.log('✅ Update successful!');
      console.log('Updated data:', JSON.stringify(updateData, null, 2));
    }
    
    // Verify the save
    console.log('\n🔍 Verifying save...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('profiles')
      .select('preferences')
      .eq('user_id', testProfile.user_id)
      .single();
    
    if (verifyError) {
      console.error('❌ Error verifying:', verifyError);
    } else {
      console.log('✅ Verified preferences:', JSON.stringify(verifyData.preferences, null, 2));
      console.log(`Theme is: ${verifyData.preferences?.theme || 'NOT SET'}`);
    }
  }
  
  // 4. Check ThemeContext code
  console.log('\n\n📋 STEP 4: Analysis');
  console.log('-'.repeat(80));
  
  console.log('\n🔍 ThemeContext.js behavior:');
  console.log('  1. Initializes from localStorage');
  console.log('  2. Saves to localStorage on change');
  console.log('  3. Saves to database (profiles.preferences.theme)');
  console.log('  4. Loads from database on mount');
  
  console.log('\n⚠️  POTENTIAL ISSUES:');
  console.log('  1. If profiles.preferences column is NULL, update might fail');
  console.log('  2. If user_id doesn\'t match auth user, query will return nothing');
  console.log('  3. If localStorage and DB are out of sync, which wins?');
  
  console.log('\n✅ EXPECTED BEHAVIOR:');
  console.log('  1. User changes theme in Appearance settings');
  console.log('  2. AppearanceSettingsTab calls setThemeMode()');
  console.log('  3. ThemeContext saves to localStorage AND database');
  console.log('  4. On next login, loads from database');
  console.log('  5. Database value overrides localStorage if different');
  
  // 5. Check for common issues
  console.log('\n\n📋 STEP 5: Common Issues Check');
  console.log('-'.repeat(80));
  
  // Check if any profiles have NULL preferences
  const nullPrefs = profiles.filter(p => p.preferences === null);
  console.log(`\n⚠️  Profiles with NULL preferences: ${nullPrefs.length}`);
  if (nullPrefs.length > 0) {
    console.log('   This could cause theme save to fail!');
    console.log('   Solution: Initialize preferences to {} before saving theme');
  }
  
  // Check if preferences is a valid JSON object
  const invalidPrefs = profiles.filter(p => p.preferences && typeof p.preferences !== 'object');
  console.log(`\n⚠️  Profiles with invalid preferences type: ${invalidPrefs.length}`);
  if (invalidPrefs.length > 0) {
    console.log('   Preferences should be a JSON object, not a string!');
  }
  
  console.log('\n\n✅ TEST COMPLETE');
  console.log('='.repeat(80));
}

testAppearanceSettings().then(() => process.exit(0)).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

