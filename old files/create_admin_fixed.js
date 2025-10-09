#!/usr/bin/env node

/**
 * Fixed TradeMate Pro Admin User Creator
 * 
 * This script creates the first admin user using the correct table order:
 * 1. auth.users (via Supabase Auth API)
 * 2. users table (with auth_user_id reference)
 * 3. profiles table (with user_id reference to users table)
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://cxlqzejzraczumqmsrcx.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bHF6ZWp6cmFjenVtcW1zcmN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODk4NTQ0MywiZXhwIjoyMDc0NTYxNDQzfQ.lNQuV8WoSo7RiHeg2IKhY7xDLipYR5-39OpajF5nTOM';

// Create Supabase client with service key (admin privileges)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Test credentials - change these as needed
const TEST_EMAIL = 'admin@trademate.com';
const TEST_PASSWORD = 'admin123!';
const TEST_FIRST_NAME = 'Admin';
const TEST_LAST_NAME = 'User';

async function createAdminUserFixed() {
  console.log('\n🔧 TradeMate Pro Fixed Admin Creator');
  console.log('====================================\n');
  
  console.log(`📧 Email: ${TEST_EMAIL}`);
  console.log(`👤 Name: ${TEST_FIRST_NAME} ${TEST_LAST_NAME}`);
  console.log(`🔒 Password: ${TEST_PASSWORD}`);
  console.log('');
  
  try {
    console.log('⏳ Creating admin user with correct table order...\n');
    
    // Step 1: Create auth user with service key
    console.log('1️⃣ Creating authentication user...');
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        first_name: TEST_FIRST_NAME,
        last_name: TEST_LAST_NAME,
        role: 'APP_OWNER'
      }
    });
    
    if (authError) {
      console.error('❌ Failed to create auth user:', authError.message);
      return;
    }
    
    console.log('✅ Auth user created:', authUser.user.id);
    console.log('   Email confirmed:', authUser.user.email_confirmed_at ? 'Yes' : 'No');
    
    // Step 2: Create user record FIRST (this is what profiles references)
    console.log('2️⃣ Creating user record with APP_OWNER role...');
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .insert({
        id: authUser.user.id, // Use the auth user ID as the primary key
        auth_user_id: authUser.user.id, // Also store as reference
        role: 'APP_OWNER',
        company_id: null, // APP_OWNER doesn't belong to a specific company
        status: 'active'
      })
      .select()
      .single();
    
    if (userError) {
      console.error('❌ Failed to create user record:', userError.message);
      console.log('   Error details:', userError);
      console.log('🔄 Attempting to clean up auth user...');
      
      // Try to delete the auth user if user record creation failed
      await supabase.auth.admin.deleteUser(authUser.user.id);
      return;
    }
    
    console.log('✅ User record created:', userRecord.id);
    console.log('   Role:', userRecord.role);
    
    // Step 3: Create user profile (references users.id)
    console.log('3️⃣ Creating user profile...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: userRecord.id, // Reference the users table ID
        first_name: TEST_FIRST_NAME,
        last_name: TEST_LAST_NAME,
        status: 'active'
      })
      .select()
      .single();
    
    if (profileError) {
      console.error('❌ Failed to create user profile:', profileError.message);
      console.log('   Error details:', profileError);
      console.log('🔄 Attempting to clean up...');
      
      // Try to delete the auth user if profile creation failed
      await supabase.auth.admin.deleteUser(authUser.user.id);
      return;
    }
    
    console.log('✅ User profile created:', profile.id);
    
    // Step 4: Verify the complete setup
    console.log('4️⃣ Verifying complete admin setup...');
    const { data: verifyUser, error: verifyError } = await supabase
      .from('users')
      .select(`
        id,
        auth_user_id,
        role,
        company_id,
        status,
        profiles!profiles_user_id_fkey (
          id,
          first_name,
          last_name,
          status
        )
      `)
      .eq('auth_user_id', authUser.user.id)
      .single();
    
    if (verifyError || !verifyUser) {
      console.error('❌ Failed to verify user setup:', verifyError?.message);
      return;
    }
    
    console.log('✅ Complete admin setup verified!');
    console.log('   User record ID:', verifyUser.id);
    console.log('   Auth user ID:', verifyUser.auth_user_id);
    console.log('   Role:', verifyUser.role);
    console.log('   Status:', verifyUser.status);
    console.log('   Profile:', verifyUser.profiles);
    
    // Success summary
    console.log('\n🎉 SUCCESS! Admin user created successfully!');
    console.log('==============================================');
    console.log(`📧 Email: ${TEST_EMAIL}`);
    console.log(`🔒 Password: ${TEST_PASSWORD}`);
    console.log(`👤 Name: ${TEST_FIRST_NAME} ${TEST_LAST_NAME}`);
    console.log(`🔐 Role: APP_OWNER`);
    console.log(`🆔 Auth User ID: ${authUser.user.id}`);
    console.log(`🆔 User Record ID: ${userRecord.id}`);
    console.log(`🆔 Profile ID: ${profile.id}`);
    console.log('\n🚀 You can now use launch_onboarding.bat to access the admin dashboard!');
    console.log('🌐 Admin Dashboard URL: http://localhost:3003');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.error('   Full error:', error);
  }
}

// Run the script
console.log('🔧 Initializing TradeMate Pro Fixed Admin Creator...');
createAdminUserFixed().then(() => {
  console.log('\n✅ Script completed. Press any key to exit...');
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on('data', process.exit.bind(process, 0));
});
