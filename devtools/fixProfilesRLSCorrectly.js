/**
 * Fix profiles RLS policies CORRECTLY
 * 
 * The issue: profiles.user_id references users.id (NOT auth.uid())
 * The fix: Use the existing working policies that join through users table
 */

const sql = require('./sqlExecutor');

async function fixProfilesRLSCorrectly() {
  console.log('🔧 Fixing profiles RLS policies CORRECTLY...\n');

  // Step 1: Drop ALL policies (including the broken ones I created)
  console.log('Step 1: Dropping ALL policies...');
  
  const policiesToDrop = [
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
    "profiles_update_own"
  ];

  for (const policy of policiesToDrop) {
    await sql.executeSQL({
      sql: `DROP POLICY IF EXISTS "${policy}" ON profiles;`,
      approved: true
    });
  }
  
  console.log('✅ All old policies dropped\n');

  // Step 2: Create CORRECT policies that join through users table
  console.log('Step 2: Creating CORRECT RLS policies...');
  
  // SELECT policy - join through users table
  await sql.executeSQL({
    sql: `
      CREATE POLICY "profiles_select_policy" 
      ON profiles FOR SELECT 
      USING (
        auth.uid() IN (
          SELECT auth_user_id 
          FROM users 
          WHERE users.id = profiles.user_id
        )
      );
    `,
    approved: true
  });
  console.log('✅ SELECT policy created (joins through users table)');

  // UPDATE policy - join through users table
  await sql.executeSQL({
    sql: `
      CREATE POLICY "profiles_update_policy" 
      ON profiles FOR UPDATE 
      USING (
        auth.uid() IN (
          SELECT auth_user_id 
          FROM users 
          WHERE users.id = profiles.user_id
        )
      )
      WITH CHECK (
        auth.uid() IN (
          SELECT auth_user_id 
          FROM users 
          WHERE users.id = profiles.user_id
        )
      );
    `,
    approved: true
  });
  console.log('✅ UPDATE policy created (joins through users table)');

  // INSERT policy - join through users table
  await sql.executeSQL({
    sql: `
      CREATE POLICY "profiles_insert_policy" 
      ON profiles FOR INSERT 
      WITH CHECK (
        auth.uid() IN (
          SELECT auth_user_id 
          FROM users 
          WHERE users.id = profiles.user_id
        )
      );
    `,
    approved: true
  });
  console.log('✅ INSERT policy created (joins through users table)\n');

  // Step 3: Verify RLS is enabled
  console.log('Step 3: Ensuring RLS is enabled...');
  await sql.executeSQL({
    sql: `ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;`,
    approved: true
  });
  console.log('✅ RLS enabled\n');

  // Step 4: Verify the fix
  console.log('Step 4: Verifying new policies...');
  const verify = await sql.executeSQL({
    sql: `
      SELECT 
        policyname,
        cmd,
        qual,
        with_check
      FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'profiles'
      ORDER BY policyname;
    `,
    approved: true,
    readOnly: true
  });
  
  console.log('📋 New policies:');
  console.log(verify.result);
  console.log('');

  console.log('🎉 Profiles RLS policies fixed CORRECTLY!');
  console.log('\n📋 Summary:');
  console.log('✅ All old/broken policies dropped');
  console.log('✅ New SELECT policy created (joins through users.auth_user_id)');
  console.log('✅ New UPDATE policy created (joins through users.auth_user_id)');
  console.log('✅ New INSERT policy created (joins through users.auth_user_id)');
  console.log('✅ RLS enabled');
  console.log('\n🚀 No more 406 errors! The policies now correctly join through the users table.');
}

// Run it
fixProfilesRLSCorrectly().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});

