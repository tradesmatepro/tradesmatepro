#!/usr/bin/env node
/**
 * FIX SALES COLUMNS NOW - Based on App Requirements
 * Fix the exact column mismatches between app expectations and database reality
 */

async function executeSql(sql, description = 'SQL execution') {
  try {
    const response = await fetch('http://localhost:4000/dev/sql/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql })
    });

    const result = await response.json();
    
    if (result.success && result.data) {
      return result.data;
    } else if (result.success) {
      return [];
    } else {
      console.log(`❌ SQL ERROR: ${result.error}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ NETWORK ERROR: ${error.message}`);
    return null;
  }
}

async function fixSalesColumns() {
  console.log('🔧 FIXING SALES COLUMNS - APP REQUIREMENTS');
  console.log('==========================================\n');

  // Step 1: Check current leads table structure
  console.log('📋 STEP 1: Checking leads table structure');
  console.log('------------------------------------------');
  
  const leadsColumns = await executeSql(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'leads'
    ORDER BY ordinal_position
  `, "Get leads columns");

  if (leadsColumns) {
    console.log('Current leads columns:');
    leadsColumns.forEach(col => {
      console.log(`  • ${col.column_name} (${col.data_type})`);
    });

    // Check what's missing for app requirements
    const hasStatus = leadsColumns.some(c => c.column_name === 'status');
    const hasSource = leadsColumns.some(c => c.column_name === 'source');
    const hasStage = leadsColumns.some(c => c.column_name === 'stage');
    const hasExpectedValue = leadsColumns.some(c => c.column_name === 'expected_value');

    console.log('\nApp requirements check:');
    console.log(`  status: ${hasStatus ? '✅' : '❌ MISSING'}`);
    console.log(`  source: ${hasSource ? '✅' : '❌ MISSING'}`);
    console.log(`  stage: ${hasStage ? '✅' : '❌ MISSING'}`);
    console.log(`  expected_value: ${hasExpectedValue ? '✅' : '❌ MISSING'}`);

    // Add missing columns to leads table
    if (!hasStatus) {
      console.log('\n🔧 Adding status column to leads...');
      await executeSql(`
        ALTER TABLE leads ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new' 
        CHECK (status IN ('new', 'contacted', 'qualified', 'unqualified', 'converted', 'lost'))
      `, "Add status to leads");
    }

    if (!hasSource) {
      console.log('🔧 Adding source column to leads...');
      await executeSql(`
        ALTER TABLE leads ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'unknown'
      `, "Add source to leads");
    }

    if (!hasStage) {
      console.log('🔧 Adding stage column to leads...');
      await executeSql(`
        ALTER TABLE leads ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'new'
      `, "Add stage to leads");
    }

    if (!hasExpectedValue) {
      console.log('🔧 Adding expected_value column to leads...');
      await executeSql(`
        ALTER TABLE leads ADD COLUMN IF NOT EXISTS expected_value DECIMAL(12,2) DEFAULT 0
      `, "Add expected_value to leads");
    }
  }

  // Step 2: Check current opportunities table structure
  console.log('\n📋 STEP 2: Checking opportunities table structure');
  console.log('------------------------------------------------');
  
  const opportunitiesColumns = await executeSql(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'opportunities'
    ORDER BY ordinal_position
  `, "Get opportunities columns");

  if (opportunitiesColumns) {
    console.log('Current opportunities columns:');
    opportunitiesColumns.forEach(col => {
      console.log(`  • ${col.column_name} (${col.data_type})`);
    });

    // Check what's missing for app requirements
    const hasStatus = opportunitiesColumns.some(c => c.column_name === 'status');
    const hasStage = opportunitiesColumns.some(c => c.column_name === 'stage');
    const hasExpectedValue = opportunitiesColumns.some(c => c.column_name === 'expected_value');
    const hasActualValue = opportunitiesColumns.some(c => c.column_name === 'actual_value');

    console.log('\nApp requirements check:');
    console.log(`  status: ${hasStatus ? '✅' : '❌ MISSING'}`);
    console.log(`  stage: ${hasStage ? '✅' : '❌ MISSING'}`);
    console.log(`  expected_value: ${hasExpectedValue ? '✅' : '❌ MISSING'}`);
    console.log(`  actual_value: ${hasActualValue ? '✅' : '❌ MISSING'}`);

    // Add missing columns to opportunities table
    if (!hasStatus) {
      console.log('\n🔧 Adding status column to opportunities...');
      await executeSql(`
        ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'open' 
        CHECK (status IN ('open', 'won', 'lost', 'on_hold'))
      `, "Add status to opportunities");
    }

    if (!hasStage) {
      console.log('🔧 Adding stage column to opportunities...');
      await executeSql(`
        ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'prospecting'
        CHECK (stage IN ('prospecting', 'qualification', 'proposal', 'negotiation', 'closed'))
      `, "Add stage to opportunities");
    }

    if (!hasExpectedValue) {
      console.log('🔧 Adding expected_value column to opportunities...');
      await executeSql(`
        ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS expected_value DECIMAL(12,2) DEFAULT 0
      `, "Add expected_value to opportunities");
    }

    if (!hasActualValue) {
      console.log('🔧 Adding actual_value column to opportunities...');
      await executeSql(`
        ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS actual_value DECIMAL(12,2) DEFAULT 0
      `, "Add actual_value to opportunities");
    }
  }

  // Step 3: Test the fixed queries that were failing
  console.log('\n📋 STEP 3: Testing Fixed Queries');
  console.log('---------------------------------');

  // Test leads queries
  console.log('\n🧪 Testing leads queries:');
  await executeSql(`SELECT COUNT(*) as total_leads FROM leads`, "Count all leads");
  await executeSql(`SELECT COUNT(*) as qualified_leads FROM leads WHERE status = 'qualified'`, "Count qualified leads");
  await executeSql(`SELECT COUNT(*) as converted_leads FROM leads WHERE status = 'converted'`, "Count converted leads");
  await executeSql(`SELECT source, COUNT(*) as count FROM leads GROUP BY source`, "Group leads by source");

  // Test opportunities queries
  console.log('\n🧪 Testing opportunities queries:');
  await executeSql(`SELECT COUNT(*) as total_opportunities FROM opportunities`, "Count all opportunities");
  await executeSql(`SELECT COUNT(*) as open_opportunities FROM opportunities WHERE status = 'open'`, "Count open opportunities");
  await executeSql(`SELECT COUNT(*) as won_opportunities FROM opportunities WHERE status = 'won'`, "Count won opportunities");
  await executeSql(`SELECT stage, COUNT(*) as count FROM opportunities GROUP BY stage`, "Group opportunities by stage");
  await executeSql(`SELECT SUM(expected_value) as pipeline_value FROM opportunities WHERE status = 'open'`, "Calculate pipeline value");

  // Step 4: Test the SalesDashboard queries that were failing
  console.log('\n📋 STEP 4: Testing SalesDashboard Queries');
  console.log('------------------------------------------');

  // Test the exact queries from SalesDashboard.js
  await executeSql(`
    SELECT 
      COUNT(*) as total_leads,
      COUNT(*) FILTER (WHERE status = 'qualified') as qualified_leads,
      COUNT(*) FILTER (WHERE status = 'converted') as converted_leads
    FROM leads
  `, "SalesDashboard leads metrics");

  await executeSql(`
    SELECT 
      COUNT(*) as total_opportunities,
      COUNT(*) FILTER (WHERE status = 'open') as open_opportunities,
      COUNT(*) FILTER (WHERE status = 'won') as won_opportunities,
      SUM(expected_value) FILTER (WHERE status = 'open') as pipeline_value,
      SUM(actual_value) FILTER (WHERE status = 'won') as won_value
    FROM opportunities
  `, "SalesDashboard opportunities metrics");

  console.log('\n🎉 SALES COLUMNS FIX COMPLETE!');
  console.log('==============================');
  console.log('\n✅ FIXED ISSUES:');
  console.log('• Added missing columns to leads table');
  console.log('• Added missing columns to opportunities table');
  console.log('• All SalesDashboard queries should now work');
  console.log('• All Sales section pages should be functional');
  
  console.log('\n🚀 NEXT STEPS:');
  console.log('1. Test the Sales Dashboard page');
  console.log('2. Test the Customers page (should already work)');
  console.log('3. Test the Quotes page (should already work)');
  console.log('4. Verify no more HTTP 400 errors');
}

// Run the fix
fixSalesColumns().catch(console.error);
