/**
 * Verify profiles RLS policies are working
 */

const sql = require('./sqlExecutor');

async function verifyProfilesRLS() {
  console.log('🔍 Verifying profiles RLS policies...\n');

  // Check all policies on profiles table
  const policies = await sql.executeSQL({
    sql: `
      SELECT 
        schemaname,
        tablename,
        policyname,
        permissive,
        roles,
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

  console.log('📋 Current RLS Policies on profiles table:');
  console.log(policies.result);
  console.log('');

  // Check if RLS is enabled
  const rlsStatus = await sql.executeSQL({
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

  console.log('🔒 RLS Status:');
  console.log(rlsStatus.result);
  console.log('');

  // Check profiles table structure
  const columns = await sql.executeSQL({
    sql: `
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'profiles'
      ORDER BY ordinal_position;
    `,
    approved: true,
    readOnly: true
  });

  console.log('📊 Profiles table structure:');
  console.log(columns.result);
  console.log('');

  console.log('✅ Verification complete!');
}

// Run it
verifyProfilesRLS().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});

