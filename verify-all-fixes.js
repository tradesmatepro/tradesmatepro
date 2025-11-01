// Verify all schema fixes
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function verifyFixes() {
  console.log('🔍 Verifying all schema fixes...\n');
  
  // Check storage buckets
  console.log('📦 STORAGE BUCKETS:');
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  
  if (bucketsError) {
    console.error('❌ Error listing buckets:', bucketsError.message);
  } else {
    buckets.forEach(bucket => {
      console.log(`   ✅ ${bucket.name} (${bucket.public ? 'PUBLIC' : 'PRIVATE'})`);
    });
  }
  
  // Check tables
  console.log('\n📊 TABLES:');
  const tablesToCheck = ['attachments', 'job_photos', 'documents', 'work_order_attachments'];
  
  for (const table of tablesToCheck) {
    const { data, error } = await supabase
      .from(table)
      .select('id')
      .limit(0);
    
    if (error) {
      console.log(`   ❌ ${table} - ${error.message}`);
    } else {
      console.log(`   ✅ ${table} - EXISTS`);
    }
  }
  
  console.log('\n✅ Verification complete!');
  console.log('\n📝 NEXT STEPS:');
  console.log('   1. Test file upload in Documents page');
  console.log('   2. Test job photo upload');
  console.log('   3. Check console for errors (should be no more 404s)');
}

verifyFixes();

