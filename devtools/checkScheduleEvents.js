/**
 * CHECK SCHEDULE EVENTS
 * 
 * Check what's in schedule_events table causing the layout issue
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://cxlqzejzraczumqmsrcx.supabase.co';
const SUPABASE_SERVICE_KEY = 'sb_secret_hPS1mDFURu9aQulTRNE7EQ_zczVFhxR';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function checkScheduleEvents() {
  console.log('\n🔍 CHECKING SCHEDULE EVENTS');
  console.log('='.repeat(80));
  
  const companyId = 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e';
  
  try {
    // Check schedule_events
    console.log('\n📋 Checking schedule_events table...');
    const { data: scheduleEvents, error: seError } = await supabase
      .from('schedule_events')
      .select('*')
      .eq('company_id', companyId)
      .order('start_time', { ascending: true });
    
    if (seError) {
      console.log(`   ❌ Error: ${seError.message}`);
    } else {
      console.log(`   ✅ Found ${scheduleEvents.length} schedule events`);
      
      if (scheduleEvents.length > 0) {
        console.log('\n   Events:');
        scheduleEvents.forEach((evt, i) => {
          console.log(`      ${i + 1}. ${evt.title || 'Untitled'}`);
          console.log(`         Work Order ID: ${evt.work_order_id}`);
          console.log(`         Employee ID: ${evt.employee_id}`);
          console.log(`         Start: ${evt.start_time}`);
          console.log(`         End: ${evt.end_time}`);
          console.log('');
        });
      }
    }
    
    // Check work_orders with scheduled dates
    console.log('\n📋 Checking work_orders with scheduled dates...');
    const { data: workOrders, error: woError } = await supabase
      .from('work_orders')
      .select('id, title, status, scheduled_start, scheduled_end')
      .eq('company_id', companyId)
      .not('scheduled_start', 'is', null);
    
    if (woError) {
      console.log(`   ❌ Error: ${woError.message}`);
    } else {
      console.log(`   ✅ Found ${workOrders.length} work orders with scheduled dates`);
      
      if (workOrders.length > 0) {
        console.log('\n   Work Orders:');
        workOrders.forEach((wo, i) => {
          console.log(`      ${i + 1}. ${wo.title || 'Untitled'} (${wo.status})`);
          console.log(`         ID: ${wo.id}`);
          console.log(`         Start: ${wo.scheduled_start}`);
          console.log(`         End: ${wo.scheduled_end}`);
          console.log('');
        });
      }
    }
    
    // Check for duplicates (same work_order_id in both)
    if (scheduleEvents.length > 0 && workOrders.length > 0) {
      console.log('\n📋 Checking for duplicates...');
      const seWorkOrderIds = new Set(scheduleEvents.map(e => e.work_order_id).filter(Boolean));
      const woIds = new Set(workOrders.map(w => w.id));
      
      const duplicates = [...seWorkOrderIds].filter(id => woIds.has(id));
      
      if (duplicates.length > 0) {
        console.log(`   🔴 Found ${duplicates.length} work orders in BOTH schedule_events AND work_orders.scheduled_start!`);
        console.log('   This causes duplicate calendar entries!');
        console.log('\n   Duplicate Work Order IDs:');
        duplicates.forEach(id => {
          const se = scheduleEvents.find(e => e.work_order_id === id);
          const wo = workOrders.find(w => w.id === id);
          console.log(`      - ${wo.title}`);
          console.log(`        schedule_events: ${se.start_time} to ${se.end_time}`);
          console.log(`        work_orders: ${wo.scheduled_start} to ${wo.scheduled_end}`);
        });
      } else {
        console.log(`   ✅ No duplicates found`);
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 SUMMARY');
    console.log('='.repeat(80));
    console.log(`   schedule_events: ${scheduleEvents?.length || 0}`);
    console.log(`   work_orders with scheduled dates: ${workOrders?.length || 0}`);
    console.log(`   Total calendar events: ${(scheduleEvents?.length || 0) + (workOrders?.length || 0)}`);
    console.log('\n' + '='.repeat(80));
    
  } catch (err) {
    console.error('\n❌ FATAL ERROR:', err);
  }
}

if (require.main === module) {
  checkScheduleEvents().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { checkScheduleEvents };

