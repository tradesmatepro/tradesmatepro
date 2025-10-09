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

async function dumpRolesAndGrants() {
  const client = new Client(DB_CONFIG);
  let output = '';
  
  try {
    await client.connect();
    console.log('Connected to database...');
    
    // The queries you specifically requested
    const queries = {
      'All roles': `
        SELECT rolname, rolsuper, rolcreatedb, rolcreaterole, rolcanlogin
        FROM pg_roles
        ORDER BY rolname;
      `,
      
      'Role memberships': `
        SELECT roleid::regrole AS role_name,
               member::regrole AS member_name
        FROM pg_auth_members
        ORDER BY role_name, member_name;
      `,
      
      'Grants (ACLs) on tables/views/sequences/functions': `
        SELECT n.nspname AS schema,
               c.relname AS object_name,
               c.relkind,
               c.relacl
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relacl IS NOT NULL
        ORDER BY schema, object_name;
      `,
      
      'Type Casts': `
        SELECT
            c.oid,
            format_type(castsource, NULL) AS source_type,
            format_type(casttarget, NULL) AS target_type,
            c.castfunc::regprocedure AS cast_function,
            c.castcontext AS context
        FROM pg_cast c
        ORDER BY source_type, target_type;
      `,
      
      'Operators': `
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
      
      'Dependencies': `
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
    
    output += '-- TradeMate Pro Roles, Grants, and System Objects Dump\n';
    output += '-- Generated: ' + new Date().toISOString() + '\n\n';
    
    for (const [queryName, query] of Object.entries(queries)) {
      try {
        console.log(`Executing: ${queryName}...`);
        const result = await client.query(query);
        
        output += `\n-- ${queryName} (${result.rows.length} rows)\n`;
        output += '-- ' + '='.repeat(50) + '\n';
        
        if (result.rows.length > 0) {
          // Get column names
          const columns = Object.keys(result.rows[0]);
          
          // Add header
          output += '-- ' + columns.join(' | ') + '\n';
          output += '-- ' + columns.map(col => '-'.repeat(col.length)).join('-+-') + '\n';
          
          // Add data rows (limit to first 50 for readability)
          const rowsToShow = Math.min(result.rows.length, 50);
          for (let i = 0; i < rowsToShow; i++) {
            const row = result.rows[i];
            const values = columns.map(col => {
              const val = row[col];
              return val === null ? 'NULL' : String(val);
            });
            output += '-- ' + values.join(' | ') + '\n';
          }
          
          if (result.rows.length > 50) {
            output += `-- ... and ${result.rows.length - 50} more rows\n`;
          }
        } else {
          output += '-- No results\n';
        }
        
        output += '\n';
        
      } catch (error) {
        console.log(`Warning: ${queryName} failed: ${error.message}`);
        output += `-- Query failed: ${error.message}\n\n`;
      }
    }
    
    // Write to file
    fs.writeFileSync('roles_grants_system.sql', output);
    console.log('✅ Roles and grants dump completed: roles_grants_system.sql');
    console.log(`📄 File size: ${Math.round(output.length / 1024)} KB`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

// Run the dump
dumpRolesAndGrants();
