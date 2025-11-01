-- =====================================================
-- TAX ID ENCRYPTION MIGRATION
-- =====================================================
-- This migration adds proper encryption for tax_id field
-- using PostgreSQL pgcrypto extension
-- =====================================================

-- Step 1: Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Step 2: Create encryption key storage (use Supabase Vault in production)
-- For now, we'll use a function that gets the key from environment
-- In production, use: SELECT vault.create_secret('tax_id_encryption_key', 'your-secure-key-here');

-- Step 3: Add encrypted_tax_id column
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS encrypted_tax_id BYTEA;

-- Step 4: Create encryption function
CREATE OR REPLACE FUNCTION encrypt_tax_id(plain_text TEXT)
RETURNS BYTEA AS $$
DECLARE
  encryption_key TEXT;
BEGIN
  -- In production, get key from Supabase Vault:
  -- SELECT decrypted_secret INTO encryption_key FROM vault.decrypted_secrets WHERE name = 'tax_id_encryption_key';
  
  -- For beta, use a hardcoded key (CHANGE THIS IN PRODUCTION!)
  encryption_key := 'trademate-pro-tax-id-encryption-key-2024';
  
  IF plain_text IS NULL OR plain_text = '' THEN
    RETURN NULL;
  END IF;
  
  RETURN pgp_sym_encrypt(plain_text, encryption_key);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create decryption function
CREATE OR REPLACE FUNCTION decrypt_tax_id(encrypted_data BYTEA)
RETURNS TEXT AS $$
DECLARE
  encryption_key TEXT;
BEGIN
  -- In production, get key from Supabase Vault:
  -- SELECT decrypted_secret INTO encryption_key FROM vault.decrypted_secrets WHERE name = 'tax_id_encryption_key';
  
  -- For beta, use a hardcoded key (CHANGE THIS IN PRODUCTION!)
  encryption_key := 'trademate-pro-tax-id-encryption-key-2024';
  
  IF encrypted_data IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN pgp_sym_decrypt(encrypted_data, encryption_key);
EXCEPTION
  WHEN OTHERS THEN
    -- If decryption fails, return NULL
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Migrate existing tax_id data to encrypted column
UPDATE companies
SET encrypted_tax_id = encrypt_tax_id(tax_id)
WHERE tax_id IS NOT NULL AND tax_id != '';

-- Step 7: Create trigger to auto-encrypt tax_id on insert/update
CREATE OR REPLACE FUNCTION auto_encrypt_tax_id()
RETURNS TRIGGER AS $$
BEGIN
  -- If tax_id is being set/updated, encrypt it
  IF NEW.tax_id IS NOT NULL AND NEW.tax_id != '' THEN
    NEW.encrypted_tax_id := encrypt_tax_id(NEW.tax_id);
    -- Clear the plain text tax_id for security
    NEW.tax_id := NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER encrypt_tax_id_trigger
BEFORE INSERT OR UPDATE ON companies
FOR EACH ROW
EXECUTE FUNCTION auto_encrypt_tax_id();

-- Step 8: Create view for easy access to decrypted tax_id
CREATE OR REPLACE VIEW companies_with_tax_id AS
SELECT 
  c.*,
  decrypt_tax_id(c.encrypted_tax_id) AS decrypted_tax_id
FROM companies c;

-- Step 9: Grant permissions
GRANT SELECT ON companies_with_tax_id TO authenticated;

-- Step 10: Add comment for documentation
COMMENT ON COLUMN companies.encrypted_tax_id IS 'Encrypted tax ID using pgcrypto. Use decrypt_tax_id() function to decrypt.';
COMMENT ON COLUMN companies.tax_id IS 'DEPRECATED: Use encrypted_tax_id instead. This column is kept for backward compatibility but will be NULL after encryption.';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (if needed)
-- =====================================================
-- To rollback this migration:
-- 1. DROP TRIGGER encrypt_tax_id_trigger ON companies;
-- 2. DROP FUNCTION auto_encrypt_tax_id();
-- 3. DROP VIEW companies_with_tax_id;
-- 4. DROP FUNCTION decrypt_tax_id(BYTEA);
-- 5. DROP FUNCTION encrypt_tax_id(TEXT);
-- 6. ALTER TABLE companies DROP COLUMN encrypted_tax_id;
-- =====================================================

-- =====================================================
-- USAGE EXAMPLES
-- =====================================================
-- Insert with encryption:
-- INSERT INTO companies (name, tax_id) VALUES ('Test Company', '12-3456789');
-- The trigger will automatically encrypt tax_id to encrypted_tax_id

-- Query with decryption:
-- SELECT id, name, decrypt_tax_id(encrypted_tax_id) AS tax_id FROM companies;
-- OR use the view:
-- SELECT id, name, decrypted_tax_id AS tax_id FROM companies_with_tax_id;

-- Update tax_id:
-- UPDATE companies SET tax_id = '98-7654321' WHERE id = 'some-uuid';
-- The trigger will automatically encrypt it
-- =====================================================

