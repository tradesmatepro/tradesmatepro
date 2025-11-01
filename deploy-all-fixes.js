/**
 * Deploy ALL fixes for scheduling RPC and settings columns
 * This is the PRODUCTION-READY fix for all 400 errors in logs
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function deployAllFixes() {
  try {
    // Load credentials
    const credPath = path.join(__dirname, 'AIDevTools', 'credentials.json');
    const creds = JSON.parse(fs.readFileSync(credPath, 'utf8'));
    
    const supabaseUrl = creds.supabase.url;
    const serviceRoleKey = creds.supabase.serviceRoleKey;
    
    if (!supabaseUrl || !serviceRoleKey || serviceRoleKey.includes('YOUR_')) {
      throw new Error('Missing or invalid Supabase credentials');
    }

    console.log('🚀 DEPLOYING ALL FIXES FOR SCHEDULING ERRORS\n');
    console.log('=' .repeat(60));

    // Create admin client
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Read SQL file
    const sqlPath = path.join(__dirname, 'sql files', 'fix_scheduling_rpc_and_settings.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('\n📋 SQL to execute:');
    console.log('-'.repeat(60));
    console.log(sqlContent.substring(0, 300) + '...\n');

    console.log('🔧 Attempting to execute via Supabase...\n');

    // Try to execute via RPC (if available)
    let data, error;
    try {
      const result = await supabase.rpc('exec_sql', {
        sql_text: sqlContent
      });
      data = result.data;
      error = result.error;
    } catch (e) {
      error = { message: 'exec_sql RPC not available: ' + e.message };
    }

    if (error && (error.message.includes('exec_sql') || error.message.includes('not found'))) {
      console.log('⚠️  Direct SQL execution not available via RPC\n');
      console.log('📋 MANUAL DEPLOYMENT REQUIRED:\n');
      console.log('1. Go to: https://app.supabase.com/project/' + creds.supabase.projectRef);
      console.log('2. Click "SQL Editor" in the left sidebar');
      console.log('3. Click "New Query"');
      console.log('4. Copy the entire content from: sql files/fix_scheduling_rpc_and_settings.sql');
      console.log('5. Paste it into the SQL editor');
      console.log('6. Click "Run" button\n');
      console.log('=' .repeat(60));
      console.log('\n✅ After executing the SQL:');
      console.log('   1. Clear browser cache (Ctrl+Shift+Delete)');
      console.log('   2. Refresh the page (F5)');
      console.log('   3. Check logs.md for errors - should be GONE\n');
      return;
    }

    if (error) {
      throw error;
    }

    console.log('✅ SQL executed successfully!\n');
    console.log('📊 Result:', data);
    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL FIXES DEPLOYED SUCCESSFULLY!\n');
    console.log('Next steps:');
    console.log('1. Clear browser cache (Ctrl+Shift+Delete)');
    console.log('2. Refresh the page (F5)');
    console.log('3. Check logs.md - errors should be GONE\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n📋 MANUAL DEPLOYMENT REQUIRED:\n');
    console.log('1. Go to: https://app.supabase.com/project/YOUR_PROJECT');
    console.log('2. Click "SQL Editor"');
    console.log('3. Click "New Query"');
    console.log('4. Copy content from: sql files/fix_scheduling_rpc_and_settings.sql');
    console.log('5. Click "Run"\n');
  }
}

deployAllFixes();

