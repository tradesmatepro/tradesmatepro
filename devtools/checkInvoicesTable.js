/**
 * CHECK INVOICES TABLE
 * 
 * Determine if we have a separate invoices table or if invoices are in work_orders
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://cxlqzejzraczumqmsrcx.supabase.co';
const SUPABASE_SERVICE_KEY = 'sb_secret_hPS1mDFURu9aQulTRNE7EQ_zczVFhxR';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function checkInvoicesTable() {
  console.log('\n🔍 CHECKING INVOICES TABLE STRUCTURE');
  console.log('='.repeat(80));
  
  try {
    // Check 1: Does invoices table exist?
    console.log('\n📋 Check 1: Invoices table...\n');
    
    const { data: invoices, error: invError } = await supabase
      .from('invoices')
      .select('*')
      .limit(5);
    
    if (invError) {
      console.log(`   ❌ Error: ${invError.message}`);
      console.log('   ℹ️  Invoices table may not exist');
    } else {
      console.log(`   ✅ Found ${invoices.length} invoices in invoices table`);
      if (invoices.length > 0) {
        console.log('\n   Sample invoice:');
        console.log(JSON.stringify(invoices[0], null, 2));
      }
    }
    
    // Check 2: Work orders with invoice status
    console.log('\n📋 Check 2: Work orders with invoice statuses...\n');
    
    const { data: invoicedWOs, error: woError } = await supabase
      .from('work_orders')
      .select('id, title, status, customer_id')
      .in('status', ['invoiced', 'paid', 'closed']);
    
    if (woError) {
      console.log(`   ❌ Error: ${woError.message}`);
    } else if (invoicedWOs) {
      console.log(`   ✅ Found ${invoicedWOs.length} work orders with invoice statuses`);

      const statusCounts = {};
      invoicedWOs.forEach(wo => {
        statusCounts[wo.status] = (statusCounts[wo.status] || 0) + 1;
      });

      console.log('\n   Status breakdown:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`      ${status}: ${count}`);
      });

      if (invoicedWOs.length > 0) {
        console.log('\n   Sample work order:');
        console.log(`      ${invoicedWOs[0].title} (${invoicedWOs[0].status})`);
      }
    }
    
    // Summary
    console.log('\n\n' + '='.repeat(80));
    console.log('📊 DIAGNOSIS');
    console.log('='.repeat(80));
    
    if (invError && !woError && invoicedWOs && invoicedWOs.length > 0) {
      console.log('\n✅ UNIFIED PIPELINE CONFIRMED');
      console.log(`   - No separate invoices table`);
      console.log(`   - ${invoicedWOs.length} work orders with invoice statuses`);
      console.log('\n🔧 FIX NEEDED:');
      console.log('   - Update Invoices.js to load from work_orders table');
      console.log('   - Query: work_orders?status=in.(invoiced,paid,closed)');
    } else if (!invError && invoices && invoices.length > 0) {
      console.log('\n⚠️  SEPARATE INVOICES TABLE EXISTS');
      console.log(`   - ${invoices.length} invoices in invoices table`);
      console.log(`   - ${invoicedWOs ? invoicedWOs.length : 0} work orders with invoice statuses`);
      console.log('\n🔧 DECISION NEEDED:');
      console.log('   - Use invoices table OR work_orders table?');
      console.log('   - Current code uses invoices table');
    } else {
      console.log('\n❌ NO INVOICE DATA FOUND');
      console.log('   - No invoices table');
      console.log('   - No work orders with invoice statuses');
    }
    
    console.log('\n' + '='.repeat(80));
    
  } catch (err) {
    console.error('\n❌ FATAL ERROR:', err);
  }
}

if (require.main === module) {
  checkInvoicesTable().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { checkInvoicesTable };

