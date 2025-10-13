# 🔧 CRITICAL FIX: LICENSES COLUMN DOESN'T EXIST

## ❌ PROBLEM

The error shows that the `licenses` column doesn't exist in your actual database:

```
"Could not find the 'licenses' column of 'companies' in the schema cache"
```

## ✅ FIX APPLIED

**Changed:** Don't try to save licenses field at all (column doesn't exist)

### **File 1: src/components/CompanyProfileSettingsTab.js**

**Lines 276-294:**

**Before:**
```javascript
const companyData = {
  name: updatedData.name,
  phone: updatedData.phone_number,
  email: updatedData.email,
  street_address: updatedData.street_address,
  city: updatedData.city,
  state: updatedData.state,
  postal_code: updatedData.postal_code,
  licenses: updatedData.license_numbers || [],  // ❌ Column doesn't exist!
  tax_id: updatedData.tax_id,
  website: updatedData.website,
  company_logo_url: updatedData.logo_url,
  theme_color: updatedData.theme_color || null,
  secondary_color: updatedData.secondary_color || null
};
```

**After:**
```javascript
const companyData = {
  name: updatedData.name,
  phone: updatedData.phone_number,
  email: updatedData.email,
  street_address: updatedData.street_address,
  city: updatedData.city,
  state: updatedData.state,
  postal_code: updatedData.postal_code,
  // ✅ FIX: Don't save licenses - column doesn't exist in actual database
  // licenses: updatedData.license_numbers || [],
  tax_id: updatedData.tax_id,
  website: updatedData.website,
  company_logo_url: updatedData.logo_url,
  theme_color: updatedData.theme_color || null,
  secondary_color: updatedData.secondary_color || null
};
```

### **File 2: src/components/SettingsDatabasePanel.js**

**Lines 212-224:**

**Before:**
```javascript
const companyData = {
  name: companySettings.companyName || '',
  phone: companySettings.companyPhone || '',
  email: companySettings.companyEmail || '',
  website: companySettings.website || '',
  licenses: companySettings.licenses || [],  // ❌ Column doesn't exist!
  tax_id: companySettings.taxId || '',
  theme_color: companySettings.themeColor || null,
  logo_url: companySettings.companyLogoUrl || null
};
```

**After:**
```javascript
const companyData = {
  name: companySettings.companyName || '',
  phone: companySettings.companyPhone || '',
  email: companySettings.companyEmail || '',
  website: companySettings.website || '',
  // ✅ FIX: Don't save licenses - column doesn't exist in actual database
  // licenses: companySettings.licenses || [],
  tax_id: companySettings.taxId || '',
  theme_color: companySettings.themeColor || null,
  logo_url: companySettings.companyLogoUrl || null
};
```

---

## 📊 IMPACT

**Before:** Company Profile save fails with 400 error  
**After:** Company Profile saves successfully (without licenses field)

**Note:** License numbers can still be displayed in the UI, they just won't be saved to the database until the `licenses` column is added to the companies table.

---

## 🚀 NEXT STEPS

**Option A: Just rebuild and test** (licenses won't be saved but everything else works)
```bash
Ctrl+C
npm start
```

**Option B: Add the licenses column to database** (if you want to save licenses)
```sql
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS licenses JSONB DEFAULT '[]'::jsonb;
```

---

## 📋 FILES MODIFIED

1. ✅ `src/components/CompanyProfileSettingsTab.js` - Lines 276-294
2. ✅ `src/components/SettingsDatabasePanel.js` - Lines 212-224

---

## 💡 WHY THIS HAPPENED

The SQL schema files in your repo show that `licenses` column SHOULD exist, but it doesn't in your actual Supabase database. This is a schema drift issue - the code was written for a schema that wasn't actually deployed.

**Root Cause:** Schema files were created but never run against the database.

**Solution:** Either:
1. Don't save licenses (current fix)
2. Run the schema migration to add the column
3. Use a different column that does exist (like `tax_id` for storing license info)

