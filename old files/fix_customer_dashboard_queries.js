// Fix Customer Dashboard Queries - Use correct column names
const fetch = require('node-fetch');

const SUPABASE_URL = "https://amgtktrwpdsigcomavlg.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64";

async function checkTableSchema(tableName) {
  try {
    console.log(`\n🔍 Checking ${tableName} table schema...`);
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sql: `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${tableName}' ORDER BY ordinal_position`
      })
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        console.log(`✅ ${tableName} columns:`);
        result.data.forEach(col => {
          console.log(`   ${col.column_name}: ${col.data_type}`);
        });
        return result.data;
      } else {
        console.log(`❌ Failed to get schema: ${result.error}`);
        return null;
      }
    } else {
      console.log(`❌ HTTP ${response.status}: ${await response.text()}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return null;
  }
}

async function testCorrectedQuery(tableName, query, description) {
  try {
    console.log(`\n🧪 Testing corrected query: ${description}`);
    console.log(`Query: ${query}`);
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${query}`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ SUCCESS - ${data.length} records`);
      return { success: true, data };
    } else {
      const error = await response.text();
      console.log(`❌ FAILED - ${response.status}: ${error}`);
      return { success: false, error, status: response.status };
    }
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function fixCustomerDashboardQueries() {
  console.log('🔧 FIXING CUSTOMER DASHBOARD QUERIES');
  console.log('Finding correct column names and fixing queries\n');

  const COMPANY_ID = 'ba643da1-c16f-468e-8fcb-f347e7929597';

  // Check schemas first
  const customersSchema = await checkTableSchema('customers');
  const serviceRequestsSchema = await checkTableSchema('service_requests');

  console.log('\n' + '='.repeat(60));
  console.log('🔧 TESTING CORRECTED QUERIES');
  console.log('='.repeat(60));

  // Test corrected customers query
  if (customersSchema) {
    const hasUpdatedAt = customersSchema.some(col => col.column_name === 'updated_at');
    const hasCreatedAt = customersSchema.some(col => col.column_name === 'created_at');
    
    let orderBy = 'created_at.desc'; // Default fallback
    if (hasUpdatedAt) {
      orderBy = 'updated_at.desc';
    } else if (hasCreatedAt) {
      orderBy = 'created_at.desc';
    }

    const customersQuery = `customers?select=*&order=${orderBy}&limit=50&company_id=eq.${COMPANY_ID}`;
    await testCorrectedQuery('customers', customersQuery, 'Customers with correct order column');
  }

  // Test corrected service_requests query
  if (serviceRequestsSchema) {
    const hasCreatedAt = serviceRequestsSchema.some(col => col.column_name === 'created_at');
    const hasUpdatedAt = serviceRequestsSchema.some(col => col.column_name === 'updated_at');
    
    let orderBy = 'id.desc'; // Default fallback
    if (hasCreatedAt) {
      orderBy = 'created_at.desc';
    } else if (hasUpdatedAt) {
      orderBy = 'updated_at.desc';
    }

    const serviceRequestsQuery = `service_requests?select=*,customers(name,email,phone)&or=(company_id.is.null,company_id.eq.${COMPANY_ID})&order=${orderBy}&limit=20`;
    await testCorrectedQuery('service_requests', serviceRequestsQuery, 'Service Requests with correct order column');
  }

  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Update CustomerDashboard.js with correct column names');
  console.log('2. Create customer_messages table in Supabase');
  console.log('3. Test Customer Dashboard in browser');
}

// Run the fix
fixCustomerDashboardQueries().catch(console.error);
