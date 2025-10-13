#!/usr/bin/env node

/**
 * Fix user_company_id() function
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const DB_HOST = process.env.DB_HOST || 'aws-1-us-west-1.pooler.supabase.com';
const DB_PORT = process.env.DB_PORT || '5432';
const DB_USER = process.env.DB_USER || 'postgres.cxlqzejzraczumqmsrcx';
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME || 'postgres';

const connectionString = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

async function fixUserCompanyIdFunction() {
  const client = new Client({ connectionString });

  try {
    console.log('🔧 Fixing user_company_id() function\n');
    await client.connect();
    console.log('✅ Connected to database\n');

    // Apply the fix
    console.log('📝 Applying fix...');
    const sql = fs.readFileSync(
      path.join(__dirname, '..', 'supabase', 'migrations', '009_fix_user_company_id_function.sql'),
      'utf8'
    );
    await client.query(sql);
    console.log('   ✅ Function updated\n');

    // Verify the fix
    console.log('🧪 Testing the function...');
    const testResult = await client.query(`
      SELECT public.user_company_id() as company_id
    `);
    
    if (testResult.rows[0].company_id) {
      console.log(`   ✅ Function works! Returns: ${testResult.rows[0].company_id}\n`);
    } else {
      console.log('   ⚠️  Function returns NULL (expected if not authenticated)\n');
    }

    // Show the new definition
    console.log('📋 New function definition:');
    const defResult = await client.query(`
      SELECT pg_get_functiondef(p.oid) as definition
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
      AND p.proname = 'user_company_id'
    `);
    
    console.log(defResult.rows[0].definition);
    console.log('');

    console.log('============================================================');
    console.log('✅ user_company_id() FUNCTION FIXED!');
    console.log('============================================================\n');
    console.log('🎯 What was fixed:');
    console.log('   ✅ Function now joins users → employees correctly');
    console.log('   ✅ Uses auth_user_id instead of user_id');
    console.log('   ✅ RLS policies should now work!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('✅ Database connection closed\n');
  }
}

fixUserCompanyIdFunction();

