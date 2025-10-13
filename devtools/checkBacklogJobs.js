/**
 * CHECK BACKLOG JOBS
 * 
 * Check which jobs are in the backlog and why they're not in Work Orders page
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://cxlqzejzraczumqmsrcx.supabase.co';
const SUPABASE_SERVICE_KEY = 'sb_secret_hPS1mDFURu9aQulTRNE7EQ_zczVFhxR';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function checkBacklogJobs() {
  console.log('\n🔍 CHECKING BACKLOG JOBS');
  console.log('='.repeat(80));
  
  const companyId = 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e';
  
  let unscheduled = [];
  let workOrdersPage = [];

  try {
    // Check backlog query (same as Calendar.js line 151)
    console.log('\n📋 Checking backlog query (approved/scheduled/in_progress without scheduled_start)...');
    const { data: backlogJobs, error: backlogError } = await supabase
      .from('work_orders')
      .select('id, title, status, scheduled_start, scheduled_end, customer_id')
      .eq('company_id', companyId)
      .in('status', ['approved', 'scheduled', 'in_progress']);

    if (backlogError) {
      console.log(`   ❌ Error: ${backlogError.message}`);
    } else {
      console.log(`   ✅ Found ${backlogJobs.length} jobs with status approved/scheduled/in_progress`);

      // Filter to only unscheduled (no scheduled_start)
      unscheduled = backlogJobs.filter(job => !job.scheduled_start);
      console.log(`   ✅ ${unscheduled.length} are truly unscheduled (no scheduled_start)`);

      if (unscheduled.length > 0) {
        console.log('\n   Unscheduled Jobs:');
        unscheduled.forEach((job, i) => {
          console.log(`      ${i + 1}. ${job.title} (${job.status})`);
          console.log(`         ID: ${job.id}`);
          console.log(`         scheduled_start: ${job.scheduled_start || 'NULL'}`);
        });
      }
    }
    
    // Check Work Orders page query (approved through paid)
    console.log('\n📋 Checking Work Orders page query (approved through paid)...');
    const { data: woPageData, error: woError } = await supabase
      .from('work_orders')
      .select('id, title, status')
      .eq('company_id', companyId)
      .in('status', ['approved', 'scheduled', 'in_progress', 'completed', 'invoiced', 'paid', 'on_hold', 'needs_rescheduling'])
      .order('created_at', { ascending: false });

    workOrdersPage = woPageData || [];
    
    if (woError) {
      console.log(`   ❌ Error: ${woError.message}`);
    } else {
      console.log(`   ✅ Found ${workOrdersPage.length} jobs for Work Orders page`);
      
      // Check which backlog jobs are in Work Orders page
      if (unscheduled.length > 0) {
        console.log('\n📋 Checking if backlog jobs appear in Work Orders page...');
        const backlogIds = new Set(unscheduled.map(j => j.id));
        const woPageIds = new Set(workOrdersPage.map(j => j.id));
        
        const inBoth = unscheduled.filter(j => woPageIds.has(j.id));
        const onlyInBacklog = unscheduled.filter(j => !woPageIds.has(j.id));
        
        console.log(`   ✅ ${inBoth.length} backlog jobs SHOULD appear in Work Orders page`);
        console.log(`   🔴 ${onlyInBacklog.length} backlog jobs NOT in Work Orders page`);
        
        if (onlyInBacklog.length > 0) {
          console.log('\n   Jobs in backlog but NOT in Work Orders page:');
          onlyInBacklog.forEach(job => {
            console.log(`      - ${job.title} (${job.status})`);
          });
        }
        
        if (inBoth.length > 0) {
          console.log('\n   Jobs in BOTH backlog and Work Orders page:');
          inBoth.forEach(job => {
            console.log(`      - ${job.title} (${job.status})`);
          });
        }
      }
    }
    
    // Check all statuses
    console.log('\n📋 Status breakdown of ALL work orders...');
    const { data: allJobs, error: allError } = await supabase
      .from('work_orders')
      .select('status')
      .eq('company_id', companyId);
    
    if (!allError) {
      const statusCounts = {};
      allJobs.forEach(job => {
        statusCounts[job.status] = (statusCounts[job.status] || 0) + 1;
      });
      
      console.log('\n   Status counts:');
      Object.entries(statusCounts).sort((a, b) => b[1] - a[1]).forEach(([status, count]) => {
        console.log(`      ${status}: ${count}`);
      });
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 SUMMARY');
    console.log('='.repeat(80));
    console.log(`   Total jobs in backlog sidebar: ${unscheduled?.length || 0}`);
    console.log(`   Total jobs in Work Orders page: ${workOrdersPage?.length || 0}`);
    console.log('\n' + '='.repeat(80));
    
  } catch (err) {
    console.error('\n❌ FATAL ERROR:', err);
  }
}

if (require.main === module) {
  checkBacklogJobs().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { checkBacklogJobs };

