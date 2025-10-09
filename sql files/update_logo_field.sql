-- Update companies table to handle base64 logo data
-- Run this in your Supabase SQL editor

-- Check current logo_url column type
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'companies' 
AND column_name = 'logo_url';

-- If logo_url doesn't exist, add it
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- If it exists but is too small, make it TEXT to handle base64 data
ALTER TABLE companies 
ALTER COLUMN logo_url TYPE TEXT;

-- Also add company_logo_url if it doesn't exist (I saw this in the logs)
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS company_logo_url TEXT;

-- Verify the changes
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'companies' 
AND column_name IN ('logo_url', 'company_logo_url');
