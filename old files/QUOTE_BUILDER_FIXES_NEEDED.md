# 🔧 Quote Builder Fixes Needed - Industry Standard

**Date:** 2025-09-30  
**Status:** Multiple schema mismatches between frontend and database

---

## 🚨 CRITICAL ISSUES FOUND:

### **1. Service Address Not Loading** ❌
**Problem:** Frontend queries `address_type=eq.SERVICE` but database has `type` column  
**Error:** Line 526, 546 in logs - `address_type` column doesn't exist

**Database has:**
- `type` (text, default 'service')
- `address_line1` (not `address_line_1`)
- `state_province` (not `state`)
- `postal_code` (not `zip_code`)

**Frontend expects:**
- `address_type`
- `address_name`
- `address_line_1`
- `state`
- `zip_code`

**Industry Standard (Jobber/ServiceTitan):**
- `address_type` enum: 'SERVICE', 'BILLING', 'SHIPPING'
- `address_line_1`, `address_line_2`
- `city`, `state`, `zip_code` (US standard)
- `address_name` (e.g., "Main Office", "Warehouse")

---

### **2. Work Order Creation Fails** ❌
**Problem:** Frontend tries to insert columns that don't exist  
**Error:** Lines 710, 758, 783 in logs

**Missing columns in work_orders:**
- ❌ `labor_summary` (JSONB) - Frontend sends this
- ❌ `pricing_model` (enum) - Frontend sends this
- ❌ `flat_rate_amount` (numeric)
- ❌ `unit_count` (integer)
- ❌ `unit_price` (numeric)
- ❌ `percentage` (numeric)
- ❌ `percentage_base_amount` (numeric)
- ❌ `recurring_interval` (text)

**Industry Standard (ServiceTitan/Jobber):**
- `pricing_model` enum: 'TIME_MATERIALS', 'FLAT_RATE', 'UNIT', 'PERCENTAGE', 'RECURRING'
- `labor_summary` JSONB: Stores labor breakdown (employees, hours, rates)
- Model-specific fields for each pricing type

---

### **3. Rate Cards Query Broken** ⚠️
**Problem:** Frontend queries columns that don't exist  
**Error:** Lines 192, 284, 366, 430 in logs

**Database has:**
- `active` (boolean)

**Frontend expects:**
- `is_active` (boolean)
- `effective_date` (date)
- `expiration_date` (date)

**Fix:** Remove rate cards query (you have 0 rate cards anyway, using company_settings fallback)

---

### **4. Employees Query Broken** ⚠️
**Problem:** Join syntax issue  
**Error:** Lines 166, 245 in logs

**Frontend query:**
```sql
employees?select=*,profile:profiles(full_name)
```

**Issue:** `profiles` table might not have `full_name` column, or join is misconfigured

---

### **5. Send to Customer Not Implemented** ⚠️
**Problem:** No email/SMS integration  
**Current:** Just marks status as 'SENT' but doesn't actually send anything

**Industry Standard:**
- Email with PDF attachment
- SMS with link to Customer Portal
- In-app notification
- Tracking: opened, viewed, accepted

---

## 🎯 RECOMMENDED FIXES (Industry Standard):

### **Fix 1: Standardize customer_addresses table**

```sql
-- Rename columns to match industry standard
ALTER TABLE customer_addresses RENAME COLUMN type TO address_type;
ALTER TABLE customer_addresses RENAME COLUMN address_line1 TO address_line_1;
ALTER TABLE customer_addresses RENAME COLUMN state_province TO state;
ALTER TABLE customer_addresses RENAME COLUMN postal_code TO zip_code;

-- Add address_name column
ALTER TABLE customer_addresses ADD COLUMN address_name TEXT;

-- Update address_type to use enum
CREATE TYPE address_type_enum AS ENUM ('SERVICE', 'BILLING', 'SHIPPING', 'MAILING');
ALTER TABLE customer_addresses ALTER COLUMN address_type TYPE address_type_enum USING address_type::address_type_enum;
ALTER TABLE customer_addresses ALTER COLUMN address_type SET DEFAULT 'SERVICE'::address_type_enum;
```

