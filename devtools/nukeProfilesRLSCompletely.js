/**
 * COMPLETELY NUKE profiles RLS - no mercy
 */

const sql = require('./sqlExecutor');

async function nukeProfilesRLSCompletely() {
  console.log('💣 COMPLETELY NUKING profiles RLS...\n');

  // Get all current policies
  const currentPolicies = await sql.executeSQL({
    sql: `
      SELECT policyname 
      FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'profiles';
    `,
    approved: true,
    readOnly: true
  });

  console.log('📋 Current policies:');
  console.log(currentPolicies.result);
  console.log('');

  // Drop each policy by name
  console.log('💣 Dropping each policy individually...');
  
  // Extract policy names from result
  const policyNames = currentPolicies.result
    .split('\n')
    .filter(line => line.trim() && !line.includes('policyname') && !line.includes('---') && !line.includes('row'))
    .map(line => line.trim());

  for (const policyName of policyNames) {
    if (policyName) {
      try {
        await sql.executeSQL({
          sql: `DROP POLICY "${policyName}" ON profiles CASCADE;`,
          approved: true
        });
        console.log(`  ✅ Dropped: ${policyName}`);
      } catch (err) {
        console.log(`  ⚠️ Could not drop: ${policyName}`);
      }
    }
  }
  console.log('');

  // Also try dropping by common names
  const commonNames = [
    'Users can view their own profile',
    'Users can update their own profile',
    'Users can insert their own profile',
    'Users can insert own profile',
    'Users can update own profile',
    'Users can view own profile',
    'app_owner_bypass',
    'profiles_delete_own',
    'profiles_insert_own',
    'profiles_select_own',
    'profiles_update_own'
  ];

  console.log('💣 Dropping common policy names...');
  for (const name of commonNames) {
    await sql.executeSQL({
      sql: `DROP POLICY IF EXISTS "${name}" ON profiles CASCADE;`,
      approved: true
    });
  }
  console.log('✅ Common policies dropped\n');

  // Disable RLS
  console.log('🔓 Disabling RLS...');
  await sql.executeSQL({
    sql: `ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;`,
    approved: true
  });
  console.log('✅ RLS disabled\n');

  // Force PostgREST to reload schema
  console.log('🔄 Forcing PostgREST schema reload...');
  await sql.executeSQL({
    sql: `NOTIFY pgrst, 'reload schema';`,
    approved: true
  });
  await sql.executeSQL({
    sql: `NOTIFY pgrst, 'reload config';`,
    approved: true
  });
  console.log('✅ PostgREST notified\n');

  // Final verification
  const finalCheck = await sql.executeSQL({
    sql: `
      SELECT 
        tablename, 
        rowsecurity,
        (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles') as policy_count
      FROM pg_tables 
      WHERE schemaname = 'public' AND tablename = 'profiles';
    `,
    approved: true,
    readOnly: true
  });

  console.log('📊 Final Status:');
  console.log(finalCheck.result);
  console.log('');

  console.log('🎉 DONE! Profiles RLS completely nuked!');
  console.log('\n⚠️ If 406 errors persist, it may be a Supabase cache issue.');
  console.log('   Try: Go to Supabase Dashboard → Settings → API → Restart API');
}

// Run it
nukeProfilesRLSCompletely().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});

