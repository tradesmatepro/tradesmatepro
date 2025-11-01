/**
 * Check all employees and their company associations
 */

const { Client } = require('pg');
require('dotenv').config();

async function checkAllEmployees() {
  let client;
  try {
    console.log('Checking all employees...\n');

    client = new Client({
      host: process.env.SUPABASE_DB_HOST,
      port: parseInt(process.env.SUPABASE_DB_PORT || 5432),
      database: process.env.SUPABASE_DB_NAME || 'postgres',
      user: process.env.SUPABASE_DB_USER,
      password: process.env.SUPABASE_DB_PASSWORD,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();

    // Get all employees with their company info
    const result = await client.query(`
      SELECT 
        e.id,
        e.company_id,
        e.user_id,
        e.job_title,
        e.is_schedulable,
        u.name,
        u.email,
        c.name as company_name
      FROM employees e
      LEFT JOIN users u ON e.user_id = u.id
      LEFT JOIN companies c ON e.company_id = c.id
      ORDER BY c.name, u.name
    `);

    console.log(`Total employees: ${result.rows.length}\n`);

    // Group by company
    const byCompany = {};
    result.rows.forEach(emp => {
      const company = emp.company_name || 'Unknown';
      if (!byCompany[company]) {
        byCompany[company] = [];
      }
      byCompany[company].push(emp);
    });

    // Display by company
    Object.entries(byCompany).forEach(([company, employees]) => {
      console.log(`Company: ${company}`);
      console.log(`  Company ID: ${employees[0].company_id}`);
      employees.forEach((emp, idx) => {
        console.log(`  ${idx + 1}. ${emp.name}`);
        console.log(`     Email: ${emp.email}`);
        console.log(`     Job Title: ${emp.job_title}`);
        console.log(`     Schedulable: ${emp.is_schedulable}`);
      });
      console.log();
    });

    await client.end();

  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkAllEmployees();

