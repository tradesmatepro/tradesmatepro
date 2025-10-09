const { Client } = require('pg');
const fs = require('fs');

// Database configuration
const DB_CONFIG = {
  host: 'aws-0-us-east-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.amgtktrwpdsigcomavlg',
  password: 'Alphaecho19!',
  ssl: {
    rejectUnauthorized: false
  }
};

async function generateSchemaDump() {
  const client = new Client(DB_CONFIG);
  let output = '';
  
  try {
    await client.connect();
    console.log('Connected to database...');
    
    // Get all schema creation SQL
    const queries = [
      // Extensions
      `SELECT 'CREATE EXTENSION IF NOT EXISTS "' || extname || '";' as sql
       FROM pg_extension 
       WHERE extname NOT IN ('plpgsql')
       ORDER BY extname;`,
      
      // Enums
      `SELECT 'CREATE TYPE ' || n.nspname || '.' || t.typname || ' AS ENUM (' ||
              string_agg('''' || e.enumlabel || '''', ', ' ORDER BY e.enumsortorder) || ');' as sql
       FROM pg_type t
       JOIN pg_enum e ON t.oid = e.enumtypid
       JOIN pg_namespace n ON n.oid = t.typnamespace
       WHERE n.nspname = 'public'
       GROUP BY n.nspname, t.typname
       ORDER BY t.typname;`,
      
      // Tables
      `SELECT 
         'CREATE TABLE ' || schemaname || '.' || tablename || ' (' ||
         string_agg(
           column_name || ' ' || data_type ||
           CASE 
             WHEN character_maximum_length IS NOT NULL 
             THEN '(' || character_maximum_length || ')'
             ELSE ''
           END ||
           CASE 
             WHEN is_nullable = 'NO' THEN ' NOT NULL'
             ELSE ''
           END ||
           CASE 
             WHEN column_default IS NOT NULL 
             THEN ' DEFAULT ' || column_default
             ELSE ''
           END,
           ', '
         ) || ');' as sql
       FROM information_schema.columns c
       JOIN information_schema.tables t ON c.table_name = t.table_name
       WHERE c.table_schema = 'public' AND t.table_type = 'BASE TABLE'
       GROUP BY schemaname, tablename
       ORDER BY tablename;`,
      
      // Indexes
      `SELECT indexdef || ';' as sql
       FROM pg_indexes
       WHERE schemaname = 'public'
       AND indexname NOT LIKE '%_pkey'
       ORDER BY indexname;`,
      
      // Primary Keys
      `SELECT 'ALTER TABLE ' || tc.table_name || 
              ' ADD CONSTRAINT ' || tc.constraint_name || 
              ' PRIMARY KEY (' || string_agg(kcu.column_name, ', ') || ');' as sql
       FROM information_schema.table_constraints tc
       JOIN information_schema.key_column_usage kcu 
         ON tc.constraint_name = kcu.constraint_name
       WHERE tc.constraint_type = 'PRIMARY KEY' 
         AND tc.table_schema = 'public'
       GROUP BY tc.table_name, tc.constraint_name
       ORDER BY tc.table_name;`,
      
      // Foreign Keys
      `SELECT 'ALTER TABLE ' || tc.table_name || 
              ' ADD CONSTRAINT ' || tc.constraint_name || 
              ' FOREIGN KEY (' || kcu.column_name || ')' ||
              ' REFERENCES ' || ccu.table_name || '(' || ccu.column_name || ');' as sql
       FROM information_schema.table_constraints tc
       JOIN information_schema.key_column_usage kcu 
         ON tc.constraint_name = kcu.constraint_name
       JOIN information_schema.constraint_column_usage ccu 
         ON ccu.constraint_name = tc.constraint_name
       WHERE tc.constraint_type = 'FOREIGN KEY' 
         AND tc.table_schema = 'public'
       ORDER BY tc.table_name;`,
      
      // Functions
      `SELECT pg_get_functiondef(p.oid) || ';' as sql
       FROM pg_proc p
       JOIN pg_namespace n ON p.pronamespace = n.oid
       WHERE n.nspname = 'public'
       ORDER BY p.proname;`,
      
      // Triggers
      `SELECT pg_get_triggerdef(oid) || ';' as sql
       FROM pg_trigger
       WHERE NOT tgisinternal
       ORDER BY tgname;`,
      
      // Views
      `SELECT 'CREATE VIEW ' || table_name || ' AS ' || view_definition || ';' as sql
       FROM information_schema.views
       WHERE table_schema = 'public'
       ORDER BY table_name;`,
      
      // RLS Policies
      `SELECT 'CREATE POLICY ' || policyname || ' ON ' || tablename ||
              ' FOR ' || cmd ||
              CASE WHEN roles IS NOT NULL THEN ' TO ' || array_to_string(roles, ', ') ELSE '' END ||
              CASE WHEN qual IS NOT NULL THEN ' USING (' || qual || ')' ELSE '' END ||
              CASE WHEN with_check IS NOT NULL THEN ' WITH CHECK (' || with_check || ')' ELSE '' END ||
              ';' as sql
       FROM pg_policies
       WHERE schemaname = 'public'
       ORDER BY tablename, policyname;`
    ];
    
    output += '-- TradeMate Pro Database Schema Dump\n';
    output += '-- Generated: ' + new Date().toISOString() + '\n\n';
    output += 'SET statement_timeout = 0;\n';
    output += 'SET lock_timeout = 0;\n';
    output += 'SET client_encoding = \'UTF8\';\n';
    output += 'SET standard_conforming_strings = on;\n';
    output += 'SET check_function_bodies = false;\n';
    output += 'SET xmloption = content;\n';
    output += 'SET client_min_messages = warning;\n';
    output += 'SET row_security = off;\n\n';
    
    for (const query of queries) {
      try {
        const result = await client.query(query);
        if (result.rows.length > 0) {
          output += '\n-- ' + query.split('\n')[0].replace(/SELECT.*FROM/, 'FROM') + '\n';
          for (const row of result.rows) {
            if (row.sql && row.sql.trim()) {
              output += row.sql + '\n';
            }
          }
          output += '\n';
        }
      } catch (error) {
        console.log(`Warning: Query failed: ${error.message}`);
        output += `-- Query failed: ${error.message}\n`;
      }
    }
    
    // Write to file
    fs.writeFileSync('full_schema.sql', output);
    console.log('✅ Schema dump completed: full_schema.sql');
    console.log(`📄 File size: ${Math.round(output.length / 1024)} KB`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

// Run the dump
generateSchemaDump();
