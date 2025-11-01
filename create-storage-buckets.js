// Create missing storage buckets for TradeMate Pro
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function createStorageBuckets() {
  console.log('🪣 Creating missing storage buckets for TradeMate Pro...\n');
  
  const bucketsToCreate = [
    { id: 'files', name: 'files', public: true },
    { id: 'company-files', name: 'company-files', public: true },
    { id: 'company-assets', name: 'company-assets', public: true }
  ];
  
  for (const bucket of bucketsToCreate) {
    try {
      console.log(`📦 Creating bucket: ${bucket.name}...`);
      
      const { data, error } = await supabase.storage.createBucket(bucket.id, {
        public: bucket.public,
        fileSizeLimit: 52428800 // 50MB
      });
      
      if (error) {
        if (error.message.includes('already exists')) {
          console.log(`✅ ${bucket.name} already exists`);
        } else {
          console.error(`❌ Error creating ${bucket.name}:`, error.message);
        }
      } else {
        console.log(`✅ ${bucket.name} created successfully`);
      }
    } catch (error) {
      console.error(`❌ Error creating ${bucket.name}:`, error.message);
    }
  }
  
  // Verify buckets exist
  console.log('\n🔍 Verifying buckets...');
  const { data: buckets, error } = await supabase.storage.listBuckets();
  
  if (error) {
    console.error('❌ Error listing buckets:', error.message);
  } else {
    console.log('\n📊 Existing buckets:');
    buckets.forEach(bucket => {
      console.log(`   ✅ ${bucket.name} (${bucket.public ? 'PUBLIC' : 'PRIVATE'})`);
    });
  }
  
  console.log('\n✅ Storage bucket setup complete!');
}

createStorageBuckets();

