const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

async function fixCompanyNumberGeneration() {
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
    
    // Read and execute the company number fix SQL
    const sql = fs.readFileSync('fix_company_number_generation.sql', 'utf8');
    console.log('🔧 Setting up company_number auto-generation...');
    
    const result = await client.query(sql);
    console.log('✅ Company number generation system installed!');
    
    // Show the test results
    if (result.length > 0) {
      const lastResult = result[result.length - 1];
      if (lastResult.rows && lastResult.rows.length > 0) {
        console.log('\n🧪 Test results:');
        lastResult.rows.forEach(row => {
          Object.keys(row).forEach(key => {
            console.log(`  ${key}: ${row[key]}`);
          });
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error setting up company number generation:', error.message);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

fixCompanyNumberGeneration();
