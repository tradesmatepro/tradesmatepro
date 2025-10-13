const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.SUPABASE_DB_HOST || process.env.DB_HOST,
  port: process.env.SUPABASE_DB_PORT || process.env.DB_PORT || 5432,
  database: process.env.SUPABASE_DB_NAME || process.env.DB_NAME || 'postgres',
  user: process.env.SUPABASE_DB_USER || process.env.DB_USER,
  password: process.env.SUPABASE_DB_PASSWORD || process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  
  console.log('📋 Profiles Table Schema:\n');
  const result = await client.query(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles'
    ORDER BY ordinal_position;
  `);
  
  console.table(result.rows);
  
  console.log('\n📋 Employees Table Schema:\n');
  const empResult = await client.query(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'employees'
    ORDER BY ordinal_position;
  `);
  
  console.table(empResult.rows);
  
  await client.end();
}

main().catch(console.error);

