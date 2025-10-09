// Test what columns actually exist in the tables
const fetch = require('node-fetch');

const SUPABASE_URL = "https://amgtktrwpdsigcomavlg.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64";

async function testTableQuery(tableName, selectFields = '*', limit = 1) {
  try {
    console.log(`\n🔍 Testing ${tableName} table...`);
    
    const query = `${tableName}?select=${selectFields}&limit=${limit}`;
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
      console.log(`✅ ${tableName} SUCCESS - ${data.length} records`);
      
      if (data.length > 0) {
        console.log('📋 Available columns:');
        Object.keys(data[0]).forEach(col => {
          console.log(`   ${col}: ${typeof data[0][col]} (${data[0][col]})`);
        });
      }
      return { success: true, data, columns: data.length > 0 ? Object.keys(data[0]) : [] };
    } else {
      const error = await response.text();
      console.log(`❌ ${tableName} FAILED - ${response.status}: ${error}`);
      return { success: false, error, status: response.status };
    }
  } catch (error) {
    console.log(`❌ ${tableName} ERROR: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function findCorrectOrderColumns() {
  console.log('🔍 FINDING CORRECT COLUMN NAMES FOR CUSTOMER DASHBOARD');
  console.log('Testing actual table structures...\n');

  // Test each table that Customer Dashboard queries
  const tables = [
    'customers',
    'work_orders', 
    'invoices',
    'service_requests'
  ];

  const results = {};

  for (const table of tables) {
    const result = await testTableQuery(table);
    results[table] = result;
    
    if (result.success && result.columns.length > 0) {
      // Look for timestamp columns that could be used for ordering
      const timestampColumns = result.columns.filter(col => 
        col.includes('created') || col.includes('updated') || col.includes('at') || col.includes('date')
      );
      
      if (timestampColumns.length > 0) {
        console.log(`   🕒 Timestamp columns: ${timestampColumns.join(', ')}`);
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('🔧 RECOMMENDED FIXES FOR CUSTOMER DASHBOARD');
  console.log('='.repeat(60));

  // Provide specific fixes based on what we found
  if (results.customers?.success) {
    const customerCols = results.customers.columns;
    if (customerCols.includes('created_at')) {
      console.log('✅ customers: Use created_at.desc instead of updated_at.desc');
    } else if (customerCols.includes('updated_by')) {
      console.log('✅ customers: Use id.desc (no timestamp columns available)');
    }
  }

  if (results.service_requests?.success) {
    const serviceCols = results.service_requests.columns;
    if (serviceCols.includes('updated_at')) {
      console.log('✅ service_requests: Use updated_at.desc instead of created_at.desc');
    } else if (serviceCols.includes('id')) {
      console.log('✅ service_requests: Use id.desc (no timestamp columns available)');
    }
  }

  console.log('\n🎯 NEXT STEP: Update CustomerDashboard.js with correct column names');
}

// Run the test
findCorrectOrderColumns().catch(console.error);
