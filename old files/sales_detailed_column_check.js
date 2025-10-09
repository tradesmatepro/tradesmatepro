// Sales Dashboard - Detailed Column Check
// Check for specific column issues that might cause 400 errors

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

async function checkSpecificColumnIssues() {
  console.log('🔍 CHECKING SPECIFIC COLUMN ISSUES IN SALES TABLES');
  console.log('='.repeat(60));

  const COMPANY_ID = 'ba643da1-c16f-468e-8fcb-f347e7929597';

  // Check specific columns that SalesDashboard.js uses
  const columnTests = [
    {
      name: 'Leads - status column',
      query: `leads?select=id,status&company_id=eq.${COMPANY_ID}&limit=1`,
      expectedColumns: ['status']
    },
    {
      name: 'Leads - source column', 
      query: `leads?select=id,source&company_id=eq.${COMPANY_ID}&limit=1`,
      expectedColumns: ['source']
    },
    {
      name: 'Opportunities - status and stage columns',
      query: `opportunities?select=id,status,stage,expected_value,actual_value&company_id=eq.${COMPANY_ID}&limit=1`,
      expectedColumns: ['status', 'stage', 'expected_value', 'actual_value']
    },
    {
      name: 'Sales Activities - activity_type column',
      query: `sales_activities?select=id,activity_type,subject,user_id&company_id=eq.${COMPANY_ID}&limit=1`,
      expectedColumns: ['activity_type', 'subject', 'user_id']
    },
    {
      name: 'Sales Activities - old column names check',
      query: `sales_activities?select=id,type,performed_by&company_id=eq.${COMPANY_ID}&limit=1`,
      expectedColumns: ['type', 'performed_by']
    }
  ];

  for (const test of columnTests) {
    const result = await testQuery(test.query, test.name);
    
    if (result.success && result.data.length > 0) {
      const actualColumns = Object.keys(result.data[0]);
      const missingColumns = test.expectedColumns.filter(col => !actualColumns.includes(col));
      
      if (missingColumns.length > 0) {
        console.log(`   ⚠️ Missing columns: ${missingColumns.join(', ')}`);
      } else {
        console.log(`   ✅ All expected columns present`);
      }
    } else if (result.success && result.data.length === 0) {
      console.log(`   ℹ️ No data to verify columns, but query syntax is valid`);
    }
  }
}

async function checkSalesDashboardSpecificQueries() {
  console.log('\n🔍 CHECKING SALESDASHBOARD.JS SPECIFIC QUERIES');
  console.log('='.repeat(60));

  const COMPANY_ID = 'ba643da1-c16f-468e-8fcb-f347e7929597';

  // Test the exact queries from SalesDashboard.js that might be causing issues
  const specificQueries = [
    {
      name: 'Leads with status filter',
      query: `leads?select=*&status=eq.qualified&company_id=eq.${COMPANY_ID}`,
      description: 'Used for qualified leads count'
    },
    {
      name: 'Opportunities with status filter',
      query: `opportunities?select=*&status=eq.open&company_id=eq.${COMPANY_ID}`,
      description: 'Used for active opportunities count'
    },
    {
      name: 'Opportunities with expected_value sum',
      query: `opportunities?select=expected_value&status=eq.open&company_id=eq.${COMPANY_ID}`,
      description: 'Used for pipeline value calculation'
    },
    {
      name: 'Sales Activities by type',
      query: `sales_activities?select=*&activity_type=eq.CALL&company_id=eq.${COMPANY_ID}`,
      description: 'Used for activity metrics'
    },
    {
      name: 'Sales Activities with user join',
      query: `sales_activities?select=*,users(full_name)&order=created_at.desc&limit=10&company_id=eq.${COMPANY_ID}`,
      description: 'Used for recent activities display'
    },
    {
      name: 'Opportunities by stage',
      query: `opportunities?select=*&stage=eq.proposal&company_id=eq.${COMPANY_ID}`,
      description: 'Used for pipeline stage breakdown'
    },
    {
      name: 'Leads by source',
      query: `leads?select=source&company_id=eq.${COMPANY_ID}`,
      description: 'Used for lead source chart'
    }
  ];

  for (const test of specificQueries) {
    const result = await testQuery(test.query, test.name);
    console.log(`   📋 Purpose: ${test.description}`);
    
    if (!result.success) {
      console.log(`   🔍 POTENTIAL ISSUE: This query fails and is used by SalesDashboard`);
    }
  }
}

async function checkForCommonSalesIssues() {
  console.log('\n🔍 CHECKING FOR COMMON SALES DASHBOARD ISSUES');
  console.log('='.repeat(60));

  // Check for issues that commonly cause 400 errors
  const commonIssues = [
    {
      name: 'Check if sales_activities uses "type" vs "activity_type"',
      queries: [
        'sales_activities?select=type&limit=1',
        'sales_activities?select=activity_type&limit=1'
      ]
    },
    {
      name: 'Check if sales_activities uses "performed_by" vs "user_id"',
      queries: [
        'sales_activities?select=performed_by&limit=1',
        'sales_activities?select=user_id&limit=1'
      ]
    },
    {
      name: 'Check opportunities expected_value vs actual_value columns',
      queries: [
        'opportunities?select=expected_value&limit=1',
        'opportunities?select=actual_value&limit=1'
      ]
    }
  ];

  for (const issue of commonIssues) {
    console.log(`\n📋 ${issue.name}:`);
    
    for (const query of issue.queries) {
      const result = await testQuery(query, `Testing ${query.split('?')[0]} column`);
      // Results will show which column names work
    }
  }
}

async function salesDetailedColumnCheck() {
  console.log('🔍 SALES DASHBOARD - DETAILED COLUMN CHECK');
  console.log('Checking for specific column issues that cause 400 errors');
  console.log('='.repeat(80));

  await checkSpecificColumnIssues();
  await checkSalesDashboardSpecificQueries();
  await checkForCommonSalesIssues();

  console.log('\n' + '='.repeat(80));
  console.log('📊 DETAILED COLUMN CHECK COMPLETE');
  console.log('='.repeat(80));
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Review any failing queries above');
  console.log('2. Check SalesDashboard.js for column name mismatches');
  console.log('3. Update queries to use correct column names');
  console.log('4. Test in browser to verify 400 errors are fixed');
}

// Run the detailed column check
salesDetailedColumnCheck().catch(console.error);
