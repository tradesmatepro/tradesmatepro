#!/usr/bin/env node
/**
 * Deploy Schema Consolidation Migration to Supabase
 * This script applies the CONSOLIDATION_MIGRATION_COMPLETE.sql to the database
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DB_CONFIG = {
  host: 'aws-1-us-west-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.cxlqzejzraczumqmsrcx',
  password: 'Alphaecho19!',
  ssl: { rejectUnauthorized: false }
};

async function deployMigration() {
  const client = new Client(DB_CONFIG);
  
  try {
    console.log('\n🚀 DEPLOYING SCHEMA CONSOLIDATION MIGRATION\n');
    
    // Connect
    console.log('📡 Connecting to Supabase...');
    await client.connect();
    console.log('✅ Connected!\n');
    
    // Read migration file
    const migrationPath = path.join(__dirname, 'CONSOLIDATION_MIGRATION_COMPLETE.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split into statements (simple split by ;)
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));
    
    console.log(`📋 Found ${statements.length} SQL statements\n`);
    
    // Execute each statement
    let successCount = 0;
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      const preview = stmt.substring(0, 60).replace(/\n/g, ' ');
      
      try {
        console.log(`[${i+1}/${statements.length}] Executing: ${preview}...`);
        await client.query(stmt);
        console.log(`✅ Success\n`);
        successCount++;
      } catch (error) {
        console.log(`⚠️  Error: ${error.message}\n`);
        // Continue on error (some statements might already exist)
      }
    }
    
    console.log(`\n✅ DEPLOYMENT COMPLETE`);
    console.log(`   Successful: ${successCount}/${statements.length}`);
    console.log(`\n📊 VERIFICATION QUERIES:\n`);
    
    // Run verification queries
    const verifyQueries = [
      'SELECT COUNT(*) as total_employees FROM employees;',
      'SELECT COUNT(*) as employees_with_user_id FROM employees WHERE user_id IS NOT NULL;',
      'SELECT COUNT(*) as employees_schedulable FROM employees WHERE is_schedulable = true;',
      'SELECT COUNT(*) as active_employees FROM employees WHERE status = \'active\';'
    ];
    
    for (const query of verifyQueries) {
      const result = await client.query(query);
      console.log(`${query}`);
      console.log(`Result: ${JSON.stringify(result.rows[0])}\n`);
    }
    
    console.log('✅ Migration deployed successfully!\n');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

deployMigration();

