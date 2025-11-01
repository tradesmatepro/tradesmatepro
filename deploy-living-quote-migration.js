const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env file');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function deployMigration() {
  console.log('🚀 Deploying Living Quote Link System Migration...\n');

  // Read migration file
  const migrationPath = path.join(__dirname, 'migrations', '2025-10-22_living_quote_link_system.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

  console.log('📄 Migration file loaded:', migrationPath);
  console.log('📏 Size:', migrationSQL.length, 'bytes\n');

  // Split into individual statements (simple split by semicolon)
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log('📊 Found', statements.length, 'SQL statements\n');

  let successCount = 0;
  let errorCount = 0;

  // Execute each statement
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';
    const preview = statement.substring(0, 100).replace(/\n/g, ' ');
    
    console.log(`\n[${i + 1}/${statements.length}] Executing: ${preview}...`);

    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
      
      if (error) {
        // Try direct execution if RPC doesn't exist
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
          },
          body: JSON.stringify({ sql: statement })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }

        console.log('  ✅ Success (via direct execution)');
        successCount++;
      } else {
        console.log('  ✅ Success');
        successCount++;
      }
    } catch (err) {
      console.error('  ❌ Error:', err.message);
      errorCount++;
      
      // Don't stop on errors - some statements might fail if already exist
      if (err.message.includes('already exists') || err.message.includes('does not exist')) {
        console.log('  ℹ️  Continuing (non-critical error)...');
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 DEPLOYMENT SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log(`📝 Total: ${statements.length}`);
  console.log('='.repeat(60));

  if (errorCount === 0) {
    console.log('\n🎉 Migration deployed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Test the customer portal with a quote link');
    console.log('2. Verify the RPC function works: get_living_quote_data()');
    console.log('3. Check that tokens expire 2 weeks after final status\n');
  } else {
    console.log('\n⚠️  Migration completed with some errors.');
    console.log('Please review the errors above and fix manually if needed.\n');
  }
}

// Run deployment
deployMigration().catch(err => {
  console.error('\n💥 Fatal error:', err);
  process.exit(1);
});

