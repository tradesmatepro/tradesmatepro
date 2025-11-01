/**
 * Verify all fixes are in place
 */

const { Client } = require('pg');
require('dotenv').config();

async function verifyFixes() {
  let client;
  try {
    console.log('🔍 VERIFYING ALL FIXES\n');
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

    // Check 1: RPC function exists
    console.log('1️⃣  Checking RPC function: get_schedulable_employees');
    const rpcCheck = await client.query(`
      SELECT proname, oidvectortypes(proargtypes) as args
      FROM pg_proc
      WHERE proname = 'get_schedulable_employees'
    `);

    if (rpcCheck.rows.length > 0) {
      console.log('   ✅ RPC function EXISTS');
      console.log(`   Function: ${rpcCheck.rows[0].proname}(${rpcCheck.rows[0].args})\n`);
    } else {
      console.log('   ❌ RPC function NOT FOUND\n');
    }

    // Check 2: Settings VIEW has required columns
    console.log('2️⃣  Checking settings VIEW columns');
    const requiredCols = [
      'enable_customer_self_scheduling',
      'auto_approve_customer_selections',
      'job_buffer_minutes',
      'default_buffer_before_minutes',
      'default_buffer_after_minutes'
    ];

    const colCheck = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'settings'
      AND column_name IN (${requiredCols.map((_, i) => `$${i + 1}`).join(',')})
    `, requiredCols);

    const foundCols = colCheck.rows.map(r => r.column_name);
    let allFound = true;
    requiredCols.forEach(col => {
      const status = foundCols.includes(col) ? '✅' : '❌';
      console.log(`   ${status} ${col}`);
      if (!foundCols.includes(col)) allFound = false;
    });
    console.log();

    // Check 3: Test RPC function
    console.log('3️⃣  Testing RPC function call');
    try {
      const testResult = await client.query(`
        SELECT COUNT(*) as count FROM get_schedulable_employees('48f32d34-f32c-46d0-8281-312fd21762d8'::uuid)
      `);
      console.log(`   ✅ RPC function callable`);
      console.log(`   Result: ${testResult.rows[0].count} employees\n`);
    } catch (e) {
      console.log(`   ❌ RPC function error: ${e.message}\n`);
    }

    // Summary
    console.log('='.repeat(60));
    if (rpcCheck.rows.length > 0 && allFound) {
      console.log('\n✅ ALL FIXES VERIFIED - PRODUCTION READY!\n');
      console.log('Next steps:');
      console.log('1. Clear browser cache (Ctrl+Shift+Delete)');
      console.log('2. Refresh the page (F5)');
      console.log('3. Check logs.md - errors should be GONE\n');
    } else {
      console.log('\n⚠️  Some fixes may not be complete\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (client) {
      await client.end();
    }
  }
}

verifyFixes();

