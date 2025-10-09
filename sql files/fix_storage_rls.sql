-- Fix Supabase Storage RLS issues for logo upload
-- Run this in your Supabase SQL editor

-- First, let's check what buckets exist
SELECT name, id, public FROM storage.buckets;

-- Create the company-files bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-files', 'company-files', true)
ON CONFLICT (id) DO NOTHING;

-- DISABLE RLS on storage.buckets (since RLS is disabled for beta)
ALTER TABLE storage.buckets DISABLE ROW LEVEL SECURITY;

-- DISABLE RLS on storage.objects (since RLS is disabled for beta)  
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies that might be causing issues
DROP POLICY IF EXISTS "Allow authenticated uploads to company files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to company files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to company files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes of company files" ON storage.objects;
DROP POLICY IF EXISTS "Allow company file uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow company file updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow company file deletes" ON storage.objects;

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('buckets', 'objects') 
AND schemaname = 'storage';

-- Verify the bucket exists and is public
SELECT name, id, public FROM storage.buckets WHERE name = 'company-files';
