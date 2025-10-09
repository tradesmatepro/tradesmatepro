const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://cxlqzejzraczumqmsrcx.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bHF6ZWp6cmFjenVtcW1zcmN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODk4NTQ0MywiZXhwIjoyMDc0NTYxNDQzfQ.lNQuV8WoSo7RiHeg2IKhY7xDLipYR5-39OpajF5nTOM';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkTimesheetsSchema() {
  console.log('🔍 Checking employee_timesheets schema...\n');

  // Get ALL timesheets to see unique employees
  const { data, error } = await supabase
    .from('employee_timesheets')
    .select('employee_id,employees:employee_id(id,employee_number,company_id,users(first_name,last_name,email))');

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('✅ Total timesheets:', data.length);

  // Get unique employee_ids
  const uniqueEmployeeIds = [...new Set(data.map(t => t.employee_id))];
  console.log('\n📊 Unique employee_ids in timesheets:', uniqueEmployeeIds);
  console.log('📊 Count:', uniqueEmployeeIds.length);

  // Show details for each unique employee
  console.log('\n📋 Employee details:');
  uniqueEmployeeIds.forEach(empId => {
    const timesheet = data.find(t => t.employee_id === empId);
    console.log(`\nEmployee ID: ${empId}`);
    console.log('  Employee Number:', timesheet.employees?.employee_number);
    console.log('  Name:', timesheet.employees?.users?.first_name, timesheet.employees?.users?.last_name);
    console.log('  Email:', timesheet.employees?.users?.email);
    console.log('  Company ID:', timesheet.employees?.company_id);
    console.log('  Has valid employee data?', !!timesheet.employees);
  });

  // Now check actual employees table
  console.log('\n\n🔍 Checking employees table...\n');
  const { data: employees, error: empError } = await supabase
    .from('employees')
    .select('id,employee_number,company_id,users(first_name,last_name,email)');

  if (empError) {
    console.error('❌ Error:', empError);
    return;
  }

  console.log('✅ Total employees in database:', employees.length);
  employees.forEach(emp => {
    console.log(`\nEmployee ID: ${emp.id}`);
    console.log('  Employee Number:', emp.employee_number);
    console.log('  Name:', emp.users?.first_name, emp.users?.last_name);
    console.log('  Email:', emp.users?.email);
    console.log('  Company ID:', emp.company_id);
  });
}

checkTimesheetsSchema().then(() => process.exit(0)).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

