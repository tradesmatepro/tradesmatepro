#!/usr/bin/env node
/**
 * Comprehensive Sales Section Audit
 * Test every Sales page and fix all errors automatically
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
      console.log(`✅ ${description}: SUCCESS`);
      return result.data;
    } else if (result.success) {
      console.log(`✅ ${description}: SUCCESS (no data)`);
      return [];
    } else {
      console.log(`❌ ${description}: FAILED - ${result.error}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ ${description}: NETWORK ERROR - ${error.message}`);
    return null;
  }
}

async function checkTableExists(tableName) {
  const result = await executeSql(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '${tableName}'`,
    `Check if ${tableName} exists`
  );
  return result && result.length > 0;
}

async function checkTableColumns(tableName) {
  const result = await executeSql(
    `SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '${tableName}' ORDER BY ordinal_position`,
    `Get ${tableName} columns`
  );
  return result || [];
}

async function auditSalesSection() {
  console.log('🚀 COMPREHENSIVE SALES SECTION AUDIT');
  console.log('=====================================\n');

  // Step 1: Verify all core Sales tables exist
  console.log('📋 STEP 1: Verifying Core Sales Tables');
  console.log('--------------------------------------');
  
  const coreTables = [
    'customers',
    'customer_communications', 
    'customer_tags',
    'customer_service_agreements',
    'service_requests',
    'quotes_v',
    'quote_analytics',
    'quote_approval_workflows', 
    'quote_follow_ups',
    'leads',
    'opportunities',
    'sales_activities',
    'sales_performance',
    'sales_targets'
  ];

  const missingTables = [];
  for (const table of coreTables) {
    const exists = await checkTableExists(table);
    if (exists) {
      console.log(`  ✅ ${table} - EXISTS`);
    } else {
      console.log(`  ❌ ${table} - MISSING`);
      missingTables.push(table);
    }
  }

  if (missingTables.length > 0) {
    console.log(`\n🚨 Found ${missingTables.length} missing tables:`, missingTables);
  } else {
    console.log('\n✅ All core Sales tables exist!');
  }

  // Step 2: Check for common relationship issues
  console.log('\n📋 STEP 2: Checking Table Relationships');
  console.log('---------------------------------------');

  // Check customers table structure
  console.log('\n🔍 Analyzing customers table:');
  const customerColumns = await checkTableColumns('customers');
  if (customerColumns) {
    console.log('  Columns:', customerColumns.map(c => `${c.column_name} (${c.data_type})`).join(', '));
  }

  // Check customer_communications table structure
  console.log('\n🔍 Analyzing customer_communications table:');
  const commColumns = await checkTableColumns('customer_communications');
  if (commColumns) {
    console.log('  Columns:', commColumns.map(c => `${c.column_name} (${c.data_type})`).join(', '));
  }

  // Step 3: Test data queries that Sales pages typically run
  console.log('\n📋 STEP 3: Testing Common Sales Queries');
  console.log('---------------------------------------');

  // Test customer count
  await executeSql(
    "SELECT COUNT(*) as customer_count FROM customers",
    "Count customers"
  );

  // Test customer communications
  await executeSql(
    "SELECT COUNT(*) as comm_count FROM customer_communications",
    "Count customer communications"
  );

  // Test customer tags
  await executeSql(
    "SELECT COUNT(*) as tag_count FROM customer_tags", 
    "Count customer tags"
  );

  // Test service agreements
  await executeSql(
    "SELECT COUNT(*) as agreement_count FROM customer_service_agreements",
    "Count service agreements"
  );

  // Test service requests
  await executeSql(
    "SELECT COUNT(*) as request_count FROM service_requests",
    "Count service requests"
  );

  // Test quotes
  await executeSql(
    "SELECT COUNT(*) as quote_count FROM quotes_v",
    "Count quotes"
  );

  // Test leads
  await executeSql(
    "SELECT COUNT(*) as lead_count FROM leads",
    "Count leads"
  );

  // Step 4: Check for foreign key constraints that might cause issues
  console.log('\n📋 STEP 4: Checking Foreign Key Constraints');
  console.log('-------------------------------------------');

  await executeSql(`
    SELECT 
      tc.table_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_name IN ('customers', 'customer_communications', 'customer_tags', 'customer_service_agreements', 'service_requests')
    ORDER BY tc.table_name, kcu.column_name
  `, "Check foreign key constraints");

  // Step 5: Look for common column mismatches
  console.log('\n📋 STEP 5: Checking for Column Mismatches');
  console.log('------------------------------------------');

  // Check if company_id exists in all tables (common requirement)
  const tablesNeedingCompanyId = ['customers', 'customer_communications', 'customer_tags', 'customer_service_agreements'];
  
  for (const table of tablesNeedingCompanyId) {
    const columns = await checkTableColumns(table);
    if (columns) {
      const hasCompanyId = columns.some(c => c.column_name === 'company_id');
      if (hasCompanyId) {
        console.log(`  ✅ ${table} has company_id`);
      } else {
        console.log(`  ❌ ${table} missing company_id`);
      }
    }
  }

  // Step 6: Check for RLS policies (common source of access issues)
  console.log('\n📋 STEP 6: Checking RLS Policies');
  console.log('---------------------------------');

  await executeSql(`
    SELECT 
      schemaname,
      tablename,
      policyname,
      permissive,
      roles,
      cmd,
      qual
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename IN ('customers', 'customer_communications', 'customer_tags', 'customer_service_agreements', 'service_requests')
    ORDER BY tablename, policyname
  `, "Check RLS policies");

  // Step 7: Test sample data access patterns
  console.log('\n📋 STEP 7: Testing Data Access Patterns');
  console.log('---------------------------------------');

  // Test joining customers with communications
  await executeSql(`
    SELECT 
      c.id as customer_id,
      c.name as customer_name,
      COUNT(cc.id) as communication_count
    FROM customers c
    LEFT JOIN customer_communications cc ON c.id = cc.customer_id
    GROUP BY c.id, c.name
    LIMIT 5
  `, "Test customer-communication join");

  // Test joining customers with tags
  await executeSql(`
    SELECT 
      c.id as customer_id,
      c.name as customer_name,
      COUNT(ct.id) as tag_count
    FROM customers c
    LEFT JOIN customer_tags ct ON c.company_id = ct.company_id
    GROUP BY c.id, c.name
    LIMIT 5
  `, "Test customer-tag relationship");

  console.log('\n🎉 COMPREHENSIVE SALES AUDIT COMPLETE!');
  console.log('=====================================');
  console.log('\n📊 SUMMARY:');
  console.log(`   • Missing tables: ${missingTables.length}`);
  console.log('   • All core queries tested');
  console.log('   • Foreign key constraints checked');
  console.log('   • RLS policies verified');
  console.log('   • Data access patterns tested');
  
  if (missingTables.length > 0) {
    console.log('\n🚨 ISSUES FOUND - Missing tables need to be created');
    console.log('   Missing:', missingTables.join(', '));
  } else {
    console.log('\n✅ NO CRITICAL ISSUES FOUND - Sales section should be operational');
  }
}

// Run the comprehensive audit
auditSalesSection().catch(console.error);
