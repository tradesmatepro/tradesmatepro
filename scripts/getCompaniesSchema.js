/**
 * Get actual companies table schema from Supabase
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function getSchema() {
  console.log('\n📋 COMPANIES TABLE SCHEMA\n');
  console.log('='.repeat(60));

  // Get table columns
  const { data: columns, error: colError } = await supabase
    .rpc('exec_sql', {
      sql: `
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'companies'
        ORDER BY ordinal_position;
      `
    })
    .catch(async () => {
      // If RPC doesn't exist, try direct query
      const response = await fetch(
        `${supabaseUrl}/rest/v1/rpc/exec_sql`,
        {
          method: 'POST',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sql: `
              SELECT 
                column_name,
                data_type,
                is_nullable,
                column_default
              FROM information_schema.columns
              WHERE table_schema = 'public'
              AND table_name = 'companies'
              ORDER BY ordinal_position;
            `
          })
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
      
      return { data: await response.json(), error: null };
    });

  if (colError) {
    console.error('❌ Error getting columns:', colError);
    return;
  }

  console.log('\n📋 Columns:\n');
  if (columns && columns.length > 0) {
    columns.forEach((col, i) => {
      console.log(`${i + 1}. ${col.column_name}`);
      console.log(`   Type: ${col.data_type}`);
      console.log(`   Nullable: ${col.is_nullable}`);
      console.log(`   Default: ${col.column_default || 'N/A'}`);
      console.log('');
    });
  }

  // Get RLS status
  const { data: rlsData, error: rlsError } = await supabase
    .rpc('exec_sql', {
      sql: `
        SELECT 
          c.relname as table_name,
          c.relrowsecurity as rls_enabled,
          c.relforcerowsecurity as rls_forced
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public'
        AND c.relname = 'companies';
      `
    })
    .catch(async () => {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/rpc/exec_sql`,
        {
          method: 'POST',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sql: `
              SELECT 
                c.relname as table_name,
                c.relrowsecurity as rls_enabled,
                c.relforcerowsecurity as rls_forced
              FROM pg_class c
              JOIN pg_namespace n ON n.oid = c.relnamespace
              WHERE n.nspname = 'public'
              AND c.relname = 'companies';
            `
          })
        }
      );
      
      return { data: await response.json(), error: null };
    });

  console.log('\n📋 RLS Status:\n');
  if (rlsData && rlsData.length > 0) {
    const rls = rlsData[0];
    console.log(`   RLS Enabled: ${rls.rls_enabled ? '✅ YES' : '❌ NO'}`);
    console.log(`   RLS Forced: ${rls.rls_forced ? '✅ YES' : '❌ NO'}`);
  }

  // Get policies
  const { data: policies, error: polError } = await supabase
    .rpc('exec_sql', {
      sql: `
        SELECT 
          policyname,
          cmd,
          permissive,
          roles,
          qual,
          with_check
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'companies'
        ORDER BY policyname;
      `
    })
    .catch(async () => {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/rpc/exec_sql`,
        {
          method: 'POST',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sql: `
              SELECT 
                policyname,
                cmd,
                permissive,
                roles,
                qual,
                with_check
              FROM pg_policies
              WHERE schemaname = 'public'
              AND tablename = 'companies'
              ORDER BY policyname;
            `
          })
        }
      );
      
      return { data: await response.json(), error: null };
    });

  console.log('\n📋 RLS Policies:\n');
  if (policies && policies.length > 0) {
    policies.forEach((pol, i) => {
      console.log(`${i + 1}. ${pol.policyname}`);
      console.log(`   Command: ${pol.cmd}`);
      console.log(`   Permissive: ${pol.permissive}`);
      console.log(`   Roles: ${pol.roles}`);
      console.log(`   Using: ${pol.qual || 'N/A'}`);
      console.log(`   With Check: ${pol.with_check || 'N/A'}`);
      console.log('');
    });
  } else {
    console.log('   ❌ NO POLICIES FOUND');
  }

  console.log('='.repeat(60) + '\n');
}

getSchema()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  });

