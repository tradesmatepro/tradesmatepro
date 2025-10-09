/*
 * Run a SQL file against the Supabase sandbox Postgres using pg client.
 * Usage:
 *   node scripts/run-sql.js migrations/2025-09-18_marketplace_fix.sql
 *
 * Config via env (preferred):
 *   SUPABASE_DB_HOST=db.<project-ref>.supabase.co
 *   SUPABASE_DB_PORT=5432
 *   SUPABASE_DB_USER=postgres
 *   SUPABASE_DB_PASSWORD=...  (sandbox password)
 *   SUPABASE_DB_NAME=postgres
 *
 * Fallbacks are provided for the current sandbox as documented in How Tos.
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function main() {
  const sqlFile = process.argv[2];
  if (!sqlFile) {
    console.error('Missing SQL file path. Example: node scripts/run-sql.js migrations/2025-09-18_marketplace_fix.sql');
    process.exit(1);
  }

  const resolvedPath = path.isAbsolute(sqlFile) ? sqlFile : path.resolve(__dirname, '..', sqlFile);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`SQL file not found: ${resolvedPath}`);
    process.exit(1);
  }

  // Derive project ref dynamically from env or supabasecreds.txt
  function deriveProjectRef() {
    const envUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
    if (envUrl) {
      try { return new URL(envUrl).host.split('.')[0]; } catch {}
    }
    // Fallback to supabasecreds.txt
    try {
      const credsPath = path.resolve(__dirname, '..', 'supabasecreds.txt');
      if (fs.existsSync(credsPath)) {
        const txt = fs.readFileSync(credsPath, 'utf8');
        const line = txt.split(/\r?\n/).find(l => l.toLowerCase().startsWith('project url')) || '';
        const parts = line.trim().split(/\s+/);
        const url = parts[parts.length - 1];
        return new URL(url).host.split('.')[0];
      }
    } catch {}
    // Last resort: use NEW project ref
    return 'cxlqzejzraczumqmsrcx';
  }
  const projectRef = deriveProjectRef();

  // Use the Supabase Session Pooler for stable IPv4 connectivity
  // Force pooler unless explicit override is requested
  const allowEnvOverride = process.env.ALLOW_SQL_ENV_OVERRIDE === '1';
  const poolerHost = allowEnvOverride ? (process.env.SUPABASE_DB_HOST || 'aws-1-us-west-1.pooler.supabase.com') : 'aws-1-us-west-1.pooler.supabase.com';
  const poolerUser = allowEnvOverride ? (process.env.SUPABASE_DB_USER || `postgres.${projectRef}`) : `postgres.${projectRef}`;
  const poolerPort = Number(allowEnvOverride ? (process.env.SUPABASE_DB_PORT || '5432') : '5432');

  const config = {
    host: poolerHost,
    port: poolerPort,
    user: poolerUser,
    password: process.env.SUPABASE_DB_PASSWORD || 'Alphaecho19!', // sandbox only (from How Tos)
    database: process.env.SUPABASE_DB_NAME || 'postgres',
    ssl: { rejectUnauthorized: false }
  };

  console.log('Connecting to Postgres:', { host: config.host, port: config.port, database: config.database, user: config.user });

  const client = new Client(config);
  await client.connect();

  const sql = fs.readFileSync(resolvedPath, 'utf8');
  console.log(`Executing SQL from ${resolvedPath}...`);

  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('✅ Migration executed successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});

