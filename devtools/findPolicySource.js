/**
 * Find what's creating the duplicate policies
 */

const sql = require('./sqlExecutor');

async function findPolicySource() {
  console.log('🔍 Searching for policy creation source...\n');

  // Check for triggers on profiles table
  const triggers = await sql.executeSQL({
    sql: `
      SELECT 
        trigger_name,
        event_manipulation,
        action_statement,
        action_timing
      FROM information_schema.triggers
      WHERE event_object_table = 'profiles'
      AND event_object_schema = 'public';
    `,
    approved: true,
    readOnly: true
  });

  console.log('🔧 Triggers on profiles table:');
  console.log(triggers.result);
  console.log('');

  // Check for functions that might create policies
  const functions = await sql.executeSQL({
    sql: `
      SELECT 
        routine_name,
        routine_definition
      FROM information_schema.routines
      WHERE routine_schema = 'public'
      AND routine_type = 'FUNCTION'
      AND (
        routine_definition LIKE '%CREATE POLICY%'
        OR routine_definition LIKE '%profiles%'
      )
      LIMIT 10;
    `,
    approved: true,
    readOnly: true
  });

  console.log('⚙️ Functions that might create policies:');
  console.log(functions.result);
  console.log('');

  // List all current policies with their definitions
  const allPolicies = await sql.executeSQL({
    sql: `
      SELECT 
        policyname,
        cmd,
        CASE 
          WHEN qual IS NOT NULL THEN pg_get_expr(qual, 'profiles'::regclass)
          ELSE 'N/A'
        END as using_clause,
        CASE 
          WHEN with_check IS NOT NULL THEN pg_get_expr(with_check, 'profiles'::regclass)
          ELSE 'N/A'
        END as with_check_clause
      FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'profiles'
      ORDER BY policyname;
    `,
    approved: true,
    readOnly: true
  });

  console.log('📋 All current policies with full definitions:');
  console.log(allPolicies.result);
  console.log('');

  console.log('✅ Investigation complete!');
}

// Run it
findPolicySource().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});

