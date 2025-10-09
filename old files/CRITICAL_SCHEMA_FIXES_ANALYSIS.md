# 🚨 Critical Schema Fixes Analysis - TradeMate Pro

**Date:** 2025-09-29  
**Status:** CRITICAL - Multiple 400 errors blocking dashboard functionality

---

## 📊 Error Summary from logs.md

### Primary Errors (Repeating 400s):
1. **profiles table** - `status=eq.ACTIVE` query failing (3 errors)
2. **work_orders table** - Multiple status queries failing (20+ errors)
3. **employees table** - Query with profile join failing (2 errors)
4. **settings table** - Table doesn't exist (should be work_settings) (6 errors)

---

## 🔍 Root Cause Analysis

### Issue #1: `profiles` Table Missing `status` Column
**Error:** `profiles?select=id&status=eq.ACTIVE` → 400

**Current Schema:**
```sql
profiles (
  id uuid,
  company_id uuid,
  first_name text,
  last_name text,
  phone text,
  role text,  -- ❌ NOT an enum, just text
  created_at timestamptz,
  updated_at timestamptz
)
```

**Missing:**
- ❌ `status` column (should be `user_status_enum` or text with CHECK constraint)
- ❌ `user_id` reference to auth.users or users table
- ❌ `email` column
- ❌ `full_name` computed field or column

**Industry Standard (Jobber/ServiceTitan/Housecall Pro):**
```sql
profiles (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid REFERENCES companies(id),
  first_name text NOT NULL,
  last_name text NOT NULL,
  full_name text GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
  email text,
  phone text,
  avatar_url text,
  role user_role_enum NOT NULL,
  status user_status_enum DEFAULT 'ACTIVE',
  preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
)
```

---

### Issue #2: `work_orders` Table Status Enum Mismatch
**Error:** `work_orders?select=id&status=in.(SCHEDULED,IN_PROGRESS,COMPLETED)` → 400

**Current Schema:**
```sql
work_orders (
  status USER-DEFINED  -- ❌ Enum exists but values don't match frontend queries
)
```

**Frontend Expects These Status Values:**
- QUOTE, SENT, ACCEPTED, SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, INVOICED

**Current Enum Values:** Unknown (need to check actual enum definition)

**Industry Standard:**
```sql
CREATE TYPE work_order_status_enum AS ENUM (
  'DRAFT',      -- Initial creation
  'QUOTE',      -- Quote stage
  'SENT',       -- Quote sent to customer
  'ACCEPTED',   -- Customer accepted quote
  'SCHEDULED',  -- Job scheduled
  'IN_PROGRESS',-- Job in progress
  'COMPLETED',  -- Job completed
  'CANCELLED',  -- Cancelled
  'INVOICED'    -- Invoiced
);
```

---

### Issue #3: `employees` Table Query Failing
**Error:** `employees?select=*,profile:profiles(full_name)&order=created_at.desc` → 400

**Current Schema:**
```sql
employees (
  id uuid,
  company_id uuid,
  user_id uuid,
  hire_date date,
  termination_date date,
  job_title text,
  department text,
  employment_type text,
  pay_rate numeric,
  pay_type text,
  status text,  -- ❌ Should be enum
  created_at timestamptz,
  updated_at timestamptz
)
```

**Problem:** 
- Join syntax `profile:profiles(full_name)` suggests foreign key relationship
- `profiles` table doesn't have `full_name` column
- No clear relationship between employees.user_id and profiles

**Industry Standard:**
```sql
employees (
  id uuid PRIMARY KEY,
  company_id uuid REFERENCES companies(id),
  user_id uuid REFERENCES users(id),  -- Links to users table
  employee_number text UNIQUE NOT NULL,
  hire_date date,
  termination_date date,
  job_title text,
  department text,
  employment_type employment_type_enum DEFAULT 'FULL_TIME',
  pay_rate numeric(10,2),
  pay_type pay_type_enum DEFAULT 'HOURLY',
  status employee_status_enum DEFAULT 'ACTIVE',
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
)
```

---

