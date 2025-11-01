/**
 * Check User Role - Verify app_owner role exists in database
 * 
 * This script checks:
 * 1. What role values exist in user_role_enum
 * 2. What role your user account has
 * 3. If app_owner role is available
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase credentials
const SUPABASE_URL = 'https://cxlqzejzraczumqmsrcx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bHF6ZWp6cmFjenVtcW1zcmN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5ODU0NDMsImV4cCI6MjA3NDU2MTQ0M30.zoD59re6xxW9Z6HOexR0qwWwTBU29MvjwP_y8qwBkkg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkUserRoles() {
  console.log('\n🔍 CHECKING USER ROLES...\n');

  try {
    // 1. Check enum values
    console.log('📋 Step 1: Checking user_role_enum values...');
    const { data: enumData, error: enumError } = await supabase
      .rpc('get_enum_values', { enum_name: 'user_role_enum' })
      .single();

    if (enumError) {
      console.log('⚠️  Could not fetch enum values (RPC may not exist)');
      console.log('   Trying alternative method...\n');
    } else {
      console.log('✅ user_role_enum values:', enumData);
      console.log('');
    }

    // 2. Check all users and their roles
    console.log('📋 Step 2: Checking all users and their roles...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, role')
      .limit(10);

    if (usersError) {
      console.log('❌ Error fetching users:', usersError.message);
    } else {
      console.log(`✅ Found ${users.length} users:\n`);
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. Email: ${user.email || 'N/A'}`);
        console.log(`      Role: ${user.role}`);
        console.log(`      ID: ${user.id}`);
        console.log('');
      });
    }

    // 3. Check for APP_OWNER role specifically (uppercase in database)
    console.log('📋 Step 3: Checking for APP_OWNER role...');
    const { data: appOwners, error: appOwnersError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('role', 'APP_OWNER');

    if (appOwnersError) {
      console.log('❌ Error checking APP_OWNER:', appOwnersError.message);
    } else if (appOwners.length === 0) {
      console.log('⚠️  No users with APP_OWNER role found');
      console.log('   You may need to update your user role to APP_OWNER\n');
    } else {
      console.log(`✅ Found ${appOwners.length} APP_OWNER(s):\n`);
      appOwners.forEach((user, index) => {
        console.log(`   ${index + 1}. Email: ${user.email || 'N/A'}`);
        console.log(`      ID: ${user.id}`);
        console.log('');
      });
    }

    // 4. Check for owner role (fallback)
    console.log('📋 Step 4: Checking for owner role...');
    const { data: owners, error: ownersError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('role', 'owner');

    if (ownersError) {
      console.log('❌ Error checking owner:', ownersError.message);
    } else if (owners.length === 0) {
      console.log('⚠️  No users with owner role found\n');
    } else {
      console.log(`✅ Found ${owners.length} owner(s):\n`);
      owners.forEach((user, index) => {
        console.log(`   ${index + 1}. Email: ${user.email || 'N/A'}`);
        console.log(`      ID: ${user.id}`);
        console.log('');
      });
    }

    // 5. Recommendations
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 RECOMMENDATIONS:\n');

    if (appOwners && appOwners.length > 0) {
      console.log('✅ You have APP_OWNER role configured!');
      console.log('   Beta filter will work correctly.\n');
    } else if (owners && owners.length > 0) {
      console.log('⚠️  You have owner role but not APP_OWNER.');
      console.log('   Options:\n');
      console.log('   1. Update your role to APP_OWNER (uppercase):');
      console.log('      UPDATE users SET role = \'APP_OWNER\' WHERE email = \'your-email@example.com\';\n');
      console.log('   2. Or add your email to betaFilter.js as fallback:');
      console.log('      if (user.email === \'your-email@example.com\') return true;\n');
    } else {
      console.log('⚠️  No owner or APP_OWNER found.');
      console.log('   You may need to set your role in the database.\n');
      console.log('   SQL to set APP_OWNER role:');
      console.log('   UPDATE users SET role = \'APP_OWNER\' WHERE email = \'your-email@example.com\';\n');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the check
checkUserRoles();

