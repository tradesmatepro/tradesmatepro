const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('\n🔍 CHECKING COMPANIES TABLE SCHEMA');
    console.log('=' .repeat(80));

    // Login
    console.log('\n🔐 Logging in...');
    await page.goto('http://localhost:3004/login');
    await page.fill('input[type="email"]', 'owner@company.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    console.log('✅ Logged in\n');

    // Get database schema
    const schema = await page.evaluate(async () => {
      const SUPABASE_URL = 'https://cxlqzejzraczumqmsrcx.supabase.co';
      const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bHF6ZWp6cmFjenVtcW1zcmN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjI4NTQ0NiwiZXhwIjoyMDUxODYxNDQ2fQ.Uw_ygE-Uw0r_5_Uw0r_5_Uw0r_5_Uw0r_5_Uw0r_5_Uw0r_5';

      // Query information_schema to get actual columns
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/rpc/get_table_columns`,
        {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ table_name: 'companies' })
        }
      );

      if (!response.ok) {
        // Fallback: Try to get a sample row and see what columns it has
        const sampleResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/companies?limit=1`,
          {
            headers: {
              'apikey': SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
            }
          }
        );

        if (sampleResponse.ok) {
          const data = await sampleResponse.json();
          if (data && data.length > 0) {
            return {
              method: 'sample_row',
              columns: Object.keys(data[0]).sort()
            };
          }
        }

        return { error: 'Could not fetch schema' };
      }

      const columns = await response.json();
      return {
        method: 'rpc',
        columns: columns
      };
    });

    console.log('📋 COMPANIES TABLE COLUMNS:');
    console.log('-'.repeat(80));
    
    if (schema.error) {
      console.log('❌ Error:', schema.error);
    } else {
      console.log(`Method: ${schema.method}`);
      console.log(`\nColumns (${schema.columns.length}):`);
      schema.columns.forEach((col, i) => {
        console.log(`  ${i + 1}. ${col}`);
      });

      // Check for license-related columns
      console.log('\n🔍 LICENSE-RELATED COLUMNS:');
      const licenseColumns = schema.columns.filter(col => 
        col.toLowerCase().includes('license')
      );
      if (licenseColumns.length > 0) {
        licenseColumns.forEach(col => console.log(`  ✅ ${col}`));
      } else {
        console.log('  ❌ No license-related columns found');
      }

      // Check for other important columns
      console.log('\n🔍 SCHEDULING-RELATED COLUMNS:');
      const schedColumns = schema.columns.filter(col => 
        col.toLowerCase().includes('buffer') || 
        col.toLowerCase().includes('scheduling') ||
        col.toLowerCase().includes('business_hours')
      );
      if (schedColumns.length > 0) {
        schedColumns.forEach(col => console.log(`  ✅ ${col}`));
      } else {
        console.log('  ❌ No scheduling-related columns found');
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ SCHEMA CHECK COMPLETE\n');

    // Keep browser open for inspection
    console.log('Browser will stay open for 30 seconds for manual inspection...\n');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  } finally {
    await browser.close();
  }
})();

