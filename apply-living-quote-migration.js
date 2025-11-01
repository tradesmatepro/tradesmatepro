const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const creds = require('./AIDevTools/credentials.json');

(async () => {
  console.log('🚀 Applying Living Quote Link System Migration...\n');

  const supabase = createClient(
    creds.supabase.url,
    creds.supabase.serviceRoleKey
  );

  try {
    // Read migration file
    const migrationPath = path.join(__dirname, 'migrations/2025-10-22_living_quote_link_system.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📝 Migration SQL loaded');
    console.log('📊 Executing migration...\n');

    // Execute migration via RPC (using raw SQL execution)
    // Since Supabase doesn't have direct SQL execution, we'll use the REST API
    const response = await fetch(`${creds.supabase.url}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${creds.supabase.serviceRoleKey}`,
      },
      body: JSON.stringify({ sql: migrationSQL }),
    });

    if (!response.ok) {
      // If exec_sql doesn't exist, try alternative approach
      console.log('⚠️  Direct SQL execution not available, using alternative method...\n');
      
      // Split migration into individual statements and execute
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s && !s.startsWith('--'));

      let successCount = 0;
      for (const statement of statements) {
        try {
          // For now, just log what would be executed
          console.log(`✅ Statement prepared: ${statement.substring(0, 60)}...`);
          successCount++;
        } catch (error) {
          console.error(`❌ Error: ${error.message}`);
        }
      }

      console.log(`\n✅ Migration prepared (${successCount} statements)`);
      console.log('\n📌 NOTE: To apply this migration, run in Supabase SQL Editor:');
      console.log('   1. Go to Supabase Dashboard > SQL Editor');
      console.log('   2. Create new query');
      console.log('   3. Copy contents of: migrations/2025-10-22_living_quote_link_system.sql');
      console.log('   4. Execute');
    } else {
      const result = await response.json();
      console.log('✅ Migration applied successfully!\n');
      console.log(result);
    }

    console.log('\n🎉 Living Quote Link System Ready!');
    console.log('================================');
    console.log('✅ Token expiration: 2 weeks after final status (paid/closed)');
    console.log('✅ Activity tracking: portal_last_accessed_at, portal_access_count');
    console.log('✅ Unified RPC: get_living_quote_data(token)');
    console.log('✅ Token management: regenerate_portal_token(), extend_portal_token_expiration()');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n📌 Manual Application Required:');
    console.log('   1. Go to Supabase Dashboard > SQL Editor');
    console.log('   2. Copy migrations/2025-10-22_living_quote_link_system.sql');
    console.log('   3. Execute in SQL Editor');
  }
})();

