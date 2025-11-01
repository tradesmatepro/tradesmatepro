/**
 * Execute SQL directly using pg library
 * Uses database credentials from .env file
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function executeSql() {
  let client;
  try {
    console.log('🔧 Connecting to PostgreSQL database...\n');

    // Get credentials from environment
    const dbHost = process.env.SUPABASE_DB_HOST;
    const dbPort = process.env.SUPABASE_DB_PORT || 5432;
    const dbName = process.env.SUPABASE_DB_NAME || 'postgres';
    const dbUser = process.env.SUPABASE_DB_USER;
    const dbPassword = process.env.SUPABASE_DB_PASSWORD;

    if (!dbHost || !dbUser || !dbPassword) {
      throw new Error('Missing database credentials in .env file');
    }

    console.log(`📍 Connecting to: ${dbUser}@${dbHost}:${dbPort}/${dbName}\n`);

    // Create connection
    client = new Client({
      host: dbHost,
      port: parseInt(dbPort),
      database: dbName,
      user: dbUser,
      password: dbPassword,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();
    console.log('✅ Connected to database\n');

    // Read SQL file
    const sqlPath = path.join(__dirname, 'sql files', 'fix_rpc_structure.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('🚀 Executing SQL...\n');
    
    // Execute the SQL
    const result = await client.query(sql);
    
    console.log('✅ SQL executed successfully!\n');
    console.log('📊 Result:', result);

    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL FIXES DEPLOYED SUCCESSFULLY!\n');
    console.log('Next steps:');
    console.log('1. Clear browser cache (Ctrl+Shift+Delete)');
    console.log('2. Refresh the page (F5)');
    console.log('3. Check logs.md - errors should be GONE\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('\n⚠️  Could not connect to database. Make sure:');
      console.log('   1. Database host is accessible');
      console.log('   2. Database credentials in .env are correct');
      console.log('   3. You have pg package installed: npm install pg');
    }
  } finally {
    if (client) {
      await client.end();
      console.log('\n✅ Database connection closed');
    }
  }
}

executeSql();

