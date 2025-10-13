/**
 * Execute SQL to Create Test Work Orders
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://cxlqzejzraczumqmsrcx.supabase.co';
const SUPABASE_SERVICE_KEY = 'sb_secret_hPS1mDFURu9aQulTRNE7EQ_zczVFhxR';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestWorkOrders() {
  console.log('\n🤖 CREATING TEST WORK ORDERS VIA SUPABASE CLIENT');
  console.log('='.repeat(80));
  
  try {
    // Step 1: Get existing quotes
    console.log('\n📋 Step 1: Fetching existing quotes...');
    const { data: quotes, error: fetchError } = await supabase
      .from('work_orders')
      .select('id, title, status, customer_id')
      .in('status', ['draft', 'sent'])
      .order('created_at', { ascending: false })
      .limit(6);
    
    if (fetchError) {
      console.error('❌ Error fetching quotes:', fetchError);
      return;
    }
    
    console.log(`✅ Found ${quotes?.length || 0} quotes`);
    
    if (!quotes || quotes.length === 0) {
      console.log('⚠️  No quotes found to convert. Please create some quotes first.');
      return;
    }
    
    const updates = [];
    
    // Step 2: Convert quotes to different statuses
    if (quotes[0]) {
      console.log(`\n✅ Converting quote "${quotes[0].title}" to APPROVED...`);
      const { data, error } = await supabase
        .from('work_orders')
        .update({ status: 'approved' })
        .eq('id', quotes[0].id)
        .select();
      
      if (error) {
        console.error('❌ Error:', error);
      } else {
        console.log('✅ Success!');
        updates.push({ type: 'Approved Job', ...data[0] });
      }
    }
    
    if (quotes[1]) {
      console.log(`\n✅ Converting quote "${quotes[1].title}" to SCHEDULED...`);
      
      // Tomorrow 9 AM - 5 PM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      
      const endTime = new Date(tomorrow);
      endTime.setHours(17, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('work_orders')
        .update({ 
          status: 'scheduled',
          scheduled_start: tomorrow.toISOString(),
          scheduled_end: endTime.toISOString()
        })
        .eq('id', quotes[1].id)
        .select();
      
      if (error) {
        console.error('❌ Error:', error);
      } else {
        console.log(`✅ Success! Scheduled for ${tomorrow.toLocaleDateString()} 9:00 AM - 5:00 PM`);
        updates.push({ type: 'Scheduled Job', ...data[0] });
      }
    }
    
    if (quotes[2]) {
      console.log(`\n✅ Converting quote "${quotes[2].title}" to IN_PROGRESS...`);
      const { data, error } = await supabase
        .from('work_orders')
        .update({ status: 'in_progress' })
        .eq('id', quotes[2].id)
        .select();
      
      if (error) {
        console.error('❌ Error:', error);
      } else {
        console.log('✅ Success!');
        updates.push({ type: 'In Progress Job', ...data[0] });
      }
    }
    
    if (quotes[3]) {
      console.log(`\n✅ Converting quote "${quotes[3].title}" to COMPLETED...`);
      const { data, error } = await supabase
        .from('work_orders')
        .update({ status: 'completed' })
        .eq('id', quotes[3].id)
        .select();
      
      if (error) {
        console.error('❌ Error:', error);
      } else {
        console.log('✅ Success!');
        updates.push({ type: 'Completed Job', ...data[0] });
      }
    }
    
    if (quotes[4]) {
      console.log(`\n✅ Converting quote "${quotes[4].title}" to INVOICED...`);
      const { data, error } = await supabase
        .from('work_orders')
        .update({ status: 'invoiced' })
        .eq('id', quotes[4].id)
        .select();
      
      if (error) {
        console.error('❌ Error:', error);
      } else {
        console.log('✅ Success!');
        updates.push({ type: 'Invoiced Job', ...data[0] });
      }
    }
    
    if (quotes[5]) {
      console.log(`\n✅ Converting quote "${quotes[5].title}" to PAID...`);
      const { data, error } = await supabase
        .from('work_orders')
        .update({ status: 'paid' })
        .eq('id', quotes[5].id)
        .select();
      
      if (error) {
        console.error('❌ Error:', error);
      } else {
        console.log('✅ Success!');
        updates.push({ type: 'Paid Job', ...data[0] });
      }
    }
    
    // Step 3: Verify
    console.log('\n📊 Verifying work order statuses...');
    const { data: statusCounts, error: countError } = await supabase
      .from('work_orders')
      .select('status')
      .then(result => {
        if (result.error) return result;
        
        const counts = {};
        result.data.forEach(wo => {
          counts[wo.status] = (counts[wo.status] || 0) + 1;
        });
        
        return { data: counts, error: null };
      });
    
    console.log('\n📋 Work Order Status Breakdown:');
    Object.entries(statusCounts || {}).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });
    
    // Summary
    console.log('\n\n' + '='.repeat(80));
    console.log('📊 SUMMARY');
    console.log('='.repeat(80));
    console.log(`\n✅ Successfully created ${updates.length} test work orders:`);
    updates.forEach((update, i) => {
      console.log(`   ${i + 1}. ${update.type}: ${update.title} (${update.status})`);
    });
    
    // Save results
    fs.writeFileSync(
      'devtools/logs/test-work-orders-created.json',
      JSON.stringify({
        timestamp: new Date().toISOString(),
        created: updates,
        statusCounts: statusCounts
      }, null, 2)
    );
    
    console.log('\n📁 Results saved to: devtools/logs/test-work-orders-created.json');
    console.log('\n✅ Test data created! Now run the comprehensive test to verify.\n');
    
  } catch (err) {
    console.error('\n❌ FATAL ERROR:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  createTestWorkOrders().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { createTestWorkOrders };

