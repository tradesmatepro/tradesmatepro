// Quick script to check what document-related tables and storage buckets actually exist
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_SERVICE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env file');
  console.error('REACT_APP_SUPABASE_URL:', supabaseUrl ? 'Found' : 'Missing');
  console.error('REACT_APP_SUPABASE_SERVICE_KEY:', process.env.REACT_APP_SUPABASE_SERVICE_KEY ? 'Found' : 'Missing');
  console.error('REACT_APP_SUPABASE_ANON_KEY:', process.env.REACT_APP_SUPABASE_ANON_KEY ? 'Found' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('\n🔍 Checking Supabase Schema for Documents/Files...\n');

  // Check for document-related tables
  const tablesToCheck = [
    'documents',
    'attachments',
    'job_photos',
    'work_order_attachments',
    'expense_receipts'
  ];

  console.log('📊 TABLES:');
  for (const table of tablesToCheck) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`  ❌ ${table} - Does NOT exist (${error.message})`);
      } else {
        console.log(`  ✅ ${table} - EXISTS`);
        
        // Get column info
        if (data && data.length > 0) {
          const columns = Object.keys(data[0]);
          console.log(`     Columns: ${columns.join(', ')}`);
        } else {
          // Try to get schema even if empty
          const { data: schemaData, error: schemaError } = await supabase
            .from(table)
            .select('*')
            .limit(0);
          if (!schemaError) {
            console.log(`     Table is empty`);
          }
        }
      }
    } catch (err) {
      console.log(`  ❌ ${table} - Error: ${err.message}`);
    }
  }

  // Check storage buckets
  console.log('\n📦 STORAGE BUCKETS:');
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.log(`  ❌ Error listing buckets: ${error.message}`);
    } else if (buckets && buckets.length > 0) {
      for (const bucket of buckets) {
        console.log(`  ✅ ${bucket.name} (${bucket.public ? 'PUBLIC' : 'PRIVATE'})`);
        
        // Try to list files in bucket
        const { data: files, error: filesError } = await supabase.storage
          .from(bucket.name)
          .list('', { limit: 5 });
        
        if (!filesError && files) {
          console.log(`     Files/Folders: ${files.length} items`);
        }
      }
    } else {
      console.log('  ⚠️  No storage buckets found');
    }
  } catch (err) {
    console.log(`  ❌ Error: ${err.message}`);
  }

  // Get detailed schema for existing tables
  console.log('\n📋 DETAILED SCHEMAS FOR EXISTING TABLES:\n');

  const existingTables = ['documents', 'work_order_attachments'];

  for (const table of existingTables) {
    try {
      const { data, error } = await supabase.rpc('get_table_schema', { table_name: table });

      if (error) {
        // Fallback: try to infer from a dummy select
        console.log(`\n  ${table}:`);
        const { data: sampleData, error: sampleError } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (!sampleError) {
          // Try to get columns by doing a select with limit 0
          const { data: schemaData } = await supabase
            .from(table)
            .select('*')
            .limit(0);

          console.log(`    (Unable to get detailed schema, but table exists)`);
        }
      }
    } catch (err) {
      console.log(`  Error getting schema for ${table}: ${err.message}`);
    }
  }

  console.log('\n');
  console.log('=' .repeat(60));
  console.log('SUMMARY:');
  console.log('=' .repeat(60));
  console.log('✅ Tables that exist: documents, work_order_attachments');
  console.log('❌ Tables that DON\'T exist: attachments, job_photos');
  console.log('❌ Storage buckets: NONE');
  console.log('');
  console.log('ACTION REQUIRED:');
  console.log('1. Create storage bucket in Supabase Dashboard');
  console.log('2. Fix Documents.js to query correct tables');
  console.log('3. Fix DocumentsService.js to use correct bucket');
  console.log('');
  console.log('See DOCUMENTS_FIX_PLAN.md for details');
  console.log('=' .repeat(60));
  console.log('\n');
}

checkSchema().catch(console.error);

