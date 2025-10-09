const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://cxlqzejzraczumqmsrcx.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bHF6ZWp6cmFjenVtcW1zcmN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODk4NTQ0MywiZXhwIjoyMDc0NTYxNDQzfQ.lNQuV8WoSo7RiHeg2IKhY7xDLipYR5-39OpajF5nTOM';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const COMPANY_ID = 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e';

async function investigateUsersVsEmployees() {
  console.log('🔍 USERS vs EMPLOYEES TABLE INVESTIGATION\n');
  console.log('=' .repeat(80));
  
  // 1. Check USERS table (what Employees page queries)
  console.log('\n📋 STEP 1: USERS TABLE (What Employees Page Sees)');
  console.log('-'.repeat(80));
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id,name,email,role,status,employee_number,created_at')
    .eq('company_id', COMPANY_ID)
    .order('created_at', { ascending: false });
  
  if (usersError) {
    console.error('❌ Error:', usersError);
  } else {
    console.log(`Total users: ${users.length}\n`);
    users.forEach((user, idx) => {
      console.log(`${idx + 1}. ${user.name || 'NO NAME'} (${user.email})`);
      console.log(`   Employee Number: ${user.employee_number || 'NONE'}`);
      console.log(`   Role: ${user.role || 'NO ROLE'}`);
      console.log(`   Status: ${user.status || 'NO STATUS'}`);
      console.log(`   Created: ${user.created_at}`);
      console.log(`   ID: ${user.id}`);
      console.log('');
    });
  }
  
  // 2. Check EMPLOYEES table (separate table)
  console.log('\n📋 STEP 2: EMPLOYEES TABLE (Separate Table)');
  console.log('-'.repeat(80));
  const { data: employees, error: empError } = await supabase
    .from('employees')
    .select('id,employee_number,user_id,is_schedulable,created_at')
    .eq('company_id', COMPANY_ID)
    .order('created_at', { ascending: false });
  
  if (empError) {
    console.error('❌ Error:', empError);
  } else {
    console.log(`Total employees: ${employees.length}\n`);
    employees.forEach((emp, idx) => {
      console.log(`${idx + 1}. Employee Number: ${emp.employee_number}`);
      console.log(`   User ID: ${emp.user_id || 'NO USER_ID'}`);
      console.log(`   Schedulable: ${emp.is_schedulable}`);
      console.log(`   Created: ${emp.created_at}`);
      console.log(`   ID: ${emp.id}`);
      console.log('');
    });
  }
  
  // 3. Check TIMESHEETS (what references employees)
  console.log('\n📋 STEP 3: TIMESHEETS (What References Employees)');
  console.log('-'.repeat(80));
  const { data: timesheets, error: tsError } = await supabase
    .from('employee_timesheets')
    .select('employee_id');
  
  if (tsError) {
    console.error('❌ Error:', tsError);
  } else {
    const uniqueEmployeeIds = [...new Set(timesheets.map(t => t.employee_id))];
    console.log(`Unique employee_ids in timesheets: ${uniqueEmployeeIds.length}\n`);
    uniqueEmployeeIds.forEach((empId, idx) => {
      const count = timesheets.filter(t => t.employee_id === empId).length;
      console.log(`${idx + 1}. Employee ID: ${empId}`);
      console.log(`   Timesheet count: ${count}`);
      
      // Check if this employee_id exists in employees table
      const empExists = employees?.find(e => e.id === empId);
      console.log(`   Exists in employees table: ${empExists ? 'YES' : 'NO'}`);
      if (empExists) {
        console.log(`   Employee Number: ${empExists.employee_number}`);
      }
      
      // Check if this employee_id exists in users table
      const userExists = users?.find(u => u.id === empId);
      console.log(`   Exists in users table: ${userExists ? 'YES' : 'NO'}`);
      if (userExists) {
        console.log(`   User Name: ${userExists.name}`);
      }
      console.log('');
    });
  }
  
  // 4. ANALYSIS
  console.log('\n📊 STEP 4: DATA ARCHITECTURE ANALYSIS');
  console.log('-'.repeat(80));
  
  console.log('\n🏗️  ARCHITECTURE:');
  console.log('   - Employees Page queries: USERS table');
  console.log('   - Timesheets reference: EMPLOYEES table (via employee_id FK)');
  console.log('   - These are TWO DIFFERENT TABLES!');
  
  console.log('\n📊 COUNTS:');
  console.log(`   - Users table: ${users?.length || 0} records`);
  console.log(`   - Employees table: ${employees?.length || 0} records`);
  console.log(`   - Timesheets reference: ${[...new Set(timesheets?.map(t => t.employee_id) || [])].length} unique employees`);
  
  // Check for mismatches
  console.log('\n⚠️  MISMATCHES:');
  
  // Users with employee_number but no employees record
  const usersWithEmpNumber = users?.filter(u => u.employee_number) || [];
  console.log(`\n1. Users with employee_number: ${usersWithEmpNumber.length}`);
  usersWithEmpNumber.forEach(u => {
    const hasEmpRecord = employees?.find(e => e.user_id === u.id);
    console.log(`   - ${u.name} (${u.employee_number}): ${hasEmpRecord ? '✅ Has employees record' : '❌ NO employees record'}`);
  });
  
  // Employees without matching user
  console.log(`\n2. Employees records: ${employees?.length || 0}`);
  employees?.forEach(e => {
    const hasUser = users?.find(u => u.id === e.user_id);
    console.log(`   - ${e.employee_number}: ${hasUser ? `✅ User: ${hasUser.name}` : '❌ NO matching user'}`);
  });
  
  // Timesheets referencing employees that don't exist
  const uniqueTimesheetEmpIds = [...new Set(timesheets?.map(t => t.employee_id) || [])];
  console.log(`\n3. Timesheets reference ${uniqueTimesheetEmpIds.length} unique employee_ids:`);
  uniqueTimesheetEmpIds.forEach(empId => {
    const empExists = employees?.find(e => e.id === empId);
    const userExists = users?.find(u => u.id === empId);
    console.log(`   - ${empId}:`);
    console.log(`     Employees table: ${empExists ? `✅ ${empExists.employee_number}` : '❌ NOT FOUND'}`);
    console.log(`     Users table: ${userExists ? `✅ ${userExists.name}` : '❌ NOT FOUND'}`);
  });
  
  // 5. RECOMMENDATIONS
  console.log('\n\n💡 RECOMMENDATIONS');
  console.log('='.repeat(80));
  
  console.log('\n🎯 THE PROBLEM:');
  console.log('   Employees Page shows users from USERS table');
  console.log('   Timesheets Page counts employees from EMPLOYEES table');
  console.log('   These are DIFFERENT tables with DIFFERENT data!');
  
  console.log('\n✅ THE FIX:');
  console.log('   Option A: Make Employees Page query EMPLOYEES table (not USERS)');
  console.log('   Option B: Make Timesheets reference USERS table (not EMPLOYEES)');
  console.log('   Option C: Sync the two tables (ensure every user has an employees record)');
  
  console.log('\n🔧 IMMEDIATE ACTION:');
  console.log('   1. Delete test employees from EMPLOYEES table');
  console.log('   2. Delete their timesheets');
  console.log('   3. Decide on single source of truth (users vs employees)');
}

investigateUsersVsEmployees().then(() => process.exit(0)).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

