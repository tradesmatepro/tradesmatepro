-- SQL to create CPQ (Configure-Price-Quote) system
-- Run this in your Supabase SQL editor

-- 1. Create quote_bundles table for good/better/best packages
CREATE TABLE IF NOT EXISTS quote_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  tier TEXT NOT NULL DEFAULT 'standard' CHECK (tier IN ('good', 'better', 'best', 'standard')),
  base_price DECIMAL(10,2) DEFAULT 0,
  savings_amount DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on quote_bundles
ALTER TABLE quote_bundles ENABLE ROW LEVEL SECURITY;

-- RLS policy: Users can only access bundles for their company
CREATE POLICY "Users can access quote bundles for their company" ON quote_bundles
  FOR ALL USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

-- 2. Create bundle_items table for items included in bundles
CREATE TABLE IF NOT EXISTS bundle_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id UUID REFERENCES quote_bundles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  description TEXT,
  item_type TEXT NOT NULL DEFAULT 'service' CHECK (item_type IN ('labor', 'material', 'part', 'service')),
  quantity INTEGER DEFAULT 1,
  rate DECIMAL(10,2) DEFAULT 0,
  is_required BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on bundle_items
ALTER TABLE bundle_items ENABLE ROW LEVEL SECURITY;

-- RLS policy: Users can only access bundle items for their company
CREATE POLICY "Users can access bundle items for their company" ON bundle_items
  FOR ALL USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

-- 3. Create quote_options table for optional add-ons
CREATE TABLE IF NOT EXISTS quote_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'Add-ons',
  price DECIMAL(10,2) DEFAULT 0,
  item_type TEXT NOT NULL DEFAULT 'service' CHECK (item_type IN ('labor', 'material', 'part', 'service')),
  is_active BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT false,
  margin_percent DECIMAL(5,2) DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on quote_options
ALTER TABLE quote_options ENABLE ROW LEVEL SECURITY;

-- RLS policy: Users can only access quote options for their company
CREATE POLICY "Users can access quote options for their company" ON quote_options
  FOR ALL USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

-- 4. Create quote_configurations table to track selected bundles/options per quote
CREATE TABLE IF NOT EXISTS quote_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  bundle_id UUID REFERENCES quote_bundles(id) ON DELETE SET NULL,
  selected_options JSONB DEFAULT '[]', -- Array of option IDs
  configuration_total DECIMAL(10,2) DEFAULT 0,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on quote_configurations
ALTER TABLE quote_configurations ENABLE ROW LEVEL SECURITY;

-- RLS policy: Users can only access quote configurations for their company
CREATE POLICY "Users can access quote configurations for their company" ON quote_configurations
  FOR ALL USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

-- 5. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_quote_bundles_company_id ON quote_bundles(company_id);
CREATE INDEX IF NOT EXISTS idx_quote_bundles_tier ON quote_bundles(tier);
CREATE INDEX IF NOT EXISTS idx_quote_bundles_active ON quote_bundles(is_active);

CREATE INDEX IF NOT EXISTS idx_bundle_items_bundle_id ON bundle_items(bundle_id);
CREATE INDEX IF NOT EXISTS idx_bundle_items_company_id ON bundle_items(company_id);

CREATE INDEX IF NOT EXISTS idx_quote_options_company_id ON quote_options(company_id);
CREATE INDEX IF NOT EXISTS idx_quote_options_category ON quote_options(category);
CREATE INDEX IF NOT EXISTS idx_quote_options_active ON quote_options(is_active);

CREATE INDEX IF NOT EXISTS idx_quote_configurations_work_order_id ON quote_configurations(work_order_id);
CREATE INDEX IF NOT EXISTS idx_quote_configurations_company_id ON quote_configurations(company_id);

-- 6. Create function to calculate bundle total
CREATE OR REPLACE FUNCTION calculate_bundle_total(p_bundle_id UUID)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  v_total DECIMAL(10,2) := 0;
BEGIN
  SELECT COALESCE(SUM(quantity * rate), 0)
  INTO v_total
  FROM bundle_items
  WHERE bundle_id = p_bundle_id;
  
  RETURN v_total;
END;
$$ LANGUAGE plpgsql;

-- 7. Create function to calculate configuration total
CREATE OR REPLACE FUNCTION calculate_configuration_total(
  p_bundle_id UUID DEFAULT NULL,
  p_option_ids UUID[] DEFAULT ARRAY[]::UUID[]
)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  v_bundle_total DECIMAL(10,2) := 0;
  v_options_total DECIMAL(10,2) := 0;
