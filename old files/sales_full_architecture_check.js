// Sales Dashboard - Full Architecture Check (No Band-Aids)
// Following the complete troubleshooting guide

const fetch = require('node-fetch');

const SUPABASE_URL = "https://amgtktrwpdsigcomavlg.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64";

async function testQuery(query, description) {
  try {
    console.log(`\n🧪 Testing: ${description}`);
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
      return { success: true, data, status: response.status };
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

async function checkSchemaAlignment() {
  console.log('🔍 2. CHECKING SCHEMA ALIGNMENT');
  console.log('='.repeat(50));

  // Sales pipeline tables that SalesDashboard.js expects
  const expectedTables = [
    'leads',
    'opportunities', 
    'work_orders',
    'sales_activities',
    'invoices',
    'customers',
    'users'
  ];

  const tableResults = {};

  for (const table of expectedTables) {
    console.log(`\n📋 Checking ${table} table...`);
    
    // Test basic table access
    const result = await testQuery(`${table}?select=*&limit=1`, `${table} table access`);
    tableResults[table] = result;
    
    if (result.success && result.data.length > 0) {
      // Show available columns
      const columns = Object.keys(result.data[0]);
      console.log(`   📊 Columns (${columns.length}): ${columns.slice(0, 8).join(', ')}${columns.length > 8 ? '...' : ''}`);
      
      // Check for required columns
      const hasId = columns.includes('id');
      const hasCompanyId = columns.includes('company_id');
      const hasCreatedAt = columns.includes('created_at');
      const hasUpdatedAt = columns.includes('updated_at');
      
      console.log(`   🔑 Required fields:`);
      console.log(`      id: ${hasId ? '✅' : '❌'}`);
      console.log(`      company_id: ${hasCompanyId ? '✅' : '❌'}`);
      console.log(`      created_at: ${hasCreatedAt ? '✅' : '❌'}`);
      console.log(`      updated_at: ${hasUpdatedAt ? '✅' : '❌'}`);
      
    } else if (result.success && result.data.length === 0) {
      console.log(`   ⚠️ Table exists but has no data`);
    } else {
      console.log(`   ❌ Table missing or inaccessible`);
    }
  }

  return tableResults;
}

async function checkDataAccessLayer(tableResults) {
  console.log('\n🔗 3. CHECKING DATA ACCESS LAYER');
  console.log('='.repeat(50));

  const COMPANY_ID = 'ba643da1-c16f-468e-8fcb-f347e7929597';

  // Test the exact queries that SalesDashboard.js makes
  const salesDashboardQueries = [
    {
      name: 'Pipeline Metrics - Leads',
      query: `leads?select=*&company_id=eq.${COMPANY_ID}`,
      table: 'leads',
      required: true
    },
    {
      name: 'Pipeline Metrics - Opportunities', 
      query: `opportunities?select=*&company_id=eq.${COMPANY_ID}`,
      table: 'opportunities',
      required: true
    },
    {
      name: 'Pipeline Metrics - Quotes',
      query: `work_orders?select=*&stage=eq.QUOTE&company_id=eq.${COMPANY_ID}`,
      table: 'work_orders',
      required: true
    },
    {
      name: 'Activity Metrics - Today',
      query: `sales_activities?select=*&created_at=gte.${new Date().toISOString().split('T')[0]}T00:00:00.000Z&company_id=eq.${COMPANY_ID}`,
      table: 'sales_activities',
      required: true
    },
    {
      name: 'Revenue Metrics - Invoices',
      query: `invoices?select=*&company_id=eq.${COMPANY_ID}`,
      table: 'invoices',
      required: true
    },
    {
      name: 'Recent Activities with User Join',
      query: `sales_activities?select=*,users(full_name)&order=created_at.desc&limit=10&company_id=eq.${COMPANY_ID}`,
      table: 'sales_activities',
      required: true
    }
  ];

  const queryResults = {};

  for (const test of salesDashboardQueries) {
    const result = await testQuery(test.query, test.name);
    queryResults[test.name] = result;
    
    // Check if this query should work based on table existence
    const tableExists = tableResults[test.table]?.success;
    
    if (test.required && !result.success && tableExists) {
      console.log(`   🔍 ANALYSIS: Table exists but query fails - likely column/relationship issue`);
    } else if (test.required && !result.success && !tableExists) {
      console.log(`   🔍 ANALYSIS: Query fails because table doesn't exist`);
    }
  }

  return queryResults;
}

async function checkSystemicIssues() {
  console.log('\n🔧 7. CHECKING FOR SYSTEMIC ISSUES');
  console.log('='.repeat(50));

  // Check for common sales pipeline issues
  const systemicChecks = [
    {
      name: 'Orphaned Opportunities (no lead)',
      query: 'SELECT COUNT(*) as count FROM opportunities WHERE lead_id IS NULL',
      expectZero: true
    },
    {
      name: 'Quotes without customers',
      query: 'SELECT COUNT(*) as count FROM work_orders WHERE stage = \'QUOTE\' AND customer_id IS NULL',
      expectZero: true
    },
    {
      name: 'Sales activities without performers',
      query: 'SELECT COUNT(*) as count FROM sales_activities WHERE user_id IS NULL AND performed_by IS NULL',
      expectZero: true
    }
  ];

  console.log('🔍 Checking for data integrity issues...');
  
  for (const check of systemicChecks) {
    // Note: These would need direct SQL execution, which we don't have access to
    // So we'll document what should be checked
    console.log(`📋 Should check: ${check.name}`);
    console.log(`   SQL: ${check.query}`);
  }
}

async function salesFullArchitectureCheck() {
  console.log('🌯 SALES DASHBOARD - FULL ARCHITECTURE CHECK');
  console.log('Following the complete troubleshooting guide - NO BAND-AIDS');
  console.log('='.repeat(80));

  console.log('\n1️⃣ THE ENCHILADA - Sales Pipeline Flow:');
  console.log('Lead Generation → Lead Qualification → Opportunity → Quote → Job → Invoice');
  console.log('Database: leads → opportunities → work_orders → invoices');
  console.log('Activities: sales_activities (tracks all interactions)');

  // 2. Check Schema Alignment
  const tableResults = await checkSchemaAlignment();

  // 3. Check Data Access Layer  
  const queryResults = await checkDataAccessLayer(tableResults);

  // 7. Check for Systemic Issues
  await checkSystemicIssues();

  // Summary and Recommendations
  console.log('\n' + '='.repeat(80));
  console.log('📊 SALES DASHBOARD ARCHITECTURE CHECK SUMMARY');
  console.log('='.repeat(80));

  const tableCount = Object.keys(tableResults).length;
  const tablesWorking = Object.values(tableResults).filter(r => r.success).length;
  const queriesCount = Object.keys(queryResults).length;
  const queriesWorking = Object.values(queryResults).filter(r => r.success).length;

  console.log(`📋 Tables: ${tablesWorking}/${tableCount} accessible`);
  console.log(`🔗 Queries: ${queriesWorking}/${queriesCount} working`);

  console.log('\n🎯 ISSUES IDENTIFIED:');
  
  // Identify missing tables
  const missingTables = Object.entries(tableResults)
    .filter(([table, result]) => !result.success)
    .map(([table]) => table);
    
  if (missingTables.length > 0) {
    console.log(`❌ Missing tables: ${missingTables.join(', ')}`);
  }

  // Identify failing queries
  const failingQueries = Object.entries(queryResults)
    .filter(([query, result]) => !result.success)
    .map(([query]) => query);
    
  if (failingQueries.length > 0) {
    console.log(`❌ Failing queries: ${failingQueries.length}`);
    failingQueries.forEach(query => console.log(`   - ${query}`));
  }

  console.log('\n🔧 NEXT STEPS:');
  console.log('1. Create missing tables using sales_dashboard_schema.sql');
  console.log('2. Fix column name mismatches in queries');
  console.log('3. Verify foreign key relationships');
  console.log('4. Test complete pipeline end-to-end');
  console.log('5. Update SalesDashboard.js with correct queries');

  if (tablesWorking === tableCount && queriesWorking === queriesCount) {
    console.log('\n🎉 SALES DASHBOARD ARCHITECTURE IS HEALTHY!');
  } else {
    console.log('\n⚠️ SALES DASHBOARD NEEDS FIXES - See issues above');
  }
}

// Run the full architecture check
salesFullArchitectureCheck().catch(console.error);
