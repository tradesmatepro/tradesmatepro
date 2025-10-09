const { Client } = require('pg');

const projectRef = 'cxlqzejzraczumqmsrcx';
const config = {
  host: 'aws-1-us-west-1.pooler.supabase.com',
  port: 5432,
  user: `postgres.${projectRef}`,
  password: 'Alphaecho19!',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
};

async function auditSchema() {
  const client = new Client(config);
  
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // 1. Check companies table columns
    console.log('=== COMPANIES TABLE COLUMNS ===');
    const companiesRes = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='companies'
      ORDER BY column_name
    `);
    companiesRes.rows.forEach(row => {
      console.log(`  ${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // 2. Check settings table columns
    console.log('\n=== SETTINGS TABLE COLUMNS ===');
    const settingsRes = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='settings'
      ORDER BY column_name
    `);
    settingsRes.rows.forEach(row => {
      console.log(`  ${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // 3. Check rate_cards for active vs is_active
    console.log('\n=== RATE_CARDS ACTIVE COLUMN ===');
    const rateCardsRes = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='rate_cards'
      AND column_name IN ('active', 'is_active')
    `);
    if (rateCardsRes.rows.length === 0) {
      console.log('  ❌ Neither "active" nor "is_active" column found!');
    } else {
      rateCardsRes.rows.forEach(row => {
        console.log(`  ✅ ${row.column_name} (${row.data_type})`);
      });
    }

    // 4. Check missing tables
    console.log('\n=== MISSING TABLES CHECK ===');
    const tables = ['tags', 'company_tags', 'auto_accept_rules', 'integration_tokens'];
    for (const table of tables) {
      const res = await client.query(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_schema='public' AND table_name=$1
        ) as exists
      `, [table]);
      const exists = res.rows[0].exists;
      console.log(`  ${exists ? '✅' : '❌'} ${table}: ${exists ? 'EXISTS' : 'MISSING'}`);
    }

    // 5. Check profiles for preferences column
    console.log('\n=== PROFILES TABLE PREFERENCES ===');
    const profilesRes = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='profiles'
      AND column_name = 'preferences'
    `);
    if (profilesRes.rows.length === 0) {
      console.log('  ❌ preferences column MISSING from profiles table');
    } else {
      console.log(`  ✅ preferences (${profilesRes.rows[0].data_type})`);
    }

    // 6. Check companies for specific missing columns from logs
    console.log('\n=== COMPANIES MISSING COLUMNS ===');
    const expectedCols = [
      'company_logo_url',
      'accepts_emergency',
      'emergency_fee',
      'nights_weekends'
    ];
    for (const col of expectedCols) {
      const res = await client.query(`
        SELECT column_name
        FROM information_schema.columns 
        WHERE table_schema='public' AND table_name='companies'
        AND column_name = $1
      `, [col]);
      const exists = res.rows.length > 0;
      console.log(`  ${exists ? '✅' : '❌'} ${col}: ${exists ? 'EXISTS' : 'MISSING'}`);
    }

    // 7. Check if company_settings still exists
    console.log('\n=== LEGACY TABLES ===');
    const legacyRes = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema='public' AND table_name='company_settings'
      ) as exists
    `);
    console.log(`  company_settings: ${legacyRes.rows[0].exists ? '⚠️ STILL EXISTS (should be deprecated)' : '✅ REMOVED'}`);

    console.log('\n✅ Schema audit complete');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

auditSchema();

