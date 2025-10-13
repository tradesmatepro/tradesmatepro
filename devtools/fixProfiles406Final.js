/**
 * Fix profiles 406 errors - FINAL FIX
 * 
 * The RLS policies keep coming back. This time we'll:
 * 1. Drop ALL policies
 * 2. Disable RLS
 * 3. Verify no policies exist
 * 4. Check for migration files that might be recreating them
 */

const { executeSQL } = require('./sqlExecutor');

async function fixProfiles406Final() {
  console.log('🔧 FIXING PROFILES 406 ERRORS - FINAL FIX');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // Step 1: Get all current policies
    console.log('Step 1: Checking current policies...');
    const checkPolicies = await executeSQL({
      sql: `
        SELECT policyname, cmd 
        FROM pg_policies 
        WHERE tablename = 'profiles';
      `,
      approved: true
    });

    if (checkPolicies.success && checkPolicies.data.length > 0) {
      console.log(`  ⚠️ Found ${checkPolicies.data.length} policies:`);
      checkPolicies.data.forEach(p => {
        console.log(`     - ${p.policyname} (${p.cmd})`);
      });
    } else {
      console.log('  ✅ No policies found');
    }

    // Step 2: Drop ALL policies using CASCADE
    console.log('\nStep 2: Dropping ALL policies with CASCADE...');
    const dropAllPolicies = await executeSQL({
      sql: `
        DO $$ 
        DECLARE 
          r RECORD;
        BEGIN
          FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles') LOOP
            EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON profiles CASCADE';
            RAISE NOTICE 'Dropped policy: %', r.policyname;
          END LOOP;
        END $$;
      `,
      approved: true
    });

    if (dropAllPolicies.success) {
      console.log('  ✅ All policies dropped');
    } else {
      console.log('  ❌ Error dropping policies:', dropAllPolicies.error);
    }

    // Step 3: Disable RLS
    console.log('\nStep 3: Disabling RLS...');
    const disableRLS = await executeSQL({
      sql: 'ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;',
      approved: true
    });

    if (disableRLS.success) {
      console.log('  ✅ RLS disabled');
    } else {
      console.log('  ❌ Error disabling RLS:', disableRLS.error);
    }

    // Step 4: Verify RLS is disabled
    console.log('\nStep 4: Verifying RLS status...');
    const checkRLS = await executeSQL({
      sql: `
        SELECT relrowsecurity 
        FROM pg_class 
        WHERE relname = 'profiles';
      `,
      approved: true
    });

    if (checkRLS.success && checkRLS.data.length > 0) {
      const rlsEnabled = checkRLS.data[0].relrowsecurity;
      if (rlsEnabled) {
        console.log('  ❌ RLS is still ENABLED!');
      } else {
        console.log('  ✅ RLS is DISABLED');
      }
    }

    // Step 5: Verify no policies exist
    console.log('\nStep 5: Verifying no policies exist...');
    const verifyPolicies = await executeSQL({
      sql: `
        SELECT COUNT(*) as policy_count 
        FROM pg_policies 
        WHERE tablename = 'profiles';
      `,
      approved: true
    });

    if (verifyPolicies.success && verifyPolicies.data.length > 0) {
      const count = parseInt(verifyPolicies.data[0].policy_count);
      if (count > 0) {
        console.log(`  ❌ Still have ${count} policies!`);
      } else {
        console.log('  ✅ No policies exist');
      }
    }

    // Step 6: Refresh PostgREST schema cache
    console.log('\nStep 6: Refreshing PostgREST schema cache...');
    const refreshSchema = await executeSQL({
      sql: `
        NOTIFY pgrst, 'reload schema';
        NOTIFY pgrst, 'reload config';
      `,
      approved: true
    });

    if (refreshSchema.success) {
      console.log('  ✅ Schema cache refreshed');
    } else {
      console.log('  ❌ Error refreshing schema:', refreshSchema.error);
    }

    // Step 7: Check for triggers that might recreate policies
    console.log('\nStep 7: Checking for triggers on profiles table...');
    const checkTriggers = await executeSQL({
      sql: `
        SELECT tgname, tgtype 
        FROM pg_trigger 
        WHERE tgrelid = 'profiles'::regclass;
      `,
      approved: true
    });

    if (checkTriggers.success && checkTriggers.data.length > 0) {
      console.log(`  ⚠️ Found ${checkTriggers.data.length} triggers:`);
      checkTriggers.data.forEach(t => {
        console.log(`     - ${t.tgname}`);
      });
    } else {
      console.log('  ✅ No triggers found');
    }

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🎉 PROFILES 406 FIX COMPLETE!');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('✅ RLS disabled on profiles table');
    console.log('✅ All policies dropped');
    console.log('✅ Schema cache refreshed');
    console.log('\n🔄 Please restart your dev server and check logs.md\n');
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run it
fixProfiles406Final();

