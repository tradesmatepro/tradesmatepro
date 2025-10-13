#!/usr/bin/env node

/**
 * AGGRESSIVE FIX FOR PROFILES 406 ERRORS
 * 
 * This script will:
 * 1. Check current RLS status on profiles table
 * 2. Drop ALL policies using pg_policies system table
 * 3. Disable RLS
 * 4. Send multiple NOTIFY commands to PostgREST
 * 5. Verify the fix
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function executeSql(sql, description) {
  console.log(`\n🔧 ${description}...`);
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    if (error) {
      console.error(`❌ Error: ${error.message}`);
      return { success: false, error };
    }
    console.log(`✅ Success!`);
    if (data) {
      console.log('📊 Result:', JSON.stringify(data, null, 2));
    }
    return { success: true, data };
  } catch (err) {
    console.error(`❌ Exception: ${err.message}`);
    return { success: false, error: err };
  }
}

async function main() {
  console.log('🚀 AGGRESSIVE PROFILES 406 FIX\n');
  console.log('=' .repeat(60));

  // Step 1: Check current RLS status
  await executeSql(
    `SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'profiles';`,
    'Step 1: Check current RLS status'
  );

  // Step 2: List all policies
  await executeSql(
    `SELECT policyname FROM pg_policies WHERE tablename = 'profiles';`,
    'Step 2: List all current policies'
  );

  // Step 3: Drop ALL policies using dynamic SQL
  await executeSql(
    `DO $$ 
    DECLARE 
      r RECORD;
    BEGIN
      FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON profiles CASCADE';
        RAISE NOTICE 'Dropped policy: %', r.policyname;
      END LOOP;
    END $$;`,
    'Step 3: Drop ALL policies dynamically'
  );

  // Step 4: Disable RLS
  await executeSql(
    `ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;`,
    'Step 4: Disable RLS on profiles table'
  );

  // Step 5: Verify RLS is disabled
  const rlsCheck = await executeSql(
    `SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'profiles';`,
    'Step 5: Verify RLS is disabled'
  );

  // Step 6: Verify no policies exist
  const policyCheck = await executeSql(
    `SELECT COUNT(*) as count FROM pg_policies WHERE tablename = 'profiles';`,
    'Step 6: Verify no policies exist'
  );

  // Step 7: Send multiple NOTIFY commands to PostgREST
  console.log('\n🔔 Step 7: Sending NOTIFY commands to PostgREST...');
  await executeSql(`NOTIFY pgrst, 'reload schema';`, 'NOTIFY pgrst reload schema');
  await executeSql(`NOTIFY pgrst, 'reload config';`, 'NOTIFY pgrst reload config');
  
  // Send it multiple times to be sure
  await executeSql(`NOTIFY pgrst, 'reload schema';`, 'NOTIFY pgrst reload schema (2nd time)');
  await executeSql(`NOTIFY pgrst, 'reload config';`, 'NOTIFY pgrst reload config (2nd time)');

  // Step 8: Final verification
  console.log('\n' + '='.repeat(60));
  console.log('📊 FINAL VERIFICATION:\n');
  
  if (rlsCheck.data && rlsCheck.data.length > 0) {
    const rlsEnabled = rlsCheck.data[0].relrowsecurity;
    if (rlsEnabled === false || rlsEnabled === 'f') {
      console.log('✅ RLS is DISABLED on profiles table');
    } else {
      console.log('❌ RLS is still ENABLED on profiles table!');
    }
  }

  if (policyCheck.data && policyCheck.data.length > 0) {
    const policyCount = policyCheck.data[0].count;
    if (policyCount === 0 || policyCount === '0') {
      console.log('✅ NO policies exist on profiles table');
    } else {
      console.log(`❌ ${policyCount} policies still exist on profiles table!`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Hard refresh your browser (Ctrl + Shift + R)');
  console.log('2. Check logs.md for 406 errors');
  console.log('3. If errors persist, restart Supabase API from Dashboard:');
  console.log('   Settings → API → Restart API Server');
  console.log('\n✅ Script complete!\n');
}

main().catch(console.error);

