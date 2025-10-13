#!/usr/bin/env node

/**
 * Check helper functions used in RLS policies
 */

const { Client } = require('pg');
require('dotenv').config();

const DB_HOST = process.env.DB_HOST || 'aws-1-us-west-1.pooler.supabase.com';
const DB_PORT = process.env.DB_PORT || '5432';
const DB_USER = process.env.DB_USER || 'postgres.cxlqzejzraczumqmsrcx';
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME || 'postgres';

const connectionString = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

async function checkHelperFunctions() {
  const client = new Client({ connectionString });

  try {
    console.log('🔍 Checking RLS helper functions\n');
    await client.connect();

    // Check user_company_id function
    console.log('📋 Step 1: Check user_company_id() function');
    const funcResult = await client.query(`
      SELECT 
        p.proname as function_name,
        pg_get_functiondef(p.oid) as definition
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
      AND p.proname = 'user_company_id'
    `);
    
    if (funcResult.rows.length === 0) {
      console.log('   ❌ user_company_id() function not found!\n');
    } else {
      console.log('   ✅ Function found:\n');
      console.log(funcResult.rows[0].definition);
      console.log('');
    }

    // Check is_admin function
    console.log('📋 Step 2: Check is_admin() function');
    const adminResult = await client.query(`
      SELECT 
        p.proname as function_name,
        pg_get_functiondef(p.oid) as definition
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
      AND p.proname = 'is_admin'
    `);
    
    if (adminResult.rows.length === 0) {
      console.log('   ❌ is_admin() function not found!\n');
    } else {
      console.log('   ✅ Function found:\n');
      console.log(adminResult.rows[0].definition);
      console.log('');
    }

    // Check is_super_admin function
    console.log('📋 Step 3: Check is_super_admin() function');
    const superAdminResult = await client.query(`
      SELECT 
        p.proname as function_name,
        pg_get_functiondef(p.oid) as definition
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
      AND p.proname = 'is_super_admin'
    `);
    
    if (superAdminResult.rows.length === 0) {
      console.log('   ❌ is_super_admin() function not found!\n');
    } else {
      console.log('   ✅ Function found:\n');
      console.log(superAdminResult.rows[0].definition);
      console.log('');
    }

    console.log('============================================================');
    console.log('✅ HELPER FUNCTIONS CHECK COMPLETE');
    console.log('============================================================\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

checkHelperFunctions();

