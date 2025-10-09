-- Fix company_number generation at database level
-- This ensures ALL apps/services that create companies will get proper company numbers

-- 1. Create function to generate unique company numbers
CREATE OR REPLACE FUNCTION generate_company_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    counter INTEGER := 0;
    max_attempts INTEGER := 100;
BEGIN
    LOOP
        -- Generate a 6-digit number
        new_number := 'C-' || LPAD((FLOOR(RANDOM() * 900000) + 100000)::TEXT, 6, '0');
        
        -- Check if it already exists
        IF NOT EXISTS (SELECT 1 FROM companies WHERE company_number = new_number) THEN
            RETURN new_number;
        END IF;
        
        counter := counter + 1;
        IF counter >= max_attempts THEN
            RAISE EXCEPTION 'Unable to generate unique company number after % attempts', max_attempts;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 2. Create trigger function to auto-generate company_number if not provided
CREATE OR REPLACE FUNCTION set_company_number()
RETURNS TRIGGER AS $$
BEGIN
    -- Only generate if company_number is NULL or empty
    IF NEW.company_number IS NULL OR NEW.company_number = '' THEN
        NEW.company_number := generate_company_number();
        RAISE NOTICE 'Auto-generated company_number: %', NEW.company_number;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create trigger to call the function before insert
DROP TRIGGER IF EXISTS trigger_set_company_number ON companies;
CREATE TRIGGER trigger_set_company_number
    BEFORE INSERT ON companies
    FOR EACH ROW
    EXECUTE FUNCTION set_company_number();

-- 4. Set default value for company_number column
ALTER TABLE companies 
ALTER COLUMN company_number SET DEFAULT generate_company_number();

-- 5. Test the function
SELECT 'Testing company number generation:' as info;
SELECT generate_company_number() as sample_company_number;
SELECT generate_company_number() as another_sample;
SELECT generate_company_number() as third_sample;
