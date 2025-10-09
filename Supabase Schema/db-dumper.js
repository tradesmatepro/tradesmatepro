const { Client } = require('pg');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

// 🔑 Database Connection Info - Try multiple endpoints
const DB_CONFIGS = [
  // Pooler connection (PRIMARY - IPv4 compatible)
  {
    name: 'Pooler Connection',
    host: 'aws-1-us-west-1.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    user: 'postgres.cxlqzejzraczumqmsrcx',
    password: 'Alphaecho19!',
    ssl: { rejectUnauthorized: false }
  },
  // Direct connection (fallback - IPv6 only)
  {
    name: 'Direct Connection',
    host: 'db.cxlqzejzraczumqmsrcx.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'Alphaecho19!',
    ssl: { rejectUnauthorized: false }
  }
];

// Try connections in order until one works
async function getWorkingConnection() {
  for (const config of DB_CONFIGS) {
    try {
      console.log(`🔄 Trying ${config.name}...`);
      const client = new Client(config);
      await client.connect();
      console.log(`✅ ${config.name} successful!`);
      return client;
    } catch (error) {
      console.log(`❌ ${config.name} failed: ${error.message}`);
      continue;
    }
  }
  throw new Error('All database connections failed');
}

// Ensure output directory exists
const OUTPUT_DIR = './supabase schema';
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// SQL Queries for COMPLETE schema extraction
const QUERIES = {
  // Basic table structure
  tables: `
    SELECT table_name, column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public'
    ORDER BY table_name, ordinal_position;
  `,

  // Enum types
  enums: `
    SELECT t.typname AS enum_name, e.enumlabel AS value
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
    ORDER BY t.typname, e.enumsortorder;
  `,

  // Views - EXACTLY as GPT specified
  views: `
    SELECT schemaname, viewname, definition
    FROM pg_views
    WHERE schemaname NOT IN ('pg_catalog', 'information_schema');
  `,

  // Constraints - EXACTLY as GPT specified
  constraints: `
    SELECT conrelid::regclass AS table_name, conname, pg_get_constraintdef(c.oid)
    FROM pg_constraint c
    JOIN pg_namespace n ON n.oid = c.connamespace
    WHERE n.nspname = 'public';
  `,

  // Triggers - EXACTLY as GPT specified
  triggers: `
    SELECT tgname AS trigger_name, relname AS table_name, proname AS function_name
    FROM pg_trigger
    JOIN pg_class ON tgrelid = pg_class.oid
    JOIN pg_proc ON tgfoid = pg_proc.oid
    WHERE NOT tgisinternal;
  `,

  // Functions - EXACTLY as GPT specified
  functions: `
    SELECT proname, pg_get_functiondef(p.oid)
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public';
  `,

  // Rules - EXACTLY as GPT specified
  rules: `
    SELECT schemaname, tablename, rulename, definition
    FROM pg_rules
    WHERE schemaname NOT IN ('pg_catalog', 'information_schema');
  `,

  // Foreign Keys (NEW - Critical for relationships)
  foreign_keys: `
    SELECT
      tc.table_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name,
      tc.constraint_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
    ORDER BY tc.table_name, kcu.column_name;
  `,

  // Indexes (NEW - Critical for performance understanding)
  indexes: `
    SELECT
      schemaname,
      tablename,
      indexname,
      indexdef
    FROM pg_indexes
    WHERE schemaname = 'public'
    ORDER BY tablename, indexname;
  `,

  // RLS Policies (ENHANCED - GPT mentioned this is critical)
  rls_policies: `
    SELECT
      schemaname,
      tablename AS table_name,
      policyname AS policy_name,
      permissive,
      roles,
      cmd AS command,
      qual AS using_expression,
      with_check AS with_check_expression,
      pg_get_expr(pol.polqual, pol.polrelid) AS qual_source,
      pg_get_expr(pol.polwithcheck, pol.polrelid) AS with_check_source
    FROM pg_policies pp
    JOIN pg_policy pol ON pp.policyname = pol.polname
    JOIN pg_class c ON pol.polrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE pp.schemaname = 'public'
    ORDER BY pp.tablename, pp.policyname;
  `,

  // Table Grants/Permissions (MISSING - GPT mentioned this)
  table_grants: `
    SELECT
      table_schema,
      table_name,
      grantee,
      privilege_type,
      is_grantable
    FROM information_schema.table_privileges
    WHERE table_schema = 'public'
    ORDER BY table_name, grantee, privilege_type;
  `,

  // Column Grants (MISSING)
  column_grants: `
    SELECT
      table_schema,
      table_name,
      column_name,
      grantee,
      privilege_type,
      is_grantable
    FROM information_schema.column_privileges
    WHERE table_schema = 'public'
    ORDER BY table_name, column_name, grantee;
  `,

  // Function Grants (MISSING)
  function_grants: `
    SELECT
      n.nspname AS schema_name,
      p.proname AS function_name,
      pg_get_function_identity_arguments(p.oid) AS arguments,
      r.rolname AS grantee,
      'EXECUTE' AS privilege_type
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    JOIN pg_proc_acl pa ON p.oid = pa.oid
    JOIN pg_roles r ON pa.grantee = r.oid
    WHERE n.nspname = 'public'
    ORDER BY p.proname, r.rolname;
  `,

  // Table Statistics (NEW - Helpful for understanding usage)
  table_stats: `
    SELECT
      schemaname,
      tablename,
      n_tup_ins AS inserts,
      n_tup_upd AS updates,
      n_tup_del AS deletes,
      n_live_tup AS live_tuples,
      n_dead_tup AS dead_tuples,
      last_vacuum,
      last_autovacuum,
      last_analyze,
      last_autoanalyze
    FROM pg_stat_user_tables
    WHERE schemaname = 'public'
    ORDER BY tablename;
  `,

  // Sequences (MISSING - GPT mentioned this)
  sequences: `
    SELECT
      schemaname,
      sequencename,
      start_value,
      min_value,
      max_value,
      increment_by,
      cycle,
      cache_size,
      last_value
    FROM pg_sequences
    WHERE schemaname = 'public'
    ORDER BY sequencename;
  `,

  // Extensions (MISSING - GPT mentioned this)
  extensions: `
    SELECT
      extname AS extension_name,
      extversion AS version,
      nspname AS schema_name,
      extrelocatable AS relocatable,
      extconfig AS config_tables
    FROM pg_extension e
    JOIN pg_namespace n ON e.extnamespace = n.oid
    ORDER BY extname;
  `,

  // Materialized Views (MISSING - GPT mentioned this)
  materialized_views: `
    SELECT
      schemaname,
      matviewname AS view_name,
      definition,
      ispopulated
    FROM pg_matviews
    WHERE schemaname = 'public'
    ORDER BY matviewname;
  `,

  // Complete Table Info (ENHANCED - includes relkind to distinguish tables/views/etc)
  table_info: `
    SELECT
      n.nspname AS schema_name,
      c.relname AS table_name,
      CASE c.relkind
        WHEN 'r' THEN 'table'
        WHEN 'v' THEN 'view'
        WHEN 'm' THEN 'materialized_view'
        WHEN 'i' THEN 'index'
        WHEN 'S' THEN 'sequence'
        WHEN 'c' THEN 'composite_type'
        WHEN 't' THEN 'toast_table'
        WHEN 'f' THEN 'foreign_table'
        ELSE c.relkind::text
      END AS object_type,
      c.reltuples::bigint AS estimated_rows,
      c.relpages AS pages,
      pg_size_pretty(pg_total_relation_size(c.oid)) AS total_size,
      obj_description(c.oid, 'pg_class') AS comment
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind IN ('r', 'v', 'm', 'S')
    ORDER BY c.relname;
  `,

  // Primary Keys (MISSING - GPT mentioned this)
  primary_keys: `
    SELECT
      tc.table_name,
      kcu.column_name,
      tc.constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    WHERE tc.constraint_type = 'PRIMARY KEY'
      AND tc.table_schema = 'public'
    ORDER BY tc.table_name, kcu.ordinal_position;
  `,

  // Unique Constraints (MISSING)
  unique_constraints: `
    SELECT
      tc.table_name,
      tc.constraint_name,
      array_agg(kcu.column_name ORDER BY kcu.ordinal_position) AS columns
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    WHERE tc.constraint_type = 'UNIQUE'
      AND tc.table_schema = 'public'
    GROUP BY tc.table_name, tc.constraint_name
    ORDER BY tc.table_name, tc.constraint_name;
  `,

  // Check Constraints (MISSING)
  check_constraints: `
    SELECT
      tc.table_name,
      tc.constraint_name,
      cc.check_clause
    FROM information_schema.table_constraints tc
    JOIN information_schema.check_constraints cc
      ON tc.constraint_name = cc.constraint_name
      AND tc.table_schema = cc.constraint_schema
    WHERE tc.constraint_type = 'CHECK'
      AND tc.table_schema = 'public'
    ORDER BY tc.table_name, tc.constraint_name;
  `,

  // All roles (NEW - User requested)
  roles: `
    SELECT rolname, rolsuper, rolcreatedb, rolcreaterole, rolcanlogin
    FROM pg_roles
    ORDER BY rolname;
  `,

  // Role memberships (NEW - User requested)
  role_memberships: `
    SELECT roleid::regrole AS role_name,
           member::regrole AS member_name
    FROM pg_auth_members
    ORDER BY role_name, member_name;
  `,

  // Grants/ACLs on database objects (NEW - User requested)
  object_grants: `
    SELECT n.nspname AS schema,
           c.relname AS object_name,
           c.relkind,
           c.relacl
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relacl IS NOT NULL
    ORDER BY schema, object_name;
  `,

  // Type Casts (NEW - Shows which casts exist between types)
  type_casts: `
    SELECT
        c.oid,
        format_type(castsource, NULL) AS source_type,
        format_type(casttarget, NULL) AS target_type,
        c.castfunc::regprocedure AS cast_function,
        c.castcontext AS context
    FROM pg_cast c
    ORDER BY source_type, target_type;
  `,

  // Operators (NEW - Lists operators and their functions)
  operators: `
    SELECT
        o.oid,
        o.oprname AS operator_name,
        n.nspname AS schema_name,
        format_type(o.oprleft, NULL) AS left_type,
        format_type(o.oprright, NULL) AS right_type,
        o.oprcode::regprocedure AS function_name
    FROM pg_operator o
    JOIN pg_namespace n ON n.oid = o.oprnamespace
    ORDER BY operator_name, left_type, right_type;
  `,

  // Dependencies (NEW - Shows which objects depend on which others)
  dependencies: `
    SELECT
        d.classid::regclass AS dependent_class,
        d.objid::regclass AS dependent_object,
        d.refclassid::regclass AS referenced_class,
        d.refobjid::regclass AS referenced_object,
        d.deptype
    FROM pg_depend d
    ORDER BY dependent_object, referenced_object;
  `
};

