/**
 * Find the underlying table for settings VIEW and its definition
 */

const { Client } = require('pg');
require('dotenv').config();

async function findSettingsView() {
  let client;
  try {
    console.log('🔍 Finding settings VIEW definition...\n');

    client = new Client({
      host: process.env.SUPABASE_DB_HOST,
      port: parseInt(process.env.SUPABASE_DB_PORT || 5432),
      database: process.env.SUPABASE_DB_NAME || 'postgres',
      user: process.env.SUPABASE_DB_USER,
      password: process.env.SUPABASE_DB_PASSWORD,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();

    // Get VIEW definition
    const viewDef = await client.query(`
      SELECT view_definition
      FROM information_schema.views
      WHERE table_schema = 'public' AND table_name = 'settings'
    `);

    if (viewDef.rows.length > 0) {
      console.log('📋 VIEW Definition:');
      console.log(viewDef.rows[0].view_definition);
      console.log('\n');
    }

    // Find all tables that might be the underlying table
    const tables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' 
      AND table_name LIKE '%setting%'
      ORDER BY table_name
    `);

    console.log('📊 All settings-related tables:');
    tables.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    // Check company_settings table
    console.log('\n🔍 Checking company_settings table...');
    const companySetting = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'company_settings'
      ORDER BY ordinal_position
    `);

    if (companySetting.rows.length > 0) {
      console.log('✅ company_settings table exists with columns:');
      companySetting.rows.forEach(row => {
        console.log(`   - ${row.column_name}: ${row.data_type}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (client) {
      await client.end();
    }
  }
}

findSettingsView();