### Issue #4: `settings` Table Doesn't Exist
**Error:** `settings?select=*&company_id=eq.{id}` → 404  
**Hint:** "Perhaps you meant the table 'public.work_settings'"

**Current Schema:**
- ❌ `settings` table does NOT exist
- ✅ `work_settings` table exists (but not being queried)
- ✅ `company_settings` table exists
- ✅ `business_settings` table exists

**Frontend Code Issue:**
```javascript
// SettingsService.js line ~267
const response = await supabase
  .from('settings')  // ❌ Wrong table name
  .select('*')
  .eq('company_id', companyId);
```

**Should be:**
```javascript
const response = await supabase
  .from('company_settings')  // ✅ Correct table
  .select('*')
  .eq('company_id', companyId);
```

---

## 🎯 Competitor Comparison

### Jobber Schema Standards:
- ✅ Unified `work_orders` table with status enum
- ✅ Separate `profiles` table with status tracking
- ✅ `employees` table with proper enums
- ✅ `company_settings` table (not just "settings")

### ServiceTitan Schema Standards:
- ✅ Status enums are UPPERCASE and comprehensive
- ✅ All user-related data in `profiles` table
- ✅ Clear separation: auth.users → users → profiles → employees
- ✅ Settings are namespaced (company_settings, user_settings, etc.)

### Housecall Pro Schema Standards:
- ✅ Status tracking on all major entities
- ✅ Audit logs for all status changes
- ✅ Proper foreign key relationships with CASCADE rules

---

## 🛠️ Required Fixes

### Priority 1: Fix `profiles` Table (CRITICAL)
```sql
-- Add missing columns
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
  ADD COLUMN IF NOT EXISTS full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
```

### Priority 2: Fix `work_orders` Status Enum (CRITICAL)
```sql
-- Check current enum values
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'work_order_status_enum'::regtype ORDER BY enumsortorder;

-- Add missing enum values if needed
ALTER TYPE work_order_status_enum ADD VALUE IF NOT EXISTS 'SENT';
ALTER TYPE work_order_status_enum ADD VALUE IF NOT EXISTS 'ACCEPTED';
ALTER TYPE work_order_status_enum ADD VALUE IF NOT EXISTS 'SCHEDULED';
ALTER TYPE work_order_status_enum ADD VALUE IF NOT EXISTS 'IN_PROGRESS';
ALTER TYPE work_order_status_enum ADD VALUE IF NOT EXISTS 'COMPLETED';
ALTER TYPE work_order_status_enum ADD VALUE IF NOT EXISTS 'CANCELLED';
ALTER TYPE work_order_status_enum ADD VALUE IF NOT EXISTS 'INVOICED';
```

### Priority 3: Fix Frontend Settings Query (CRITICAL)
**File:** `src/services/SettingsService.js`
```javascript
// Line ~267 - Change from 'settings' to 'company_settings'
const response = await supabase
  .from('company_settings')  // ✅ Fixed
  .select('*')
  .eq('company_id', companyId);
```

### Priority 4: Fix `employees` Table Status (HIGH)
```sql
-- Convert status to enum
CREATE TYPE employee_status_enum AS ENUM ('ACTIVE', 'INACTIVE', 'TERMINATED', 'ON_LEAVE');

ALTER TABLE employees 
  ALTER COLUMN status TYPE employee_status_enum USING status::employee_status_enum;
```

---

## 📋 Deployment Checklist

- [ ] Backup current database
- [ ] Run schema analysis script to verify current state
- [ ] Apply Priority 1 fixes (profiles table)
- [ ] Apply Priority 2 fixes (work_orders enum)
- [ ] Apply Priority 3 fixes (frontend code)
- [ ] Apply Priority 4 fixes (employees table)
- [ ] Test dashboard queries
- [ ] Test quote builder
- [ ] Verify no 400 errors in logs
- [ ] Update schema documentation

---

## 🚀 Next Steps

1. **Immediate:** Run diagnostic query to check current enum values
2. **Immediate:** Apply database migrations
3. **Immediate:** Fix frontend code references
4. **Short-term:** Add missing indexes for performance
5. **Short-term:** Create views for backward compatibility
6. **Long-term:** Implement full schema standardization per locked schema


