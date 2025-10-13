#!/usr/bin/env node

/**
 * Fix Login Policy - Apply users table RLS fix
 */

const { Client } = require('pg');
require('dotenv').config();

const DB_HOST = process.env.DB_HOST || 'aws-1-us-west-1.pooler.supabase.com';
const DB_PORT = process.env.DB_PORT || '5432';
const DB_USER = process.env.DB_USER || 'postgres.cxlqzejzraczumqmsrcx';
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME || 'postgres';

const connectionString = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

async function fixLoginPolicy() {
  const client = new Client({ connectionString });

  try {
    console.log('🔐 Fixing Users Table Login Policy\n');
    await client.connect();
    console.log('✅ Connected to database\n');

    // Step 1: Drop existing policies
    console.log('📝 Step 1: Dropping existing policies...');
    await client.query(`
      DROP POLICY IF EXISTS "company_users_select" ON users;
      DROP POLICY IF EXISTS "company_users_insert" ON users;
      DROP POLICY IF EXISTS "company_users_update" ON users;
      DROP POLICY IF EXISTS "company_users_delete" ON users;
    `);
    console.log('   ✅ Old policies dropped\n');

    // Step 2: Create new SELECT policy (allows own record + company)
    console.log('📝 Step 2: Creating new SELECT policy...');
    await client.query(`
      CREATE POLICY "users_select_own_or_company"
      ON users FOR SELECT
      USING (
        auth_user_id = auth.uid()
        OR
        company_id = public.user_company_id()
      );
    `);
    console.log('   ✅ SELECT policy created\n');

    // Step 3: Create INSERT policy
    console.log('📝 Step 3: Creating INSERT policy...');
    await client.query(`
      CREATE POLICY "users_insert_company"
      ON users FOR INSERT
      WITH CHECK (company_id = public.user_company_id());
    `);
    console.log('   ✅ INSERT policy created\n');

    // Step 4: Create UPDATE policy
    console.log('📝 Step 4: Creating UPDATE policy...');
    await client.query(`
      CREATE POLICY "users_update_own_or_company"
      ON users FOR UPDATE
      USING (
        auth_user_id = auth.uid()
        OR
        company_id = public.user_company_id()
      )
      WITH CHECK (
        company_id = public.user_company_id()
      );
    `);
    console.log('   ✅ UPDATE policy created\n');

    // Step 5: Create DELETE policy
    console.log('📝 Step 5: Creating DELETE policy...');
    await client.query(`
      CREATE POLICY "users_delete_company"
      ON users FOR DELETE
      USING (company_id = public.user_company_id());
    `);
    console.log('   ✅ DELETE policy created\n');

    console.log('============================================================');
    console.log('✅ Login policy fixed successfully!');
    console.log('============================================================\n');
    console.log('🧪 Test login now:');
    console.log('   1. Refresh the app in your browser');
    console.log('   2. Try logging in');
    console.log('   3. Check console for errors\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('✅ Database connection closed\n');
  }
}

fixLoginPolicy();

