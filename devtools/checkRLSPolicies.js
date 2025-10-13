/**
 * CHECK RLS POLICIES ON ALL TABLES
 * 
 * Verifies that Row Level Security is enabled and properly configured
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = 'https://cxlqzejzraczumqmsrcx.supabase.co';
const SUPABASE_SERVICE_KEY = 'sb_secret_hPS1mDFURu9aQulTRNE7EQ_zczVFhxR';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Tables that MUST have RLS
const CRITICAL_TABLES = [
  'work_orders',
  'work_order_line_items',
  'customers',
  'employees',
  'users',
  'profiles',
  'companies',
  'invoices',
  'timesheets',
  'expenses',
  'inventory',
  'vendors',
  'purchase_orders',
  'schedule_events',
  'employee_time_off'
];

async function checkRLSPolicies() {
  console.log('\n🔒 CHECKING RLS POLICIES');
  console.log('='.repeat(80));
  
  const results = {
    enabled: [],
    disabled: [],
    errors: [],
    policies: {}
  };
  
  try {
    // Query to check RLS status on all tables
    const { data: rlsStatus, error: rlsError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT 
            schemaname,
            tablename,
            rowsecurity as rls_enabled
          FROM pg_tables
          WHERE schemaname = 'public'
          ORDER BY tablename;
        `
      });
    
    if (rlsError) {
      console.log('   ⚠️  RPC not available, using alternative method...\n');
      
      // Alternative: Check each critical table individually
      for (const tableName of CRITICAL_TABLES) {
        console.log(`   Checking ${tableName}...`);
        
        try {
          // Try to query without auth - should fail if RLS is enabled
          const anonClient = createClient(SUPABASE_URL, 'sb_publishable_62eAoe6DcrOweYtnzfhHmQ_aYY4JZSG');
          
          const { data, error } = await anonClient
            .from(tableName)
            .select('*')
            .limit(1);
          
          if (error) {
            if (error.message.includes('row-level security') || 
                error.message.includes('permission denied') ||
                error.message.includes('JWT')) {
              console.log(`      ✅ RLS appears to be enabled (query blocked)`);
              results.enabled.push(tableName);
            } else {
              console.log(`      ⚠️  Error: ${error.message}`);
              results.errors.push({ table: tableName, error: error.message });
            }
          } else {
            console.log(`      ❌ RLS NOT ENFORCED (query succeeded without auth)`);
            results.disabled.push(tableName);
          }
        } catch (err) {
          console.log(`      ⚠️  Error checking: ${err.message}`);
          results.errors.push({ table: tableName, error: err.message });
        }
      }
    } else {
      console.log(`\n   Found ${rlsStatus?.length || 0} tables\n`);
      
      for (const table of rlsStatus || []) {
        const isCritical = CRITICAL_TABLES.includes(table.tablename);
        const icon = table.rls_enabled ? '✅' : '❌';
        const critical = isCritical ? ' [CRITICAL]' : '';
        
        console.log(`   ${icon} ${table.tablename}${critical}: RLS ${table.rls_enabled ? 'ENABLED' : 'DISABLED'}`);
        
        if (table.rls_enabled) {
          results.enabled.push(table.tablename);
        } else {
          results.disabled.push(table.tablename);
        }
      }
    }
    
    // Check for policies on critical tables
    console.log('\n📋 Checking policies on critical tables...\n');
    
    for (const tableName of CRITICAL_TABLES) {
      try {
        const { data: policies, error: policiesError } = await supabase
          .rpc('exec_sql', {
            sql: `
              SELECT 
                policyname,
                cmd,
                qual
              FROM pg_policies
              WHERE tablename = '${tableName}';
            `
          });
        
        if (!policiesError && policies) {
          console.log(`   ${tableName}: ${policies.length} policies`);
          results.policies[tableName] = policies.length;
        }
      } catch (err) {
        // RPC might not exist
      }
    }
    
  } catch (err) {
    console.error('\n❌ Error:', err.message);
  }
  
  // Print summary
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 RLS SUMMARY');
  console.log('='.repeat(80));
  
  console.log(`\n✅ Tables with RLS enabled: ${results.enabled.length}`);
  console.log(`❌ Tables with RLS disabled: ${results.disabled.length}`);
  console.log(`⚠️  Errors: ${results.errors.length}`);
  
  if (results.disabled.length > 0) {
    console.log('\n❌ TABLES WITHOUT RLS:\n');
    results.disabled.forEach(table => {
      const isCritical = CRITICAL_TABLES.includes(table);
      console.log(`   ${isCritical ? '🔴 CRITICAL: ' : ''}${table}`);
    });
  }
  
  if (results.errors.length > 0) {
    console.log('\n⚠️  ERRORS:\n');
    results.errors.forEach(err => {
      console.log(`   ${err.table}: ${err.error}`);
    });
  }
  
  // Check for missing critical tables
  const missingTables = CRITICAL_TABLES.filter(t => 
    !results.enabled.includes(t) && !results.disabled.includes(t)
  );
  
  if (missingTables.length > 0) {
    console.log('\n⚠️  CRITICAL TABLES NOT FOUND:\n');
    missingTables.forEach(table => {
      console.log(`   ${table}`);
    });
  }
  
  // Save results
  fs.writeFileSync(
    'devtools/logs/rls-audit-results.json',
    JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: {
        enabled: results.enabled.length,
        disabled: results.disabled.length,
        errors: results.errors.length,
        missingCritical: missingTables.length
      },
      results,
      missingTables
    }, null, 2)
  );
  
  console.log('\n='.repeat(80));
  console.log('\n📁 Results saved to: devtools/logs/rls-audit-results.json');
  
  if (results.disabled.length > 0) {
    console.log('\n🔴 WARNING: Some tables do not have RLS enabled!');
    console.log('   This is a security risk if the app is in production.\n');
  } else {
    console.log('\n✅ All checked tables have RLS enabled!\n');
  }
}

if (require.main === module) {
  checkRLSPolicies().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { checkRLSPolicies };

