#!/usr/bin/env node

/**
 * Apply Login Fix Migration
 * Fixes the users table RLS policy to allow login
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env file');
  process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyLoginFix() {
  console.log('🔐 Applying Login Fix Migration\n');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '005_fix_users_table_login_policy.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Applying: Fix users table login policy');
    console.log('   File:', migrationPath);

    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql }).catch(async () => {
      // If exec_sql doesn't exist, try direct execution
      const { error: directError } = await supabase.from('_migrations').insert({
        name: '005_fix_users_table_login_policy',
        executed_at: new Date().toISOString()
      });
      
      // Execute SQL directly using pg
      const { Client } = require('pg');
      const client = new Client({
        connectionString: process.env.DATABASE_URL || `postgresql://postgres:${process.env.DB_PASSWORD}@db.cxlqzejzraczumqmsrcx.supabase.co:5432/postgres`
      });
      
      await client.connect();
      await client.query(sql);
      await client.end();
      
      return { error: directError };
    });

    if (error) {
      console.log('   ❌ Error:', error.message);
      return false;
    }

    console.log('   ✅ Success!\n');
    return true;

  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    return false;
  }
}

async function main() {
  console.log('Connecting to Supabase database...');
  
  const success = await applyLoginFix();
  
  if (success) {
    console.log('============================================================');
    console.log('✅ Login fix applied successfully!');
    console.log('============================================================\n');
    console.log('🧪 Test login now:');
    console.log('   1. Refresh the app');
    console.log('   2. Try logging in');
    console.log('   3. Check console for errors\n');
  } else {
    console.log('============================================================');
    console.log('❌ Login fix failed');
    console.log('============================================================\n');
    process.exit(1);
  }
}

main().catch(console.error);

