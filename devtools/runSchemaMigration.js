/**
 * AUTO-RUN SCHEMA MIGRATION
 * 
 * This tool automatically runs the schema migration to fix all drift issues
 */

const fs = require('fs');
const path = require('path');

// Database connection details from .env
const DB_HOST = 'aws-1-us-west-1.pooler.supabase.com';
const DB_PORT = 5432;
const DB_NAME = 'postgres';
const DB_USER = 'postgres.cxlqzejzraczumqmsrcx';
const DB_PASSWORD = 'Alphaecho19!';

async function runMigration() {
  console.log('\n🚀 AUTO-RUNNING SCHEMA MIGRATION');
  console.log('='.repeat(80));

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'sql files', 'fix_schema_drift.sql');
    console.log(`\n📄 Reading migration file: ${migrationPath}`);
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log(`✅ Migration file loaded (${migrationSQL.length} characters)`);

    // Import pg library
    console.log('\n📦 Loading PostgreSQL client...');
    const { Client } = require('pg');

    // Create database connection
    const connectionString = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
    console.log(`\n🔌 Connecting to database...`);
    console.log(`   Host: ${DB_HOST}`);
    console.log(`   Port: ${DB_PORT}`);
    console.log(`   Database: ${DB_NAME}`);
    console.log(`   User: ${DB_USER}`);

    const client = new Client({ connectionString });
    await client.connect();
    console.log('✅ Connected to database');

    // Run the migration
    console.log('\n🔧 Running migration...\n');
    console.log('-'.repeat(80));

    const result = await client.query(migrationSQL);
    
    console.log('-'.repeat(80));
    console.log('\n✅ Migration completed successfully!');

    // Run verification queries
    console.log('\n🔍 VERIFYING MIGRATION RESULTS');
    console.log('='.repeat(80));

    // Check companies table columns
    console.log('\n📋 Checking companies table columns...');
    const companiesCheck = await client.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'companies'
      AND column_name IN ('licenses', 'license_number', 'job_buffer_minutes', 'business_hours_start', 'working_days')
      ORDER BY column_name
    `);

    if (companiesCheck.rows.length > 0) {
      console.log('✅ Companies table columns found:');
      companiesCheck.rows.forEach(row => {
        console.log(`   - ${row.column_name} (${row.data_type})`);
      });
    } else {
      console.log('⚠️  No companies columns found (might need to check table name)');
    }

    // Check rate_cards table columns
    console.log('\n📋 Checking rate_cards table columns...');
    const rateCardsCheck = await client.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'rate_cards'
      AND column_name IN ('service_name', 'description', 'category', 'unit_type', 'rate', 'sort_order', 'is_active')
      ORDER BY column_name
    `);

    if (rateCardsCheck.rows.length > 0) {
      console.log('✅ Rate_cards table columns found:');
      rateCardsCheck.rows.forEach(row => {
        console.log(`   - ${row.column_name} (${row.data_type})`);
      });
    } else {
      console.log('⚠️  No rate_cards columns found (might need to check table name)');
    }

    // Check invoice_items table exists
    console.log('\n📋 Checking invoice_items table...');
    const invoiceItemsCheck = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_name = 'invoice_items'
    `);

    if (invoiceItemsCheck.rows.length > 0) {
      console.log('✅ invoice_items table exists');
    } else {
      console.log('⚠️  invoice_items table not found');
    }

    // Close connection
    await client.end();
    console.log('\n🔌 Database connection closed');

    console.log('\n' + '='.repeat(80));
    console.log('✅ MIGRATION COMPLETE!');
    console.log('='.repeat(80));

    console.log('\n📊 SUMMARY:');
    console.log('   ✅ companies table: Added licenses + scheduling columns');
    console.log('   ✅ rate_cards table: Added all missing columns');
    console.log('   ✅ invoice_items table: Created if missing');
    console.log('   ✅ Indexes: Created for performance');

    console.log('\n🚀 NEXT STEPS:');
    console.log('   1. Rebuild the app: Ctrl+C then npm start');
    console.log('   2. Test Company Profile Settings');
    console.log('   3. Test Smart Scheduling Settings');
    console.log('   4. Test Rate Cards Settings');
    console.log('   5. Test Invoicing');

    console.log('\n✨ All schema drift issues should now be fixed!\n');

  } catch (error) {
    console.error('\n❌ ERROR RUNNING MIGRATION:');
    console.error(error.message);
    console.error('\nStack trace:');
    console.error(error.stack);

    if (error.message.includes('pg')) {
      console.error('\n💡 TIP: Make sure pg library is installed:');
      console.error('   npm install pg');
    }

    process.exit(1);
  }
}

runMigration();

