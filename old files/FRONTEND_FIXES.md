# Frontend Code Fixes for Schema Issues

## Issue: SettingsService.js queries non-existent 'settings' table

**File:** `src/services/SettingsService.js`  
**Line:** 261  
**Problem:** Queries `settings` table which doesn't exist (should be `company_settings`)

### Current Code (BROKEN):
```javascript
// Line 257-264
console.log('🔧 Loading rates from settings table (industry standard)...');

// Get company settings (has default rates)
const { data: settings, error: settingsError } = await supabase
  .from('settings')  // ❌ WRONG - table doesn't exist
  .select('*')
  .eq('company_id', companyId)
  .single();
```

### Fixed Code:
```javascript
console.log('🔧 Loading rates from company_settings table (industry standard)...');

// Get company settings (has default rates)
const { data: settings, error: settingsError } = await supabase
  .from('company_settings')  // ✅ CORRECT
  .select('*')
  .eq('company_id', companyId)
  .single();
```

### Additional Changes Needed:
The method tries to query both `settings` and `company_settings` tables, but they should be the same table. The logic should be simplified to only query `company_settings` once.

---

## Issue: POSettingsService.js has fallback to non-existent 'settings' table

**File:** `src/services/POSettingsService.js`  
**Lines:** 31-42  
**Problem:** Has fallback logic to query `settings` table which doesn't exist

### Current Code (BROKEN):
```javascript
// Fallback to legacy settings table
const settingsRes = await supaFetch(
  `settings?company_id=eq.${companyId}&select=*`,  // ❌ WRONG
  { method: 'GET' },
  companyId
);
```

### Fix:
Remove the fallback entirely since `company_settings` is the correct table. If `company_settings` doesn't have data, return defaults.

---

## Summary of Required Frontend Changes

1. **src/services/SettingsService.js** - Line 261: Change `'settings'` to `'company_settings'`
2. **src/services/SettingsService.js** - Lines 270-279: Remove duplicate query (already querying company_settings)
3. **src/services/POSettingsService.js** - Lines 31-42: Remove fallback to `settings` table

---

## Testing Checklist After Fixes

- [ ] Dashboard loads without 400 errors
- [ ] Quote Builder loads rates successfully
- [ ] Settings page loads company settings
- [ ] No "settings table not found" errors in console
- [ ] All pricing/rates display correctly

