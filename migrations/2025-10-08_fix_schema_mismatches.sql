-- Fix all schema mismatches between database and code expectations
-- Based on logs.md errors and schema audit

-- ============================================
-- 1. FIX COMPANIES TABLE - ADD MISSING COLUMNS
-- ============================================

-- Add marketplace/emergency columns
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS company_logo_url TEXT,
  ADD COLUMN IF NOT EXISTS company_banner_url TEXT,
  ADD COLUMN IF NOT EXISTS accepts_emergency BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS emergency_fee NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS nights_weekends BOOLEAN NOT NULL DEFAULT false;

-- Add theme/branding columns
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT '#3B82F6',
  ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#6B7280';

-- Add marketplace rating columns
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS avg_rating NUMERIC(3,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rating_count INT DEFAULT 0;

COMMENT ON COLUMN companies.company_logo_url IS 'URL to company logo (used by CompanyProfileSettingsTab)';
COMMENT ON COLUMN companies.company_banner_url IS 'URL to company banner image';
COMMENT ON COLUMN companies.accepts_emergency IS 'Whether company accepts emergency marketplace requests';
COMMENT ON COLUMN companies.emergency_fee IS 'Fee charged for emergency jobs';
COMMENT ON COLUMN companies.nights_weekends IS 'Whether company works nights/weekends';
COMMENT ON COLUMN companies.theme_color IS 'Primary brand color (hex)';
COMMENT ON COLUMN companies.secondary_color IS 'Secondary brand color (hex)';

-- ============================================
-- 2. FIX RATE_CARDS TABLE - RENAME active TO is_active
-- ============================================

-- Check if 'active' column exists and 'is_active' doesn't
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='rate_cards' AND column_name='active'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='rate_cards' AND column_name='is_active'
  ) THEN
    -- Rename active to is_active
    ALTER TABLE rate_cards RENAME COLUMN active TO is_active;
    RAISE NOTICE 'Renamed rate_cards.active to is_active';
  ELSIF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='rate_cards' AND column_name='is_active'
  ) THEN
    -- Neither exists, add is_active
    ALTER TABLE rate_cards ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
    RAISE NOTICE 'Added rate_cards.is_active column';
  END IF;
END $$;

-- Update indexes if they reference 'active'
DROP INDEX IF EXISTS idx_rate_cards_active;
DROP INDEX IF EXISTS idx_rate_cards_company_active;

CREATE INDEX IF NOT EXISTS idx_rate_cards_is_active ON rate_cards(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_rate_cards_company_is_active ON rate_cards(company_id, is_active) WHERE is_active = true;

-- ============================================
-- 3. CREATE TAGS SYSTEM TABLES
-- ============================================

-- Master tags table
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL CHECK (char_length(name) > 1),
  category TEXT,
  is_curated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Company tags junction table
CREATE TABLE IF NOT EXISTS company_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, tag_id)
);

-- Request tags junction table (for marketplace)
CREATE TABLE IF NOT EXISTS request_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES marketplace_requests(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(request_id, tag_id)
);

-- Indexes for tags
CREATE INDEX IF NOT EXISTS idx_company_tags_company ON company_tags(company_id);
CREATE INDEX IF NOT EXISTS idx_company_tags_tag ON company_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_request_tags_request ON request_tags(request_id);
CREATE INDEX IF NOT EXISTS idx_request_tags_tag ON request_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);

-- ============================================
-- 4. CREATE AUTO_ACCEPT_RULES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS auto_accept_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  trade_tag TEXT NOT NULL,
  request_type TEXT NOT NULL DEFAULT 'standard' CHECK (request_type IN ('standard','emergency')),
  min_internal_rating NUMERIC(3,2) DEFAULT 0,
  require_verified BOOLEAN DEFAULT false,
  max_hourly_rate NUMERIC(12,2),
  max_eta_hours INT,
  max_distance_km NUMERIC(6,2),
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_auto_accept_rules_company ON auto_accept_rules(requester_company_id);
CREATE INDEX IF NOT EXISTS idx_auto_accept_rules_enabled ON auto_accept_rules(enabled) WHERE enabled = true;

