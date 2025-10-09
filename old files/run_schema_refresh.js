const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

async function refreshSchemaCache() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    // Read and execute the schema refresh SQL
    const sql = fs.readFileSync('refresh_schema_cache.sql', 'utf8');
    console.log('🔄 Refreshing schema cache...');
    
    await client.query(sql);
    console.log('✅ Schema cache refreshed successfully!');
    
  } catch (error) {
    console.error('❌ Error refreshing schema cache:', error.message);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

refreshSchemaCache();
