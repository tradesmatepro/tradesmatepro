#!/usr/bin/env node

/**
 * Deploy Living Quote Link System Migration to Supabase
 * Comprehensive deployment with error handling
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Load credentials
const credentials = JSON.parse(fs.readFileSync(path.join(__dirname, 'AIDevTools', 'credentials.json'), 'utf8'));

const accessToken = credentials.supabase.accessToken;
const projectRef = credentials.supabase.projectRef;

// Read migration SQL
const migrationPath = path.join(__dirname, 'migrations', '2025-10-22_living_quote_link_system.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

console.log('🚀 Deploying Living Quote Link System Migration to Supabase...\n');

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.supabase.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function deployMigration() {
  try {
    console.log('📝 Migration SQL loaded');
    console.log(`📊 SQL size: ${migrationSQL.length} bytes\n`);

    // Split SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📋 Found ${statements.length} SQL statements\n`);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const statementNum = i + 1;

      try {
        const preview = statement.substring(0, 50).replace(/\n/g, ' ');
        console.log(`[${statementNum}/${statements.length}] ${preview}...`);
        
        // Execute SQL via Supabase Management API
        const response = await makeRequest(
          'POST',
          `/v1/projects/${projectRef}/database/query`,
          { query: statement + ';' }
        );

        if (response.status >= 400) {
          const errorMsg = response.data?.message || response.data?.error || JSON.stringify(response.data);
          
          // Check if it's an "already exists" error (which is OK)
          if (errorMsg.toLowerCase().includes('already exists')) {
            console.log(`✅ Already exists (OK)\n`);
            successCount++;
          } else {
            throw new Error(errorMsg);
          }
        } else {
          console.log(`✅ Success\n`);
          successCount++;
        }
      } catch (err) {
        console.log(`⚠️  Error: ${err.message}\n`);
        errorCount++;
        errors.push({
          statement: statementNum,
          sql: statement.substring(0, 80),
          error: err.message
        });
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('📊 DEPLOYMENT SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Successful: ${successCount}/${statements.length}`);
    console.log(`❌ Failed: ${errorCount}/${statements.length}`);
    console.log(`📈 Success Rate: ${((successCount / statements.length) * 100).toFixed(1)}%\n`);

    if (errorCount === 0) {
      console.log('🎉 ALL STATEMENTS EXECUTED SUCCESSFULLY!\n');
      console.log('✅ Living Quote Link System is now deployed to Supabase!');
      console.log('🔗 Tokens expire 2 weeks after work_order reaches paid/closed status');
      console.log('📊 Activity tracking enabled');
      console.log('🔄 Unified RPC function available: get_living_quote_data()');
      console.log('🔐 Token regeneration available: regenerate_portal_token()');
      console.log('⏱️ Manual extension available: extend_portal_token_expiration()');
      return true;
    } else {
      console.log('⚠️  DEPLOYMENT PARTIALLY COMPLETE\n');
      console.log('📋 ERRORS:\n');
      errors.forEach((err, idx) => {
        console.log(`${idx + 1}. Statement ${err.statement}:`);
        console.log(`   Error: ${err.error}\n`);
      });

      console.log('💡 NEXT STEPS:\n');
      console.log('1. Go to: https://app.supabase.com/project/cxlqzejzraczumqmsrcx/sql/new');
      console.log('2. Copy contents of: migrations/2025-10-22_living_quote_link_system.sql');
      console.log('3. Paste into SQL Editor');
      console.log('4. Click "Run"');
      console.log('5. Verify success message\n');
      return false;
    }

  } catch (err) {
    console.error('❌ FATAL ERROR:', err.message);
    console.log('\n📋 MANUAL DEPLOYMENT REQUIRED:\n');
    console.log('1. Go to: https://app.supabase.com/project/cxlqzejzraczumqmsrcx/sql/new');
    console.log('2. Copy contents of: migrations/2025-10-22_living_quote_link_system.sql');
    console.log('3. Paste into SQL Editor');
    console.log('4. Click "Run"');
    console.log('5. Verify success message\n');
    process.exit(1);
  }
}

// Run deployment
deployMigration().then(success => {
  process.exit(success ? 0 : 1);
}).catch(err => {
  console.error('❌ Deployment failed:', err);
  process.exit(1);
});

