-- Creates a public bucket for company assets and permissive policies for beta
-- Run this in Supabase SQL editor

-- 1) Create the bucket (id and name must match)
insert into storage.buckets (id, name, public)
values ('company-assets', 'company-assets', true)
on conflict do nothing;

-- 2) Policies to allow authenticated uploads/updates/deletes and public reads
-- Drop existing policies if they exist to avoid duplicates
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'company-assets public read'
  ) THEN
    EXECUTE 'DROP POLICY "company-assets public read" ON storage.objects';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'company-assets auth insert'
  ) THEN
    EXECUTE 'DROP POLICY "company-assets auth insert" ON storage.objects';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'company-assets auth update'
  ) THEN
    EXECUTE 'DROP POLICY "company-assets auth update" ON storage.objects';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'company-assets auth delete'
  ) THEN
    EXECUTE 'DROP POLICY "company-assets auth delete" ON storage.objects';
  END IF;
END $$;

-- Public read for this bucket
create policy "company-assets public read" on storage.objects
for select using (bucket_id = 'company-assets');

-- Authenticated users can insert into this bucket
create policy "company-assets auth insert" on storage.objects
for insert with check (
  bucket_id = 'company-assets' and auth.role() = 'authenticated'
);

-- Authenticated users can update their objects in this bucket
create policy "company-assets auth update" on storage.objects
for update using (
  bucket_id = 'company-assets' and auth.role() = 'authenticated'
);

-- Authenticated users can delete their objects in this bucket
create policy "company-assets auth delete" on storage.objects
for delete using (
  bucket_id = 'company-assets' and auth.role() = 'authenticated'
);

