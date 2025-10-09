// Sales Dashboard - Complete Verification (Following Fix Loop Guide)
// Test all queries that SalesDashboard.js makes after fixes

const fetch = require('node-fetch');

const SUPABASE_URL = "https://amgtktrwpdsigcomavlg.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64";

async function testQuery(query, description, shouldWork = true) {
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

async function verifySalesDashboardFixes() {
  console.log('🔧 SALES DASHBOARD - COMPLETE VERIFICATION');
  console.log('Testing all queries after column name fixes');
  console.log('='.repeat(80));

  const COMPANY_ID = 'ba643da1-c16f-468e-8fcb-f347e7929597';

  // Test all the exact queries that SalesDashboard.js makes
  const salesDashboardQueries = [
    {
      name: 'loadPipelineMetrics - Leads',
      query: `leads?select=*&company_id=eq.${COMPANY_ID}`,
      shouldWork: true,
      purpose: 'Load all leads for pipeline metrics'
    },
    {
      name: 'loadPipelineMetrics - Opportunities',
      query: `opportunities?select=*&company_id=eq.${COMPANY_ID}`,
      shouldWork: true,
      purpose: 'Load all opportunities for pipeline metrics'
    },
    {
      name: 'loadPipelineMetrics - Quotes',
      query: `work_orders?select=*&stage=eq.QUOTE&company_id=eq.${COMPANY_ID}`,
      shouldWork: true,
      purpose: 'Load quotes from work_orders'
    },
    {
      name: 'loadActivityMetrics - Today Activities',
      query: `sales_activities?select=*&created_at=gte.${new Date().toISOString().split('T')[0]}T00:00:00.000Z&created_at=lt.${new Date().toISOString().split('T')[0]}T23:59:59.999Z&company_id=eq.${COMPANY_ID}`,
      shouldWork: true,
      purpose: 'Load today\'s sales activities'
    },
    {
      name: 'loadActivityMetrics - Follow-ups',
      query: `sales_activities?select=*&limit=50&company_id=eq.${COMPANY_ID}`,
      shouldWork: true,
      purpose: 'Load activities for follow-up count'
    },
    {
      name: 'loadRevenueMetrics - Invoices',
      query: `invoices?select=*&company_id=eq.${COMPANY_ID}`,
      shouldWork: true,
      purpose: 'Load invoices for revenue calculations'
    },
    {
      name: 'loadPipelineData - Opportunities for stages',
      query: `opportunities?select=*&company_id=eq.${COMPANY_ID}`,
      shouldWork: true,
      purpose: 'Load opportunities for pipeline stage breakdown'
    },
    {
      name: 'loadPipelineData - Leads for stages',
      query: `leads?select=*&company_id=eq.${COMPANY_ID}`,
      shouldWork: true,
      purpose: 'Load leads for pipeline stage breakdown'
    },
    {
      name: 'loadLeadSourceData - Lead sources',
      query: `leads?select=source&company_id=eq.${COMPANY_ID}`,
      shouldWork: true,
      purpose: 'Load lead sources for chart'
    },
    {
      name: 'loadRecentActivities - FIXED QUERY',
      query: `sales_activities?select=*,users(full_name)&created_at=gte.${new Date(Date.now() - 7*24*60*60*1000).toISOString()}&order=created_at.desc&limit=10&company_id=eq.${COMPANY_ID}`,
      shouldWork: true,
      purpose: 'Load recent activities with user join (FIXED: uses description not subject)'
    }
  ];

  const results = [];

  console.log('1️⃣ TESTING ALL SALESDASHBOARD.JS QUERIES');
  console.log('-'.repeat(50));

  for (const test of salesDashboardQueries) {
    const result = await testQuery(test.query, test.name, test.shouldWork);
    results.push({ ...test, result });
    console.log(`   📋 Purpose: ${test.purpose}`);
    
    if (!result.success && test.shouldWork) {
      console.log(`   🚨 CRITICAL: This query is required by SalesDashboard.js`);
    }
  }

  // Test specific column usage that was causing issues
  console.log('\n2️⃣ TESTING SPECIFIC COLUMN FIXES');
  console.log('-'.repeat(50));

  const columnTests = [
    {
      name: 'Sales Activities - activity_type column (FIXED)',
      query: `sales_activities?select=activity_type&company_id=eq.${COMPANY_ID}&limit=1`,
      shouldWork: true
    },
    {
      name: 'Sales Activities - description column (FIXED)',
      query: `sales_activities?select=description&company_id=eq.${COMPANY_ID}&limit=1`,
      shouldWork: true
    },
    {
      name: 'Sales Activities - user_id column (FIXED)',
      query: `sales_activities?select=user_id&company_id=eq.${COMPANY_ID}&limit=1`,
      shouldWork: true
    },
    {
      name: 'Sales Activities - OLD subject column (should fail)',
      query: `sales_activities?select=subject&company_id=eq.${COMPANY_ID}&limit=1`,
      shouldWork: false
    },
    {
      name: 'Sales Activities - OLD type column (should fail)',
      query: `sales_activities?select=type&company_id=eq.${COMPANY_ID}&limit=1`,
      shouldWork: false
    },
    {
      name: 'Sales Activities - OLD performed_by column (should fail)',
      query: `sales_activities?select=performed_by&company_id=eq.${COMPANY_ID}&limit=1`,
      shouldWork: false
    }
  ];

  for (const test of columnTests) {
    const result = await testQuery(test.query, test.name, test.shouldWork);
    results.push({ ...test, result });
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 SALES DASHBOARD VERIFICATION SUMMARY');
  console.log('='.repeat(80));

  const totalTests = results.length;
  const passedTests = results.filter(r => r.result.success === r.shouldWork).length;
  const failedTests = totalTests - passedTests;

  console.log(`🎯 RESULTS: ${passedTests}/${totalTests} tests passed`);

  if (failedTests === 0) {
    console.log('\n🎉 ALL SALES DASHBOARD QUERIES ARE WORKING!');
    console.log('✅ Column name fixes successful');
    console.log('✅ All required queries pass');
    console.log('✅ Old column names properly fail (as expected)');
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Test Sales Dashboard in browser');
    console.log('2. Verify no 400 errors in browser console');
    console.log('3. Check that all metrics display correctly');
  } else {
    console.log('\n⚠️ SOME TESTS FAILED - NEED MORE FIXES');
    console.log('\n❌ FAILING TESTS:');
    
    results.forEach((test, index) => {
      if (test.result.success !== test.shouldWork) {
        console.log(`   ${index + 1}. ${test.name}`);
        console.log(`      Expected: ${test.shouldWork ? 'SUCCESS' : 'FAILURE'}`);
        console.log(`      Actual: ${test.result.success ? 'SUCCESS' : 'FAILURE'}`);
        if (!test.result.success) {
          console.log(`      Error: ${test.result.error}`);
        }
      }
    });
  }

  console.log('\n🔧 FIXES APPLIED:');
  console.log('✅ Changed activity.subject → activity.description in SalesDashboard.js');
  console.log('✅ Confirmed activity_type column usage');
  console.log('✅ Confirmed user_id column usage');
  
  return { totalTests, passedTests, failedTests, results };
}

// Run the complete verification
verifySalesDashboardFixes().catch(console.error);
