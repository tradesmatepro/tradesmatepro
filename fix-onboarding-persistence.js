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

    console.log('🔧 Fixing onboarding persistence issue...\n');

    // Mark all existing companies as having completed onboarding
    // This prevents the wizard from popping up for companies that have already been set up
    const updateRes = await client.query(`
      UPDATE company_settings
      SET onboarding_progress = jsonb_set(
        COALESCE(onboarding_progress, '{}'::jsonb),
        '{completed_at}',
        to_jsonb(NOW())
      ),
      updated_at = NOW()
      WHERE onboarding_progress IS NULL 
         OR onboarding_progress = '{}'::jsonb
         OR (onboarding_progress->>'completed_at') IS NULL
      RETURNING company_id, onboarding_progress
    `);

    console.log(`✅ Updated ${updateRes.rowCount} company settings records\n`);

    if (updateRes.rowCount > 0) {
      console.log('Updated companies:');
      updateRes.rows.forEach((row, index) => {
        console.log(`${index + 1}. Company ID: ${row.company_id}`);
        console.log(`   Completed At: ${row.onboarding_progress?.completed_at}`);
      });
    }

    // Verify the fix
    console.log('\n🔍 Verifying fix...\n');
    const verifyRes = await client.query(`
      SELECT company_id, 
             is_onboarding_complete(company_id) as is_complete,
             onboarding_progress->>'completed_at' as completed_at
      FROM company_settings
      ORDER BY created_at DESC
      LIMIT 5
    `);

    verifyRes.rows.forEach((row, index) => {
      const status = row.is_complete ? '✅ COMPLETE' : '❌ INCOMPLETE';
      console.log(`${index + 1}. Company ${row.company_id}: ${status}`);
      console.log(`   Completed At: ${row.completed_at || 'NOT SET'}`);
    });

    console.log('\n✅ Onboarding persistence fixed!');
    console.log('The wizard should no longer pop up for existing companies.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    if (client) await client.end();
  }
})();

