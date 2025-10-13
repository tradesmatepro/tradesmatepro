// Simple script to check actual database schema
const fetch = require('node-fetch');

const SUPABASE_URL = 'https://cxlqzejzraczumqmsrcx.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bHF6ZWp6cmFjenVtcW1zcmN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjI4NTQ0NiwiZXhwIjoyMDUxODYxNDQ2fQ.Uw_ygE-Uw0r_5_Uw0r_5_Uw0r_5_Uw0r_5_Uw0r_5_Uw0r_5';

async function checkSchema() {
  console.log('\n🔍 CHECKING DATABASE SCHEMA');
  console.log('='.repeat(80));

  try {
    // Get a sample row from companies table to see what columns exist
    console.log('\n📋 Fetching sample company row...');
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/companies?limit=1`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      console.error('❌ Failed to fetch:', response.status, response.statusText);
      return;
    }

    const data = await response.json();
    
    if (!data || data.length === 0) {
      console.log('⚠️  No companies found in database');
      return;
    }

    const columns = Object.keys(data[0]).sort();
    
    console.log(`\n✅ COMPANIES TABLE COLUMNS (${columns.length} total):`);
    console.log('-'.repeat(80));
    columns.forEach((col, i) => {
      console.log(`  ${String(i + 1).padStart(2, ' ')}. ${col}`);
    });

    // Check for license-related columns
    console.log('\n🔍 LICENSE-RELATED COLUMNS:');
    console.log('-'.repeat(80));
    const licenseColumns = columns.filter(col => 
      col.toLowerCase().includes('license')
    );
    if (licenseColumns.length > 0) {
      licenseColumns.forEach(col => console.log(`  ✅ ${col}`));
    } else {
      console.log('  ❌ No license-related columns found');
      console.log('  💡 Suggestion: Column might be named differently or missing');
    }

    // Check for scheduling-related columns
    console.log('\n🔍 SCHEDULING-RELATED COLUMNS:');
    console.log('-'.repeat(80));
    const schedColumns = columns.filter(col => 
      col.toLowerCase().includes('buffer') || 
      col.toLowerCase().includes('scheduling') ||
      col.toLowerCase().includes('business_hours') ||
      col.toLowerCase().includes('working_days')
    );
    if (schedColumns.length > 0) {
      schedColumns.forEach(col => console.log(`  ✅ ${col}`));
    } else {
      console.log('  ❌ No scheduling-related columns found');
    }

    // Check for rate card columns
    console.log('\n🔍 CHECKING RATE_CARDS TABLE:');
    console.log('-'.repeat(80));
    const rateResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/rate_cards?limit=1`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Accept': 'application/json'
        }
      }
    );

    if (rateResponse.ok) {
      const rateData = await rateResponse.json();
      if (rateData && rateData.length > 0) {
        const rateColumns = Object.keys(rateData[0]).sort();
        console.log(`\n✅ RATE_CARDS TABLE COLUMNS (${rateColumns.length} total):`);
        rateColumns.forEach((col, i) => {
          console.log(`  ${String(i + 1).padStart(2, ' ')}. ${col}`);
        });

        // Check for sort_order
        if (rateColumns.includes('sort_order')) {
          console.log('\n  ✅ sort_order column EXISTS');
        } else {
          console.log('\n  ❌ sort_order column MISSING');
        }
      } else {
        console.log('  ⚠️  No rate cards found (table might be empty)');
      }
    } else {
      console.log('  ❌ Failed to fetch rate_cards:', rateResponse.status);
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ SCHEMA CHECK COMPLETE\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  }
}

checkSchema();

