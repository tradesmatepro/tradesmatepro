/**
 * Check if settings is a table or view
 */

const { Client } = require('pg');
require('dotenv').config();

async function checkSettings() {
  let client;
  try {
    console.log('🔍 Checking settings table/view...\n');

    client = new Client({
      host: process.env.SUPABASE_DB_HOST,
      port: parseInt(process.env.SUPABASE_DB_PORT || 5432),
      database: process.env.SUPABASE_DB_NAME || 'postgres',
      user: process.env.SUPABASE_DB_USER,
      password: process.env.SUPABASE_DB_PASSWORD,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();

    // Check if settings is a table or view
    const result = await client.query(`
      SELECT table_type, table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'settings'
    `);

    if (result.rows.length === 0) {
      console.log('❌ settings table/view does not exist');
      return;
    }

    const { table_type, table_name } = result.rows[0];
    console.log(`✅ Found: ${table_name} (Type: ${table_type})\n`);

    // Get columns
    const colResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'settings'
      ORDER BY ordinal_position
      LIMIT 20
    `);

    console.log('📋 First 20 columns:');
    colResult.rows.forEach(row => {
      console.log(`   ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });

    console.log(`\n📊 Total columns: ${colResult.rows.length}`);

    // Check for specific columns we need
    const checkCols = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'settings'
      AND column_name IN (
        'enable_customer_self_scheduling',
        'auto_approve_customer_selections',
        'job_buffer_minutes',
        'default_buffer_before_minutes',
        'default_buffer_after_minutes'
      )
    `);

    console.log('\n🔍 Checking for required columns:');
    const foundCols = checkCols.rows.map(r => r.column_name);
    const requiredCols = [
      'enable_customer_self_scheduling',
      'auto_approve_customer_selections',
      'job_buffer_minutes',
      'default_buffer_before_minutes',
      'default_buffer_after_minutes'
    ];

    requiredCols.forEach(col => {
      const status = foundCols.includes(col) ? '✅' : '❌';
      console.log(`   ${status} ${col}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (client) {
      await client.end();
    }
  }
}

checkSettings();

