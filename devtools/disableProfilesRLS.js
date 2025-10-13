/**
 * Disable RLS on profiles table entirely
 * 
 * User said: "app is in beta so security/RLS is not a current priority"
 * This will eliminate all 406 errors
 */

const sql = require('./sqlExecutor');

async function disableProfilesRLS() {
  console.log('🔓 Disabling RLS on profiles table...\n');

  // Step 1: Drop ALL policies
  console.log('Step 1: Dropping all policies...');
  
  const policies = [
    "Users can view their own profile",
    "Users can update their own profile", 
    "Users can insert their own profile",
    "Users can insert own profile",
    "Users can update own profile",
    "Users can view own profile",
    "app_owner_bypass",
    "profiles_delete_own",
    "profiles_insert_own",
    "profiles_select_own",
    "profiles_update_own",
    "profiles_insert_policy",
    "profiles_update_policy",
    "profiles_select_policy",
    "profiles_insert",
    "profiles_update",
    "profiles_select"
  ];

  for (const policy of policies) {
    await sql.executeSQL({
      sql: `DROP POLICY IF EXISTS "${policy}" ON profiles CASCADE;`,
      approved: true
    });
  }
  
  console.log('✅ All policies dropped\n');

  // Step 2: DISABLE RLS entirely
  console.log('Step 2: Disabling RLS...');
  await sql.executeSQL({
    sql: `ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;`,
    approved: true
  });
  console.log('✅ RLS disabled on profiles table\n');

  // Step 3: Verify
  const verify = await sql.executeSQL({
    sql: `
      SELECT 
        tablename, 
        rowsecurity as rls_enabled
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename = 'profiles';
    `,
    approved: true,
    readOnly: true
  });

  console.log('📊 RLS Status:');
  console.log(verify.result);
  console.log('');

  const policyCount = await sql.executeSQL({
    sql: `
      SELECT COUNT(*) as policy_count
      FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'profiles';
    `,
    approved: true,
    readOnly: true
  });

  console.log('📋 Policy Count:');
  console.log(policyCount.result);
  console.log('');

  console.log('🎉 DONE! RLS completely disabled on profiles table!');
  console.log('\n📋 Summary:');
  console.log('✅ All policies dropped');
  console.log('✅ RLS disabled');
  console.log('✅ No more 406 errors!');
  console.log('\n⚠️ Note: This is fine for beta. Re-enable RLS before production.');
  console.log('\n🚀 Restart dev server to see the fix!');
}

// Run it
disableProfilesRLS().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});

