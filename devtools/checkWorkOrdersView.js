/**
 * CHECK WORK ORDERS VIEW
 * 
 * Check if work_orders_v view exists and what it returns
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://cxlqzejzraczumqmsrcx.supabase.co';
const SUPABASE_SERVICE_KEY = 'sb_secret_hPS1mDFURu9aQulTRNE7EQ_zczVFhxR';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function checkWorkOrdersView() {
  console.log('\n🔍 CHECKING WORK ORDERS VIEW');
  console.log('='.repeat(80));
  
  const companyId = 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e';
  
  try {
    // Check work_orders_v view
    console.log('\n📋 Checking work_orders_v view...');
    const { data: viewData, error: viewError } = await supabase
      .from('work_orders_v')
      .select('*')
      .eq('company_id', companyId)
      .limit(5);
    
    if (viewError) {
      console.log(`   ❌ Error: ${viewError.message}`);
      console.log(`   Code: ${viewError.code}`);
    } else {
      console.log(`   ✅ View exists and returned ${viewData.length} rows`);
      if (viewData.length > 0) {
        console.log('\n   Sample row:');
        console.log(JSON.stringify(viewData[0], null, 2));
      }
    }
    
    // Check work_orders table directly
    console.log('\n📋 Checking work_orders table...');
    const { data: tableData, error: tableError } = await supabase
      .from('work_orders')
      .select('id, title, status, company_id')
      .eq('company_id', companyId)
      .in('status', ['approved', 'scheduled', 'in_progress', 'completed', 'invoiced', 'paid', 'on_hold', 'needs_rescheduling'])
      .limit(10);
    
    if (tableError) {
      console.log(`   ❌ Error: ${tableError.message}`);
    } else {
      console.log(`   ✅ Table query returned ${tableData.length} rows`);
      if (tableData.length > 0) {
        console.log('\n   Sample rows:');
        tableData.forEach(wo => {
          console.log(`      - ${wo.title} (${wo.status})`);
        });
      }
    }
    
    // Check all work orders (no status filter)
    console.log('\n📋 Checking ALL work orders...');
    const { data: allData, error: allError } = await supabase
      .from('work_orders')
      .select('status')
      .eq('company_id', companyId);
    
    if (allError) {
      console.log(`   ❌ Error: ${allError.message}`);
    } else {
      console.log(`   ✅ Total work orders: ${allData.length}`);
      
      const statusCounts = {};
      allData.forEach(wo => {
        statusCounts[wo.status] = (statusCounts[wo.status] || 0) + 1;
      });
      
      console.log('\n   Status breakdown:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`      ${status}: ${count}`);
      });
    }
    
    console.log('\n' + '='.repeat(80));
    
  } catch (err) {
    console.error('\n❌ FATAL ERROR:', err);
  }
}

if (require.main === module) {
  checkWorkOrdersView().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { checkWorkOrdersView };

