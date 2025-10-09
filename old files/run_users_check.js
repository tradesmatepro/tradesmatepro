const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

async function checkUsersTable() {
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
    
    const sql = fs.readFileSync('check_users_table.sql', 'utf8');
    const result = await client.query(sql);
    
    console.log('📋 Users table columns:');
    result[0].rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable}, default: ${row.column_default || 'none'})`);
    });
    
    console.log('\n⚠️  NOT NULL columns without defaults:');
    if (result[1].rows.length > 0) {
      result[1].rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type} (REQUIRED!)`);
      });
    } else {
      console.log('  - None found (good!)');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

checkUsersTable();
