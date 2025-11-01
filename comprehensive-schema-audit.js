// Comprehensive Schema Audit: Frontend vs Backend
// This script checks what the frontend EXPECTS vs what actually EXISTS in Supabase
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_SERVICE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Tables that frontend code references
const FRONTEND_TABLES = [
  // Core
  'companies',
  'users',
  'profiles',
  'employees',
  'customers',
  'settings',
  'public_settings',
  
  // Work Orders Pipeline
  'work_orders',
  'work_order_line_items',
  'work_order_attachments',
  
  // Scheduling
  'schedule_events',
  'employee_availability',
  'employee_time_off',
  'job_assignments',
  
  // Documents & Files
  'documents',
  'attachments',
  'job_photos',
  'expense_receipts',
  
  // Finance
  'invoices',
  'invoice_line_items',
  'payments',
  'expenses',
  'purchase_orders',
  
  // Messaging
  'messages',
  'notifications',
  
  // Marketplace
  'marketplace_requests',
  'marketplace_responses',
  'marketplace_reviews',
  'company_tags',
  'request_tags',
  'auto_accept_rules',
  'company_approval_settings',
  
  // Customer Portal
  'customer_portal_accounts',
  'service_requests',
  'customer_reviews',
  
  // Other
  'service_contracts',
  'technician_locations',
  'items_catalog',
  'vendors',
  'company_customers'
];

const STORAGE_BUCKETS = [
  'files',
  'company-files',
  'company-assets'
];

async function auditDatabase() {
  console.log('\n' + '='.repeat(80));
  console.log('COMPREHENSIVE SCHEMA AUDIT: Frontend Expectations vs Database Reality');
  console.log('='.repeat(80) + '\n');

  const results = {
    tables: {
      exists: [],
      missing: [],
      empty: [],
      hasData: []
    },
    buckets: {
      exists: [],
      missing: []
    },
    issues: []
  };

  // Check Tables
  console.log('📊 CHECKING TABLES...\n');
  for (const tableName of FRONTEND_TABLES) {
    try {
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: false })
        .limit(1);
      
      if (error) {
        if (error.message.includes('does not exist') || error.message.includes('not found') || error.message.includes('schema cache')) {
          console.log(`  ❌ ${tableName.padEnd(35)} - DOES NOT EXIST`);
          results.tables.missing.push(tableName);
          results.issues.push({
            type: 'MISSING_TABLE',
            table: tableName,
            severity: 'HIGH',
            impact: 'Frontend queries will fail with 404 errors'
          });
        } else {
          console.log(`  ⚠️  ${tableName.padEnd(35)} - ERROR: ${error.message}`);
          results.issues.push({
            type: 'TABLE_ERROR',
            table: tableName,
            severity: 'MEDIUM',
            error: error.message
          });
        }
      } else {
        const hasData = data && data.length > 0;
        const status = hasData ? '✅ EXISTS (has data)' : '⚠️  EXISTS (empty)';
        console.log(`  ${status.padEnd(50)} ${tableName}`);
        results.tables.exists.push(tableName);
        
        if (hasData) {
          results.tables.hasData.push(tableName);
        } else {
          results.tables.empty.push(tableName);
        }
      }
    } catch (err) {
      console.log(`  ❌ ${tableName.padEnd(35)} - EXCEPTION: ${err.message}`);
      results.tables.missing.push(tableName);
    }
  }

  // Check Storage Buckets
  console.log('\n📦 CHECKING STORAGE BUCKETS...\n');
  try {
    const { data: allBuckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.log(`  ❌ Error listing buckets: ${error.message}`);
      results.issues.push({
        type: 'STORAGE_ERROR',
        severity: 'HIGH',
        error: error.message
      });
    } else {
      const existingBucketNames = (allBuckets || []).map(b => b.name);
      
      for (const bucketName of STORAGE_BUCKETS) {
        if (existingBucketNames.includes(bucketName)) {
          const bucket = allBuckets.find(b => b.name === bucketName);
          console.log(`  ✅ ${bucketName.padEnd(20)} - EXISTS (${bucket.public ? 'PUBLIC' : 'PRIVATE'})`);
          results.buckets.exists.push(bucketName);
        } else {
          console.log(`  ❌ ${bucketName.padEnd(20)} - DOES NOT EXIST`);
          results.buckets.missing.push(bucketName);
          results.issues.push({
            type: 'MISSING_BUCKET',
            bucket: bucketName,
            severity: 'HIGH',
            impact: 'File uploads will fail'
          });
        }
      }
      
      // Show any extra buckets not in our list
      const extraBuckets = existingBucketNames.filter(name => !STORAGE_BUCKETS.includes(name));
      if (extraBuckets.length > 0) {
        console.log('\n  📌 Additional buckets found:');
        extraBuckets.forEach(name => {
          const bucket = allBuckets.find(b => b.name === name);
          console.log(`     - ${name} (${bucket.public ? 'PUBLIC' : 'PRIVATE'})`);
        });
      }
    }
  } catch (err) {
    console.log(`  ❌ Exception: ${err.message}`);
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80) + '\n');
  
  console.log(`📊 TABLES:`);
  console.log(`   ✅ Exist: ${results.tables.exists.length}/${FRONTEND_TABLES.length}`);
  console.log(`   ❌ Missing: ${results.tables.missing.length}`);
  console.log(`   📝 Have Data: ${results.tables.hasData.length}`);
  console.log(`   ⚠️  Empty: ${results.tables.empty.length}`);
  
  console.log(`\n📦 STORAGE BUCKETS:`);
  console.log(`   ✅ Exist: ${results.buckets.exists.length}/${STORAGE_BUCKETS.length}`);
  console.log(`   ❌ Missing: ${results.buckets.missing.length}`);
  
  console.log(`\n⚠️  TOTAL ISSUES: ${results.issues.length}`);
  
  if (results.tables.missing.length > 0) {
    console.log(`\n❌ MISSING TABLES (${results.tables.missing.length}):`);
    results.tables.missing.forEach(t => console.log(`   - ${t}`));
  }
  
  if (results.buckets.missing.length > 0) {
    console.log(`\n❌ MISSING STORAGE BUCKETS (${results.buckets.missing.length}):`);
    results.buckets.missing.forEach(b => console.log(`   - ${b}`));
  }

  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      tablesChecked: FRONTEND_TABLES.length,
      tablesExist: results.tables.exists.length,
      tablesMissing: results.tables.missing.length,
      bucketsChecked: STORAGE_BUCKETS.length,
      bucketsExist: results.buckets.exists.length,
      bucketsMissing: results.buckets.missing.length,
      totalIssues: results.issues.length
    },
    tables: results.tables,
    buckets: results.buckets,
    issues: results.issues
  };

  fs.writeFileSync('SCHEMA_AUDIT_REPORT.json', JSON.stringify(report, null, 2));
  console.log(`\n📄 Detailed report saved to: SCHEMA_AUDIT_REPORT.json`);
  
  console.log('\n' + '='.repeat(80) + '\n');
  
  return results;
}

auditDatabase().catch(console.error);

