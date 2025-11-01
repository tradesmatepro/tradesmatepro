const { Client } = require('pg');

async function checkTables() {
  const config = {
    host: 'aws-1-us-west-1.pooler.supabase.com',
    port: 5432,
    user: 'postgres.cxlqzejzraczumqmsrcx',
    password: 'Alphaecho19!',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  };

  console.log('🔍 Checking tables for notification triggers...\n');
  const client = new Client(config);
  await client.connect();

  try {
    // Check which tables exist
    const tables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('payments', 'schedule_events', 'pto_requests', 'expenses', 'inventory_transactions', 'inventory_items', 'timesheets')
      ORDER BY table_name;
    `);
    
    console.log('📋 TABLES THAT EXIST:');
    if (tables.rows.length > 0) {
      console.table(tables.rows);
    } else {
      console.log('❌ None of the expected tables exist\n');
    }

    // Check all public tables
    console.log('\n📋 ALL PUBLIC TABLES:');
    const allTables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    console.table(allTables.rows);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkTables().catch(console.error);

