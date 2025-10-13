# 🔐 Security Keys Rotated - Action Required

## Status: ✅ Keys Updated Locally

**Date:** 2025-10-09  
**Reason:** Old service_role key was exposed in 36+ frontend files

---

## What Changed

### OLD Keys (COMPROMISED - DO NOT USE):
```
❌ anon: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bHF6ZWp6cmFjenVtcW1zcmN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5ODU0NDMsImV4cCI6MjA3NDU2MTQ0M30.zoD59re6xxW9Z6HOexR0qwWwTBU29MvjwP_y8qwBkkg
❌ service_role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bHF6ZWp6cmFjenVtcW1zcmN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODk4NTQ0MywiZXhwIjoyMDc0NTYxNDQzfQ.lNQuV8WoSo7RiHeg2IKhY7xDLipYR5-39OpajF5nTOM
```

### NEW Keys (SECURE):
```
✅ publishable: sb_publishable_62eAoe6DcrOweYtnzfhHmQ_aYY4JZSG
✅ secret: sb_secret_hPS1mDFURu9aQulTRNE7EQ_zczVFhxR
```

---

## Files Updated

### ✅ `.env`
- Updated `SUPABASE_ANON_KEY` → `sb_publishable_...`
- Updated `SUPABASE_SERVICE_KEY` → `sb_secret_...`
- Updated `REACT_APP_SUPABASE_ANON_KEY` → `sb_publishable_...`
- **Commented out** `REACT_APP_SUPABASE_SERVICE_KEY` (should never be in frontend!)

### ✅ `.env.local` (NEW FILE)
- Created for server-side secrets only
- Contains `SUPABASE_SECRET_KEY`
- Contains `RESEND_API_KEY`
- Contains `DB_PASSWORD`
- **Already in `.gitignore`** - will never be committed

---

## ⚠️ CRITICAL: You Must Do This in Supabase Dashboard

**The keys I used are the ones you provided, but you need to verify they're active!**

### Step 1: Check if Keys Are Already Rotated
1. Go to: https://supabase.com/dashboard/project/cxlqzejzraczumqmsrcx/settings/api
2. Check if the current keys match:
   - Publishable: `sb_publishable_62eAoe6DcrOweYtnzfhHmQ_aYY4JZSG`
   - Secret: `sb_secret_hPS1mDFURu9aQulTRNE7EQ_zczVFhxR`

### Step 2: If Keys Don't Match, Rotate Them
1. Click **"Rotate"** button next to each key
2. Copy the NEW keys
3. Update `.env` and `.env.local` with the new keys
4. Restart your dev server

### Step 3: Verify Old Keys Are Disabled
1. Try using the old `anon` key - should get 401 error
2. Try using the old `service_role` key - should get 401 error
3. If they still work, the rotation didn't happen!

---

## What Happens Next

### Phase 2A: Remove Hardcoded Keys from Frontend (IN PROGRESS)

I need to update **36 files** that have hardcoded keys:

**Critical files:**
1. `src/utils/env.js` - Remove hardcoded fallback keys
2. `src/components/CustomerForms.js` - Remove hardcoded service key
3. `src/components/IntegrationDrawer.js` - Remove hardcoded service key
4. `src/services/DatabaseSetupService.js` - Remove hardcoded service key
5. `src/services/GoogleCalendarService.js` - Remove hardcoded service key
6. `src/pages/Employees.js` - Remove 80+ service key references
7. `src/pages/Timesheets.js` - Remove 40+ service key references
8. `src/pages/Payroll.js` - Remove 20+ service key references
... and 28 more files

**Strategy:**
- Remove all hardcoded JWT tokens
- Remove all `SUPABASE_SERVICE_KEY` usage from frontend
- Create Supabase Edge Functions for admin operations
- Update frontend to call Edge Functions instead

---

## Phase 2B: Create Supabase Edge Functions

**Why:** Service key should NEVER be in frontend code!

**What I'll create:**
1. `supabase/functions/admin-create-user/` - Create users (needs service key)
2. `supabase/functions/admin-update-permissions/` - Update permissions
3. `supabase/functions/admin-delete-record/` - Delete records
4. `supabase/functions/send-email/` - Send emails with Resend API

**How it works:**
```javascript
// ❌ OLD (INSECURE):
const response = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
  headers: {
    'apikey': SUPABASE_SERVICE_KEY,  // EXPOSED IN BROWSER!
    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
  }
});

// ✅ NEW (SECURE):
const { data, error } = await supabase.functions.invoke('admin-create-user', {
  body: { email, role }
});
// Service key is only on server, never exposed!
```

---

## Phase 3: Enable RLS on All Tables

**After keys are secure, we enable RLS:**

1. Enable RLS on all 88 tables
2. Create company-scoped policies
3. Create role-based policies
4. Create public portal policies

**Example policy:**
```sql
-- Enable RLS
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;

-- Users can only see their company's data
CREATE POLICY "company_isolation"
ON work_orders
FOR SELECT
USING (
  company_id IN (
    SELECT company_id 
    FROM profiles 
    WHERE user_id = auth.uid()
  )
);
```

---

## Timeline

| Phase | Status | Time Remaining |
|-------|--------|----------------|
| 1. Audit | ✅ Complete | 0 min |
| 2A. Remove hardcoded keys | 🔄 In Progress | 1 hour |
| 2B. Create Edge Functions | ⏳ Pending | 2 hours |
| 2C. Update frontend calls | ⏳ Pending | 3 hours |
| 3. Enable RLS | ⏳ Pending | 3 hours |
| 4. Test security | ⏳ Pending | 2 hours |
| **Total** | **~11 hours remaining** | |

---

## Next Steps

**Option 1: Continue Full Auto (Recommended)**
- I'll update all 36 files automatically
- Remove all hardcoded keys
- Create Edge Functions
- Enable RLS
- Test everything

**Option 2: Pause and Review**
- You review the key rotation
- Verify in Supabase dashboard
- Then I continue with Phase 2A

**Option 3: Manual Review**
- I create all the code changes
- You review each file
- You approve before I apply

---

## Questions to Answer

1. **Did you already rotate the keys in Supabase dashboard?**
   - If yes, are the new keys the ones you provided?
   - If no, should I wait while you rotate them?

2. **Should I continue with Phase 2A (remove hardcoded keys)?**
   - This will update 36 files
   - All hardcoded JWT tokens will be removed
   - Service key usage will be moved to Edge Functions

3. **Do you want to review each change or full auto?**
   - Full auto: I make all changes, you review final result
   - Manual: I show you each change, you approve

---

**Ready to continue? Say "continue phase 2" to proceed!**

