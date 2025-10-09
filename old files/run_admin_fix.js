const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

async function runAdminFix() {
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
    
    // Read the SQL file
    const sql = fs.readFileSync('fix_admin_dashboard_schema.sql', 'utf8');
    console.log('📖 Loaded SQL file');
    
    // Execute the SQL
    console.log('🔧 Executing schema fixes...');
    const result = await client.query(sql);
    
    console.log('✅ Schema fixes completed successfully!');
    console.log('📋 Results:', result);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('📋 Full error:', error);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

runAdminFix();
