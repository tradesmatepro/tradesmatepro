-- =========================================
-- TRADEMATE PRO - TABLE STANDARDIZATION
-- Industry Standard: No Duplication
-- =========================================
-- Date: 2025-10-01
-- Purpose: Merge employees + profiles into users table
-- Approach: ServiceTitan pattern (combined user + employment)
-- =========================================

BEGIN;

-- =========================================
-- STEP 1: ADD COLUMNS TO users TABLE
-- =========================================

-- Personal Info
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;

-- Address
ALTER TABLE users ADD COLUMN IF NOT EXISTS address_line_1 TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS address_line_2 TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS state_province TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'US';

-- Employment (from employees table)
ALTER TABLE users ADD COLUMN IF NOT EXISTS employee_number TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS hire_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS termination_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS job_title TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS employee_type TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS pay_type TEXT;

-- Compensation
ALTER TABLE users ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC(8,2) DEFAULT 0.00;
ALTER TABLE users ADD COLUMN IF NOT EXISTS overtime_rate NUMERIC(8,2);

-- Skills & Certifications
ALTER TABLE users ADD COLUMN IF NOT EXISTS certifications TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS skills TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS notes TEXT;

-- Emergency Contact
ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;

-- Add computed name column
ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT 
  GENERATED ALWAYS AS (
    CASE 
      WHEN first_name IS NOT NULL AND last_name IS NOT NULL THEN first_name || ' ' || last_name
      WHEN first_name IS NOT NULL THEN first_name
      WHEN last_name IS NOT NULL THEN last_name
      ELSE 'Unknown'
    END
  ) STORED;

-- =========================================
-- STEP 2: MIGRATE DATA FROM profiles TO users
-- =========================================

UPDATE users u
SET 
  first_name = COALESCE(u.first_name, p.first_name),
  last_name = COALESCE(u.last_name, p.last_name),
  email = COALESCE(u.email, p.email),
  phone = COALESCE(u.phone, p.phone),
  date_of_birth = COALESCE(u.date_of_birth, p.date_of_birth),
  bio = COALESCE(u.bio, p.bio),
  address_line_1 = COALESCE(u.address_line_1, p.address_line_1),
  address_line_2 = COALESCE(u.address_line_2, p.address_line_2),
  city = COALESCE(u.city, p.city),
  state_province = COALESCE(u.state_province, p.state_province),
  postal_code = COALESCE(u.postal_code, p.postal_code),
  country = COALESCE(u.country, p.country)
FROM profiles p
WHERE u.id = p.user_id;

-- =========================================
-- STEP 3: MIGRATE DATA FROM employees TO users
-- =========================================

UPDATE users u
SET 
  employee_number = COALESCE(u.employee_number, e.employee_number),
  hire_date = COALESCE(u.hire_date, e.hire_date),
  termination_date = COALESCE(u.termination_date, e.termination_date),
  job_title = COALESCE(u.job_title, e.job_title),
  department = COALESCE(u.department, e.department),
  employee_type = COALESCE(u.employee_type, e.employee_type),
  pay_type = COALESCE(u.pay_type, e.pay_type),
  hourly_rate = COALESCE(u.hourly_rate, e.hourly_rate),
  overtime_rate = COALESCE(u.overtime_rate, e.overtime_rate),
  certifications = COALESCE(u.certifications, e.certifications),
  skills = COALESCE(u.skills, e.skills),
  notes = COALESCE(u.notes, e.notes),
  emergency_contact_name = COALESCE(u.emergency_contact_name, e.emergency_contact_name),
  emergency_contact_phone = COALESCE(u.emergency_contact_phone, e.emergency_contact_phone)
FROM employees e
WHERE u.id = e.user_id;

-- =========================================
-- STEP 4: UPDATE FOREIGN KEYS
-- =========================================

-- Update tables that reference employees to reference users instead
-- (This will be done per table as needed)

-- Example: employee_timesheets
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'employee_timesheets'
  ) THEN
    -- Add user_id column if it doesn't exist
    ALTER TABLE employee_timesheets ADD COLUMN IF NOT EXISTS user_id UUID;
    
    -- Copy employee_id to user_id
    UPDATE employee_timesheets et
    SET user_id = e.user_id
    FROM employees e
    WHERE et.employee_id = e.id;
    
    -- Drop old FK constraint
    ALTER TABLE employee_timesheets DROP CONSTRAINT IF EXISTS employee_timesheets_employee_id_fkey;
    
    -- Add new FK constraint
    ALTER TABLE employee_timesheets 
      ADD CONSTRAINT employee_timesheets_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- =========================================
-- STEP 5: DROP DUPLICATE COLUMNS FROM profiles
-- =========================================

