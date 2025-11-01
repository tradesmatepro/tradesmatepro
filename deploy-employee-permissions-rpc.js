const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

async function deploy() {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Read SQL file
    const sql = fs.readFileSync('sql files/create_employee_permissions_rpc.sql', 'utf8');
    
    console.log('📝 Deploying employee permissions RPC...\n');
    
    // Execute SQL
    await client.query(sql);
    
    console.log('✅ RPC deployed successfully!\n');
    
    // Verify function exists
    const result = await client.query(`
      SELECT routine_name, routine_type
      FROM information_schema.routines
      WHERE routine_name = 'upsert_employee_permissions'
      AND routine_schema = 'public'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Verification: Function exists');
      console.log(`   Name: ${result.rows[0].routine_name}`);
      console.log(`   Type: ${result.rows[0].routine_type}\n`);
    }
    
    console.log('🎉 Deployment complete!');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

deploy();

