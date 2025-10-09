-- Fix rate cards function parameter mismatch
-- Drop the old function with the wrong signature
DROP FUNCTION IF EXISTS create_default_rate_cards(UUID, NUMERIC);

-- Create the correct function (single parameter)
CREATE OR REPLACE FUNCTION create_default_rate_cards(
    p_company_id UUID
)
RETURNS VOID AS $$
DECLARE
    v_industry TEXT;
BEGIN
    -- Look up the company's industry
    SELECT industry INTO v_industry
    FROM companies
    WHERE id = p_company_id;

    -- Only seed if company has no rate cards
    IF NOT EXISTS (SELECT 1 FROM rate_cards WHERE company_id = p_company_id) THEN

        -- Universal defaults (always added, 0.00 placeholder)
        INSERT INTO rate_cards (company_id, service_name, description, category, unit_type, rate, is_default, sort_order)
        VALUES
        (p_company_id, 'General Labor', 'Standard labor rate', 'OTHER', 'HOUR', 0.00, true, 1),
        (p_company_id, 'Service Call', 'Basic service call / dispatch', 'OTHER', 'FLAT_FEE', 0.00, false, 2),
        (p_company_id, 'Emergency Service', 'After-hours / urgent response', 'OTHER', 'HOUR', 0.00, false, 3),
        (p_company_id, 'Parts & Materials', 'Parts and consumables', 'OTHER', 'UNIT', 0.00, false, 4);

        -- Optional trade-specific placeholders
        IF v_industry = 'HVAC' THEN
            INSERT INTO rate_cards (company_id, service_name, description, category, unit_type, rate, is_default, sort_order)
            VALUES
            (p_company_id, 'HVAC Repair', 'General HVAC repair work', 'HVAC', 'HOUR', 0.00, false, 10),
            (p_company_id, 'System Tune-up', 'Annual maintenance and tune-up', 'HVAC', 'FLAT_FEE', 0.00, false, 11);

        ELSIF v_industry = 'PLUMBING' THEN
            INSERT INTO rate_cards (company_id, service_name, description, category, unit_type, rate, is_default, sort_order)
            VALUES
            (p_company_id, 'Plumbing Repair', 'General plumbing repair work', 'PLUMBING', 'HOUR', 0.00, false, 10),
            (p_company_id, 'Drain Cleaning', 'Standard drain cleaning service', 'PLUMBING', 'FLAT_FEE', 0.00, false, 11);

        ELSIF v_industry = 'ELECTRICAL' THEN
            INSERT INTO rate_cards (company_id, service_name, description, category, unit_type, rate, is_default, sort_order)
            VALUES
            (p_company_id, 'Electrical Repair', 'General electrical repair work', 'ELECTRICAL', 'HOUR', 0.00, false, 10),
            (p_company_id, 'Outlet Installation', 'Install new electrical outlet', 'ELECTRICAL', 'UNIT', 0.00, false, 11);

        END IF;

        RAISE NOTICE 'Created default rate card structure for company %', p_company_id;
    ELSE
        RAISE NOTICE 'Rate cards already exist for company %, skipping defaults', p_company_id;
    END IF;
END;
$$ LANGUAGE plpgsql;