---

### **Fix 2: Add missing work_orders columns**

```sql
-- Add pricing model enum
CREATE TYPE pricing_model_enum AS ENUM ('TIME_MATERIALS', 'FLAT_RATE', 'UNIT', 'PERCENTAGE', 'RECURRING');

-- Add missing columns
ALTER TABLE work_orders ADD COLUMN pricing_model pricing_model_enum DEFAULT 'TIME_MATERIALS';
ALTER TABLE work_orders ADD COLUMN labor_summary JSONB;
ALTER TABLE work_orders ADD COLUMN flat_rate_amount NUMERIC(10,2);
ALTER TABLE work_orders ADD COLUMN unit_count INTEGER;
ALTER TABLE work_orders ADD COLUMN unit_price NUMERIC(10,2);
ALTER TABLE work_orders ADD COLUMN percentage NUMERIC(5,2);
ALTER TABLE work_orders ADD COLUMN percentage_base_amount NUMERIC(10,2);
ALTER TABLE work_orders ADD COLUMN recurring_interval TEXT;

-- Add service address columns (from customer_addresses)
ALTER TABLE work_orders ADD COLUMN service_address_line_1 TEXT;
ALTER TABLE work_orders ADD COLUMN service_address_line_2 TEXT;
ALTER TABLE work_orders ADD COLUMN service_city TEXT;
ALTER TABLE work_orders ADD COLUMN service_state TEXT;
ALTER TABLE work_orders ADD COLUMN service_zip_code TEXT;
```

---

### **Fix 3: Remove rate_cards query from frontend**

**File:** `src/services/SettingsService.js`

**Change:**
```javascript
// Remove this query (you have 0 rate cards)
const { data: rateCards } = await supabase
  .from('rate_cards')
  .select('*')
  .eq('company_id', companyId)
  .eq('is_active', true)
  .lte('effective_date', today)
  .or(`expiration_date.is.null,expiration_date.gte.${today}`)
  .order('effective_date', { ascending: false });

// Just use company_settings fallback
const settings = await getCompanySettings(companyId);
return {
  rateCards: [],
  laborRates: {
    standard: settings.labor_rate || 75,
    overtime: (settings.labor_rate || 75) * (settings.overtime_multiplier || 1.5),
    // ...
  }
};
```

---

### **Fix 4: Fix employees query**

**File:** `src/services/LaborService.js`

**Change:**
```javascript
// OLD (broken):
const { data } = await supabase
  .from('employees')
  .select('*,profile:profiles(full_name)')
  .eq('company_id', companyId);

// NEW (fixed):
const { data } = await supabase
  .from('employees')
  .select('*,profiles(full_name)')
  .eq('company_id', companyId);
```

---

### **Fix 5: Implement Send to Customer (Phase 2)**

**For beta:** Just generate PDF and mark as SENT  
**Post-beta:** Add email/SMS integration

---

## 📋 PRIORITY ORDER:

1. **🔴 URGENT:** Fix customer_addresses columns (service address not loading)
2. **🔴 URGENT:** Add missing work_orders columns (quote creation fails)
3. **🟡 HIGH:** Remove rate_cards query (non-blocking, has fallback)
4. **🟡 HIGH:** Fix employees query (non-blocking for quotes)
5. **🟢 MEDIUM:** Implement Send to Customer properly

---

## 🚀 DEPLOYMENT PLAN:

**Step 1:** Create SQL migration file  
**Step 2:** Deploy to database  
**Step 3:** Test quote creation  
**Step 4:** Test service address loading  
**Step 5:** Remove rate_cards query from frontend  

---

## ✅ EXPECTED RESULT:

After fixes:
- ✅ Service address loads correctly
- ✅ Quote creation works
- ✅ Address shows in quote builder
- ✅ "Send to Customer" marks as SENT (email integration later)
- ✅ No more 400 errors in console

---

**Want me to:**
1. Create the SQL migration file?
2. Deploy it to your database?
3. Fix the frontend queries?

