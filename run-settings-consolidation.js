const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
  host: 'aws-1-us-west-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.cxlqzejzraczumqmsrcx',
  password: 'Alphaecho19!',
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    const sql = fs.readFileSync('migrations/2025-10-22_consolidate_settings_tables.sql', 'utf8');
    
    await client.query(sql);
    console.log('✅ Settings consolidation migration completed successfully!');
    
    // Verify
    const result = await client.query('SELECT COUNT(*) FROM company_settings');
    console.log(`✅ company_settings table now has ${result.rows[0].count} records`);
    
    // Show sample
    const sample = await client.query('SELECT company_id, timezone, currency, default_tax_rate FROM company_settings LIMIT 1');
    if (sample.rows.length > 0) {
      console.log('✅ Sample record:', sample.rows[0]);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();

