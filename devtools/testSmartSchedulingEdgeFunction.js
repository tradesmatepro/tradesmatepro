/**
 * TEST SMART SCHEDULING EDGE FUNCTION
 * 
 * Tests the smart-scheduling edge function for customer self-scheduling
 */

const SUPABASE_URL = 'https://cxlqzejzraczumqmsrcx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bHF6ZWp6cmFjenVtcW1zcmN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5ODU0NDMsImV4cCI6MjA3NDU2MTQ0M30.zoD59re6xxW9Z6HOexR0qwWwTBU29MvjwP_y8qwBkkg';

async function testSmartScheduling() {
  console.log('\n🧪 TESTING SMART SCHEDULING EDGE FUNCTION');
  console.log('='.repeat(80));

  try {
    // First, get a company ID and employees
    console.log('\n📋 Step 1: Getting company and employees...');
    
    const companiesResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/companies?select=id&limit=1`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      }
    );

    if (!companiesResponse.ok) {
      const errorText = await companiesResponse.text();
      throw new Error(`Failed to get companies: ${errorText}`);
    }

    const companies = await companiesResponse.json();
    console.log('Companies response:', companies);

    if (!companies || companies.length === 0 || !companies[0]) {
      throw new Error('No companies found');
    }

    const companyId = companies[0].id;
    console.log(`✅ Company ID: ${companyId}`);

    // Get employees for this company
    const employeesResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/employees?company_id=eq.${companyId}&select=id`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      }
    );

    if (!employeesResponse.ok) {
      const errorText = await employeesResponse.text();
      throw new Error(`Failed to get employees: ${errorText}`);
    }

    const employees = await employeesResponse.json();
    console.log('Employees response:', employees);

    if (!employees || employees.length === 0) {
      throw new Error('No employees found for this company');
    }

    const employeeIds = employees.map(e => e.id);
    console.log(`✅ Found ${employeeIds.length} employees`);

    // Test the smart scheduling edge function
    console.log('\n📋 Step 2: Calling smart-scheduling edge function...');
    
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 14); // Next 2 weeks

    const requestBody = {
      employeeIds,
      durationMinutes: 120, // 2 hours
      companyId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };

    console.log('Request:', JSON.stringify(requestBody, null, 2));

    const schedulingResponse = await fetch(
      `${SUPABASE_URL}/functions/v1/smart-scheduling`,
      {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
    );

    console.log(`\nResponse status: ${schedulingResponse.status}`);

    if (!schedulingResponse.ok) {
      const errorText = await schedulingResponse.text();
      console.error('❌ Error response:', errorText);
      throw new Error(`Edge function returned ${schedulingResponse.status}`);
    }

    const result = await schedulingResponse.json();
    
    console.log('\n✅ SUCCESS! Edge function returned:');
    console.log(JSON.stringify(result, null, 2));

    // Count total available slots
    let totalSlots = 0;
    Object.values(result.suggestions || {}).forEach((employeeData) => {
      totalSlots += employeeData.available_slots?.length || 0;
    });

    console.log('\n📊 SUMMARY:');
    console.log(`   Employees checked: ${Object.keys(result.suggestions || {}).length}`);
    console.log(`   Total available slots: ${totalSlots}`);
    console.log(`   Search period: ${result.search_period?.start} to ${result.search_period?.end}`);

    if (totalSlots > 0) {
      console.log('\n✅ Customer self-scheduling is WORKING!');
      console.log('   Customers will see available time slots in quote.html');
    } else {
      console.log('\n⚠️  No available slots found');
      console.log('   This could mean:');
      console.log('   - All employees are fully booked');
      console.log('   - Business hours settings are too restrictive');
      console.log('   - Min advance booking hours is too high');
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ TEST COMPLETE!\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED:');
    console.error(error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    process.exit(1);
  }
}

testSmartScheduling();

