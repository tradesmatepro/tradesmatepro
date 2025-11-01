#!/usr/bin/env node

const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

async function deploySkipSchedulingFix() {
  const client = new Client({
    host: process.env.SUPABASE_DB_HOST,
    port: process.env.SUPABASE_DB_PORT,
    database: process.env.SUPABASE_DB_NAME,
    user: process.env.SUPABASE_DB_USER,
    password: process.env.SUPABASE_DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected');

    console.log('\n📝 Deploying skip scheduling RPC fix...');
    const sql = fs.readFileSync('sql files/skip_scheduling_workflow.sql', 'utf8');
    
    await client.query(sql);
    console.log('✅ Skip scheduling RPC updated successfully!');

    console.log('\n🔌 Disconnecting...');
    await client.end();
    console.log('✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

deploySkipSchedulingFix();

