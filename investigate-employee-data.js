const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://cxlqzejzraczumqmsrcx.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bHF6ZWp6cmFjenVtcW1zcmN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODk4NTQ0MywiZXhwIjoyMDc0NTYxNDQzfQ.lNQuV8WoSo7RiHeg2IKhY7xDLipYR5-39OpajF5nTOM';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const COMPANY_ID = 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e';

async function investigateEmployeeData() {
  console.log('🔍 EMPLOYEE DATA INVESTIGATION\n');
  console.log('=' .repeat(80));
  
  // 1. Check employees table
  console.log('\n📋 STEP 1: ALL EMPLOYEES IN DATABASE');
  console.log('-'.repeat(80));
  const { data: allEmployees, error: empError } = await supabase
    .from('employees')
    .select('*,users(first_name,last_name,email)')
    .eq('company_id', COMPANY_ID);
  
  if (empError) {
    console.error('❌ Error:', empError);
    return;
  }
  
  console.log(`Total employees: ${allEmployees.length}\n`);
  allEmployees.forEach((emp, idx) => {
    console.log(`${idx + 1}. ${emp.employee_number} - ${emp.users?.first_name} ${emp.users?.last_name}`);
    console.log(`   Email: ${emp.users?.email}`);
    console.log(`   Status: ${emp.status || 'NO STATUS FIELD'}`);
    console.log(`   Role: ${emp.role || 'NO ROLE FIELD'}`);
    console.log(`   Schedulable: ${emp.is_schedulable !== undefined ? emp.is_schedulable : 'NO FIELD'}`);
    console.log(`   Created: ${emp.created_at}`);
    console.log(`   ID: ${emp.id}`);
    console.log('');
  });
  
  // 2. Check what the Employees page query would return
  console.log('\n📋 STEP 2: WHAT EMPLOYEES PAGE SEES (Active only)');
  console.log('-'.repeat(80));
  const activeEmployees = allEmployees.filter(emp => emp.status === 'active');
  console.log(`Active employees: ${activeEmployees.length}\n`);
  activeEmployees.forEach((emp, idx) => {
    console.log(`${idx + 1}. ${emp.employee_number} - ${emp.users?.first_name} ${emp.users?.last_name}`);
    console.log(`   Email: ${emp.users?.email}`);
    console.log('');
  });
  
  // 3. Check timesheets
  console.log('\n📋 STEP 3: EMPLOYEES WITH TIMESHEETS');
  console.log('-'.repeat(80));
  const { data: timesheets, error: tsError } = await supabase
    .from('employee_timesheets')
    .select('employee_id,employees:employee_id(id,employee_number,status,users(first_name,last_name,email))');
  
  if (tsError) {
    console.error('❌ Error:', tsError);
    return;
  }
  
  const uniqueEmployeeIds = [...new Set(timesheets.map(t => t.employee_id))];
  console.log(`Unique employees with timesheets: ${uniqueEmployeeIds.length}\n`);
  
  uniqueEmployeeIds.forEach((empId, idx) => {
    const ts = timesheets.find(t => t.employee_id === empId);
    const emp = ts.employees;
    console.log(`${idx + 1}. ${emp?.employee_number} - ${emp?.users?.first_name} ${emp?.users?.last_name}`);
    console.log(`   Email: ${emp?.users?.email}`);
    console.log(`   Status: ${emp?.status || 'NO STATUS'}`);
    console.log(`   ID: ${empId}`);
    console.log(`   Timesheet count: ${timesheets.filter(t => t.employee_id === empId).length}`);
    console.log('');
  });
  
  // 4. Analysis
  console.log('\n📊 STEP 4: DATA INTEGRITY ANALYSIS');
  console.log('-'.repeat(80));
  
  // Check for test employees
  const testEmployees = allEmployees.filter(emp => emp.employee_number?.includes('TEST'));
  console.log(`\n❌ TEST/MOCK EMPLOYEES: ${testEmployees.length}`);
  testEmployees.forEach(emp => {
    console.log(`   - ${emp.employee_number} (${emp.users?.email})`);
  });
  
  // Check for employees without status
  const noStatus = allEmployees.filter(emp => !emp.status);
  console.log(`\n⚠️  EMPLOYEES WITHOUT STATUS: ${noStatus.length}`);
  noStatus.forEach(emp => {
    console.log(`   - ${emp.employee_number} (${emp.users?.email})`);
  });
  
  // Check for duplicate emails
  const emails = allEmployees.map(emp => emp.users?.email);
  const duplicateEmails = emails.filter((email, idx) => emails.indexOf(email) !== idx);
  console.log(`\n⚠️  DUPLICATE EMAILS: ${[...new Set(duplicateEmails)].length}`);
  [...new Set(duplicateEmails)].forEach(email => {
    const count = emails.filter(e => e === email).length;
    console.log(`   - ${email} (${count} employees)`);
  });
  
  // Check for orphaned timesheets
  const timesheetEmployeeIds = uniqueEmployeeIds;
  const actualEmployeeIds = allEmployees.map(emp => emp.id);
  const orphanedTimesheets = timesheetEmployeeIds.filter(id => !actualEmployeeIds.includes(id));
  console.log(`\n⚠️  ORPHANED TIMESHEETS (employee doesn't exist): ${orphanedTimesheets.length}`);
  orphanedTimesheets.forEach(id => {
    console.log(`   - Employee ID: ${id}`);
  });
  
  // 5. Recommendations
  console.log('\n\n💡 RECOMMENDATIONS');
  console.log('='.repeat(80));
  
  if (testEmployees.length > 0) {
    console.log('\n1. ❌ DELETE TEST EMPLOYEES:');
    console.log('   You have test/mock employees that should be removed.');
    console.log('   SQL: DELETE FROM employees WHERE employee_number LIKE \'%TEST%\';');
    console.log('   SQL: DELETE FROM employee_timesheets WHERE employee_id IN (');
    console.log('        SELECT id FROM employees WHERE employee_number LIKE \'%TEST%\');');
  }
  
  if (noStatus.length > 0) {
    console.log('\n2. ⚠️  FIX MISSING STATUS:');
    console.log('   Some employees don\'t have a status field.');
    console.log('   SQL: UPDATE employees SET status = \'active\' WHERE status IS NULL;');
  }
  
  if (duplicateEmails.length > 0) {
    console.log('\n3. ⚠️  RESOLVE DUPLICATE EMAILS:');
    console.log('   Multiple employee records share the same email.');
    console.log('   This suggests test data or data entry errors.');
  }
  
  console.log('\n4. ✅ REAL EMPLOYEES (Best guess):');
  const realEmployees = allEmployees.filter(emp => 
    !emp.employee_number?.includes('TEST') && 
    emp.status === 'active'
  );
  console.log(`   Count: ${realEmployees.length}`);
  realEmployees.forEach(emp => {
    console.log(`   - ${emp.employee_number}: ${emp.users?.first_name} ${emp.users?.last_name} (${emp.users?.email})`);
  });
  
  console.log('\n\n🎯 CONCLUSION:');
  console.log('='.repeat(80));
  console.log(`Database has: ${allEmployees.length} total employees`);
  console.log(`Active employees: ${activeEmployees.length}`);
  console.log(`Test employees: ${testEmployees.length}`);
  console.log(`Real employees: ${realEmployees.length}`);
  console.log(`Employees with timesheets: ${uniqueEmployeeIds.length}`);
  console.log('\nThe discrepancy is caused by:');
  console.log('  - Employees page filters by status=\'active\'');
  console.log('  - Timesheets page counts ALL employees with timesheets (including test data)');
  console.log('  - Test/mock data polluting the database');
}

investigateEmployeeData().then(() => process.exit(0)).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

