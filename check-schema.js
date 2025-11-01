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

    // Check company settings for the test company
    const companyId = 'c27b7833-5eec-4688-8409-cbb6784470c1';
    const settingsRes = await client.query(
      `SELECT business_hours_start, business_hours_end, working_days FROM company_settings WHERE company_id = $1`,
      [companyId]
    );
    console.log('📋 Company Settings:');
    console.log(JSON.stringify(settingsRes.rows, null, 2));

    // Check employees for this company
    const empRes = await client.query(
      `SELECT id, user_id, is_schedulable FROM employees WHERE company_id = $1`,
      [companyId]
    );
    console.log('\n👥 Employees:');
    console.log(`Total: ${empRes.rows.length}`);
    empRes.rows.forEach(e => {
      console.log(`  - ID: ${e.id}, user_id: ${e.user_id}, schedulable=${e.is_schedulable}`);
    });

    // Check schedule_events for this company
    const schedRes = await client.query(
      `SELECT COUNT(*) as count FROM schedule_events WHERE company_id = $1`,
      [companyId]
    );
    console.log(`\n📅 Schedule Events: ${schedRes.rows[0].count}`);

    // Check work_orders assigned_to field
    const woRes = await client.query(
      `SELECT id, title, assigned_to, scheduled_start, scheduled_end FROM work_orders WHERE company_id = $1 LIMIT 5`,
      [companyId]
    );
    console.log(`\n📋 Work Orders (sample):`);
    woRes.rows.forEach(wo => {
      console.log(`  - ${wo.title}: assigned_to=${wo.assigned_to}, scheduled=${wo.scheduled_start ? 'yes' : 'no'}`);
    });

    // Check what the employee's user_id is
    const empUserRes = await client.query(
      `SELECT id, user_id FROM employees WHERE company_id = $1 LIMIT 1`,
      [companyId]
    );
    if (empUserRes.rows.length > 0) {
      const emp = empUserRes.rows[0];
      console.log(`\n👤 Employee Record:`);
      console.log(`  - employee.id: ${emp.id}`);
      console.log(`  - employee.user_id: ${emp.user_id}`);
    }

    await client.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();

