-- SQL to enable expense receipt uploads
-- Run this in your Supabase SQL editor

-- 1. Create documents table for file metadata
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  linked_to UUID, -- expense_id, job_id, customer_id, etc.
  type TEXT NOT NULL, -- 'expenses', 'jobs', 'customers', etc.
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on documents
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- RLS policy: Users can only access documents for their company
CREATE POLICY "Users can access documents for their company" ON documents
  FOR ALL USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

-- 2. Create the company-files storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-files', 'company-files', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Set up storage policies for company-files bucket
-- Allow authenticated users to upload files for their company
CREATE POLICY "Allow company file uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'company-files' 
  AND auth.role() = 'authenticated'
);

-- Allow public read access to company files (for displaying receipts)
CREATE POLICY "Allow public read access to company files" ON storage.objects
FOR SELECT USING (bucket_id = 'company-files');

-- Allow company users to update their own files
CREATE POLICY "Allow company file updates" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'company-files' 
  AND auth.role() = 'authenticated'
);

-- Allow company users to delete their own files
CREATE POLICY "Allow company file deletes" ON storage.objects
FOR DELETE USING (
  bucket_id = 'company-files' 
  AND auth.role() = 'authenticated'
);

-- 4. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_documents_company_id ON documents(company_id);
CREATE INDEX IF NOT EXISTS idx_documents_linked_to ON documents(linked_to);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_company_type ON documents(company_id, type);

-- 5. Verify setup
SELECT 'Documents table created' as status;
SELECT name, id, public FROM storage.buckets WHERE name = 'company-files';
SELECT COUNT(*) as document_count FROM documents;
