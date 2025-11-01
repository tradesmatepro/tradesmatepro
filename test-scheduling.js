require('dotenv').config();
const { Client } = require('pg');

(async () => {
  const client = new Client({
    host: process.env.SUPABASE_DB_HOST,
    port: process.env.SUPABASE_DB_PORT,
    database: process.env.SUPABASE_DB_NAME,
    user: process.env.SUPABASE_DB_USER,
    password: process.env.SUPABASE_DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    const companyId = 'c27b7833-5eec-4688-8409-cbb6784470c1';
    const employeeId = '842fb87c-f16a-4369-9d0b-b4beec9ebda2';
    const userId = '5d9cf798-3ac9-41ba-a6f3-485f6e764322';

    // Test 1: Check if employee is schedulable
    console.log('=== TEST 1: Employee Schedulability ===');
    const empRes = await client.query(
      `SELECT id, user_id, is_schedulable FROM employees WHERE id = $1`,
      [employeeId]
    );
    console.log('Employee:', empRes.rows[0]);

    // Test 2: Check schedule_events for this employee
    console.log('\n=== TEST 2: Schedule Events ===');
    const schedRes = await client.query(
      `SELECT id, employee_id, user_id, start_time, end_time FROM schedule_events 
       WHERE (employee_id = $1 OR user_id = $2) AND company_id = $3`,
      [employeeId, userId, companyId]
    );
    console.log(`Found ${schedRes.rows.length} schedule events`);
    schedRes.rows.forEach(r => {
      console.log(`  - ${r.start_time} to ${r.end_time}`);
    });

    // Test 3: Check work_orders assigned to this employee
    console.log('\n=== TEST 3: Work Orders ===');
    const woRes = await client.query(
      `SELECT id, title, assigned_to, scheduled_start, scheduled_end, status 
       FROM work_orders 
       WHERE company_id = $1 AND (assigned_to = $2 OR assigned_to = $3)`,
      [companyId, employeeId, userId]
    );
    console.log(`Found ${woRes.rows.length} work orders`);
    woRes.rows.forEach(wo => {
      console.log(`  - ${wo.title} (${wo.status}): assigned_to=${wo.assigned_to}`);
      if (wo.scheduled_start) {
        console.log(`    Scheduled: ${wo.scheduled_start} to ${wo.scheduled_end}`);
      }
    });

    // Test 4: Check PTO for this employee
    console.log('\n=== TEST 4: PTO ===');
    const ptoRes = await client.query(
      `SELECT id, kind, starts_at, ends_at, status FROM employee_time_off 
       WHERE employee_id = $1 AND company_id = $2 AND status = 'APPROVED'`,
      [employeeId, companyId]
    );
    console.log(`Found ${ptoRes.rows.length} approved PTO records`);
    ptoRes.rows.forEach(pto => {
      console.log(`  - ${pto.kind}: ${pto.starts_at} to ${pto.ends_at}`);
    });

    // Test 5: Check company settings
    console.log('\n=== TEST 5: Company Settings ===');
    const settingsRes = await client.query(
      `SELECT business_hours_start, business_hours_end, working_days, min_advance_booking_hours, max_advance_booking_days 
       FROM company_settings WHERE company_id = $1`,
      [companyId]
    );
    if (settingsRes.rows.length > 0) {
      const s = settingsRes.rows[0];
      console.log(`Business hours: ${s.business_hours_start} - ${s.business_hours_end}`);
      console.log(`Working days: ${JSON.stringify(s.working_days)}`);
      console.log(`Min advance: ${s.min_advance_booking_hours}h, Max: ${s.max_advance_booking_days}d`);
    }

    // Test 6: Simulate slot generation
    console.log('\n=== TEST 6: Slot Generation ===');
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0);
    
    const dayEnd = new Date(tomorrow);
    dayEnd.setHours(17, 0, 0, 0);

    console.log(`Generating slots from ${tomorrow.toISOString()} to ${dayEnd.toISOString()}`);
    
    let slotCount = 0;
    let currentTime = new Date(tomorrow);
    while (currentTime < dayEnd) {
      slotCount++;
      currentTime.setMinutes(currentTime.getMinutes() + 15);
    }
    console.log(`Would generate ${slotCount} slots (15-min intervals)`);

    await client.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();

