require('dotenv').config();
const { Client } = require('pg');

(async () => {
  const client = new Client({
    host: process.env.SUPABASE_DB_HOST,
    port: process.env.SUPABASE_DB_PORT,
    database: process.env.SUPABASE_DB_NAME,
    user: process.env.SUPABASE_DB_USER,
    password: process.env.SUPABASE_DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Check column types
    const res = await client.query(`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns 
      WHERE table_name = 'company_settings' 
      ORDER BY column_name
    `);
    
    console.log('company_settings columns:');
    res.rows.forEach(r => {
      console.log(`  ${r.column_name}: ${r.data_type} (${r.udt_name})`);
    });

    // Check actual data
    const dataRes = await client.query(`
      SELECT working_days FROM company_settings LIMIT 1
    `);
    
    if (dataRes.rows.length > 0) {
      console.log('\nSample working_days value:');
      console.log('  Type:', typeof dataRes.rows[0].working_days);
      console.log('  Value:', dataRes.rows[0].working_days);
    }

    await client.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();

