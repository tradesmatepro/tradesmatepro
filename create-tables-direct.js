// Create missing tables using direct SQL
require('dotenv').config();
const { Client } = require('pg');

async function createTables() {
  const client = new Client({
    host: process.env.SUPABASE_DB_HOST,
    port: process.env.SUPABASE_DB_PORT,
    database: process.env.SUPABASE_DB_NAME,
    user: process.env.SUPABASE_DB_USER,
    password: process.env.SUPABASE_DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('🔗 Connected to database\n');

    // Create attachments table
    console.log('📄 Creating attachments table...');
    await client.query(`
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
    `);
    console.log('✅ attachments table created\n');

    // Create indexes for attachments
    console.log('📑 Creating indexes for attachments...');
    await client.query(`CREATE INDEX IF NOT EXISTS idx_attachments_company_id ON public.attachments(company_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_attachments_work_order_id ON public.attachments(work_order_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_attachments_uploaded_at ON public.attachments(uploaded_at DESC);`);
    console.log('✅ Indexes created\n');

    // Create job_photos table
    console.log('📸 Creating job_photos table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.job_photos (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
        work_order_id UUID REFERENCES public.work_orders(id) ON DELETE CASCADE,
        photo_url TEXT NOT NULL,
        tag TEXT CHECK (tag IN ('BEFORE', 'DURING', 'AFTER')),
        uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ job_photos table created\n');

    // Create indexes for job_photos
    console.log('📑 Creating indexes for job_photos...');
    await client.query(`CREATE INDEX IF NOT EXISTS idx_job_photos_company_id ON public.job_photos(company_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_job_photos_work_order_id ON public.job_photos(work_order_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_job_photos_created_at ON public.job_photos(created_at DESC);`);
    console.log('✅ Indexes created\n');

    // Verify tables
    console.log('🔍 Verifying tables...');
    const result = await client.query(`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public'
        AND table_name IN ('attachments', 'job_photos')
      ORDER BY table_name;
    `);

    console.log('📊 Created tables:');
    result.rows.forEach(row => {
      console.log(`   ✅ ${row.table_name} (${row.column_count} columns)`);
    });

    console.log('\n✅ All tables created successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

createTables();

