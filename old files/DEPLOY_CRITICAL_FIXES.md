# 🚀 Deploy Critical Fixes - TradeMate Pro

**Date:** 2025-09-29  
**Priority:** CRITICAL - Fixes 400 errors blocking dashboard

---

## 📋 Pre-Deployment Checklist

- [ ] Read CRITICAL_SCHEMA_FIXES_ANALYSIS.md
- [ ] Read RATE_SYSTEM_ANALYSIS.md
- [ ] Backup database (see below)
- [ ] Server is restarted and ready
- [ ] Browser cache cleared

---

## 🔧 What This Fixes

### Frontend Fixes (✅ COMPLETED):
1. **SettingsService.js** - Fixed to use industry-standard rate system
   - Now queries `service_rates` table first (industry standard)
   - Falls back to `company_settings` if no service rates exist
   - Removed query to non-existent `settings` table
   
2. **POSettingsService.js** - Removed fallback to non-existent `settings` table
   - Now only queries `company_settings`
   - Returns defaults if no settings found

### Database Fixes (⏳ PENDING):
1. **profiles table** - Add missing columns (status, user_id, email, full_name)
2. **work_orders table** - Fix status enum values
3. **employees table** - Convert status to enum
4. **Create settings view** - Compatibility view pointing to company_settings

---

## 🗄️ Step 1: Backup Database

```bash
# Windows (PowerShell)
& "C:\Program Files\PostgreSQL\17\bin\pg_dump.exe" `
  -h db.cxlqzejzraczumqmsrcx.supabase.co `
  -p 5432 `
  -U postgres `
  -d postgres `
  -F c `
  -b `
  -v `
  -f "backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').dump"

# Or use Supabase dashboard: Database > Backups > Create Backup
```

---

## 🔍 Step 2: Run Diagnostic (Optional but Recommended)

```bash
# Connect to database
psql -h db.cxlqzejzraczumqmsrcx.supabase.co -p 5432 -U postgres -d postgres

# Run diagnostic
\i DIAGNOSTIC_SCHEMA_CHECK.sql

# Review output for issues
```

---

## 🛠️ Step 3: Apply Database Fixes

### Option A: Via Supabase SQL Editor (RECOMMENDED)

1. Go to https://supabase.com/dashboard/project/cxlqzejzraczumqmsrcx/sql
2. Open `FIX_CRITICAL_SCHEMA_ISSUES.sql`
3. Copy contents to SQL Editor
4. Click "Run"
5. Verify no errors

### Option B: Via psql Command Line

```bash
psql -h db.cxlqzejzraczumqmsrcx.supabase.co -p 5432 -U postgres -d postgres -f FIX_CRITICAL_SCHEMA_ISSUES.sql
```

---

## 🌐 Step 4: Restart Frontend

```bash
# Kill any running servers
# Windows PowerShell:
Get-Process node | Where-Object {$_.Path -like "*TradeMate*"} | Stop-Process -Force

# Start dev server
npm start

# Or use your batch dispatcher
```

---

## ✅ Step 5: Verify Fixes

### Test 1: Dashboard Loads Without Errors
1. Open http://localhost:3000
2. Login as jeraldjsmith@gmail.com
3. Navigate to Dashboard
4. Open browser console (F12)
5. **Expected:** No 400 errors
6. **Expected:** Dashboard shows data

### Test 2: Quote Builder Loads Rates
1. Navigate to Quotes > New Quote
2. Open browser console (F12)
3. **Expected:** See "✅ Using service_rates table (industry standard)" OR "⚠️ No service_rates found, falling back to company_settings"
4. **Expected:** No 404 errors for "settings" table
5. **Expected:** Rates load successfully

### Test 3: Check logs.md
1. Open logs.md
2. Clear file contents
3. Use app for 2-3 minutes (navigate pages, create quote, etc.)
4. Check logs.md
5. **Expected:** No 400 errors for:
   - profiles?select=id&status=eq.ACTIVE
   - work_orders?select=id&status=in.(SCHEDULED,IN_PROGRESS,COMPLETED)
   - employees?select=*,profile:profiles(full_name)
   - settings?select=*&company_id=eq.{id}

