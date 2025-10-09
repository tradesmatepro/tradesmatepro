// Check specific component issues that might cause 400 errors
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

async function checkSpecificComponentIssues() {
  console.log('🔍 CHECKING SPECIFIC COMPONENT ISSUES');
  console.log('Looking for queries that might cause 400 errors in browser');
  console.log('='.repeat(80));

  const COMPANY_ID = 'ba643da1-c16f-468e-8fcb-f347e7929597';

  // Test specific problematic queries found in components
  const problematicQueries = [
    {
      name: 'Quotes_clean.js - Wrong JOB stage',
      query: `work_orders?select=*&stage=eq.JOB&order=created_at.desc&company_id=eq.${COMPANY_ID}`,
      issue: 'Uses stage=JOB instead of stage=WORK_ORDER',
      shouldWork: false
    },
    {
      name: 'Quotes_clean.js - Correct WORK_ORDER stage',
      query: `work_orders?select=*&stage=eq.WORK_ORDER&order=created_at.desc&company_id=eq.${COMPANY_ID}`,
      issue: 'Should use this instead',
      shouldWork: true
    },
    {
      name: 'Customers.js - loadCommunications',
      query: `customer_communications?select=*&order=created_at.desc&company_id=eq.${COMPANY_ID}`,
      issue: 'customer_communications table might not exist',
      shouldWork: false
    },
    {
      name: 'Customers.js - loadCustomerTags',
      query: `customer_tags?select=*&company_id=eq.${COMPANY_ID}`,
      issue: 'customer_tags table might not exist',
      shouldWork: false
    },
    {
      name: 'Customers.js - loadServiceAgreements',
      query: `customer_service_agreements?select=*&company_id=eq.${COMPANY_ID}`,
      issue: 'customer_service_agreements table might not exist',
      shouldWork: false
    },
    {
      name: 'CustomerDatabasePanel - Direct fetch',
      query: `customers?company_id=eq.${COMPANY_ID}&select=*&order=created_at.desc`,
      issue: 'Uses direct fetch instead of supaFetch',
      shouldWork: true
    },
    {
      name: 'Invoices page - Basic query',
      query: `invoices?select=*&order=created_at.desc&company_id=eq.${COMPANY_ID}`,
      issue: 'Should work but might have data issues',
      shouldWork: true
    },
    {
      name: 'Work Orders - Customer join',
      query: `work_orders?select=*,customers(name,email,phone)&stage=eq.QUOTE&company_id=eq.${COMPANY_ID}`,
      issue: 'Customer join might fail if relationship broken',
      shouldWork: true
    }
  ];

  console.log('1️⃣ TESTING SPECIFIC PROBLEMATIC QUERIES');
  console.log('-'.repeat(60));

  const results = [];

  for (const test of problematicQueries) {
    const result = await testQuery(test.query, test.name);
    results.push({ ...test, result });
    
    console.log(`   📋 Issue: ${test.issue}`);
    console.log(`   Expected: ${test.shouldWork ? 'SUCCESS' : 'FAILURE'}`);
    console.log(`   Actual: ${result.success ? 'SUCCESS' : 'FAILURE'}`);
    
    if (result.success !== test.shouldWork) {
      console.log(`   🚨 UNEXPECTED RESULT!`);
    }
  }

  // Check for missing tables that components expect
  console.log('\n2️⃣ CHECKING FOR MISSING TABLES');
  console.log('-'.repeat(60));

  const expectedTables = [
    'customer_communications',
    'customer_tags', 
    'customer_service_agreements',
    'customer_messages'
  ];

  for (const table of expectedTables) {
    const result = await testQuery(`${table}?select=*&limit=1`, `${table} table existence`);
    
    if (!result.success) {
      console.log(`   🔧 MISSING TABLE: ${table} - This will cause 400 errors`);
    } else {
      console.log(`   ✅ TABLE EXISTS: ${table}`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 SPECIFIC COMPONENT ISSUES SUMMARY');
  console.log('='.repeat(80));

  const failingQueries = results.filter(r => !r.result.success && r.shouldWork);
  const unexpectedResults = results.filter(r => r.result.success !== r.shouldWork);

  console.log(`🎯 RESULTS:`);
  console.log(`   Queries tested: ${results.length}`);
  console.log(`   Unexpected failures: ${failingQueries.length}`);
  console.log(`   Unexpected results: ${unexpectedResults.length}`);

  if (failingQueries.length > 0) {
    console.log('\n❌ QUERIES THAT SHOULD WORK BUT FAIL:');
    failingQueries.forEach(q => {
      console.log(`   - ${q.name}: ${q.result.error}`);
    });
  }

  if (unexpectedResults.length > 0) {
    console.log('\n⚠️ UNEXPECTED RESULTS:');
    unexpectedResults.forEach(q => {
      console.log(`   - ${q.name}: Expected ${q.shouldWork ? 'SUCCESS' : 'FAILURE'}, got ${q.result.success ? 'SUCCESS' : 'FAILURE'}`);
    });
  }

  console.log('\n🔧 FIXES NEEDED:');
  console.log('1. Fix Quotes_clean.js to use stage=WORK_ORDER instead of stage=JOB');
  console.log('2. Create missing tables: customer_communications, customer_tags, customer_service_agreements');
  console.log('3. Fix CustomerDatabasePanel to use supaFetch instead of direct fetch');
  console.log('4. Create customer_messages table for Customer Dashboard');

  return results;
}

// Run the specific component check
checkSpecificComponentIssues().catch(console.error);
