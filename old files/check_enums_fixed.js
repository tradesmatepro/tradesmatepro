const { Client } = require('pg');
require('dotenv').config();

async function checkEnums() {
  const client = new Client({
    connectionString: process.env.SUPABASE_DB_URL
  });
  
  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    // Check user_role_enum values
    const roleResult = await client.query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role_enum')
      ORDER BY enumsortorder;
    `);
    
    console.log('🔍 user_role_enum values:', roleResult.rows.map(r => r.enumlabel));
    
    // Check if EMPLOYEE exists
    const hasEmployee = roleResult.rows.some(r => r.enumlabel === 'EMPLOYEE');
    console.log('📋 Has EMPLOYEE role:', hasEmployee);
    
    if (!hasEmployee) {
      console.log('➕ Adding EMPLOYEE to user_role_enum...');
      await client.query(`ALTER TYPE user_role_enum ADD VALUE 'EMPLOYEE';`);
      console.log('✅ EMPLOYEE added successfully');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkEnums();
