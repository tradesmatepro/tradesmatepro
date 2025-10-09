#!/usr/bin/env node
/**
 * Create the correct exec_sql function in Supabase
 * Using GPT's improved definition that handles all SQL types
 */

async function createExecSqlFunction() {
  console.log('🚀 Creating exec_sql function in Supabase...\n');

  const createFunctionSQL = `
DROP FUNCTION IF EXISTS exec_sql(text);

CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  result json;
BEGIN
  BEGIN
    EXECUTE format('SELECT json_agg(t) FROM (%s) t', query) INTO result;
    IF result IS NULL THEN
      RETURN json_build_object('status','success','result','null');
    END IF;
    RETURN result;
  EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
      'status','error',
      'message', SQLERRM,
      'hint', COALESCE(PG_EXCEPTION_DETAIL, 'No additional details'),
      'context', COALESCE(PG_EXCEPTION_CONTEXT, 'No context available')
    );
  END;
END;
$$;

GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;
GRANT EXECUTE ON FUNCTION exec_sql(text) TO authenticated;
  `.trim();

  try {
    // Use direct Supabase client to create the function
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabase = createClient(
      "https://amgtktrwpdsigcomavlg.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64"
    );

    console.log('📝 Executing SQL to create exec_sql function...');
    
    // Execute the function creation SQL directly
    const { data, error } = await supabase.rpc('sql', { 
      query: createFunctionSQL 
    });

    if (error) {
      console.log('❌ Failed to create exec_sql function via RPC');
      console.log('Error:', error);
      
      // Try alternative approach - direct SQL execution
      console.log('\n🔄 Trying alternative approach...');
      
      const response = await fetch('https://amgtktrwpdsigcomavlg.supabase.co/rest/v1/rpc/sql', {
        method: 'POST',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: createFunctionSQL })
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ exec_sql function created successfully via REST API!');
        console.log('Result:', result);
      } else {
        console.log('❌ Failed to create exec_sql function via REST API');
        console.log('Error:', result);
        
        console.log('\n📋 MANUAL STEP REQUIRED:');
        console.log('Please copy and paste this SQL into Supabase SQL Editor:');
        console.log('\n' + '='.repeat(60));
        console.log(createFunctionSQL);
        console.log('='.repeat(60));
        return false;
      }
    } else {
      console.log('✅ exec_sql function created successfully!');
      console.log('Result:', data);
    }

    // Test the function
    console.log('\n🧪 Testing the exec_sql function...');
    
    const testResult = await fetch('http://localhost:4000/dev/sql/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql: "SELECT NOW() as current_time, 'Function test successful!' as message;" })
    });

    const testData = await testResult.json();
    
    if (testData.success) {
      console.log('✅ exec_sql function test PASSED!');
      console.log('Result:', testData.data);
      return true;
    } else {
      console.log('❌ exec_sql function test FAILED!');
      console.log('Error:', testData.error);
      return false;
    }

  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
    
    console.log('\n📋 MANUAL STEP REQUIRED:');
    console.log('Please copy and paste this SQL into Supabase SQL Editor:');
    console.log('\n' + '='.repeat(60));
    console.log(createFunctionSQL);
    console.log('='.repeat(60));
    return false;
  }
}

// Run the function creation
createExecSqlFunction().then(success => {
  if (success) {
    console.log('\n🎉 SQL Automation System is now ready!');
    console.log('✅ Claude can now automatically fix database issues!');
  } else {
    console.log('\n⚠️  Manual intervention required to complete setup.');
  }
}).catch(console.error);
