const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

async function fixUserRoleEnum() {
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
    
    // Read and execute the user role enum fix SQL
    const sql = fs.readFileSync('fix_user_role_enum_complete.sql', 'utf8');
    console.log('🔄 Fixing user_role_enum to match locked schema...');
    
    const result = await client.query(sql);
    console.log('✅ user_role_enum updated successfully!');
    
    // Show the results
    if (result.length > 0) {
      console.log('\n📋 Current user_role_enum values:');
      result[result.length - 1].rows.forEach(row => {
        console.log(`  - ${row.enumlabel}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error fixing user_role_enum:', error.message);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

fixUserRoleEnum();