---

## 🐛 Troubleshooting

### Issue: Still seeing "settings table not found" error

**Cause:** Browser cache or old code  
**Fix:**
```bash
# Clear browser cache (Ctrl+Shift+Delete)
# Hard refresh (Ctrl+F5)
# Or restart dev server
npm start
```

### Issue: "profiles.status column does not exist"

**Cause:** Database migration didn't run  
**Fix:**
```sql
-- Run this in Supabase SQL Editor
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVE';
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
```

### Issue: "work_orders status enum value not found"

**Cause:** Enum values missing  
**Fix:**
```sql
-- Check current enum values
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'work_order_status_enum'::regtype;

-- Add missing values (run each separately)
ALTER TYPE work_order_status_enum ADD VALUE IF NOT EXISTS 'SCHEDULED';
ALTER TYPE work_order_status_enum ADD VALUE IF NOT EXISTS 'IN_PROGRESS';
ALTER TYPE work_order_status_enum ADD VALUE IF NOT EXISTS 'COMPLETED';
```

### Issue: "employees query failing"

**Cause:** Join syntax or missing columns  
**Fix:**
```sql
-- Check employees table structure
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'employees';

-- Check profiles table structure
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'profiles';
```

---

## 📊 Expected Results

### Before Fixes:
- ❌ 23+ errors in logs.md
- ❌ Dashboard shows "0" for all metrics
- ❌ Quote Builder fails to load rates
- ❌ Console full of 400/404 errors

### After Fixes:
- ✅ No 400/404 errors in logs.md
- ✅ Dashboard shows actual data
- ✅ Quote Builder loads rates successfully
- ✅ Console shows success messages

---

## 🔄 Rollback Plan (If Needed)

### If Database Changes Cause Issues:

```bash
# Restore from backup
pg_restore -h db.cxlqzejzraczumqmsrcx.supabase.co -p 5432 -U postgres -d postgres -c backup_YYYYMMDD_HHMMSS.dump
```

### If Frontend Changes Cause Issues:

```bash
# Revert frontend files
git checkout HEAD -- src/services/SettingsService.js
git checkout HEAD -- src/services/POSettingsService.js

# Restart server
npm start
```

---

## 📝 Post-Deployment Tasks

- [ ] Update schema documentation
- [ ] Run full regression tests
- [ ] Monitor logs.md for new errors
- [ ] Update CRITICAL_SCHEMA_FIXES_ANALYSIS.md with results
- [ ] Plan Phase 2: Populate service_rates table with initial data
- [ ] Plan Phase 3: Build UI for managing service rates and rate cards

---

## 🎯 Next Steps (Future Sprints)

### Phase 2: Populate Service Rates
- Create migration script to copy data from company_settings to service_rates
- Add default service categories (Plumbing, HVAC, Electrical, etc.)
- Populate service_rates with base rates for each category

### Phase 3: Rate Management UI
- Build Settings > Rates & Pricing page
- Allow editing service rates by category
- Allow creating customer-specific rate cards
- Add rate history/audit log

### Phase 4: Advanced Pricing
- Implement dynamic pricing rules (emergency, after-hours, etc.)
- Add tiered pricing support
- Add volume discounts
- Add seasonal pricing

---

## 📞 Support

If you encounter issues:
1. Check logs.md for error details
2. Review CRITICAL_SCHEMA_FIXES_ANALYSIS.md
3. Run DIAGNOSTIC_SCHEMA_CHECK.sql
4. Check browser console for frontend errors
5. Verify database connection

---

## ✅ Deployment Sign-Off

- [ ] Database backup completed
- [ ] Database fixes applied successfully
- [ ] Frontend code updated
- [ ] Server restarted
- [ ] All verification tests passed
- [ ] No errors in logs.md
- [ ] Dashboard loads correctly
- [ ] Quote Builder works correctly

**Deployed by:** _________________  
**Date/Time:** _________________  
**Result:** ☐ Success  ☐ Partial  ☐ Rollback Required


