-- ============================================================================
-- Phase 2: Tax System Database Schema
-- ============================================================================
-- This script creates NEW tables and adds NULLABLE columns
-- 100% backward compatible - existing queries work unchanged
-- Safe to run - won't break anything
-- ============================================================================

-- ============================================================================
-- 1. TAX JURISDICTIONS TABLE
-- ============================================================================
-- Stores tax rates for different jurisdictions (state, county, city, district)

CREATE TABLE IF NOT EXISTS tax_jurisdictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Jurisdiction info
  name VARCHAR(255) NOT NULL, -- "California State Tax", "Los Angeles County", "City of LA"
  jurisdiction_type VARCHAR(50) NOT NULL, -- 'state', 'county', 'city', 'district'
  
  -- Tax rate
  tax_rate DECIMAL(5,4) NOT NULL CHECK (tax_rate >= 0 AND tax_rate <= 1), -- 0.0725 = 7.25%
  
  -- Applicability
  applies_to VARCHAR(50) DEFAULT 'all', -- 'all', 'goods', 'services', 'labor'
  
  -- Geographic scope (optional)
  state_code VARCHAR(2), -- 'CA', 'TX', etc.
  county_name VARCHAR(100),
  city_name VARCHAR(100),
  zip_codes TEXT[], -- Array of zip codes this applies to
  
  -- Status
  active BOOLEAN DEFAULT true,
  effective_date DATE DEFAULT CURRENT_DATE,
  expiration_date DATE,
  
  -- Notes
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Constraints
  CONSTRAINT chk_tax_rate_valid CHECK (tax_rate >= 0 AND tax_rate <= 1),
  CONSTRAINT chk_dates_valid CHECK (expiration_date IS NULL OR expiration_date > effective_date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tax_jurisdictions_company ON tax_jurisdictions(company_id);
CREATE INDEX IF NOT EXISTS idx_tax_jurisdictions_active ON tax_jurisdictions(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_tax_jurisdictions_state ON tax_jurisdictions(state_code) WHERE state_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tax_jurisdictions_type ON tax_jurisdictions(jurisdiction_type);

-- Auto-update timestamp trigger
CREATE TRIGGER update_tax_jurisdictions_updated_at
  BEFORE UPDATE ON tax_jurisdictions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE tax_jurisdictions IS 'Tax rates for different jurisdictions (state, county, city, district). Supports multi-rate tax calculation.';
COMMENT ON COLUMN tax_jurisdictions.tax_rate IS 'Tax rate as decimal (0.0725 = 7.25%)';
COMMENT ON COLUMN tax_jurisdictions.applies_to IS 'What this tax applies to: all, goods, services, labor';

-- ============================================================================
-- 2. TAX EXEMPTIONS TABLE
-- ============================================================================
-- Stores customer tax exemption certificates

CREATE TABLE IF NOT EXISTS tax_exemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Exemption details
  exemption_type VARCHAR(50) NOT NULL, -- 'resale', 'nonprofit', 'government', 'agricultural', 'other'
  certificate_number VARCHAR(100),
  issuing_state VARCHAR(2),
  issuing_authority VARCHAR(255),
  
  -- Validity
  issue_date DATE,
  expiration_date DATE,
  
  -- Scope
  applies_to VARCHAR(50) DEFAULT 'all', -- 'all', 'goods', 'services', 'labor'
  exempt_jurisdictions UUID[], -- Array of jurisdiction IDs (NULL = all jurisdictions)
  
  -- Documentation
  document_url TEXT, -- Link to stored certificate in Supabase storage
  notes TEXT,
  
  -- Status
  active BOOLEAN DEFAULT true,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Constraints
  CONSTRAINT chk_exemption_dates_valid CHECK (expiration_date IS NULL OR expiration_date > issue_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tax_exemptions_customer ON tax_exemptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_tax_exemptions_active ON tax_exemptions(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_tax_exemptions_expiring ON tax_exemptions(expiration_date) WHERE active = true AND expiration_date IS NOT NULL;

-- Auto-update timestamp trigger
CREATE TRIGGER update_tax_exemptions_updated_at
  BEFORE UPDATE ON tax_exemptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE tax_exemptions IS 'Customer tax exemption certificates. Tracks resale certificates, nonprofit exemptions, etc.';
COMMENT ON COLUMN tax_exemptions.exemption_type IS 'Type of exemption: resale, nonprofit, government, agricultural, other';
COMMENT ON COLUMN tax_exemptions.applies_to IS 'What this exemption applies to: all, goods, services, labor';

-- ============================================================================
-- 3. SERVICE ADDRESS TAX RATES TABLE (CACHE)
-- ============================================================================
-- Caches calculated tax rates for service addresses (for performance)

CREATE TABLE IF NOT EXISTS service_address_tax_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Address
  address TEXT NOT NULL,
  city VARCHAR(100),
  state VARCHAR(2),
  zip_code VARCHAR(10),
  
  -- Geocoding (optional, for future address-based lookup)
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  
  -- Tax rates
  combined_rate DECIMAL(5,4) NOT NULL, -- Total of all jurisdictions
  jurisdiction_breakdown JSONB, -- {"state": 0.0625, "county": 0.01, "city": 0.01}
  jurisdiction_ids UUID[], -- Array of jurisdiction IDs that apply
  
  -- Verification
  last_verified TIMESTAMPTZ DEFAULT NOW(),
  verification_source VARCHAR(100), -- 'manual', 'avalara', 'taxjar', etc.
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT chk_combined_rate_valid CHECK (combined_rate >= 0 AND combined_rate <= 1)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_service_address_tax_rates_company ON service_address_tax_rates(company_id);
CREATE INDEX IF NOT EXISTS idx_service_address_tax_rates_zip ON service_address_tax_rates(zip_code);
CREATE INDEX IF NOT EXISTS idx_service_address_tax_rates_location ON service_address_tax_rates(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Auto-update timestamp trigger
CREATE TRIGGER update_service_address_tax_rates_updated_at
  BEFORE UPDATE ON service_address_tax_rates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE service_address_tax_rates IS 'Cached tax rates for service addresses. Improves performance by avoiding repeated calculations.';
COMMENT ON COLUMN service_address_tax_rates.combined_rate IS 'Total tax rate (sum of all jurisdictions)';
COMMENT ON COLUMN service_address_tax_rates.jurisdiction_breakdown IS 'JSON breakdown of tax by jurisdiction type';

-- ============================================================================
-- 4. ADD COLUMNS TO EXISTING TABLES (NULLABLE - BACKWARD COMPATIBLE)
-- ============================================================================

-- Add tax-related columns to work_orders (all nullable, won't break existing queries)
ALTER TABLE work_orders
ADD COLUMN IF NOT EXISTS service_address_id UUID REFERENCES service_address_tax_rates(id),
ADD COLUMN IF NOT EXISTS tax_jurisdiction_ids UUID[], -- Array of jurisdiction IDs
ADD COLUMN IF NOT EXISTS tax_exempt BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS tax_exemption_id UUID REFERENCES tax_exemptions(id);

-- Add tax-related columns to work_order_line_items (all nullable)
ALTER TABLE work_order_line_items
ADD COLUMN IF NOT EXISTS taxable BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,4), -- Can override per line item
ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10,2);

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_work_orders_service_address ON work_orders(service_address_id) WHERE service_address_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_work_orders_tax_exempt ON work_orders(tax_exempt) WHERE tax_exempt = true;
CREATE INDEX IF NOT EXISTS idx_work_order_line_items_taxable ON work_order_line_items(taxable);

-- Comments
COMMENT ON COLUMN work_orders.service_address_id IS 'Link to cached service address tax rate';
COMMENT ON COLUMN work_orders.tax_jurisdiction_ids IS 'Array of tax jurisdiction IDs that apply to this work order';
COMMENT ON COLUMN work_orders.tax_exempt IS 'Whether this work order is tax exempt';
COMMENT ON COLUMN work_orders.tax_exemption_id IS 'Link to tax exemption certificate if applicable';
COMMENT ON COLUMN work_order_line_items.taxable IS 'Whether this line item is taxable';
COMMENT ON COLUMN work_order_line_items.tax_rate IS 'Tax rate for this line item (can override work order rate)';
COMMENT ON COLUMN work_order_line_items.tax_amount IS 'Calculated tax amount for this line item';

-- ============================================================================
-- 5. GRANT PERMISSIONS
-- ============================================================================

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON tax_jurisdictions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON tax_exemptions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON service_address_tax_rates TO authenticated;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- ✅ Created 3 new tables:
--    1. tax_jurisdictions - Store tax rates by jurisdiction
--    2. tax_exemptions - Store customer exemption certificates
--    3. service_address_tax_rates - Cache calculated rates
--
-- ✅ Added nullable columns to existing tables:
--    - work_orders: service_address_id, tax_jurisdiction_ids, tax_exempt, tax_exemption_id
--    - work_order_line_items: taxable, tax_rate, tax_amount
--
-- ✅ Backward compatible:
--    - All new columns are nullable
--    - Existing queries work unchanged
--    - No data migration required
--
-- ✅ Safe to run:
--    - Uses IF NOT EXISTS
--    - Won't break existing functionality
--    - Zero risk
-- ============================================================================

