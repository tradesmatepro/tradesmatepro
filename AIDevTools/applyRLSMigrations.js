const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

console.log('🔐 Applying RLS Migrations to Supabase\n');

// Load database credentials from .env
require('dotenv').config();

const client = new Client({
  host: process.env.SUPABASE_DB_HOST || process.env.DB_HOST,
  port: process.env.SUPABASE_DB_PORT || process.env.DB_PORT || 5432,
  database: process.env.SUPABASE_DB_NAME || process.env.DB_NAME || 'postgres',
  user: process.env.SUPABASE_DB_USER || process.env.DB_USER,
  password: process.env.SUPABASE_DB_PASSWORD || process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

async function applyMigration(filePath, description) {
  console.log(`\n📄 Applying: ${description}`);
  console.log(`   File: ${filePath}`);
  
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    await client.query(sql);
    console.log(`   ✅ Success!`);
    return true;
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function main() {
  try {
    console.log('Connecting to Supabase database...');
    await client.connect();
    console.log('✅ Connected!\n');

    const migrations = [
      {
        file: path.join(__dirname, '../supabase/migrations/001_enable_rls_all_tables.sql'),
        description: 'Enable RLS on all 88 tables + helper functions'
      },
      {
        file: path.join(__dirname, '../supabase/migrations/002_create_company_policies.sql'),
        description: 'Create company-scoped RLS policies'
      }
    ];

    let successCount = 0;
    let failCount = 0;

    for (const migration of migrations) {
      const success = await applyMigration(migration.file, migration.description);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 Migration Summary:');
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log(`${'='.repeat(60)}\n`);

    if (failCount === 0) {
      console.log('🎉 All migrations applied successfully!');
      console.log('\n🔐 RLS is now enabled on all tables!');
      console.log('✅ Company data isolation is active!');
      console.log('✅ Public portal token access is configured!');
      console.log('\n📋 Next steps:');
      console.log('   1. Test cross-company isolation');
      console.log('   2. Test role-based permissions');
      console.log('   3. Test public portal access');
      console.log('   4. Deploy to production');
    } else {
      console.log('⚠️  Some migrations failed. Review errors above.');
    }

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n✅ Database connection closed.');
  }
}

main();

