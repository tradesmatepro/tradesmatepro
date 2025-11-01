require('dotenv').config();
const { Client } = require('pg');

(async () => {
  const client = new Client({
    host: process.env.SUPABASE_DB_HOST,
    port: process.env.SUPABASE_DB_PORT,
    database: process.env.SUPABASE_DB_NAME,
    user: process.env.SUPABASE_DB_USER,
    password: process.env.SUPABASE_DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  const res = await client.query(`
    SELECT routine_name, pg_get_function_identity_arguments(p.oid) as params
    FROM information_schema.routines r
    JOIN pg_proc p ON p.proname = r.routine_name
    WHERE routine_schema = 'public'
      AND routine_name LIKE '%message%'
    ORDER BY routine_name
  `);

  console.log('Message RPC Functions:');
  res.rows.forEach(row => {
    console.log(`  - ${row.routine_name}(${row.params})`);
  });

  await client.end();
})();

