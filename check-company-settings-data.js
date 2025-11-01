const { Client } = require('pg');

const client = new Client({
  host: 'aws-1-us-west-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.cxlqzejzraczumqmsrcx',
  password: 'Alphaecho19!',
  ssl: { rejectUnauthorized: false }
});

async function check() {
  try {
    await client.connect();
    
    // Check company_settings data
    const result = await client.query('SELECT id, company_id, deposit_type FROM company_settings LIMIT 5');
    console.log('Current company_settings data:');
    result.rows.forEach(row => {
      console.log(`  ID: ${row.id}, Company: ${row.company_id}, Deposit Type: ${row.deposit_type}`);
    });
    
    // Check settings data
    const settingsResult = await client.query('SELECT id, company_id, deposit_type FROM settings LIMIT 5');
    console.log('\nCurrent settings data:');
    settingsResult.rows.forEach(row => {
      console.log(`  ID: ${row.id}, Company: ${row.company_id}, Deposit Type: ${row.deposit_type}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

check();

