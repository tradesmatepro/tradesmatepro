const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

async function checkCompaniesTable() {
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
    
    // Read and execute the table check SQL
    const sql = fs.readFileSync('check_companies_table.sql', 'utf8');
    console.log('🔍 Checking companies table structure...');
    
    const result = await client.query(sql);
    
    console.log('\n📋 Companies table columns:');
    result[0].rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable}, default: ${row.column_default || 'none'})`);
    });
    
    console.log('\n🔒 Companies table constraints:');
    if (result[1].rows.length > 0) {
      result[1].rows.forEach(row => {
        console.log(`  - ${row.constraint_name} (${row.constraint_type}): ${row.constraint_definition}`);
      });
    } else {
      console.log('  - No constraints found');
    }
    
  } catch (error) {
    console.error('❌ Error checking companies table:', error.message);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

checkCompaniesTable();
