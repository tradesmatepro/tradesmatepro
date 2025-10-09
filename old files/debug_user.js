#!/usr/bin/env node

/**
 * TradeMate Pro User Debug Script
 * 
 * This script checks what users exist and helps debug login issues.
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

async function debugUsers() {
  console.log('\n🔍 TradeMate Pro User Debug');
  console.log('============================\n');
  
  try {
    // Check auth users
    console.log('1️⃣ Checking auth users...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Failed to list auth users:', authError.message);
      return;
    }
    
    console.log(`✅ Found ${authUsers.users.length} auth users:`);
    authUsers.users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (ID: ${user.id})`);
      console.log(`      Created: ${user.created_at}`);
      console.log(`      Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
      console.log(`      Metadata:`, user.user_metadata);
      console.log('');
    });
    
    // Check profiles table
    console.log('2️⃣ Checking profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
    
    if (profilesError) {
      console.error('❌ Failed to query profiles:', profilesError.message);
      console.log('   This might mean the profiles table doesn\'t exist');
    } else {
      console.log(`✅ Found ${profiles.length} profiles:`);
      profiles.forEach((profile, index) => {
        console.log(`   ${index + 1}. ${profile.first_name} ${profile.last_name}`);
        console.log(`      ID: ${profile.id}`);
        console.log(`      Role: ${profile.role}`);
        console.log(`      Company ID: ${profile.company_id}`);
        console.log('');
      });
    }
    
    // Check users table (in case it exists)
    console.log('3️⃣ Checking users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');
    
    if (usersError) {
      console.error('❌ Failed to query users table:', usersError.message);
      console.log('   This might mean the users table doesn\'t exist or has different structure');
    } else {
      console.log(`✅ Found ${users.length} users in users table:`);
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email || 'No email'}`);
        console.log(`      ID: ${user.id}`);
        console.log(`      Role: ${user.role}`);
        console.log('');
      });
    }
    
    // Test login with the email you tried
    console.log('4️⃣ Testing login with info@cgre-llc.com...');
    const { data: loginTest, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'info@cgre-llc.com',
      password: 'test123' // You'll need to replace this with the actual password you used
    });
    
    if (loginError) {
      console.error('❌ Login test failed:', loginError.message);
    } else {
      console.log('✅ Login test successful!');
      console.log('   User:', loginTest.user.email);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the debug
console.log('🔍 Starting user debug...');
debugUsers();
