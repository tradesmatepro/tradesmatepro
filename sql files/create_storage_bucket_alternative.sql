-- Alternative approach: Create bucket and permissive policies
-- Run this in your Supabase SQL editor

-- First, let's check what buckets exist
SELECT name, id, public FROM storage.buckets;

-- Create the company-files bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-files', 'company-files', true)
ON CONFLICT (id) DO NOTHING;

-- Drop any existing restrictive policies
DROP POLICY IF EXISTS "Allow authenticated uploads to company files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to company files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to company files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes of company files" ON storage.objects;
DROP POLICY IF EXISTS "Allow company file uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow company file updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow company file deletes" ON storage.objects;

-- Create very permissive policies for company-files bucket
-- Allow all authenticated users to upload to company-files bucket
CREATE POLICY "Allow all authenticated uploads to company-files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'company-files' 
  AND auth.role() = 'authenticated'
);

-- Allow all authenticated users to update files in company-files bucket
CREATE POLICY "Allow all authenticated updates to company-files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'company-files' 
  AND auth.role() = 'authenticated'
);

-- Allow all authenticated users to delete files in company-files bucket
CREATE POLICY "Allow all authenticated deletes from company-files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'company-files' 
  AND auth.role() = 'authenticated'
);

-- Allow public read access to company-files bucket (for displaying logos)
CREATE POLICY "Allow public read from company-files" ON storage.objects
FOR SELECT USING (bucket_id = 'company-files');

-- Verify the bucket was created
SELECT name, id, public FROM storage.buckets WHERE name = 'company-files';

-- Check if policies were created
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';
