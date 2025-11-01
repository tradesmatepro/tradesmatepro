// Create missing tables for TradeMate Pro
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function createMissingTables() {
  console.log('🔧 Creating missing tables for TradeMate Pro...\n');

  try {
    // Use direct SQL execution via fetch
    const url = process.env.REACT_APP_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;

    // Create attachments table
    console.log('📄 Creating attachments table...');
    const attachmentsSQL = `
      CREATE TABLE IF NOT EXISTS public.attachments (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
        work_order_id UUID REFERENCES public.work_orders(id) ON DELETE CASCADE,
        uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
        file_url TEXT NOT NULL,
        file_name TEXT,
        file_type TEXT,
        file_size INTEGER,
        auto_tags TEXT[],
        ocr_text TEXT,
        uploaded_at TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_attachments_company_id ON public.attachments(company_id);
      CREATE INDEX IF NOT EXISTS idx_attachments_work_order_id ON public.attachments(work_order_id);
      CREATE INDEX IF NOT EXISTS idx_attachments_uploaded_at ON public.attachments(uploaded_at DESC);
    `;

    const attachmentsRes = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: attachmentsSQL })
    });

    if (!attachmentsRes.ok) {
      const error = await attachmentsRes.text();
      console.error('❌ Error creating attachments table:', error);
    } else {
      console.log('✅ attachments table created successfully\n');
    }

    // Create job_photos table
    console.log('📸 Creating job_photos table...');
    const photosSQL = `
      CREATE TABLE IF NOT EXISTS public.job_photos (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
        work_order_id UUID REFERENCES public.work_orders(id) ON DELETE CASCADE,
        photo_url TEXT NOT NULL,
        tag TEXT CHECK (tag IN ('BEFORE', 'DURING', 'AFTER')),
        uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_job_photos_company_id ON public.job_photos(company_id);
      CREATE INDEX IF NOT EXISTS idx_job_photos_work_order_id ON public.job_photos(work_order_id);
      CREATE INDEX IF NOT EXISTS idx_job_photos_created_at ON public.job_photos(created_at DESC);
    `;

    const photosRes = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: photosSQL })
    });

    if (!photosRes.ok) {
      const error = await photosRes.text();
      console.error('❌ Error creating job_photos table:', error);
    } else {
      console.log('✅ job_photos table created successfully\n');
    }

    // Verify tables exist
    console.log('🔍 Verifying tables...');
    const { data: tables, error: verifyError } = await supabase
      .from('attachments')
      .select('id')
      .limit(0);

    if (!verifyError || verifyError.code === 'PGRST116') {
      console.log('✅ attachments table verified');
    } else {
      console.log('⚠️  attachments table verification:', verifyError?.message);
    }

    const { data: photos, error: photosVerifyError } = await supabase
      .from('job_photos')
      .select('id')
      .limit(0);

    if (!photosVerifyError || photosVerifyError.code === 'PGRST116') {
      console.log('✅ job_photos table verified');
    } else {
      console.log('⚠️  job_photos table verification:', photosVerifyError?.message);
    }

    console.log('\n✅ Table creation complete!');
    console.log('\n⚠️  NEXT STEP: Create storage buckets in Supabase Dashboard');
    console.log('   Go to: https://supabase.com/dashboard/project/cxlqzejzraczumqmsrcx/storage/buckets');
    console.log('   Create 3 PUBLIC buckets:');
    console.log('   1. files');
    console.log('   2. company-files');
    console.log('   3. company-assets');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createMissingTables();

