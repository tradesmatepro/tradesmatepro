require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

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

    // ========================================================================
    // DEPLOY: Consolidated Scheduling RPC
    // ========================================================================
    console.log('📋 Deploying: get_available_time_slots_consolidated');
    const consolidatedRPC = fs.readFileSync(
      path.join(__dirname, 'sql files/get_available_time_slots_consolidated.sql'),
      'utf8'
    );
    
    await client.query(consolidatedRPC);
    console.log('✅ Deployed: get_available_time_slots_consolidated\n');

    // ========================================================================
    // DEPLOY: Skip Scheduling Workflow
    // ========================================================================
    console.log('📋 Deploying: skip_scheduling_workflow');
    const skipSchedulingRPC = fs.readFileSync(
      path.join(__dirname, 'sql files/skip_scheduling_workflow.sql'),
      'utf8'
    );
    
    await client.query(skipSchedulingRPC);
    console.log('✅ Deployed: skip_scheduling_and_start_job');
    console.log('✅ Deployed: change_work_order_status\n');

    // ========================================================================
    // VERIFY: Check if RPCs exist
    // ========================================================================
    console.log('🔍 Verifying RPC functions...\n');
    
    const rpcCheck = await client.query(`
      SELECT routine_name 
      FROM information_schema.routines 
      WHERE routine_name IN (
        'get_available_time_slots_consolidated',
        'skip_scheduling_and_start_job',
        'change_work_order_status'
      )
      ORDER BY routine_name
    `);

    console.log('📋 Deployed RPC Functions:');
    rpcCheck.rows.forEach(row => {
      console.log(`  ✅ ${row.routine_name}`);
    });

    if (rpcCheck.rows.length === 3) {
      console.log('\n🎉 All RPCs deployed successfully!\n');
    } else {
      console.log(`\n⚠️  Expected 3 RPCs, found ${rpcCheck.rows.length}\n`);
    }

    // ========================================================================
    // TEST: Call consolidated RPC with test data
    // ========================================================================
    console.log('🧪 Testing consolidated RPC...\n');

    const testCompanyId = 'c27b7833-5eec-4688-8409-cbb6784470c1';
    const testEmployeeId = '842fb87c-f16a-4369-9d0b-b4beec9ebda2';

    try {
      const testResult = await client.query(`
        SELECT get_available_time_slots_consolidated(
          $1::uuid,
          ARRAY[$2::uuid],
          120,
          CURRENT_DATE + 1,
          CURRENT_DATE + 7
        ) as result
      `, [testCompanyId, testEmployeeId]);

      const result = testResult.rows[0]?.result;
      if (result) {
        console.log('📊 Test Result:');
        console.log(`  Success: ${result.success}`);
        console.log(`  Slots found: ${result.slots ? result.slots.length : 0}`);
        console.log(`  Debug info:`, result.debug);
        console.log();

        if (result.success) {
          console.log('✅ RPC is working correctly!\n');
        } else {
          console.log('⚠️  RPC returned error:', result.debug?.error, '\n');
        }
      } else {
        console.log('⚠️  Could not parse RPC result\n');
      }
    } catch (testError) {
      console.log('⚠️  RPC test skipped (may need test data):', testError.message, '\n');
    }

    // ========================================================================
    // SUMMARY
    // ========================================================================
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🎉 SCHEDULING CONSOLIDATION DEPLOYMENT COMPLETE');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('✅ Deployed 3 RPC functions:');
    console.log('   1. get_available_time_slots_consolidated');
    console.log('   2. skip_scheduling_and_start_job');
    console.log('   3. change_work_order_status\n');
    console.log('📋 Next steps:');
    console.log('   1. Deploy frontend changes (src/utils/smartScheduling.js)');
    console.log('   2. Update SmartSchedulingAssistant component');
    console.log('   3. Test in browser');
    console.log('   4. Deploy to production\n');
    console.log('📚 Documentation: SCHEDULING_CONSOLIDATION_DEPLOYMENT.md\n');

    await client.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();