BEGIN
  -- Calculate bundle total
  IF p_bundle_id IS NOT NULL THEN
    v_bundle_total := calculate_bundle_total(p_bundle_id);
  END IF;
  
  -- Calculate options total
  IF array_length(p_option_ids, 1) > 0 THEN
    SELECT COALESCE(SUM(price), 0)
    INTO v_options_total
    FROM quote_options
    WHERE id = ANY(p_option_ids);
  END IF;
  
  RETURN v_bundle_total + v_options_total;
END;
$$ LANGUAGE plpgsql;

-- 8. Insert sample data for demonstration
-- Good/Better/Best HVAC bundles
INSERT INTO quote_bundles (company_id, name, description, tier, base_price, savings_amount, display_order) VALUES
((SELECT id FROM companies LIMIT 1), 'Basic HVAC Service', 'Essential maintenance and basic repairs', 'good', 299.00, 0, 1),
((SELECT id FROM companies LIMIT 1), 'Complete HVAC Care', 'Comprehensive service with priority support', 'better', 499.00, 100.00, 2),
((SELECT id FROM companies LIMIT 1), 'Premium HVAC Protection', 'Full-service plan with 24/7 emergency support', 'best', 799.00, 200.00, 3);

-- Sample bundle items for Basic HVAC Service
INSERT INTO bundle_items (bundle_id, company_id, item_name, description, item_type, quantity, rate) VALUES
((SELECT id FROM quote_bundles WHERE name = 'Basic HVAC Service' LIMIT 1), (SELECT id FROM companies LIMIT 1), 'System Inspection', 'Complete visual inspection of HVAC system', 'service', 1, 75.00),
((SELECT id FROM quote_bundles WHERE name = 'Basic HVAC Service' LIMIT 1), (SELECT id FROM companies LIMIT 1), 'Filter Replacement', 'Replace standard air filter', 'material', 1, 25.00),
((SELECT id FROM quote_bundles WHERE name = 'Basic HVAC Service' LIMIT 1), (SELECT id FROM companies LIMIT 1), 'Basic Cleaning', 'Clean accessible components', 'labor', 2, 99.50);

-- Sample bundle items for Complete HVAC Care
INSERT INTO bundle_items (bundle_id, company_id, item_name, description, item_type, quantity, rate) VALUES
((SELECT id FROM quote_bundles WHERE name = 'Complete HVAC Care' LIMIT 1), (SELECT id FROM companies LIMIT 1), 'Comprehensive Inspection', 'Detailed system analysis with report', 'service', 1, 125.00),
((SELECT id FROM quote_bundles WHERE name = 'Complete HVAC Care' LIMIT 1), (SELECT id FROM companies LIMIT 1), 'Premium Filter', 'High-efficiency air filter replacement', 'material', 1, 45.00),
((SELECT id FROM quote_bundles WHERE name = 'Complete HVAC Care' LIMIT 1), (SELECT id FROM companies LIMIT 1), 'Deep Cleaning', 'Thorough cleaning of all components', 'labor', 3, 109.67),
((SELECT id FROM quote_bundles WHERE name = 'Complete HVAC Care' LIMIT 1), (SELECT id FROM companies LIMIT 1), 'Performance Tuning', 'Optimize system performance', 'service', 1, 75.00);

-- Sample optional add-ons
INSERT INTO quote_options (company_id, name, description, category, price, item_type) VALUES
((SELECT id FROM companies LIMIT 1), 'Duct Cleaning', 'Professional air duct cleaning service', 'Maintenance', 199.00, 'service'),
((SELECT id FROM companies LIMIT 1), 'Thermostat Upgrade', 'Smart programmable thermostat installation', 'Upgrades', 299.00, 'material'),
((SELECT id FROM companies LIMIT 1), 'Emergency Service', '24/7 emergency repair coverage', 'Support', 99.00, 'service'),
((SELECT id FROM companies LIMIT 1), 'Extended Warranty', 'Additional 2-year parts warranty', 'Warranty', 149.00, 'service'),
((SELECT id FROM companies LIMIT 1), 'Air Quality Test', 'Indoor air quality assessment', 'Testing', 89.00, 'service');

-- 9. Verify setup
SELECT 'CPQ system created successfully' as status;
SELECT COUNT(*) as bundles_count FROM quote_bundles;
SELECT COUNT(*) as bundle_items_count FROM bundle_items;
SELECT COUNT(*) as options_count FROM quote_options;
