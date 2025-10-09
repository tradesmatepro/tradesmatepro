2 – Running SQL Commands (Final Corrected Guide)

This guide explains how to correctly run SQL commands in the TradesMate Pro app.
Claude/GPT must always follow these rules to avoid confusion between frontend queries and admin/sandbox queries.

🔑 Golden Rules

Frontend (React apps) → Use supabase-js or supaFetch().

Admin/Sandbox (schema, migrations, debugging) → Use pg client or Supabase SQL Editor, with DB password.

Never replace standard queries with rpc() unless a Postgres function exists.

Never touch the production project directly — sandbox only.

⚙️ 1. Frontend Queries (React App)

In the Customer Portal and TradesMate Pro React apps, all queries must use the Supabase client (@supabase/supabase-js) or the app’s supaFetch() wrapper.

Example: Fetch Quotes
const { data, error } = await supabase
  .from('work_orders')
  .select('*')
  .eq('stage', 'quote');

Example: Insert a New Job
const { data, error } = await supabase
  .from('work_orders')
  .insert([
    { stage: 'job', customer_id: 123, company_id: 456 }
  ]);

supaFetch Wrapper

If the app provides a supaFetch() utility, Claude must use it instead of writing direct fetch calls:

const data = await supaFetch('work_orders', { stage: 'invoice' });


✅ This ensures session tokens, RLS, and auth are always respected.
❌ Do not use raw SQL strings in the frontend.

⚙️ 2. Admin Queries (Sandbox Only)

For schema changes, migrations, or debugging, SQL must be run directly against the sandbox database — never against production.

Using Node.js with pg Client
import { Client } from "pg";

const client = new Client({
  host: "db.<sandbox-project-id>.supabase.co",
  port: 5432,
  user: "postgres",
  password: "Alphaecho19!",   // sandbox password
  database: "postgres"
});

await client.connect();

const res = await client.query("SELECT * FROM work_orders LIMIT 5;");
console.log(res.rows);

await client.end();

Using Supabase SQL Editor

Log into Supabase dashboard.

Open SQL Editor in the sandbox project.

Paste and run the migration script.

Save migration as /migrations/*.sql.

✅ Always export migration scripts so they can be applied consistently.
❌ Never run ad-hoc queries directly in production.

⚙️ 3. REST API (Fallback Only)

Supabase exposes a REST API automatically. This is only for debugging/testing, not the default path.

Example (curl):

curl "https://<project-id>.supabase.co/rest/v1/work_orders?stage=eq.quote" \
  -H "apikey: <anon-key>" \
  -H "Authorization: Bearer <anon-key>"


Use only if supabase-js is failing and you need to confirm the endpoint works.

⚙️ 4. RPC Functions (Special Case)

RPC is only used if you explicitly created a Postgres stored procedure.

Example:

const { data, error } = await supabase.rpc('assign_contractor', {
  contractor_id: 123,
  request_id: 456
});


✅ Only use if the function exists in the DB.
❌ Never replace normal queries with RPC calls.

🚫 What Not to Do

❌ Don’t run direct SQL in React code.

❌ Don’t use RPC unless a function exists.

❌ Don’t touch the real project DB — only sandbox.

❌ Don’t create duplicate tables (Quotes, Jobs belong in work_orders).

🎯 Key Principles

Frontend = supabase-js/supaFetch

Admin/Sandbox = pg client + password or SQL Editor

REST = fallback only

RPC = special case only

👉 With this guide, Claude has zero excuses:
He must always choose the right method depending on whether he’s working in frontend app code or in the sandbox DB.