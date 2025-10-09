// Test the exact queries that Customers.js makes
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

async function testCustomersPageQueries() {
  console.log('🔍 TESTING CUSTOMERS.JS EXACT QUERIES');
  console.log('These are the exact queries that Customers.js makes');
  console.log('='.repeat(80));

  const COMPANY_ID = 'ba643da1-c16f-468e-8fcb-f347e7929597';

  // These are the EXACT queries from Customers.js
  const customersQueries = [
    {
      name: 'loadCustomers',
      query: `customers?select=*&order=created_at.desc&company_id=eq.${COMPANY_ID}`,
      line: '1731'
    },
    {
      name: 'loadJobs', 
      query: `work_orders?select=*&stage=eq.WORK_ORDER&order=created_at.desc&company_id=eq.${COMPANY_ID}`,
      line: '1756'
    },
    {
      name: 'loadQuotes',
      query: `work_orders?select=*&stage=eq.QUOTE&order=created_at.desc&company_id=eq.${COMPANY_ID}`,
      line: '1769'
    },
    {
      name: 'loadInvoices',
      query: `invoices?select=*&order=created_at.desc&company_id=eq.${COMPANY_ID}`,
      line: '1782'
    },
    {
      name: 'loadCommunications',
      query: `customer_communications?select=*,users(first_name,last_name)&order=created_at.desc&company_id=eq.${COMPANY_ID}`,
      line: '1795'
    },
    {
      name: 'loadCustomerTags',
      query: `customer_tags?select=*&is_active=eq.true&order=name.asc&company_id=eq.${COMPANY_ID}`,
      line: '1808'
    },
    {
      name: 'loadServiceAgreements',
      query: `customer_service_agreements?select=*&order=created_at.desc&company_id=eq.${COMPANY_ID}`,
      line: '1821'
    }
  ];

  const results = [];

  for (const test of customersQueries) {
    const result = await testQuery(test.query, `${test.name} (line ${test.line})`);
    results.push({ ...test, result });
  }

  // Check for specific column issues
  console.log('\n🔍 CHECKING FOR COLUMN ISSUES');
  console.log('-'.repeat(50));

  const columnTests = [
    {
      name: 'customer_communications - users join',
      query: `customer_communications?select=*,users(first_name,last_name)&limit=1&company_id=eq.${COMPANY_ID}`,
      issue: 'users table might not have first_name,last_name columns'
    },
    {
      name: 'customer_tags - is_active column',
      query: `customer_tags?select=*&is_active=eq.true&limit=1&company_id=eq.${COMPANY_ID}`,
      issue: 'customer_tags might not have is_active column'
    }
  ];

  for (const test of columnTests) {
    const result = await testQuery(test.query, test.name);
    console.log(`   📋 Issue: ${test.issue}`);
    results.push({ ...test, result });
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 CUSTOMERS.JS QUERIES SUMMARY');
  console.log('='.repeat(80));

  const totalQueries = results.length;
  const successfulQueries = results.filter(r => r.result.success).length;
  const failedQueries = totalQueries - successfulQueries;

  console.log(`🎯 RESULTS: ${successfulQueries}/${totalQueries} queries working`);

  if (failedQueries > 0) {
    console.log('\n❌ FAILING QUERIES (These cause 400 errors):');
    results.forEach(test => {
      if (!test.result.success) {
        console.log(`   - ${test.name}: ${test.result.error}`);
      }
    });

    console.log('\n🔧 FIXES NEEDED:');
    console.log('1. Fix column name mismatches');
    console.log('2. Create missing foreign key relationships');
    console.log('3. Add missing columns to tables');
  } else {
    console.log('\n🎉 ALL CUSTOMERS.JS QUERIES WORKING!');
  }

  return results;
}

// Run the test
testCustomersPageQueries().catch(console.error);
