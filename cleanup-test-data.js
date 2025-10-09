const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://cxlqzejzraczumqmsrcx.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bHF6ZWp6cmFjenVtcW1zcmN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODk4NTQ0MywiZXhwIjoyMDc0NTYxNDQzfQ.lNQuV8WoSo7RiHeg2IKhY7xDLipYR5-39OpajF5nTOM';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const COMPANY_ID = 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e';

async function cleanupTestData() {
  console.log('🧹 CLEANING UP TEST DATA\n');
  console.log('=' .repeat(80));
  
  // 1. Show BEFORE state
  console.log('\n📊 BEFORE CLEANUP:');
  console.log('-'.repeat(80));
  
  const { data: beforeEmployees } = await supabase
    .from('employees')
    .select('id,employee_number')
    .eq('company_id', COMPANY_ID);
  
  const { data: beforeTimesheets } = await supabase
    .from('employee_timesheets')
    .select('id,employee_id');
  
  const testEmployees = beforeEmployees?.filter(e => e.employee_number?.includes('TEST')) || [];
  const testEmployeeIds = testEmployees.map(e => e.id);
  const testTimesheets = beforeTimesheets?.filter(t => testEmployeeIds.includes(t.employee_id)) || [];
  
  console.log(`Total employees: ${beforeEmployees?.length || 0}`);
  console.log(`Test employees: ${testEmployees.length}`);
  testEmployees.forEach(e => console.log(`  - ${e.employee_number} (${e.id})`));
  
  console.log(`\nTotal timesheets: ${beforeTimesheets?.length || 0}`);
  console.log(`Test timesheets: ${testTimesheets.length}`);
  
  // 2. Delete test timesheets FIRST (foreign key constraint)
  console.log('\n\n🗑️  STEP 1: Deleting test timesheets...');
  console.log('-'.repeat(80));
  
  if (testEmployeeIds.length > 0) {
    const { data: deletedTimesheets, error: tsError } = await supabase
      .from('employee_timesheets')
      .delete()
      .in('employee_id', testEmployeeIds)
      .select();
    
    if (tsError) {
      console.error('❌ Error deleting timesheets:', tsError);
    } else {
      console.log(`✅ Deleted ${deletedTimesheets?.length || 0} test timesheets`);
    }
  } else {
    console.log('⚠️  No test employees found, skipping timesheet deletion');
  }
  
  // 3. Delete test employees
  console.log('\n🗑️  STEP 2: Deleting test employees...');
  console.log('-'.repeat(80));
  
  const { data: deletedEmployees, error: empError } = await supabase
    .from('employees')
    .delete()
    .like('employee_number', '%TEST%')
    .eq('company_id', COMPANY_ID)
    .select();
  
  if (empError) {
    console.error('❌ Error deleting employees:', empError);
  } else {
    console.log(`✅ Deleted ${deletedEmployees?.length || 0} test employees`);
    deletedEmployees?.forEach(e => console.log(`  - ${e.employee_number}`));
  }
  
  // 4. Show AFTER state
  console.log('\n\n📊 AFTER CLEANUP:');
  console.log('-'.repeat(80));
  
  const { data: afterEmployees } = await supabase
    .from('employees')
    .select('id,employee_number,user_id,is_schedulable')
    .eq('company_id', COMPANY_ID);
  
  const { data: afterTimesheets } = await supabase
    .from('employee_timesheets')
    .select('id,employee_id');
  
  const uniqueTimesheetEmployees = [...new Set(afterTimesheets?.map(t => t.employee_id) || [])];
  
  console.log(`Total employees: ${afterEmployees?.length || 0}`);
  afterEmployees?.forEach(e => console.log(`  - ${e.employee_number} (schedulable: ${e.is_schedulable})`));
  
  console.log(`\nTotal timesheets: ${afterTimesheets?.length || 0}`);
  console.log(`Unique employees with timesheets: ${uniqueTimesheetEmployees.length}`);
  
  // 5. Verify users table
  console.log('\n\n📊 USERS TABLE (What Employees Page Shows):');
  console.log('-'.repeat(80));
  
  const { data: users } = await supabase
    .from('users')
    .select('id,name,email,role,status')
    .eq('company_id', COMPANY_ID);
  
  console.log(`Total users: ${users?.length || 0}`);
  users?.forEach(u => console.log(`  - ${u.name} (${u.email}) - ${u.role} - ${u.status}`));
  
  // 6. Summary
  console.log('\n\n✅ CLEANUP COMPLETE!');
  console.log('='.repeat(80));
  console.log(`Deleted: ${deletedTimesheets?.length || 0} timesheets, ${deletedEmployees?.length || 0} employees`);
  console.log(`Remaining: ${afterEmployees?.length || 0} employees, ${afterTimesheets?.length || 0} timesheets`);
  console.log(`\nExpected Results:`);
  console.log(`  - Employees Page: Should show ${users?.length || 0} employees`);
  console.log(`  - Timesheets Page: Should show ${uniqueTimesheetEmployees.length} employees with timesheets`);
  console.log(`\n🎯 Both pages should now be consistent!`);
}

cleanupTestData().then(() => process.exit(0)).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

