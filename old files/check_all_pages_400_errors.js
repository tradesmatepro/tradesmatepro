// Check ALL pages for 400 errors - Full Architecture Check
// Following the complete troubleshooting guide for ALL pages

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

async function checkAllPages() {
  console.log('🌯 CHECKING ALL PAGES FOR 400 ERRORS - FULL ARCHITECTURE CHECK');
  console.log('Following the complete troubleshooting guide for ALL pages');
  console.log('='.repeat(80));

  const COMPANY_ID = 'ba643da1-c16f-468e-8fcb-f347e7929597';

  // Define all page queries that need to be checked
  const pageQueries = {
    'CUSTOMERS PAGE': [
      {
        name: 'Customers - Basic Query',
        query: `customers?select=*&company_id=eq.${COMPANY_ID}&order=created_at.desc&limit=50`
      },
      {
        name: 'Customers - With Work Orders Join',
        query: `customers?select=*,work_orders(*)&company_id=eq.${COMPANY_ID}&limit=10`
      },
      {
        name: 'Customer Stats Query',
        query: `customers?select=count&company_id=eq.${COMPANY_ID}`
      }
    ],
    
    'QUOTES PAGE': [
      {
        name: 'Quotes - From Work Orders',
        query: `work_orders?select=*&stage=eq.QUOTE&company_id=eq.${COMPANY_ID}&order=created_at.desc`
      },
      {
        name: 'Quotes - With Customer Join',
        query: `work_orders?select=*,customers(name,email,phone)&stage=eq.QUOTE&company_id=eq.${COMPANY_ID}`
      },
      {
        name: 'Quotes - Status Filter',
        query: `work_orders?select=*&stage=eq.QUOTE&quote_status=eq.SENT&company_id=eq.${COMPANY_ID}`
      },
      {
        name: 'Quote Templates (if exists)',
        query: `quote_templates?select=*&company_id=eq.${COMPANY_ID}&limit=10`
      }
    ],
    
    'INVOICES PAGE': [
      {
        name: 'Invoices - Basic Query',
        query: `invoices?select=*&company_id=eq.${COMPANY_ID}&order=created_at.desc`
      },
      {
        name: 'Invoices - With Customer Join',
        query: `invoices?select=*,customers(name,email,phone)&company_id=eq.${COMPANY_ID}`
      },
      {
        name: 'Invoices - Status Filter',
        query: `invoices?select=*&status=eq.UNPAID&company_id=eq.${COMPANY_ID}`
      },
      {
        name: 'Invoices - Revenue Sum',
        query: `invoices?select=total_amount&company_id=eq.${COMPANY_ID}`
      }
    ],
    
    'CUSTOMER DASHBOARD': [
      {
        name: 'Customer Dashboard - Customers',
        query: `customers?select=*&order=created_at.desc&limit=50&company_id=eq.${COMPANY_ID}`
      },
      {
        name: 'Customer Dashboard - Customer Messages',
        query: `customer_messages?select=*,customers(name,email)&order=created_at.desc&limit=20&company_id=eq.${COMPANY_ID}`
      },
      {
        name: 'Customer Dashboard - Service Requests',
        query: `service_requests?select=*,customers(name,email,phone)&or=(company_id.is.null,company_id.eq.${COMPANY_ID})&order=id.desc&limit=20`
      }
    ],
    
    'SALES DASHBOARD': [
      {
        name: 'Sales Dashboard - Leads',
        query: `leads?select=*&company_id=eq.${COMPANY_ID}`
      },
      {
        name: 'Sales Dashboard - Opportunities',
        query: `opportunities?select=*&company_id=eq.${COMPANY_ID}`
      },
      {
        name: 'Sales Dashboard - Sales Activities',
        query: `sales_activities?select=*,users(full_name)&order=created_at.desc&limit=10&company_id=eq.${COMPANY_ID}`
      }
    ]
  };

  const allResults = {};

  // Test each page's queries
  for (const [pageName, queries] of Object.entries(pageQueries)) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔍 CHECKING ${pageName}`);
    console.log(`${'='.repeat(60)}`);

    const pageResults = [];

    for (const queryTest of queries) {
      const result = await testQuery(queryTest.query, queryTest.name);
      pageResults.push({ ...queryTest, result });
    }

    allResults[pageName] = pageResults;

    // Page summary
    const pageTotal = pageResults.length;
    const pageSuccess = pageResults.filter(r => r.result.success).length;
    const pageFailed = pageTotal - pageSuccess;

    console.log(`\n📊 ${pageName} SUMMARY: ${pageSuccess}/${pageTotal} queries working`);
    
    if (pageFailed > 0) {
      console.log(`❌ ${pageName} HAS ${pageFailed} FAILING QUERIES - NEEDS FIXES`);
      pageResults.forEach(test => {
        if (!test.result.success) {
          console.log(`   - ${test.name}: ${test.result.error}`);
        }
      });
    } else {
      console.log(`✅ ${pageName} ALL QUERIES WORKING`);
    }
  }

  // Overall summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 ALL PAGES - COMPLETE SUMMARY');
  console.log('='.repeat(80));

  let totalQueries = 0;
  let totalSuccess = 0;
  const pageIssues = [];

  for (const [pageName, pageResults] of Object.entries(allResults)) {
    const pageTotal = pageResults.length;
    const pageSuccess = pageResults.filter(r => r.result.success).length;
    const pageFailed = pageTotal - pageSuccess;

    totalQueries += pageTotal;
    totalSuccess += pageSuccess;

    console.log(`${pageName}: ${pageSuccess}/${pageTotal} queries working`);
    
    if (pageFailed > 0) {
      pageIssues.push({
        page: pageName,
        failed: pageFailed,
        issues: pageResults.filter(r => !r.result.success)
      });
    }
  }

  console.log(`\n🎯 OVERALL: ${totalSuccess}/${totalQueries} queries working across all pages`);

  if (pageIssues.length > 0) {
    console.log('\n❌ PAGES WITH ISSUES:');
    pageIssues.forEach(page => {
      console.log(`\n🔧 ${page.page} - ${page.failed} issues:`);
      page.issues.forEach(issue => {
        console.log(`   - ${issue.name}`);
        console.log(`     Error: ${issue.result.error}`);
      });
    });

    console.log('\n🔧 NEXT STEPS:');
    console.log('1. Fix column name mismatches in failing queries');
    console.log('2. Create missing tables if needed');
    console.log('3. Update component code with correct queries');
    console.log('4. Test each page in browser');
  } else {
    console.log('\n🎉 ALL PAGES WORKING - NO 400 ERRORS EXPECTED!');
  }

  return allResults;
}

// Run the complete check
checkAllPages().catch(console.error);
