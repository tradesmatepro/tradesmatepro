-- ===============================================
-- SAFE MARKETPLACE MIGRATION - Incremental Approach
-- Handles existing data conflicts gracefully
-- Date: 2025-09-22
-- ===============================================

-- STEP 1: Create Enums (Safe - won't conflict)
-- ===============================================

CREATE TYPE IF NOT EXISTS request_type_enum AS ENUM (
  'INSTALLATION',
  'REPAIR', 
  'MAINTENANCE',
  'INSPECTION',
  'OTHER'
);

CREATE TYPE IF NOT EXISTS pricing_preference_enum AS ENUM (
  'FIXED_PRICE',
  'HOURLY',
  'ESTIMATE',
  'BIDDING'
);

CREATE TYPE IF NOT EXISTS urgency_enum AS ENUM (
  'ASAP',
  'SCHEDULED',
  'FLEXIBLE'
);

CREATE TYPE IF NOT EXISTS marketplace_response_status_enum AS ENUM (
  'INTERESTED',
  'DECLINED',
  'ACCEPTED',
  'PENDING'
);

-- STEP 2: Create Reference Tables (Safe)
-- ===============================================

CREATE TABLE IF NOT EXISTS service_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS service_subcategories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(category_id, name)
);

CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- STEP 3: Add New Columns to marketplace_requests (Safe - all nullable)
-- ===============================================

-- Add enum columns (nullable initially)
ALTER TABLE marketplace_requests
    ADD COLUMN IF NOT EXISTS request_type request_type_enum;

ALTER TABLE marketplace_requests
    ADD COLUMN IF NOT EXISTS pricing_preference pricing_preference_enum;

ALTER TABLE marketplace_requests
    ADD COLUMN IF NOT EXISTS urgency urgency_enum;

-- Add reference columns (nullable initially)
ALTER TABLE marketplace_requests
    ADD COLUMN IF NOT EXISTS category_id UUID;

ALTER TABLE marketplace_requests
    ADD COLUMN IF NOT EXISTS subcategory_id UUID;

-- Add other new columns (nullable)
ALTER TABLE marketplace_requests
    ADD COLUMN IF NOT EXISTS service_address TEXT;

ALTER TABLE marketplace_requests
    ADD COLUMN IF NOT EXISTS latitude NUMERIC;

ALTER TABLE marketplace_requests
    ADD COLUMN IF NOT EXISTS longitude NUMERIC;

ALTER TABLE marketplace_requests
    ADD COLUMN IF NOT EXISTS budget_min NUMERIC;

ALTER TABLE marketplace_requests
    ADD COLUMN IF NOT EXISTS budget_max NUMERIC;

ALTER TABLE marketplace_requests
    ADD COLUMN IF NOT EXISTS preferred_schedule JSONB;

ALTER TABLE marketplace_requests
    ADD COLUMN IF NOT EXISTS contact_preference TEXT;

-- STEP 4: Add Foreign Key Constraints (After columns exist)
-- ===============================================

-- Add foreign key constraints (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_marketplace_requests_category_id'
    ) THEN
        ALTER TABLE marketplace_requests 
        ADD CONSTRAINT fk_marketplace_requests_category_id 
        FOREIGN KEY (category_id) REFERENCES service_categories(id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_marketplace_requests_subcategory_id'
    ) THEN
        ALTER TABLE marketplace_requests 
        ADD CONSTRAINT fk_marketplace_requests_subcategory_id 
        FOREIGN KEY (subcategory_id) REFERENCES service_subcategories(id);
    END IF;
END $$;

-- STEP 5: Add Check Constraint for contact_preference
-- ===============================================

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chk_contact_preference'
    ) THEN
        ALTER TABLE marketplace_requests 
        ADD CONSTRAINT chk_contact_preference 
        CHECK (contact_preference IN ('PHONE','SMS','EMAIL','ANY'));
    END IF;
