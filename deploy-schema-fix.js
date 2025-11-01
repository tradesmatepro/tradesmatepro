const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

(async () => {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    console.log('🔌 Connected\n');
    const sql = fs.readFileSync('migrations/2025-10-22_fix_rpc_schema_match.sql', 'utf8');
    await client.query(sql);
    console.log('✅ RPC FUNCTION UPDATED TO MATCH ACTUAL SCHEMA!\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('🔌 Disconnected\n');
  }
})();

