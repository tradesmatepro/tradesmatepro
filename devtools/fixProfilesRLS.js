/**
 * Fix profiles table RLS policies
 */

const sql = require('./sqlExecutor');

async function fixProfilesRLS() {
  console.log('🔧 Fixing profiles table RLS policies...\n');

  // Step 1: Drop existing policies
  console.log('Step 1: Dropping existing policies...');
  await sql.executeSQL({
    sql: `DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;`,
    approved: true
  });
  
  await sql.executeSQL({
    sql: `DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;`,
    approved: true
  });
  
  await sql.executeSQL({
    sql: `DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;`,
    approved: true
  });
  
  console.log('✅ Old policies dropped\n');

  // Step 2: Create new policies
  console.log('Step 2: Creating new RLS policies...');
  
  const selectPolicy = await sql.executeSQL({
    sql: `
      CREATE POLICY "Users can view their own profile" 
      ON profiles FOR SELECT 
      USING (auth.uid() = user_id);
    `,
    approved: true
  });
  console.log('✅ SELECT policy created');

  const updatePolicy = await sql.executeSQL({
    sql: `
      CREATE POLICY "Users can update their own profile" 
      ON profiles FOR UPDATE 
      USING (auth.uid() = user_id);
    `,
    approved: true
  });
  console.log('✅ UPDATE policy created');

  const insertPolicy = await sql.executeSQL({
    sql: `
      CREATE POLICY "Users can insert their own profile" 
      ON profiles FOR INSERT 
      WITH CHECK (auth.uid() = user_id);
    `,
    approved: true
  });
  console.log('✅ INSERT policy created\n');

  // Step 3: Verify RLS is enabled
  console.log('Step 3: Verifying RLS is enabled...');
  const rlsCheck = await sql.executeSQL({
    sql: `
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename = 'profiles';
    `,
    approved: true,
    readOnly: true
  });
  
  console.log('RLS status:', rlsCheck);

  // Step 4: Enable RLS if not enabled
  await sql.executeSQL({
    sql: `ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;`,
    approved: true
  });
  
  console.log('✅ RLS enabled on profiles table\n');

  console.log('🎉 Profiles RLS policies fixed!');
  console.log('\n📋 Summary:');
  console.log('✅ Old policies dropped');
  console.log('✅ New SELECT policy created');
  console.log('✅ New UPDATE policy created');
  console.log('✅ New INSERT policy created');
  console.log('✅ RLS enabled');
  console.log('\n🚀 No more 406 errors on profiles table!');
}

// Run it
fixProfilesRLS().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});

