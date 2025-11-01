/**
 * Fix Storage Bucket RLS Policies
 * 
 * Issue: Storage buckets have RLS enabled but no policies
 * Error: "new row violates row-level security policy"
 * 
 * Solution: Create RLS policies for authenticated users to upload/read files
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing environment variables!');
  console.error('Need: REACT_APP_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function fixStorageRLS() {
  console.log('🔧 Fixing Storage Bucket RLS Policies...\n');

  const buckets = ['files', 'company-files', 'company-assets'];

  // SQL to create RLS policies for storage buckets
  const sql = `
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete files" ON storage.objects;

-- Create policies for authenticated users
-- Allow INSERT (upload)
CREATE POLICY "Authenticated users can upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow SELECT (read/download)
CREATE POLICY "Authenticated users can read files"
ON storage.objects
FOR SELECT
TO authenticated
USING (true);

-- Allow UPDATE (update metadata)
CREATE POLICY "Authenticated users can update files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow DELETE (delete files)
CREATE POLICY "Authenticated users can delete files"
ON storage.objects
FOR DELETE
TO authenticated
USING (true);
`;

  try {
    console.log('📝 Creating RLS policies for storage.objects table...');
    
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      // Try direct SQL execution instead
      console.log('⚠️ RPC failed, trying direct SQL execution...');
      
      // Execute each policy separately
      const policies = [
        {
          name: 'upload',
          sql: `CREATE POLICY "Authenticated users can upload files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (true);`
        },
        {
          name: 'read',
          sql: `CREATE POLICY "Authenticated users can read files" ON storage.objects FOR SELECT TO authenticated USING (true);`
        },
        {
          name: 'update',
          sql: `CREATE POLICY "Authenticated users can update files" ON storage.objects FOR UPDATE TO authenticated USING (true) WITH CHECK (true);`
        },
        {
          name: 'delete',
          sql: `CREATE POLICY "Authenticated users can delete files" ON storage.objects FOR DELETE TO authenticated USING (true);`
        }
      ];

      console.log('\n⚠️ Cannot create policies via JavaScript.');
      console.log('📋 Please run this SQL manually in Supabase SQL Editor:\n');
      console.log('='.repeat(80));
      console.log(sql);
      console.log('='.repeat(80));
      console.log('\n📍 Go to: https://supabase.com/dashboard/project/[your-project]/sql/new');
      console.log('📝 Copy the SQL above and run it\n');
      
      return;
    }

    console.log('✅ RLS policies created successfully!\n');

    // Verify buckets are public
    console.log('🔍 Verifying bucket settings...\n');
    for (const bucketName of buckets) {
      const { data: bucket, error: bucketError } = await supabase
        .storage
        .getBucket(bucketName);

      if (bucketError) {
        console.log(`❌ ${bucketName}: Error - ${bucketError.message}`);
      } else {
        console.log(`✅ ${bucketName}: ${bucket.public ? 'PUBLIC' : 'PRIVATE'}`);
      }
    }

    console.log('\n✅ Storage RLS fix complete!');
    console.log('\n🧪 Test by uploading a file in the Documents page');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n📋 Manual SQL to run in Supabase SQL Editor:\n');
    console.log('='.repeat(80));
    console.log(sql);
    console.log('='.repeat(80));
  }
}

fixStorageRLS().catch(console.error);