-- ============================================
-- 5. CREATE INTEGRATION_TOKENS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS integration_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  integration_type TEXT NOT NULL CHECK (integration_type IN ('quickbooks','stripe','google_calendar','mailchimp','zapier','other')),
  token_data JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, integration_type)
);

CREATE INDEX IF NOT EXISTS idx_integration_tokens_company ON integration_tokens(company_id);
CREATE INDEX IF NOT EXISTS idx_integration_tokens_type ON integration_tokens(integration_type);
CREATE INDEX IF NOT EXISTS idx_integration_tokens_active ON integration_tokens(is_active) WHERE is_active = true;

-- ============================================
-- 6. SEED DEFAULT TAGS
-- ============================================

-- Insert common trade/service tags if they don't exist
INSERT INTO tags (name, category, is_curated) VALUES
  ('plumbing', 'TRADE', true),
  ('electrical', 'TRADE', true),
  ('hvac', 'TRADE', true),
  ('carpentry', 'TRADE', true),
  ('roofing', 'TRADE', true),
  ('painting', 'TRADE', true),
  ('flooring', 'TRADE', true),
  ('landscaping', 'TRADE', true),
  ('general_contractor', 'TRADE', true),
  ('handyman', 'TRADE', true),
  ('emergency', 'SERVICE_TYPE', true),
  ('residential', 'SERVICE_TYPE', true),
  ('commercial', 'SERVICE_TYPE', true),
  ('maintenance', 'SERVICE_TYPE', true),
  ('repair', 'SERVICE_TYPE', true),
  ('installation', 'SERVICE_TYPE', true),
  ('inspection', 'SERVICE_TYPE', true),
  ('consultation', 'SERVICE_TYPE', true)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 7. VERIFICATION
-- ============================================

-- Verify companies columns
DO $$
DECLARE
  missing_cols TEXT[];
BEGIN
  SELECT ARRAY_AGG(col) INTO missing_cols
  FROM (
    VALUES 
      ('company_logo_url'),
      ('accepts_emergency'),
      ('emergency_fee'),
      ('nights_weekends')
  ) AS expected(col)
  WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='companies' AND column_name=expected.col
  );
  
  IF array_length(missing_cols, 1) > 0 THEN
    RAISE WARNING 'Still missing companies columns: %', missing_cols;
  ELSE
    RAISE NOTICE '✅ All required companies columns exist';
  END IF;
END $$;

-- Verify rate_cards has is_active
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='rate_cards' AND column_name='is_active'
  ) THEN
    RAISE NOTICE '✅ rate_cards.is_active column exists';
  ELSE
    RAISE WARNING '❌ rate_cards.is_active column missing';
  END IF;
END $$;

-- Verify new tables
DO $$
DECLARE
  missing_tables TEXT[];
BEGIN
  SELECT ARRAY_AGG(tbl) INTO missing_tables
  FROM (
    VALUES ('tags'), ('company_tags'), ('auto_accept_rules'), ('integration_tokens')
  ) AS expected(tbl)
  WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema='public' AND table_name=expected.tbl
  );
  
  IF array_length(missing_tables, 1) > 0 THEN
    RAISE WARNING 'Still missing tables: %', missing_tables;
  ELSE
    RAISE NOTICE '✅ All required tables exist';
  END IF;
END $$;

-- Show summary
SELECT 
  '✅ Schema mismatch fixes applied' as status,
  (SELECT COUNT(*) FROM tags) as tags_count,
  (SELECT COUNT(*) FROM company_tags) as company_tags_count,
  (SELECT COUNT(*) FROM auto_accept_rules) as auto_accept_rules_count,
  (SELECT COUNT(*) FROM integration_tokens) as integration_tokens_count;

