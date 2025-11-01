/**
 * Deploy portal token generation fix
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const DB_HOST = process.env.SUPABASE_DB_HOST || process.env.DB_HOST;
const DB_PORT = process.env.SUPABASE_DB_PORT || process.env.DB_PORT;
const DB_NAME = process.env.SUPABASE_DB_NAME || process.env.DB_NAME;
const DB_USER = process.env.SUPABASE_DB_USER || process.env.DB_USER;
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD || process.env.DB_PASSWORD;

const connectionString = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

(async () => {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('🔌 Connected to database\n');
    
    const sql = fs.readFileSync('migrations/2025-10-22_fix_portal_token_generation.sql', 'utf8');
    
    await client.query('BEGIN');
    console.log('🔄 Transaction started\n');
    
    console.log('⚙️  Deploying portal token generation fix...\n');
    await client.query(sql);
    
    await client.query('COMMIT');
    console.log('\n✅ Transaction committed');
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ PORTAL TOKEN FIX DEPLOYED');
    console.log('='.repeat(60));
    
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (e) {}
    
    console.error('\n❌ Error:', error.message);
    if (error.detail) console.error('Detail:', error.detail);
    
  } finally {
    await client.end();
    console.log('\n🔌 Disconnected\n');
  }
})();

