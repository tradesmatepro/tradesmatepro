-- Setup Supabase Storage bucket for company files
-- Run this in your Supabase SQL editor

-- First, let's check what buckets exist
SELECT name, id, public FROM storage.buckets;

-- Create the company-files bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-files', 'company-files', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the company-files bucket
-- Allow authenticated users to upload files for their company
CREATE POLICY "Allow company file uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'company-files' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = ('company-' || auth.jwt() ->> 'company_id')
);

-- Allow public read access to company files (for logos, etc.)
CREATE POLICY "Allow public read access to company files" ON storage.objects
FOR SELECT USING (bucket_id = 'company-files');

-- Allow company users to update their own files
CREATE POLICY "Allow company file updates" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'company-files' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = ('company-' || auth.jwt() ->> 'company_id')
);

-- Allow company users to delete their own files
CREATE POLICY "Allow company file deletes" ON storage.objects
FOR DELETE USING (
  bucket_id = 'company-files' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = ('company-' || auth.jwt() ->> 'company_id')
);

-- Verify the bucket was created
SELECT name, id, public FROM storage.buckets WHERE name = 'company-files';
