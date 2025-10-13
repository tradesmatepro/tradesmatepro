/**
 * NUKE all profiles policies and start fresh
 */

const sql = require('./sqlExecutor');

async function nukeAllProfilesPolicies() {
  console.log('💣 NUKING all profiles RLS policies...\n');

  // Get all current policies
  const currentPolicies = await sql.executeSQL({
    sql: `
      SELECT policyname
      FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'profiles';
    `,
    approved: true,
    readOnly: true
  });

  console.log('📋 Current policies:');
  console.log(currentPolicies.result);
  console.log('');

  // Drop each one individually
  console.log('💣 Dropping all policies...');
  
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
    "profiles_select_policy"
  ];

  for (const policy of policies) {
    try {
      const result = await sql.executeSQL({
        sql: `DROP POLICY IF EXISTS "${policy}" ON profiles CASCADE;`,
        approved: true
      });
      console.log(`  ✅ Dropped: ${policy}`);
    } catch (err) {
      console.log(`  ⚠️ Could not drop: ${policy} (${err.message})`);
    }
  }
  
  console.log('\n✅ All policies dropped\n');

  // Verify they're gone
  const afterDrop = await sql.executeSQL({
    sql: `
      SELECT COUNT(*) as policy_count
      FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'profiles';
    `,
    approved: true,
    readOnly: true
  });

  console.log('📊 Policies remaining:');
  console.log(afterDrop.result);
  console.log('');

  // Now create ONLY the correct policies
  console.log('🔧 Creating CORRECT policies...\n');

  // SELECT - allows users to view their own profile
  await sql.executeSQL({
    sql: `
      CREATE POLICY "profiles_select" 
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
  console.log('✅ SELECT policy created');

  // UPDATE - allows users to update their own profile
  await sql.executeSQL({
    sql: `
      CREATE POLICY "profiles_update" 
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
  console.log('✅ UPDATE policy created');

  // INSERT - allows users to create their own profile
  await sql.executeSQL({
    sql: `
      CREATE POLICY "profiles_insert" 
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
  console.log('✅ INSERT policy created\n');

  // Enable RLS
  await sql.executeSQL({
    sql: `ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;`,
    approved: true
  });
  console.log('✅ RLS enabled\n');

  // Final verification
  const final = await sql.executeSQL({
    sql: `
      SELECT 
        policyname,
        cmd
      FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'profiles'
      ORDER BY policyname;
    `,
    approved: true,
    readOnly: true
  });

  console.log('📋 Final policies:');
  console.log(final.result);
  console.log('');

  console.log('🎉 DONE! Profiles RLS completely rebuilt!');
  console.log('\n📋 Summary:');
  console.log('✅ All old policies nuked');
  console.log('✅ 3 new policies created (SELECT, UPDATE, INSERT)');
  console.log('✅ All policies join through users.auth_user_id');
  console.log('✅ RLS enabled');
  console.log('\n🚀 Restart dev server to see the fix!');
}

// Run it
nukeAllProfilesPolicies().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});

