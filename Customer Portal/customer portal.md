how do i use sql to create a fake user for the customer portal that works the login? lets say test@gmail.com and password Gizmo123
ChatGPT said:

Good question 👍 — since you’re using Supabase, you don’t insert directly into customer_portal_accounts to make a working login.

Supabase Auth manages all real logins, so you need to use their auth.users system table (managed via auth schema).

Here’s how to do it properly for a test account:

✅ Step 1: Insert into Supabase Auth

Run this SQL in your project’s SQL editor:

-- Create a new user in Supabase Auth
insert into auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values (
  gen_random_uuid(),            -- user id
  '00000000-0000-0000-0000-000000000000',  -- instance id (default for Supabase)
  'test@gmail.com',             -- email
  crypt('Gizmo123', gen_salt('bf')),  -- bcrypt hash of password
  now(),                        -- email confirmed
  now(),
  now()
);

✅ Step 2: Link to customer_portal_accounts

Now link this Supabase Auth user to your portal table:

insert into public.customer_portal_accounts (id, customer_id, auth_user_id, email, is_active, created_at, updated_at)
values (
  gen_random_uuid(),      -- portal account id
  null,                   -- customer_id if you want to link to an existing customer row, otherwise null
  (select id from auth.users where email = 'test@gmail.com'),
  'test@gmail.com',
  true,
  now(),
  now()
);

⚠️ Important Notes

auth.users is Supabase’s system table, and direct SQL inserts bypass email confirmation (good for testing).

In production you’d normally use the Supabase API/SDK (signUp()) so the password hashing and confirmation are handled automatically.

The crypt() + gen_salt('bf') trick uses PostgreSQL’s pgcrypto extension to generate a proper bcrypt hash (must be enabled in Supabase).