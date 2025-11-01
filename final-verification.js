/**
 * Final verification that all fixes are working
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function finalVerification() {
  try {
    console.log('🔍 FINAL VERIFICATION - ALL FIXES\n');
    console.log('='.repeat(60) + '\n');

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    // Get a company_id
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('company_id')
      .limit(1);

    if (empError || !employees || employees.length === 0) {
      console.log('❌ No employees found in database');
      return;
    }

    const company_id = employees[0].company_id;
    console.log(`Testing with company_id: ${company_id}\n`);

    // Test 1: RPC function exists and is callable
    console.log('1️⃣  Testing RPC function: get_schedulable_employees');
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_schedulable_employees', {
      p_company_id: company_id
    });

    if (rpcError) {
      console.log('   ❌ RPC Error:', rpcError.message);
      console.log('   Details:', rpcError.details);
    } else {
      console.log('   ✅ RPC Success!');
      console.log(`   Returned ${rpcData.length} employees\n`);
      
      if (rpcData.length > 0) {
        console.log('   Sample employee data:');
        const emp = rpcData[0];
        console.log(`   - ID: ${emp.id}`);
        console.log(`   - Full Name: ${emp.full_name}`);
        console.log(`   - Email: ${emp.email}`);
        console.log(`   - Role: ${emp.role} (type: ${typeof emp.role})`);
        console.log(`   - Status: ${emp.status} (type: ${typeof emp.status})`);
        console.log(`   - Job Title: ${emp.job_title}`);
        console.log(`   - Schedulable: ${emp.is_schedulable}\n`);
      }
    }

    // Test 2: Verify data structure
    console.log('2️⃣  Verifying RPC data structure');
    if (rpcData && rpcData.length > 0) {
      const emp = rpcData[0];
      const requiredFields = [
        'id', 'user_id', 'employee_id', 'full_name', 'first_name', 
        'last_name', 'email', 'role', 'status', 'job_title', 'is_schedulable'
      ];
      
      let allFieldsPresent = true;
      requiredFields.forEach(field => {
        const hasField = field in emp;
        const status = hasField ? '✅' : '❌';
        console.log(`   ${status} ${field}: ${emp[field]}`);
        if (!hasField) allFieldsPresent = false;
      });
      
      if (allFieldsPresent) {
        console.log('\n   ✅ All required fields present!\n');
      } else {
        console.log('\n   ❌ Some fields missing!\n');
      }
    }

    // Test 3: Verify type casting
    console.log('3️⃣  Verifying type casting');
    if (rpcData && rpcData.length > 0) {
      const emp = rpcData[0];
      const roleIsText = typeof emp.role === 'string';
      const statusIsText = typeof emp.status === 'string';
      
      console.log(`   ${roleIsText ? '✅' : '❌'} role is TEXT (${typeof emp.role})`);
      console.log(`   ${statusIsText ? '✅' : '❌'} status is TEXT (${typeof emp.status})`);
      
      if (roleIsText && statusIsText) {
        console.log('\n   ✅ Type casting working correctly!\n');
      } else {
        console.log('\n   ❌ Type casting issue detected!\n');
      }
    }

    // Summary
    console.log('='.repeat(60));
    console.log('\n✅ VERIFICATION COMPLETE\n');
    console.log('Next steps:');
    console.log('1. Clear browser cache (Ctrl+Shift+Delete)');
    console.log('2. Refresh the page (F5)');
    console.log('3. Navigate to Scheduling/Calendar/Jobs pages');
    console.log('4. Verify employees now appear in the UI\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

finalVerification();

