-- Check what storage buckets exist and their permissions
-- Run this in your Supabase SQL editor

-- Check existing buckets
SELECT name, id, public, created_at FROM storage.buckets ORDER BY created_at;

-- Check existing policies on storage.objects
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;

-- Check if RLS is enabled on storage tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('buckets', 'objects') 
AND schemaname = 'storage';

-- Try to see what's in the company-files bucket (if it exists)
SELECT name, bucket_id, created_at 
FROM storage.objects 
WHERE bucket_id = 'company-files' 
LIMIT 5;
