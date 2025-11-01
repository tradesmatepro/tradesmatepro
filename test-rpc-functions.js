#!/usr/bin/env node

/**
 * Test RPC Functions - Verify all backend functions work correctly
 * Run: node test-rpc-functions.js
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Test results
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

async function test(name, fn) {
  try {
    console.log(`\n🧪 Testing: ${name}`);
    await fn();
    console.log(`✅ PASSED: ${name}`);
    results.passed++;
    results.tests.push({ name, status: 'PASSED' });
  } catch (error) {
    console.error(`❌ FAILED: ${name}`);
    console.error(`   Error: ${error.message}`);
    results.failed++;
    results.tests.push({ name, status: 'FAILED', error: error.message });
  }
}

async function runTests() {
  console.log('🚀 Starting RPC Function Tests\n');
  console.log('=' .repeat(80));

  // Get a test company ID
  const { data: companies } = await supabase
    .from('companies')
    .select('id')
    .limit(1);

  if (!companies || companies.length === 0) {
    console.error('❌ No companies found in database');
    process.exit(1);
  }

  const companyId = companies[0].id;
  console.log(`\n📊 Using company ID: ${companyId}\n`);

  // Test 1: get_schedulable_employees
  await test('get_schedulable_employees()', async () => {
    const { data, error } = await supabase.rpc('get_schedulable_employees', {
      p_company_id: companyId
    });
    if (error) throw error;
    console.log(`   ✓ Returned ${data?.length || 0} employees`);
  });

  // Test 2: get_all_employees
  await test('get_all_employees()', async () => {
    const { data, error } = await supabase.rpc('get_all_employees', {
      p_company_id: companyId
    });
    if (error) throw error;
    console.log(`   ✓ Returned ${data?.length || 0} employees`);
  });

  // Test 3: get_unscheduled_work_orders
  await test('get_unscheduled_work_orders()', async () => {
    const { data, error } = await supabase.rpc('get_unscheduled_work_orders', {
      p_company_id: companyId
    });
    if (error) throw error;
    console.log(`   ✓ Returned ${data?.length || 0} unscheduled work orders`);
  });

  // Test 4: get_work_orders_by_status
  await test('get_work_orders_by_status()', async () => {
    const { data, error } = await supabase.rpc('get_work_orders_by_status', {
      p_company_id: companyId,
      p_statuses: ['approved', 'scheduled', 'in_progress', 'completed', 'invoiced', 'paid']
    });
    if (error) throw error;
    console.log(`   ✓ Returned ${data?.length || 0} work orders`);
  });

  // Test 5: get_work_orders_with_crew
  await test('get_work_orders_with_crew()', async () => {
    const { data, error } = await supabase.rpc('get_work_orders_with_crew', {
      p_company_id: companyId,
      p_status: 'scheduled'
    });
    if (error) throw error;
    console.log(`   ✓ Returned ${data?.length || 0} work orders with crew`);
  });

  // Test 6: get_work_orders_for_calendar
  await test('get_work_orders_for_calendar()', async () => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    const { data, error } = await supabase.rpc('get_work_orders_for_calendar', {
      p_company_id: companyId,
      p_start_date: startDate.toISOString().split('T')[0],
      p_end_date: endDate.toISOString().split('T')[0],
      p_employee_id: null
    });
    if (error) throw error;
    console.log(`   ✓ Returned ${data?.length || 0} calendar work orders`);
  });

  // Test 7: get_customers_with_work_order_count
  await test('get_customers_with_work_order_count()', async () => {
    const { data, error } = await supabase.rpc('get_customers_with_work_order_count', {
      p_company_id: companyId
    });
    if (error) throw error;
    console.log(`   ✓ Returned ${data?.length || 0} customers with counts`);
  });

  // Test 8: update_employee_schedulable
  await test('update_employee_schedulable()', async () => {
    // Get an employee first
    const { data: employees } = await supabase
      .from('employees')
      .select('id')
      .eq('company_id', companyId)
      .limit(1);

    if (!employees || employees.length === 0) {
      console.log('   ⚠️  No employees found to test update');
      return;
    }

    const employeeId = employees[0].id;
    const { data, error } = await supabase.rpc('update_employee_schedulable', {
      p_employee_id: employeeId,
      p_is_schedulable: true
    });
    if (error) throw error;
    console.log(`   ✓ Updated employee ${employeeId}`);
  });

  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('\n📊 TEST SUMMARY\n');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📊 Total:  ${results.passed + results.failed}`);

  if (results.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.tests
      .filter(t => t.status === 'FAILED')
      .forEach(t => {
        console.log(`   - ${t.name}: ${t.error}`);
      });
  }

  console.log('\n' + '='.repeat(80));

  if (results.failed === 0) {
    console.log('\n✅ ALL TESTS PASSED!\n');
    process.exit(0);
  } else {
    console.log('\n❌ SOME TESTS FAILED\n');
    process.exit(1);
  }
}

runTests().catch(error => {
  console.error('❌ Test suite error:', error);
  process.exit(1);
});

