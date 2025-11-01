/**
 * Test RPC directly with Supabase client
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testRPC() {
  try {
    console.log('🔍 TESTING RPC WITH SUPABASE CLIENT\n');

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    // Get a company_id
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('company_id')
      .limit(1);

    if (empError) {
      console.log('❌ Error getting company_id:', empError);
      return;
    }

    if (!employees || employees.length === 0) {
      console.log('❌ No employees found');
      return;
    }

    const company_id = employees[0].company_id;
    console.log(`Testing with company_id: ${company_id}\n`);

    // Call RPC
    console.log('Calling get_schedulable_employees RPC...');
    const { data, error } = await supabase.rpc('get_schedulable_employees', {
      p_company_id: company_id
    });

    if (error) {
      console.log('❌ RPC Error:', error);
      console.log('   Code:', error.code);
      console.log('   Message:', error.message);
      console.log('   Details:', error.details);
    } else {
      console.log('✅ RPC Success!');
      console.log(`   Returned ${data.length} employees\n`);
      
      if (data.length > 0) {
        console.log('First employee:');
        console.log(JSON.stringify(data[0], null, 2));
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testRPC();

