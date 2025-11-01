/**
 * Debug RLS issue - simulate what the frontend does
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

async function debugRLS() {
  console.log('\n🔍 DEBUGGING RLS ISSUE\n');
  console.log('='.repeat(60));

  // 1. Use service key to get user info
  const supabaseService = createClient(supabaseUrl, supabaseServiceKey);
  
  const { data: testUser, error: userError } = await supabaseService
    .from('users')
    .select('id, auth_user_id, company_id, email, role')
    .eq('email', 'brad@cgrenewables.com')
    .single();

  if (userError || !testUser) {
    console.error('❌ No test user found:', userError);
    return;
  }

  console.log('\n📋 Test User:');
  console.log(`   Email: ${testUser.email}`);
  console.log(`   Role: ${testUser.role}`);
  console.log(`   User ID: ${testUser.id}`);
  console.log(`   Auth User ID: ${testUser.auth_user_id}`);
  console.log(`   Company ID: ${testUser.company_id}`);

  // 2. Get the auth user
  const { data: authData, error: authError } = await supabaseService.auth.admin.getUserById(testUser.auth_user_id);
  
  if (authError || !authData) {
    console.error('❌ Could not get auth user:', authError);
    return;
  }

  console.log(`   Auth Email: ${authData.user.email}`);

  // 3. Try to update with service key (should work)
  console.log('\n📋 Test 1: UPDATE with service key (should work)...\n');

  const { data: serviceUpdate, error: serviceError } = await supabaseService
    .from('companies')
    .update({ name: 'Smith Plumbing' })
    .eq('id', testUser.company_id)
    .select();

  if (serviceError) {
    console.error('❌ Service key UPDATE FAILED:', serviceError.message);
    console.error('   Details:', serviceError.details);
    console.error('   Hint:', serviceError.hint);
    console.error('   Code:', serviceError.code);
  } else {
    console.log('✅ Service key UPDATE SUCCESSFUL');
  }

  // 4. Create authenticated client (simulate frontend)
  console.log('\n📋 Test 2: Sign in as user and try UPDATE...\n');
  
  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  
  // Sign in (you need to know the password)
  console.log('   ⚠️  Attempting to sign in...');
  console.log('   ⚠️  This requires knowing the password');
  console.log('   ⚠️  Skipping actual sign-in for now');
  
  // 5. Check RLS policies
  console.log('\n📋 Test 3: Checking RLS policies...\n');

  const rlsCheck = await supabaseService.rpc('exec_sql', {
    sql: `
      SELECT 
        policyname,
        cmd,
        qual as using_clause,
        with_check
      FROM pg_policies
      WHERE schemaname = 'public'
      AND tablename = 'companies'
      ORDER BY policyname;
    `
  }).catch(err => {
    // RPC might not exist, use direct query
    return supabaseService
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'companies');
  });

  console.log('   RLS Policies:', rlsCheck);

  // 6. Test the actual query that's failing
  console.log('\n📋 Test 4: Simulating frontend PATCH request...\n');
  console.log(`   URL: companies?id=eq.${testUser.company_id}`);
  console.log('   Method: PATCH');
  console.log('   Body: { name: "Smith Plumbing" }');

  // Try with service key first
  const response = await fetch(
    `${supabaseUrl}/rest/v1/companies?id=eq.${testUser.company_id}`,
    {
      method: 'PATCH',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ name: 'Smith Plumbing' })
    }
  );

  console.log(`   Response Status: ${response.status} ${response.statusText}`);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('   ❌ Error:', errorText);
  } else {
    console.log('   ✅ Service key PATCH successful');
  }

  // 7. Check what auth.uid() returns
  console.log('\n📋 Test 5: Checking auth.uid() function...\n');

  const authUidTest = await supabaseService.rpc('exec_sql', {
    sql: `SELECT auth.uid() as current_user_id;`
  }).catch(err => {
    console.log('   ⚠️  Cannot test auth.uid() without RPC function');
    return null;
  });

  if (authUidTest) {
    console.log('   auth.uid():', authUidTest);
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n💡 DIAGNOSIS:\n');
  console.log('The 400 error is likely caused by one of these:');
  console.log('1. RLS policy blocking the update (auth.uid() not matching)');
  console.log('2. Missing columns in the PATCH body');
  console.log('3. Invalid data types in the PATCH body');
  console.log('4. Constraint violations (check constraints, foreign keys)');
  console.log('\n' + '='.repeat(60) + '\n');
}

debugRLS()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('\n❌ Debug failed:', error);
    process.exit(1);
  });

