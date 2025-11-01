/**
 * Deploy RPC table name fix
 */

const { Client } = require('pg');
const fs = require('fs');
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
    
    const sql = fs.readFileSync('migrations/2025-10-22_fix_rpc_table_name.sql', 'utf8');
    
    console.log('⚙️  Deploying RPC table name fix...\n');
    await client.query(sql);
    
    console.log('\n✅ RPC FUNCTION FIXED!');
    console.log('📋 Changed: quote_items → work_order_line_items');
    console.log('📋 Added: quote_number, service address, sort_order\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.detail) console.error('Detail:', error.detail);
    
  } finally {
    await client.end();
    console.log('🔌 Disconnected\n');
  }
})();

