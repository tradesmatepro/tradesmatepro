const { Client } = require('pg');

// Database connection config (from db-dumper.js)
const DB_CONFIGS = [
  {
    name: 'Pooler Connection',
    host: 'aws-1-us-west-1.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    user: 'postgres.cxlqzejzraczumqmsrcx',
    password: 'Alphaecho19!',
    ssl: { rejectUnauthorized: false }
  },
  {
    name: 'Direct Connection',
    host: 'db.cxlqzejzraczumqmsrcx.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'Alphaecho19!',
    ssl: { rejectUnauthorized: false }
  }
];

async function getWorkingConnection() {
  for (const config of DB_CONFIGS) {
    try {
      console.log(`🔄 Trying ${config.name}...`);
      const client = new Client(config);
      await client.connect();
      console.log(`✅ ${config.name} successful!\n`);
      return client;
    } catch (error) {
      console.log(`❌ ${config.name} failed: ${error.message}`);
      continue;
    }
  }
  throw new Error('All database connections failed');
}

(async () => {
  let client;
  try {
    client = await getWorkingConnection();

    // Check company_settings onboarding_progress
    const res = await client.query(`
      SELECT company_id, onboarding_progress 
      FROM company_settings 
      ORDER BY created_at DESC
      LIMIT 5
    `);

    console.log('📊 Company Settings Onboarding Progress:\n');
    res.rows.forEach((row, index) => {
      console.log(`${index + 1}. Company ID: ${row.company_id}`);
      console.log('   Onboarding Progress:', JSON.stringify(row.onboarding_progress, null, 2));
      console.log('   Completed At:', row.onboarding_progress?.completed_at || 'NOT SET');
      console.log('   Skipped:', row.onboarding_progress?.skipped || false);
      console.log('');
    });

    // Test the is_onboarding_complete function
    console.log('\n🔍 Testing is_onboarding_complete function:\n');
    for (const row of res.rows) {
      const checkRes = await client.query(`
        SELECT is_onboarding_complete($1) as is_complete
      `, [row.company_id]);
      
      console.log(`Company ${row.company_id}: ${checkRes.rows[0].is_complete ? '✅ COMPLETE' : '❌ INCOMPLETE'}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
})();

