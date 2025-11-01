const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

async function check() {
  try {
    await client.connect();
    
    // Check if settings is a view or table
    const result = await client.query(`
      SELECT table_type, table_name 
      FROM information_schema.tables 
      WHERE table_name IN ('settings', 'company_settings', 'companies')
      AND table_schema = 'public'
    `);
    
    console.log('📊 Table types:');
    result.rows.forEach(row => {
      console.log(`  ${row.table_name}: ${row.table_type}`);
    });
    
  } finally {
    await client.end();
  }
}

check();