ALTER TABLE profiles 
  DROP COLUMN IF EXISTS first_name CASCADE,
  DROP COLUMN IF EXISTS last_name CASCADE,
  DROP COLUMN IF EXISTS name CASCADE,
  DROP COLUMN IF EXISTS email CASCADE,
  DROP COLUMN IF EXISTS phone CASCADE,
  DROP COLUMN IF EXISTS role CASCADE,
  DROP COLUMN IF EXISTS status CASCADE,
  DROP COLUMN IF EXISTS company_id CASCADE,
  DROP COLUMN IF EXISTS hire_date CASCADE,
  DROP COLUMN IF EXISTS date_of_birth CASCADE,
  DROP COLUMN IF EXISTS bio CASCADE,
  DROP COLUMN IF EXISTS address_line_1 CASCADE,
  DROP COLUMN IF EXISTS address_line_2 CASCADE,
  DROP COLUMN IF EXISTS city CASCADE,
  DROP COLUMN IF EXISTS state_province CASCADE,
  DROP COLUMN IF EXISTS postal_code CASCADE,
  DROP COLUMN IF EXISTS country CASCADE,
  DROP COLUMN IF EXISTS emergency_contact_name CASCADE,
  DROP COLUMN IF EXISTS emergency_contact_phone CASCADE,
  DROP COLUMN IF EXISTS emergency_contact_relationship CASCADE,
  DROP COLUMN IF EXISTS email_verified CASCADE,
  DROP COLUMN IF EXISTS phone_verified CASCADE;

-- =========================================
-- STEP 6: ADD CONSTRAINTS TO users TABLE
-- =========================================

-- Add unique constraint on employee_number
ALTER TABLE users ADD CONSTRAINT users_employee_number_key UNIQUE (employee_number);

-- Add check constraints
ALTER TABLE users ADD CONSTRAINT chk_termination_after_hire 
  CHECK (termination_date IS NULL OR termination_date >= hire_date);

ALTER TABLE users ADD CONSTRAINT users_employee_type_check 
  CHECK (employee_type = ANY (ARRAY['full_time'::text, 'part_time'::text, 'contractor'::text, 'seasonal'::text]));

ALTER TABLE users ADD CONSTRAINT users_pay_type_check 
  CHECK (pay_type = ANY (ARRAY['hourly'::text, 'salary'::text, 'commission'::text, 'per_job'::text]));

ALTER TABLE users ADD CONSTRAINT chk_users_name_not_empty 
  CHECK (length(TRIM(BOTH FROM first_name)) > 0 AND length(TRIM(BOTH FROM last_name)) > 0);

ALTER TABLE users ADD CONSTRAINT chk_users_phone_format 
  CHECK (phone IS NULL OR phone ~ '^[\+]?[1-9][\d]{0,15}$'::text);

-- =========================================
-- STEP 7: ADD INDEXES TO users TABLE
-- =========================================

CREATE INDEX IF NOT EXISTS idx_users_name ON users (first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_users_name_lower ON users (lower(name));
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users (phone);
CREATE INDEX IF NOT EXISTS idx_users_employee_number ON users (employee_number);
CREATE INDEX IF NOT EXISTS idx_users_hire_date ON users (hire_date);
CREATE INDEX IF NOT EXISTS idx_users_job_title ON users (job_title);
CREATE INDEX IF NOT EXISTS idx_users_department ON users (department);

-- =========================================
-- STEP 8: DROP employees TABLE
-- =========================================

-- Drop all foreign key constraints referencing employees
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT conname, conrelid::regclass AS table_name
    FROM pg_constraint
    WHERE confrelid = 'employees'::regclass
  ) LOOP
    EXECUTE format('ALTER TABLE %s DROP CONSTRAINT IF EXISTS %I CASCADE', r.table_name, r.conname);
  END LOOP;
END $$;

-- Drop the employees table
DROP TABLE IF EXISTS employees CASCADE;

-- =========================================
-- STEP 9: UPDATE VIEWS
-- =========================================

-- Drop old views
DROP VIEW IF EXISTS employees_with_profiles CASCADE;
DROP VIEW IF EXISTS user_profiles CASCADE;

-- Create new simplified view
CREATE OR REPLACE VIEW user_profiles AS
SELECT 
  u.id,
  u.auth_user_id,
  u.company_id,
  u.role,
  u.status,
  u.first_name,
  u.last_name,
  u.name,
  u.email,
  u.phone,
  u.employee_number,
  u.hire_date,
  u.job_title,
  u.department,
  u.hourly_rate,
  p.avatar_url,
  p.preferences,
  p.notification_preferences,
  u.created_at,
  u.updated_at
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id;

-- =========================================
-- STEP 10: VERIFICATION QUERIES
-- =========================================

-- Check data migration
DO $$
DECLARE
  users_count INTEGER;
  profiles_count INTEGER;
  users_with_names INTEGER;
BEGIN
  SELECT COUNT(*) INTO users_count FROM users;
  SELECT COUNT(*) INTO profiles_count FROM profiles;
  SELECT COUNT(*) INTO users_with_names FROM users WHERE first_name IS NOT NULL AND last_name IS NOT NULL;
  
  RAISE NOTICE 'Migration Complete:';
  RAISE NOTICE '  Total users: %', users_count;
  RAISE NOTICE '  Total profiles: %', profiles_count;
  RAISE NOTICE '  Users with names: %', users_with_names;
  
  IF users_with_names < users_count THEN
    RAISE WARNING 'Some users are missing names! Check data migration.';
  END IF;
END $$;

COMMIT;

-- =========================================
-- ROLLBACK SCRIPT (Save separately)
-- =========================================
-- If something goes wrong, run this:
-- 
-- BEGIN;
-- -- Restore employees table from backup
-- -- Restore profiles columns from backup
-- -- Drop new columns from users
-- ROLLBACK;