async function connectToDatabase() {
  return await getWorkingConnection();
}

async function executeQuery(client, queryName, sql) {
  try {
    console.log(`   Fetching ${queryName}...`);
    const result = await client.query(sql);
    return result.rows;
  } catch (error) {
    console.error(`❌ Error fetching ${queryName}:`, error.message);
    return [];
  }
}

async function dumpSchema() {
  let client;
  
  try {
    console.log('🔄 Starting schema dump...');
    client = await connectToDatabase();
    
    // Execute all queries
    const schema = {};
    for (const [queryName, sql] of Object.entries(QUERIES)) {
      schema[queryName] = await executeQuery(client, queryName, sql);
    }
    
    // Add comprehensive metadata
    schema.metadata = {
      project_name: 'TradeMate Pro',
      project_id: 'cxlqzejzraczumqmsrcx', // ✅ CORRECT PROJECT (NEW standardized DB)
      dumped_at: new Date().toISOString(),
      schema_version: '3.1', // COMPLETE schema dump with roles and grants
      total_tables: schema.tables ? [...new Set(schema.tables.map(t => t.table_name))].length : 0,
      total_enums: schema.enums ? [...new Set(schema.enums.map(e => e.enum_name))].length : 0,
      total_views: schema.views ? schema.views.length : 0,
      total_materialized_views: schema.materialized_views ? schema.materialized_views.length : 0,
      total_constraints: schema.constraints ? schema.constraints.length : 0,
      total_primary_keys: schema.primary_keys ? schema.primary_keys.length : 0,
      total_unique_constraints: schema.unique_constraints ? schema.unique_constraints.length : 0,
      total_check_constraints: schema.check_constraints ? schema.check_constraints.length : 0,
      total_triggers: schema.triggers ? schema.triggers.length : 0,
      total_functions: schema.functions ? schema.functions.length : 0,
      total_rules: schema.rules ? schema.rules.length : 0,
      total_foreign_keys: schema.foreign_keys ? schema.foreign_keys.length : 0,
      total_indexes: schema.indexes ? schema.indexes.length : 0,
      total_sequences: schema.sequences ? schema.sequences.length : 0,
      total_extensions: schema.extensions ? schema.extensions.length : 0,
      total_policies: schema.rls_policies ? schema.rls_policies.length : 0,
      total_table_grants: schema.table_grants ? schema.table_grants.length : 0,
      total_column_grants: schema.column_grants ? schema.column_grants.length : 0,
      total_function_grants: schema.function_grants ? schema.function_grants.length : 0,
      total_table_stats: schema.table_stats ? schema.table_stats.length : 0,
      total_roles: schema.roles ? schema.roles.length : 0,
      total_role_memberships: schema.role_memberships ? schema.role_memberships.length : 0,
      total_object_grants: schema.object_grants ? schema.object_grants.length : 0,
      total_type_casts: schema.type_casts ? schema.type_casts.length : 0,
      total_operators: schema.operators ? schema.operators.length : 0,
      total_dependencies: schema.dependencies ? schema.dependencies.length : 0,
      completeness: 'COMPLETE' // Now includes ALL PostgreSQL objects including system-level pieces
    };
    
    // Generate timestamp for historical file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    
    // Save files
    const latestPath = path.join(OUTPUT_DIR, 'latest.json');
    const historicalPath = path.join(OUTPUT_DIR, `schema_${timestamp}.json`);
    
    const jsonOutput = JSON.stringify(schema, null, 2);
    
    // Save latest (always overwritten)
    fs.writeFileSync(latestPath, jsonOutput);
    
    // Save historical snapshot
    fs.writeFileSync(historicalPath, jsonOutput);
    
    console.log('✅ COMPLETE Schema dumped successfully! (All PostgreSQL objects included)');
    console.log(`   → ${latestPath}`);
    console.log(`   → ${historicalPath}`);
    console.log(`   📊 COMPLETE Summary (Schema v3.1):`);
    console.log(`      Tables: ${schema.metadata.total_tables}`);
    console.log(`      Views: ${schema.metadata.total_views}`);
    console.log(`      Materialized Views: ${schema.metadata.total_materialized_views}`);
    console.log(`      Functions: ${schema.metadata.total_functions}`);
    console.log(`      Triggers: ${schema.metadata.total_triggers}`);
    console.log(`      Constraints: ${schema.metadata.total_constraints}`);
    console.log(`      Primary Keys: ${schema.metadata.total_primary_keys}`);
    console.log(`      Unique Constraints: ${schema.metadata.total_unique_constraints}`);
    console.log(`      Check Constraints: ${schema.metadata.total_check_constraints}`);
    console.log(`      Foreign Keys: ${schema.metadata.total_foreign_keys}`);
    console.log(`      Indexes: ${schema.metadata.total_indexes}`);
    console.log(`      Rules: ${schema.metadata.total_rules}`);
    console.log(`      Sequences: ${schema.metadata.total_sequences}`);
    console.log(`      Extensions: ${schema.metadata.total_extensions}`);
    console.log(`      Enums: ${schema.metadata.total_enums}`);
    console.log(`      RLS Policies: ${schema.metadata.total_policies}`);
    console.log(`      Table Grants: ${schema.metadata.total_table_grants}`);
    console.log(`      Column Grants: ${schema.metadata.total_column_grants}`);
    console.log(`      Function Grants: ${schema.metadata.total_function_grants}`);
    console.log(`      Table Stats: ${schema.metadata.total_table_stats}`);
    console.log(`      Roles: ${schema.metadata.total_roles}`);
    console.log(`      Role Memberships: ${schema.metadata.total_role_memberships}`);
    console.log(`      Object Grants: ${schema.metadata.total_object_grants}`);
    console.log(`      Type Casts: ${schema.metadata.total_type_casts}`);
    console.log(`      Operators: ${schema.metadata.total_operators}`);
    console.log(`      Dependencies: ${schema.metadata.total_dependencies}`);
    console.log(`   🎯 Completeness: ${schema.metadata.completeness} - Including system-level pieces!`);
    
  } catch (error) {
    console.error('❌ Schema dump failed:', error.message);
  } finally {
    if (client) {
      await client.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run immediately on startup
console.log('🚀 Database Schema Dumper Started');
console.log('📅 Schedule: Every hour (0 * * * *)');
console.log('📁 Output: ./supabase schema/');
console.log('');

// Initial dump
dumpSchema();

// Schedule hourly dumps (0 * * * * = every hour at minute 0)
cron.schedule('0 * * * *', () => {
  console.log('\n⏰ Scheduled schema dump triggered...');
  dumpSchema();
});

// Keep the process running
console.log('⏳ Waiting for scheduled dumps... (Press Ctrl+C to stop)');
