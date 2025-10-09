/* Verify marketplace migration applied correctly */
const { Client } = require('pg');

async function run() {
  const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://amgtktrwpdsigcomavlg.supabase.co';
  const projectRef = new URL(SUPABASE_URL).host.split('.')[0];

  const config = {
    host: process.env.SUPABASE_DB_HOST || 'aws-0-us-east-1.pooler.supabase.com',
    port: Number(process.env.SUPABASE_DB_PORT || '5432'),
    user: process.env.SUPABASE_DB_USER || `postgres.${projectRef}`,
    password: process.env.SUPABASE_DB_PASSWORD || 'Alphaecho19!',
    database: process.env.SUPABASE_DB_NAME || 'postgres',
    ssl: { rejectUnauthorized: false }
  };

  const client = new Client(config);
  await client.connect();

  try {
    const cols = await client.query(`
      select column_name from information_schema.columns
      where table_schema='public' and table_name='work_orders'
      and column_name in ('marketplace_request_id','marketplace_response_id')
      order by column_name;
    `);
    console.log('work_orders new columns =>', cols.rows);

    const fn = await client.query(`
      select p.proname, pg_get_functiondef(p.oid) as def
      from pg_proc p join pg_namespace n on n.oid=p.pronamespace
      where n.nspname='public' and p.proname='submit_marketplace_response';
    `);
    console.log('submit_marketplace_response exists =>', fn.rows.length > 0);

  } catch (e) {
    console.error('Verification error:', e);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

run();

