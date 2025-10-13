/**
 * TEST SCHEDULING QUERY
 * 
 * Test the exact query the calendar uses
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://cxlqzejzraczumqmsrcx.supabase.co';
const SUPABASE_SERVICE_KEY = 'sb_secret_hPS1mDFURu9aQulTRNE7EQ_zczVFhxR';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function testSchedulingQuery() {
  console.log('\n🔍 TESTING SCHEDULING QUERY');
  console.log('='.repeat(80));
  
  const companyId = 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e';
  
  try {
    // Test 1: schedule_events table
    console.log('\n📋 Test 1: schedule_events table...');
    const { data: scheduleEvents, error: seError } = await supabase
      .from('schedule_events')
      .select('*')
      .eq('company_id', companyId);
    
    if (seError) {
      console.log(`   ❌ Error: ${seError.message}`);
    } else {
      console.log(`   ✅ Found ${scheduleEvents.length} schedule events`);
    }
    
    // Test 2: work_orders with scheduled dates
    console.log('\n📋 Test 2: work_orders with scheduled dates...');
    const { data: scheduledWOs, error: woError } = await supabase
      .from('work_orders')
      .select('id, title, status, scheduled_start, scheduled_end')
      .eq('company_id', companyId)
      .not('scheduled_start', 'is', null)
      .not('scheduled_end', 'is', null);
    
    if (woError) {
      console.log(`   ❌ Error: ${woError.message}`);
    } else {
      console.log(`   ✅ Found ${scheduledWOs.length} work orders with scheduled dates`);
      if (scheduledWOs.length > 0) {
        console.log('\n   Sample:');
        scheduledWOs.slice(0, 3).forEach(wo => {
          console.log(`      - ${wo.title} (${wo.status})`);
          console.log(`        ${wo.scheduled_start} to ${wo.scheduled_end}`);
        });
      }
    }
    
    // Test 3: Check if calendar service would return events
    console.log('\n📋 Test 3: Simulating calendar service query...');
    
    // First try schedule_events
    let events = [];
    if (!seError && scheduleEvents.length > 0) {
      console.log(`   ✅ Would use schedule_events (${scheduleEvents.length} events)`);
      events = scheduleEvents;
    } else {
      console.log(`   ⚠️  No schedule_events, falling back to work_orders...`);
      if (!woError && scheduledWOs.length > 0) {
        console.log(`   ✅ Would use work_orders (${scheduledWOs.length} events)`);
        events = scheduledWOs;
      } else {
        console.log(`   ❌ No events available from either source`);
      }
    }
    
    console.log(`\n   📊 Calendar would show: ${events.length} events`);
    
    console.log('\n' + '='.repeat(80));
    
  } catch (err) {
    console.error('\n❌ FATAL ERROR:', err);
  }
}

if (require.main === module) {
  testSchedulingQuery().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { testSchedulingQuery };

