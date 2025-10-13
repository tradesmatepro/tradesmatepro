/**
 * Diagnose the 406 (Not Acceptable) error
 * 
 * 406 errors typically mean:
 * 1. Missing Accept header
 * 2. Server can't produce content in requested format
 * 3. RLS blocking the request
 * 4. Schema mismatch
 */

const fetch = require('node-fetch');

async function diagnose406Error() {
  console.log('🔍 DIAGNOSING 406 ERROR');
  console.log('═══════════════════════════════════════════════════════\n');

  const SUPABASE_URL = 'https://cxlqzejzraczumqmsrcx.supabase.co';
  const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bHF6ZWp6cmFjenVtcW1zcmN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5MTU2NzcsImV4cCI6MjA1MDQ5MTY3N30.VYb7jxGdLqEqQxOqLqQxOqLqQxOqLqQxOqLqQxOqLqQ';
  const USER_ID = '268b99b5-907d-4b48-ad0e-92cdd4ac388a';

  console.log('Testing the exact request that\'s failing...\n');

  // Test 1: GET request (same as in logs)
  console.log('Test 1: GET /profiles with preferences');
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?select=preferences&user_id=eq.${USER_ID}`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`  Status: ${response.status} ${response.statusText}`);
    console.log(`  Headers:`, Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log(`  Body: ${text.substring(0, 200)}`);
    
    if (response.status === 406) {
      console.log('  ❌ 406 ERROR REPRODUCED!');
      console.log('  This means the server is rejecting the request format');
    } else if (response.status === 200) {
      console.log('  ✅ Request succeeded!');
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }

  console.log('\n');

  // Test 2: Check if table exists
  console.log('Test 2: Check if profiles table exists');
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?limit=1`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Accept': 'application/json'
        }
      }
    );

    console.log(`  Status: ${response.status} ${response.statusText}`);
    
    if (response.status === 200) {
      console.log('  ✅ Table exists and is accessible');
    } else if (response.status === 406) {
      console.log('  ❌ 406 error - likely RLS or schema issue');
    } else if (response.status === 404) {
      console.log('  ❌ Table does not exist!');
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }

  console.log('\n');

  // Test 3: Check RLS status via SQL
  console.log('Test 3: Checking RLS status via RPC');
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/exec_sql`,
      {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          query: "SELECT relrowsecurity FROM pg_class WHERE relname = 'profiles'"
        })
      }
    );

    console.log(`  Status: ${response.status} ${response.statusText}`);
    
    if (response.status === 200) {
      const data = await response.json();
      console.log(`  RLS Status:`, data);
    }
  } catch (error) {
    console.log(`  ⚠️ RPC not available: ${error.message}`);
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📊 DIAGNOSIS SUMMARY');
  console.log('═══════════════════════════════════════════════════════\n');
  
  console.log('Possible causes of 406 error:');
  console.log('1. RLS policies are blocking the request');
  console.log('2. Table schema doesn\'t match the query');
  console.log('3. PostgREST configuration issue');
  console.log('4. Missing or incorrect Accept header');
  console.log('\nRecommended fixes:');
  console.log('1. Disable RLS on profiles table in Supabase Dashboard');
  console.log('2. Verify table schema has user_id and preferences columns');
  console.log('3. Restart Supabase API server from Dashboard');
  console.log('\n═══════════════════════════════════════════════════════\n');
}

// Run it
diagnose406Error();

