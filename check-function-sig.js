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
    SELECT pg_get_function_identity_arguments(p.oid) as params
    FROM pg_proc p
    WHERE p.proname = 'send_portal_message'
      AND p.pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  `);

  console.log('Function signature:', res.rows[0]?.params);

  await client.end();
})();

