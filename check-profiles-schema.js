require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

async function checkSchema() {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    // Check profiles table schema
    const schemaResult = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'profiles' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 PROFILES TABLE SCHEMA:');
    console.log('='.repeat(60));
    schemaResult.rows.forEach(row => {
      console.log(`  ${row.column_name.padEnd(30)} ${row.data_type.padEnd(15)} ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Check if preferences column exists and its type
    const prefsCol = schemaResult.rows.find(r => r.column_name === 'preferences');
    if (prefsCol) {
      console.log('\n✅ preferences column EXISTS');
      console.log(`   Type: ${prefsCol.data_type}`);
    } else {
      console.log('\n❌ preferences column MISSING');
    }
    
    // Check sample data
    const dataResult = await client.query(`
      SELECT user_id, preferences 
      FROM profiles 
      WHERE preferences IS NOT NULL 
      LIMIT 3
    `);
    
    console.log('\n📊 SAMPLE DATA (first 3 rows with preferences):');
    console.log('='.repeat(60));
    if (dataResult.rows.length === 0) {
      console.log('  No rows with preferences found');
    } else {
      dataResult.rows.forEach(row => {
        console.log(`  user_id: ${row.user_id}`);
        console.log(`  preferences: ${JSON.stringify(row.preferences, null, 2)}`);
        console.log('  ---');
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkSchema();

