const { Client } = require('pg');
require('dotenv').config();

const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

(async () => {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    console.log('🔍 Checking work_orders deposit columns...\n');
    
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'work_orders' 
      AND column_name LIKE '%deposit%'
      ORDER BY column_name
    `);
    
    console.log('Deposit-related columns in work_orders:');
    if (result.rows.length === 0) {
      console.log('  ❌ NO DEPOSIT COLUMNS FOUND!\n');
    } else {
      result.rows.forEach(row => {
        console.log(`  ✅ ${row.column_name} (${row.data_type}, nullable: ${row.is_nullable})`);
      });
    }
    
    console.log('\n🔍 Checking ALL work_orders columns for payment/deposit related...\n');
    
    const allCols = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns 
      WHERE table_name = 'work_orders' 
      AND (
        column_name LIKE '%deposit%' OR
        column_name LIKE '%payment%' OR
        column_name LIKE '%paid%' OR
        column_name LIKE '%amount%'
      )
      ORDER BY column_name
    `);
    
    console.log('Payment/Amount related columns:');
    allCols.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
})();

