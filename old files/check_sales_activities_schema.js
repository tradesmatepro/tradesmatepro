// Check actual sales_activities table schema
const fetch = require('node-fetch');

const SUPABASE_URL = "https://amgtktrwpdsigcomavlg.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64";

async function checkSalesActivitiesSchema() {
  console.log('🔍 CHECKING SALES_ACTIVITIES TABLE SCHEMA');
  console.log('='.repeat(50));

  try {
    // First, let's see if we can get any record to see the actual columns
    const response = await fetch(`${SUPABASE_URL}/rest/v1/sales_activities?select=*&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      
      if (data.length > 0) {
        console.log('✅ Found sales_activities record. Actual columns:');
        const columns = Object.keys(data[0]);
        columns.forEach((col, index) => {
          console.log(`   ${index + 1}. ${col}: ${typeof data[0][col]} (${data[0][col]})`);
        });
      } else {
        console.log('⚠️ sales_activities table exists but has no data');
        console.log('Let me try to insert a test record to see the schema...');
        
        // Try to insert a minimal record to see what columns are required/available
        const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/sales_activities`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            company_id: 'ba643da1-c16f-468e-8fcb-f347e7929597',
            activity_type: 'NOTE',
            description: 'Test record to check schema'
          })
        });

        if (insertResponse.ok) {
          console.log('✅ Test record inserted successfully');
          
          // Now fetch it back to see the schema
          const fetchResponse = await fetch(`${SUPABASE_URL}/rest/v1/sales_activities?select=*&limit=1`, {
            method: 'GET',
            headers: {
              'apikey': SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
              'Accept': 'application/json'
            }
          });

          if (fetchResponse.ok) {
            const fetchData = await fetchResponse.json();
            if (fetchData.length > 0) {
              console.log('📋 Actual sales_activities columns:');
              const columns = Object.keys(fetchData[0]);
              columns.forEach((col, index) => {
                console.log(`   ${index + 1}. ${col}: ${typeof fetchData[0][col]}`);
              });
            }
          }
        } else {
          const insertError = await insertResponse.text();
          console.log('❌ Failed to insert test record:', insertError);
          console.log('This error might show us what columns are required/available');
        }
      }
    } else {
      const error = await response.text();
      console.log('❌ Failed to access sales_activities table:', error);
    }

  } catch (error) {
    console.log('❌ Error checking schema:', error.message);
  }

  // Also check what SalesDashboard.js is trying to use
  console.log('\n📋 COLUMNS THAT SALESDASHBOARD.JS EXPECTS:');
  console.log('Based on the code analysis:');
  console.log('   - activity_type (for filtering CALL, EMAIL, MEETING)');
  console.log('   - subject (for displaying activity title)');
  console.log('   - user_id (for linking to users table)');
  console.log('   - created_at (for date filtering and sorting)');
  console.log('   - company_id (for company isolation)');

  console.log('\n🔧 LIKELY FIXES NEEDED:');
  console.log('1. If "subject" column is missing, SalesDashboard.js should use "description" or add subject column');
  console.log('2. Confirm activity_type vs type column name');
  console.log('3. Confirm user_id vs performed_by column name');
}

checkSalesActivitiesSchema().catch(console.error);
