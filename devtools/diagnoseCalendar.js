/**
 * DIAGNOSE CALENDAR ISSUE
 * 
 * Check why calendar shows no events
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://cxlqzejzraczumqmsrcx.supabase.co';
const SUPABASE_SERVICE_KEY = 'sb_secret_hPS1mDFURu9aQulTRNE7EQ_zczVFhxR';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function diagnoseCalendar() {
  console.log('\n🔍 DIAGNOSING CALENDAR ISSUE');
  console.log('='.repeat(80));
  
  try {
    // Check 1: Do we have scheduled work orders?
    console.log('\n📋 Check 1: Work orders with scheduled dates...\n');
    
    const { data: scheduledWOs, error: woError } = await supabase
      .from('work_orders')
      .select('id, title, status, scheduled_start, scheduled_end, company_id')
      .not('scheduled_start', 'is', null)
      .not('scheduled_end', 'is', null);
    
    if (woError) {
      console.log('   ❌ Error:', woError.message);
    } else {
      console.log(`   ✅ Found ${scheduledWOs.length} work orders with scheduled dates`);
      scheduledWOs.forEach(wo => {
        console.log(`      - ${wo.title} (${wo.status})`);
        console.log(`        Start: ${wo.scheduled_start}`);
        console.log(`        End: ${wo.scheduled_end}`);
        console.log(`        Company: ${wo.company_id}`);
      });
    }
    
    // Check 2: Do we have schedule_events?
    console.log('\n📋 Check 2: Schedule events table...\n');
    
    const { data: scheduleEvents, error: seError } = await supabase
      .from('schedule_events')
      .select('*')
      .limit(10);
    
    if (seError) {
      console.log(`   ❌ Error: ${seError.message}`);
      console.log('   ℹ️  schedule_events table may not exist or has no data');
    } else {
      console.log(`   ✅ Found ${scheduleEvents.length} schedule events`);
      scheduleEvents.forEach(event => {
        console.log(`      - ${event.title || 'Untitled'}`);
        console.log(`        Start: ${event.start_time}`);
        console.log(`        End: ${event.end_time}`);
      });
    }
    
    // Check 3: What statuses do we have?
    console.log('\n📋 Check 3: Work order statuses...\n');
    
    const { data: allWOs, error: allError } = await supabase
      .from('work_orders')
      .select('status');
    
    if (!allError) {
      const statusCounts = {};
      allWOs.forEach(wo => {
        statusCounts[wo.status] = (statusCounts[wo.status] || 0) + 1;
      });
      
      console.log('   Status breakdown:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`      ${status}: ${count}`);
      });
    }
    
    // Check 4: Test the exact query the calendar uses
    console.log('\n📋 Check 4: Testing calendar query...\n');
    
    const { data: calendarWOs, error: calError } = await supabase
      .from('work_orders')
      .select('*')
      .not('scheduled_start', 'is', null)
      .not('scheduled_end', 'is', null)
      .order('scheduled_start', { ascending: true });
    
    if (calError) {
      console.log('   ❌ Error:', calError.message);
    } else {
      console.log(`   ✅ Calendar query would return ${calendarWOs.length} events`);
      
      if (calendarWOs.length > 0) {
        console.log('\n   Sample events:');
        calendarWOs.slice(0, 3).forEach(wo => {
          console.log(`      - ${wo.title}`);
          console.log(`        Status: ${wo.status}`);
          console.log(`        Start: ${wo.scheduled_start}`);
          console.log(`        End: ${wo.scheduled_end}`);
        });
      }
    }
    
    // Summary
    console.log('\n\n' + '='.repeat(80));
    console.log('📊 DIAGNOSIS SUMMARY');
    console.log('='.repeat(80));
    
    if (scheduledWOs && scheduledWOs.length > 0) {
      console.log(`\n✅ ${scheduledWOs.length} work orders have scheduled dates`);
      console.log('✅ Calendar should be showing events');
      console.log('\n🔧 LIKELY ISSUE: App needs to be restarted to pick up changes');
      console.log('   OR: Frontend is filtering out the events');
    } else {
      console.log('\n❌ No work orders have scheduled dates');
      console.log('🔧 FIX: Need to add scheduled_start/scheduled_end to work orders');
    }
    
    if (seError) {
      console.log('\n⚠️  schedule_events table not accessible');
      console.log('   Calendar will fall back to work_orders table');
    }
    
    console.log('\n' + '='.repeat(80));
    
  } catch (err) {
    console.error('\n❌ FATAL ERROR:', err);
  }
}

if (require.main === module) {
  diagnoseCalendar().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { diagnoseCalendar };

