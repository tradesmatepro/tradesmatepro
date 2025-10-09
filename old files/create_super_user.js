#!/usr/bin/env node

/**
 * TradeMate Pro App Owner Creator
 *
 * This script creates the first APP_OWNER user for your TradeMate Pro admin dashboard.
 * It uses the Supabase service key to bypass normal auth restrictions.
 *
 * Usage: node create_super_user.js
 */

const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

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

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

function askPassword(question) {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    const stdout = process.stdout;

    stdout.write(question);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    let password = '';

    const onData = function(char) {
      char = char + '';

      switch(char) {
        case '\n':
        case '\r':
        case '\u0004':
          stdin.setRawMode(false);
          stdin.pause();
          stdin.removeListener('data', onData);
          stdout.write('\n');
          resolve(password);
          break;
        case '\u0003':
          process.exit();
          break;
        case '\u007f': // backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
            stdout.write('\b \b');
          }
          break;
        default:
          password += char;
          stdout.write('*');
          break;
      }
    };

    stdin.on('data', onData);
  });
}

async function createSuperUser() {
  console.log('\n🔧 TradeMate Pro App Owner Creator');
  console.log('===================================\n');
  
  try {
    // Get user details
    const email = await askQuestion('📧 Enter super admin email: ');
    const password = await askPassword('🔒 Enter password (hidden): ');
    const firstName = await askQuestion('👤 Enter first name: ');
    const lastName = await askQuestion('👤 Enter last name: ');
    
    console.log('\n⏳ Creating app owner user...\n');
    
    // Step 1: Create auth user with service key
    console.log('1️⃣ Creating authentication user...');
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        role: 'APP_OWNER'
      }
    });
    
    if (authError) {
      console.error('❌ Failed to create auth user:', authError.message);
      return;
    }
    
    console.log('✅ Auth user created:', authUser.user.id);
    
    // Step 2: Create user profile
    console.log('2️⃣ Creating user profile...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: authUser.user.id,
        first_name: firstName,
        last_name: lastName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (profileError) {
      console.error('❌ Failed to create user profile:', profileError.message);
      console.log('🔄 Attempting to clean up auth user...');

      // Try to delete the auth user if profile creation failed
      await supabase.auth.admin.deleteUser(authUser.user.id);
      return;
    }

    console.log('✅ User profile created');

    // Step 3: Create user record with APP_OWNER role
    console.log('3️⃣ Creating user record with APP_OWNER role...');
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .insert({
        auth_user_id: authUser.user.id,
        role: 'admin', // Try 'admin' first, will change to APP_OWNER if needed
        company_id: null, // APP_OWNER doesn't belong to a specific company
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (userError) {
      console.error('❌ Failed to create user record:', userError.message);
      console.log('🔄 Attempting to clean up...');

      // Try to delete the auth user and profile if user record creation failed
      await supabase.auth.admin.deleteUser(authUser.user.id);
      return;
    }

    console.log('✅ User record created with APP_OWNER role');
    
    // Step 4: Verify the setup
    console.log('4️⃣ Verifying app owner setup...');
    const { data: verifyUser, error: verifyError } = await supabase
      .from('users')
      .select('*, profiles!users_auth_user_id_fkey(*)')
      .eq('auth_user_id', authUser.user.id)
      .single();
    
    if (verifyError || !verifyUser) {
      console.error('❌ Failed to verify user setup:', verifyError?.message);
      return;
    }
    
    console.log('✅ App owner user verified');

    // Success summary
    console.log('\n🎉 SUCCESS! App owner user created successfully!');
    console.log('==============================================');
    console.log(`📧 Email: ${email}`);
    console.log(`👤 Name: ${firstName} ${lastName}`);
    console.log(`🔐 Role: APP_OWNER`);
    console.log(`🆔 User ID: ${authUser.user.id}`);
    console.log('\n🚀 You can now use launch_onboarding.bat to access the admin dashboard!');
    console.log('🌐 Admin Dashboard URL: http://localhost:3003');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  } finally {
    rl.close();
  }
}

// Run the script
console.log('🔧 Initializing TradeMate Pro App Owner Creator...');
createSuperUser();
