/**
 * GET SUPABASE KEYS
 * 
 * Retrieves the actual JWT anon key from Supabase project
 */

const SUPABASE_PROJECT_REF = 'cxlqzejzraczumqmsrcx';
const SUPABASE_ACCESS_TOKEN = 'sbp_40c44d77ac59ebc9276f358139231f89f52ce881'; // From previous sessions

async function getKeys() {
  console.log('\n🔑 GETTING SUPABASE KEYS');
  console.log('='.repeat(80));

  try {
    console.log(`\n📋 Project: ${SUPABASE_PROJECT_REF}`);
    
    // Get project API settings
    const response = await fetch(
      `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/api-keys`,
      {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get keys: ${response.status} - ${errorText}`);
    }

    const keys = await response.json();
    
    console.log('\n✅ API KEYS:');
    console.log(JSON.stringify(keys, null, 2));

    // Find anon key
    const anonKey = keys.find(k => k.name === 'anon' || k.name === 'anon public');
    const serviceKey = keys.find(k => k.name === 'service_role');

    if (anonKey) {
      console.log('\n📋 ANON KEY (for .env and quote.html):');
      console.log(anonKey.api_key);
      console.log('\nFormat:', anonKey.api_key.startsWith('eyJ') ? 'JWT ✅' : 'New format ⚠️');
    }

    if (serviceKey) {
      console.log('\n📋 SERVICE ROLE KEY (for backend only):');
      console.log(serviceKey.api_key);
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ KEYS RETRIEVED!\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\nTrying alternative method...\n');

    // Alternative: Get from project config
    try {
      const configResponse = await fetch(
        `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/config`,
        {
          headers: {
            'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (configResponse.ok) {
        const config = await configResponse.json();
        console.log('Project config:');
        console.log(JSON.stringify(config, null, 2));
      }
    } catch (e) {
      console.error('Alternative method also failed:', e.message);
    }

    console.error('\n💡 MANUAL SOLUTION:');
    console.error('1. Go to: https://supabase.com/dashboard/project/cxlqzejzraczumqmsrcx/settings/api');
    console.error('2. Look for "Project API keys" section');
    console.error('3. Copy the "anon public" key (should start with eyJhbGciOiJIUzI1NiIs...)');
    console.error('4. Update .env file with that key\n');
  }
}

getKeys();

