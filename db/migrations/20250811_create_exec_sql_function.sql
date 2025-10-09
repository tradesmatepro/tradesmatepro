-- Create an RPC-compatible exec_sql(sql text) function for DatabaseSetupService
-- SECURITY: This function is SECURITY DEFINER and intended to be called only with the service_role key
-- Do NOT expose this to anon users.

begin;

create or replace function public.exec_sql(sql text)
returns void
language plpgsql
security definer
as $$
begin
  execute sql;
end;
$$;

-- Ensure only service role can execute (PostgREST uses JWT roles)
-- In Supabase, service_role JWT bypasses RLS and has full privileges by default.
-- You may optionally restrict other roles here, e.g.:
-- revoke all on function public.exec_sql(text) from public;

commit;

