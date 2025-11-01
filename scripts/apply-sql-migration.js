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

async function applyMigration() {
  try {
    console.log('🔄 Connecting to database...');
    await client.connect();
    console.log('✅ Connected\n');

    console.log('📝 Applying migration: Add missing onboarding columns\n');

    // 1. Add columns to companies table
    console.log('1️⃣  Adding columns to companies table...');
    await client.query(`
      ALTER TABLE companies
        ADD COLUMN IF NOT EXISTS industry TEXT,
        ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
        ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/Los_Angeles';
    `);
    console.log('   ✅ Done\n');

    // 2. Add columns to company_settings table (settings is a VIEW, not a table)
    console.log('2️⃣  Adding columns to company_settings table...');
    await client.query(`
      ALTER TABLE company_settings
        ADD COLUMN IF NOT EXISTS industry TEXT,
        ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
        ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/Los_Angeles';
    `);
    console.log('   ✅ Done\n');

    // 3. Set default working_days for rows that don't have it (JSONB format)
    console.log('3️⃣  Setting default working_days for empty rows...');
    await client.query(`
      UPDATE company_settings
      SET working_days = '{"monday":true,"tuesday":true,"wednesday":true,"thursday":true,"friday":true,"saturday":false,"sunday":false}'::jsonb
      WHERE working_days IS NULL OR working_days = '{}';
    `);
    console.log('   ✅ Done\n');

    console.log('✅ Migration completed successfully!\n');
    console.log('📋 Summary:');
    console.log('  ✓ Added industry, tags, timezone to companies table');
    console.log('  ✓ Added industry, tags, timezone to company_settings table');
    console.log('  ✓ Set default working_days (JSONB format) for empty rows');
    console.log('\n📝 Schema Notes:');
    console.log('  - settings is a VIEW that reads from company_settings');
    console.log('  - working_days is stored as JSONB: {day: true/false, ...}');
    console.log('  - tags is stored as TEXT[] array');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyMigration();