END $$;

-- STEP 6: Update marketplace_responses (Safe)
-- ===============================================

ALTER TABLE marketplace_responses
    ADD COLUMN IF NOT EXISTS response_status marketplace_response_status_enum DEFAULT 'INTERESTED';

-- STEP 7: Handle request_tags migration (Safe approach)
-- ===============================================

-- Populate tags table with existing data
INSERT INTO tags (name) 
SELECT DISTINCT tag 
FROM request_tags 
WHERE tag IS NOT NULL AND tag != ''
ON CONFLICT (name) DO NOTHING;

-- Add tag_id column (nullable initially)
ALTER TABLE request_tags 
ADD COLUMN IF NOT EXISTS tag_id UUID;

-- Update with foreign keys where possible
UPDATE request_tags 
SET tag_id = (SELECT id FROM tags WHERE tags.name = request_tags.tag)
WHERE tag IS NOT NULL AND tag != '' AND tag_id IS NULL;

-- STEP 8: Insert Sample Data
-- ===============================================

INSERT INTO service_categories (name) VALUES
    ('Plumbing'),
    ('Electrical'),
    ('HVAC'),
    ('Carpentry'),
    ('Painting'),
    ('Landscaping'),
    ('Cleaning'),
    ('Appliance Repair'),
    ('Roofing'),
    ('Flooring')
ON CONFLICT (name) DO NOTHING;

-- Insert Sample Subcategories
INSERT INTO service_subcategories (category_id, name) 
SELECT c.id, sub.name
FROM service_categories c
CROSS JOIN (VALUES
    ('Plumbing', 'Leak Repair'),
    ('Plumbing', 'Drain Cleaning'),
    ('Plumbing', 'Fixture Installation'),
    ('Plumbing', 'Water Heater'),
    ('Electrical', 'Outlet Installation'),
    ('Electrical', 'Panel Upgrade'),
    ('Electrical', 'Lighting'),
    ('Electrical', 'Wiring'),
    ('HVAC', 'AC Repair'),
    ('HVAC', 'Heating Repair'),
    ('HVAC', 'Installation'),
    ('HVAC', 'Maintenance'),
    ('Carpentry', 'Cabinet Installation'),
    ('Carpentry', 'Trim Work'),
    ('Carpentry', 'Deck Building'),
    ('Carpentry', 'Repairs'),
    ('Painting', 'Interior Painting'),
    ('Painting', 'Exterior Painting'),
    ('Painting', 'Cabinet Painting'),
    ('Painting', 'Touch-ups')
) AS sub(category, name)
WHERE c.name = sub.category
ON CONFLICT (category_id, name) DO NOTHING;

-- STEP 9: Create Indexes (Safe)
-- ===============================================

CREATE INDEX IF NOT EXISTS idx_marketplace_requests_category ON marketplace_requests(category_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_requests_subcategory ON marketplace_requests(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_requests_request_type ON marketplace_requests(request_type);
CREATE INDEX IF NOT EXISTS idx_marketplace_requests_pricing_preference ON marketplace_requests(pricing_preference);
CREATE INDEX IF NOT EXISTS idx_marketplace_requests_urgency ON marketplace_requests(urgency);
CREATE INDEX IF NOT EXISTS idx_marketplace_responses_status ON marketplace_responses(response_status);
CREATE INDEX IF NOT EXISTS idx_request_tags_tag_id ON request_tags(tag_id);

-- ===============================================
-- SAFE MIGRATION COMPLETE
-- 
-- This migration:
-- - Handles existing data conflicts gracefully
-- - Uses IF NOT EXISTS everywhere
-- - Adds constraints separately from columns
-- - Keeps old columns until manual verification
-- - Uses nullable columns initially
-- 
-- Next steps:
-- 1. Verify data integrity
-- 2. Populate new fields as needed
-- 3. Remove old columns when ready
-- ===============================================
