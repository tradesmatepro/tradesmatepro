// Test exec_sql function with different SQL syntax
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

async function testQuery(query, description) {
  const creds = getSupabaseCredentials();
  
  if (!creds) {
    console.log('❌ No credentials');
    return;
  }

  try {
    console.log(`\n🧪 Testing: ${description}`);
    console.log(`   Query: ${query}`);
    
    const response = await fetch(`${creds.url}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': creds.key,
        'Authorization': `Bearer ${creds.key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: query })
    });

    const result = await response.text();
    
    if (response.ok) {
      console.log('   ✅ SUCCESS');
      console.log('   Result:', result);
    } else {
      console.log('   ❌ FAILED');
      console.log('   Status:', response.status);
      console.log('   Error:', result);
    }

  } catch (error) {
    console.log('   ❌ NETWORK ERROR:', error.message);
  }
}

async function main() {
  console.log('🧪 TESTING EXEC_SQL FUNCTION SYNTAX');
  console.log('='.repeat(50));

  // Test different query formats
  await testQuery('SELECT NOW() as current_time', 'Query without semicolon');
  await testQuery('SELECT NOW() as current_time;', 'Query with semicolon');
  await testQuery('SELECT 1 as test', 'Simple number query');
  await testQuery('SELECT current_database() as db', 'Database name query');
  await testQuery('SELECT table_name FROM information_schema.tables LIMIT 1', 'Schema query');
  
  console.log('\n' + '='.repeat(50));
  console.log('🎯 If queries without semicolon work, we need to fix devSqlExec.js');
}

main().catch(console.error);
