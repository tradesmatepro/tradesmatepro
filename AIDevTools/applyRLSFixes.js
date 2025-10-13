#!/usr/bin/env node

/**
 * Apply RLS Fixes - Automatically fix profiles and companies tables
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

async function applyRLSFixes() {
  const client = new Client({ connectionString });

  try {
    console.log('🚀 FULL AUTO FIX - Applying RLS Fixes\n');
    await client.connect();
    console.log('✅ Connected to database\n');

    // Fix 1: profiles table
    console.log('📝 Fix 1: profiles Table RLS Policies');
    const profilesSQL = fs.readFileSync(
      path.join(__dirname, '..', 'supabase', 'migrations', '006_fix_profiles_table_rls.sql'),
      'utf8'
    );
    await client.query(profilesSQL);
    console.log('   ✅ profiles table policies created\n');

    // Fix 2: companies table
    console.log('📝 Fix 2: companies Table RLS Policies');
    const companiesSQL = fs.readFileSync(
      path.join(__dirname, '..', 'supabase', 'migrations', '007_fix_companies_table_rls.sql'),
      'utf8'
    );
    await client.query(companiesSQL);
    console.log('   ✅ companies table policies created\n');

    // Fix 3: inventory_stock, employee_timesheets, employee_time_off tables
    console.log('📝 Fix 3: Remaining Tables RLS Policies');
    const remainingSQL = fs.readFileSync(
      path.join(__dirname, '..', 'supabase', 'migrations', '008_fix_remaining_table_rls.sql'),
      'utf8'
    );
    await client.query(remainingSQL);
    console.log('   ✅ inventory_stock, employee_timesheets, employee_time_off policies created\n');

    console.log('============================================================');
    console.log('✅ RLS FIXES APPLIED SUCCESSFULLY!');
    console.log('============================================================\n');
    console.log('📊 What was fixed:');
    console.log('   ✅ profiles table - 4 policies created');
    console.log('   ✅ companies table - 4 policies created');
    console.log('   ✅ inventory_stock table - 4 policies created');
    console.log('   ✅ employee_timesheets table - 4 policies created');
    console.log('   ✅ employee_time_off table - 4 policies created');
    console.log('   ✅ Expected to fix ~400 errors!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('✅ Database connection closed\n');
  }
}

applyRLSFixes();

