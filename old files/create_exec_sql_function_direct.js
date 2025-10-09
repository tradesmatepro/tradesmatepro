// Create exec_sql RPC function directly via Supabase REST API
const fetch = require('node-fetch');
const fs = require('fs');

// Get Supabase credentials
function getSupabaseCredentials() {
  try {
    if (fs.existsSync('supabasecreds.txt')) {
      const creds = fs.readFileSync('supabasecreds.txt', 'utf8');
      const lines = creds.split('\n');
      
      const urlLine = lines.find(line => line.includes('supabase.co'));
      const url = urlLine ? urlLine.replace('project url ', '').trim() : null;
      
      const serviceLine = lines.find(line => line.startsWith('service '));
      const key = serviceLine ? serviceLine.replace('service ', '').trim() : null;
      
      if (url && key) {
        return { url, key };
      }
    }
  } catch (error) {
    console.log('⚠️ Could not read supabasecreds.txt:', error.message);
  }
  
  return null;
}

async function createExecSqlFunction() {
  console.log('🔧 CREATING EXEC_SQL RPC FUNCTION DIRECTLY');
  console.log('='.repeat(60));

  const creds = getSupabaseCredentials();
  
  if (!creds) {
    console.log('❌ Cannot create function: No Supabase credentials');
    return;
  }

  console.log(`✅ Using Supabase: ${creds.url}`);

  // The SQL to create the exec_sql function
  const createFunctionSQL = `
    CREATE OR REPLACE FUNCTION public.exec_sql(query text)
    RETURNS json AS $$
    DECLARE
      result json;
      rec record;
      query_type text;
      row_count integer := 0;
      result_array json[] := '{}';
    BEGIN
      query_type := upper(trim(split_part(query, ' ', 1)));
      
      IF query_type IN ('SELECT', 'WITH') THEN
        FOR rec IN EXECUTE query LOOP
          result_array := result_array || to_json(rec);
          row_count := row_count + 1;
        END LOOP;
        result := json_build_object('type', 'SELECT', 'data', result_array, 'row_count', row_count, 'success', true);
      ELSIF query_type IN ('INSERT', 'UPDATE', 'DELETE') THEN
        EXECUTE query;
        GET DIAGNOSTICS row_count = ROW_COUNT;
        result := json_build_object('type', query_type, 'rows_affected', row_count, 'success', true);
      ELSE
        EXECUTE query;
        result := json_build_object('type', query_type, 'success', true, 'message', 'Query executed successfully');
      END IF;
      
      RETURN result;
    EXCEPTION
      WHEN OTHERS THEN
        result := json_build_object('success', false, 'error', SQLERRM, 'error_code', SQLSTATE);
        RETURN result;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO authenticated;
    GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO service_role;
  `;

  try {
    console.log('\n🔧 Creating exec_sql RPC function...');
    
    // Use Supabase REST API to execute the SQL
    const response = await fetch(`${creds.url}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': creds.key,
        'Authorization': `Bearer ${creds.key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: createFunctionSQL })
    });

    if (response.ok) {
      console.log('✅ exec_sql function created successfully!');
    } else {
      // If the RPC doesn't exist, we need to create it via SQL editor
      console.log('❌ Cannot create function via RPC (function doesn\'t exist yet)');
      console.log('\n🎯 MANUAL STEPS REQUIRED:');
      console.log('1. Open Supabase Dashboard');
      console.log('2. Go to SQL Editor');
      console.log('3. Paste and run this SQL:');
      console.log('\n' + '='.repeat(60));
      console.log(createFunctionSQL);
      console.log('='.repeat(60));
      
      // Save to file for easy copy-paste
      fs.writeFileSync('create_exec_sql_function.sql', createFunctionSQL);
      console.log('\n✅ SQL saved to: create_exec_sql_function.sql');
      console.log('   Copy and paste this file into Supabase SQL Editor');
    }

  } catch (error) {
    console.log('❌ Error creating function:', error.message);
    
    // Save SQL to file as fallback
    fs.writeFileSync('create_exec_sql_function.sql', createFunctionSQL);
    console.log('\n🎯 FALLBACK: SQL saved to create_exec_sql_function.sql');
    console.log('   Manually run this in Supabase SQL Editor');
  }
}

async function testExecSqlFunction() {
  console.log('\n🧪 TESTING EXEC_SQL FUNCTION');
  console.log('-'.repeat(40));

  const creds = getSupabaseCredentials();
  
  if (!creds) {
    console.log('❌ Cannot test: No credentials');
    return;
  }

  try {
    // Test the exec_sql function
    const response = await fetch(`${creds.url}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': creds.key,
        'Authorization': `Bearer ${creds.key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: 'SELECT NOW() as current_time;' })
    });

    const result = await response.text();
    
    if (response.ok) {
      console.log('✅ exec_sql function is working!');
      console.log('   Result:', result);
    } else {
      console.log('❌ exec_sql function test failed');
      console.log('   Status:', response.status);
      console.log('   Error:', result);
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

async function main() {
  await createExecSqlFunction();
  await testExecSqlFunction();
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 NEXT STEPS:');
  console.log('1. If function creation failed, manually run the SQL in Supabase');
  console.log('2. Once function exists, restart devSqlExec.js server');
  console.log('3. Re-run the 400 error fixes');
  console.log('4. Verify fixes work via both dev server and REST API');
}

main().catch(console.error);
