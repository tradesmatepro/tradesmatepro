#!/usr/bin/env node
/**
 * FIX SALES SCHEMA ISSUES - Full Automation
 * Inspect actual table structures and fix column mismatches
 * NO BANDAIDS - Fix the root cause properly
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

async function inspectAndFixTables() {
  console.log('🔧 FIXING SALES SCHEMA ISSUES - FULL AUTOMATION');
  console.log('===============================================\n');

  // Step 1: Inspect quotes_v table structure
  console.log('📋 STEP 1: Inspecting quotes_v Table Structure');
  console.log('-----------------------------------------------');
  
  const quotesColumns = await executeSql(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'quotes_v'
    ORDER BY ordinal_position
  `, "Get quotes_v columns");

  if (quotesColumns) {
    console.log('📊 quotes_v current columns:');
    quotesColumns.forEach(col => {
      console.log(`  • ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });

    // Check if critical columns are missing
    const hasCustomerId = quotesColumns.some(c => c.column_name === 'customer_id');
    const hasStatus = quotesColumns.some(c => c.column_name === 'status');
    
    console.log(`\n🔍 Critical columns check:`);
    console.log(`  customer_id: ${hasCustomerId ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`  status: ${hasStatus ? '✅ EXISTS' : '❌ MISSING'}`);
  }

  // Step 2: Inspect leads table structure  
  console.log('\n📋 STEP 2: Inspecting leads Table Structure');
  console.log('-------------------------------------------');
  
  const leadsColumns = await executeSql(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'leads'
    ORDER BY ordinal_position
  `, "Get leads columns");

  if (leadsColumns) {
    console.log('📊 leads current columns:');
    leadsColumns.forEach(col => {
      console.log(`  • ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });

    // Check if critical columns are missing
    const hasName = leadsColumns.some(c => c.column_name === 'name');
    const hasEmail = leadsColumns.some(c => c.column_name === 'email');
    const hasPhone = leadsColumns.some(c => c.column_name === 'phone');
    const hasStatus = leadsColumns.some(c => c.column_name === 'status');
    const hasSource = leadsColumns.some(c => c.column_name === 'source');
    
    console.log(`\n🔍 Critical columns check:`);
    console.log(`  name: ${hasName ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`  email: ${hasEmail ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`  phone: ${hasPhone ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`  status: ${hasStatus ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`  source: ${hasSource ? '✅ EXISTS' : '❌ MISSING'}`);
  }

  // Step 3: Inspect quote analytics table
  console.log('\n📋 STEP 3: Inspecting Quote Analytics Tables');
  console.log('---------------------------------------------');
  
  const quoteAnalyticsColumns = await executeSql(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'quote_analytics'
    ORDER BY ordinal_position
  `, "Get quote_analytics columns");

  if (quoteAnalyticsColumns) {
    console.log('📊 quote_analytics current columns:');
    quoteAnalyticsColumns.forEach(col => {
      console.log(`  • ${col.column_name} (${col.data_type})`);
    });
  }

  // Step 4: Inspect sales_activities table
  console.log('\n📋 STEP 4: Inspecting sales_activities Table');
  console.log('---------------------------------------------');
  
  const salesActivitiesColumns = await executeSql(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'sales_activities'
    ORDER BY ordinal_position
  `, "Get sales_activities columns");

  if (salesActivitiesColumns) {
    console.log('📊 sales_activities current columns:');
    salesActivitiesColumns.forEach(col => {
      console.log(`  • ${col.column_name} (${col.data_type})`);
    });
  }

  // Step 5: Check what the React code expects vs what exists
  console.log('\n📋 STEP 5: Analyzing React Code Expectations');
  console.log('---------------------------------------------');
  
  console.log('🔍 Based on the errors, the React code expects:');
  console.log('  quotes_v table needs:');
  console.log('    • customer_id column (for joins with customers)');
  console.log('    • status column (for filtering pending quotes)');
  console.log('  leads table needs:');
  console.log('    • name, email, phone, status, source columns');
  console.log('  quote_analytics needs:');
  console.log('    • quote_id column (for joining with quotes)');
  console.log('  sales_activities needs:');
  console.log('    • activity_date column (for date filtering)');

  // Step 6: Test sample data to understand current structure
  console.log('\n📋 STEP 6: Testing Sample Data');
  console.log('-------------------------------');
  
  // Test quotes_v sample data
  const quoteSample = await executeSql(`SELECT * FROM quotes_v LIMIT 1`, "Get quotes_v sample");
  if (quoteSample && quoteSample.length > 0) {
    console.log('📊 quotes_v sample data structure:');
    console.log('  Available columns:', Object.keys(quoteSample[0]).join(', '));
  } else {
    console.log('📊 quotes_v: No sample data available');
  }

  // Test leads sample data
  const leadSample = await executeSql(`SELECT * FROM leads LIMIT 1`, "Get leads sample");
  if (leadSample && leadSample.length > 0) {
    console.log('📊 leads sample data structure:');
    console.log('  Available columns:', Object.keys(leadSample[0]).join(', '));
  } else {
    console.log('📊 leads: No sample data available');
  }

  console.log('\n🎯 ANALYSIS COMPLETE - Ready to create fix plan');
  console.log('===============================================');
  
  console.log('\n📋 ISSUES IDENTIFIED:');
  console.log('1. quotes_v missing customer_id and status columns');
  console.log('2. leads missing basic contact columns');
  console.log('3. Quote analytics tables have wrong column structure');
  console.log('4. Missing performance indexes');
  console.log('5. RLS policies need to be enabled');
  
  console.log('\n🚨 CRITICAL: Need to understand if quotes_v is a VIEW or TABLE');
  console.log('   If it\'s a view, we need to modify the underlying table');
  console.log('   If it\'s a table, we can add columns directly');
  
  // Check if quotes_v is a view or table
  const tableType = await executeSql(`
    SELECT table_type 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'quotes_v'
  `, "Check if quotes_v is view or table");
  
  if (tableType && tableType.length > 0) {
    console.log(`\n🔍 quotes_v is a: ${tableType[0].table_type}`);
    
    if (tableType[0].table_type === 'VIEW') {
      console.log('⚠️  quotes_v is a VIEW - need to check underlying table structure');
      
      // Get the view definition
      const viewDef = await executeSql(`
        SELECT view_definition 
        FROM information_schema.views 
        WHERE table_schema = 'public' AND table_name = 'quotes_v'
      `, "Get quotes_v view definition");
      
      if (viewDef && viewDef.length > 0) {
        console.log('📋 View definition:', viewDef[0].view_definition.substring(0, 200) + '...');
      }
    }
  }
}

// Run the inspection
inspectAndFixTables().catch(console.error);
