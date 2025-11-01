/**
 * Check employees in database
 */

const { Client } = require('pg');
require('dotenv').config();

async function checkEmployees() {
  let client;
  try {
    console.log('🔍 CHECKING EMPLOYEES IN DATABASE\n');
    console.log('='.repeat(60) + '\n');

    client = new Client({
      host: process.env.SUPABASE_DB_HOST,
      port: parseInt(process.env.SUPABASE_DB_PORT || 5432),
      database: process.env.SUPABASE_DB_NAME || 'postgres',
      user: process.env.SUPABASE_DB_USER,
      password: process.env.SUPABASE_DB_PASSWORD,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();

    // Check 1: Total employees
    console.log('1️⃣  Total employees in database:');
    const totalCheck = await client.query(`
      SELECT COUNT(*) as count FROM employees
    `);
    console.log(`   Total: ${totalCheck.rows[0].count}\n`);

    // Check 2: Schedulable employees
    console.log('2️⃣  Schedulable employees (is_schedulable = true):');
    const schedulableCheck = await client.query(`
      SELECT COUNT(*) as count FROM employees WHERE is_schedulable = true
    `);
    console.log(`   Schedulable: ${schedulableCheck.rows[0].count}\n`);

    // Check 3: Employees with NULL is_schedulable
    console.log('3️⃣  Employees with NULL is_schedulable:');
    const nullCheck = await client.query(`
      SELECT COUNT(*) as count FROM employees WHERE is_schedulable IS NULL
    `);
    console.log(`   NULL: ${nullCheck.rows[0].count}\n`);

    // Check 4: List all employees with details
    console.log('4️⃣  All employees with details:');
    const allEmployees = await client.query(`
      SELECT 
        e.id,
        e.user_id,
        e.company_id,
        e.job_title,
        e.is_schedulable,
        u.name,
        u.email,
        u.status
      FROM employees e
      LEFT JOIN users u ON e.user_id = u.id
      ORDER BY u.name ASC
    `);

    if (allEmployees.rows.length === 0) {
      console.log('   ❌ NO EMPLOYEES FOUND\n');
    } else {
      allEmployees.rows.forEach((emp, idx) => {
        console.log(`   ${idx + 1}. ${emp.name || 'N/A'}`);
        console.log(`      Email: ${emp.email}`);
        console.log(`      Job Title: ${emp.job_title}`);
        console.log(`      Schedulable: ${emp.is_schedulable === null ? 'NULL (defaults to true)' : emp.is_schedulable}`);
        console.log(`      User Status: ${emp.status}`);
        console.log();
      });
    }

    // Check 5: Test RPC function
    console.log('5️⃣  Testing get_schedulable_employees RPC:');
    
    // Get a company_id from the database
    const companyCheck = await client.query(`
      SELECT DISTINCT company_id FROM employees LIMIT 1
    `);

    if (companyCheck.rows.length > 0) {
      const company_id = companyCheck.rows[0].company_id;
      console.log(`   Testing with company_id: ${company_id}`);
      
      try {
        const rpcResult = await client.query(`
          SELECT * FROM get_schedulable_employees($1::uuid)
        `, [company_id]);
        
        console.log(`   ✅ RPC returned ${rpcResult.rows.length} employees\n`);
        
        if (rpcResult.rows.length > 0) {
          rpcResult.rows.forEach((emp, idx) => {
            console.log(`   ${idx + 1}. ${emp.full_name}`);
            console.log(`      Email: ${emp.email}`);
            console.log(`      Job Title: ${emp.job_title}`);
            console.log(`      Schedulable: ${emp.is_schedulable}`);
            console.log();
          });
        }
      } catch (e) {
        console.log(`   ❌ RPC error: ${e.message}\n`);
      }
    } else {
      console.log('   ⚠️  No companies found in employees table\n');
    }

    // Summary
    console.log('='.repeat(60));
    console.log('\n📊 SUMMARY:');
    console.log(`   Total employees: ${totalCheck.rows[0].count}`);
    console.log(`   Schedulable: ${schedulableCheck.rows[0].count}`);
    console.log(`   NULL is_schedulable: ${nullCheck.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (client) {
      await client.end();
    }
  }
}

checkEmployees();

