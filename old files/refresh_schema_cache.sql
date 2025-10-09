-- Force Supabase PostgREST to reload schema cache
-- This fixes issues after schema changes
NOTIFY pgrst, 'reload schema';
