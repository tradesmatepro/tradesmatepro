const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

async function check() {
  try {
    await client.connect();
    
    // Check column types in company_settings
    const result = await client.query(`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns
      WHERE table_name = 'company_settings'
      AND column_name IN ('working_days', 'industry', 'tags')
      AND table_schema = 'public'
    `);
    
    console.log('📊 Column types in company_settings:');
    if (result.rows.length === 0) {
      console.log('  (no matching columns found)');
    } else {
      result.rows.forEach(row => {
        console.log(`  ${row.column_name}: ${row.data_type} (${row.udt_name})`);
      });
    }

    // Check a sample row
    const sampleResult = await client.query(`
      SELECT working_days, industry, tags
      FROM company_settings
      LIMIT 1
    `);
    
    console.log('\n📋 Sample data:');
    if (sampleResult.rows.length > 0) {
      const row = sampleResult.rows[0];
      console.log(`  working_days: ${JSON.stringify(row.working_days)} (type: ${typeof row.working_days})`);
      console.log(`  industry: ${JSON.stringify(row.industry)}`);
      console.log(`  tags: ${JSON.stringify(row.tags)}`);
    }
    
  } finally {
    await client.end();
  }
}

check();

