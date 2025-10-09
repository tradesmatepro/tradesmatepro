const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

async function checkPhoneConstraint() {
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
    
    const sql = fs.readFileSync('check_phone_constraint.sql', 'utf8');
    const result = await client.query(sql);
    
    console.log('📱 Profiles phone constraints:');
    result[0].rows.forEach(row => {
      console.log('  -', row.constraint_name + ':', row.constraint_definition);
    });
    
    console.log('\n📱 Companies phone constraints:');
    result[1].rows.forEach(row => {
      console.log('  -', row.constraint_name + ':', row.constraint_definition);
    });
    
    console.log('\n🧪 Phone format tests:');
    result[2].rows.forEach(row => {
      console.log('  - Raw phone (5417050524):', row.raw_phone_matches);
      console.log('  - Formatted phone (+15417050524):', row.formatted_phone_matches);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

checkPhoneConstraint();
