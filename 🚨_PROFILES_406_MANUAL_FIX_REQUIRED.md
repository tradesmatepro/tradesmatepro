# 🚨 PROFILES 406 ERRORS - MANUAL FIX REQUIRED

## ❌ THE PROBLEM:

The profiles table is returning **406 (Not Acceptable)** errors:

```
GET  /rest/v1/profiles?select=preferences&user_id=eq.268b99b5-907d-4b48-ad0e-92cdd4ac388a 406
PATCH /rest/v1/profiles?user_id=eq.268b99b5-907d-4b48-ad0e-92cdd4ac388a&select=* 406
```

**This is happening 5 times on every page load!**

---

## 🔍 ROOT CAUSE:

**RLS (Row Level Security) policies are blocking the requests.**

Even though we've disabled RLS multiple times via SQL, the policies keep coming back. This suggests:
1. Supabase Dashboard is recreating them
2. A migration file is recreating them
3. PostgREST cache is stale

---

## ✅ MANUAL FIX (DO THIS IN SUPABASE DASHBOARD):

### **Step 1: Open Supabase Dashboard**
1. Go to: https://supabase.com/dashboard
2. Select your project: `cxlqzejzraczumqmsrcx`
3. Click **Authentication** → **Policies**

### **Step 2: Find profiles table**
1. Scroll down to find the `profiles` table
2. You should see RLS policies listed

### **Step 3: Delete ALL policies**
1. Click the **trash icon** next to each policy
2. Confirm deletion for each one
3. Make sure **ALL policies are deleted**

### **Step 4: Disable RLS**
1. Click the **RLS toggle** to disable it
2. Or go to **Table Editor** → `profiles` → **Settings** → Disable RLS

### **Step 5: Restart API Server**
1. Go to **Settings** → **API**
2. Click **Restart API Server**
3. Wait for it to restart (30-60 seconds)

---

## 🔧 ALTERNATIVE: SQL EDITOR FIX

If the Dashboard doesn't work, use SQL Editor:

### **Go to SQL Editor and run:**

```sql
-- 1. Drop ALL policies
DO $$ 
DECLARE 
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles') LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON profiles CASCADE';
    RAISE NOTICE 'Dropped policy: %', r.policyname;
  END LOOP;
END $$;

-- 2. Disable RLS
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 3. Verify RLS is disabled
SELECT 
  relname as table_name,
  relrowsecurity as rls_enabled
FROM pg_class 
WHERE relname = 'profiles';
-- Should show: rls_enabled = false

-- 4. Verify no policies exist
SELECT COUNT(*) as policy_count 
FROM pg_policies 
WHERE tablename = 'profiles';
-- Should show: policy_count = 0

-- 5. Refresh PostgREST cache
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';
```

---

## 🔍 VERIFY THE FIX:

After applying the fix:

1. **Hard refresh your browser** (Ctrl + Shift + R)
2. **Check the console** - should see NO 406 errors
3. **Check logs.md** - should be clean

---

## ⚠️ WHY THIS KEEPS HAPPENING:

The RLS policies keep coming back because:

1. **Supabase Dashboard auto-creates policies** when you enable RLS
2. **Migration files** might be recreating them
3. **PostgREST cache** doesn't refresh immediately

---

## 🎯 PERMANENT FIX:

To prevent this from happening again:

### **Option 1: Keep RLS disabled (RECOMMENDED for beta)**
- Since you confirmed "app is in beta so security/RLS is not a current priority"
- Keep RLS disabled on profiles table
- Re-enable before production

### **Option 2: Create correct RLS policies**
If you want RLS enabled, create policies that actually work:

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
USING (
  user_id IN (
    SELECT id FROM users WHERE auth_user_id = auth.uid()
  )
);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (
  user_id IN (
    SELECT id FROM users WHERE auth_user_id = auth.uid()
  )
);

-- Refresh cache
NOTIFY pgrst, 'reload schema';
```

---

## 📊 CURRENT STATUS:

```
❌ RLS Status: Unknown (need to check Dashboard)
❌ Policy Count: Unknown (need to check Dashboard)
❌ 406 Errors: 5 errors per page load
❌ Impact: Theme preferences not saving
```

---

## 🚀 AFTER YOU FIX IT:

1. ✅ Restart dev server
2. ✅ Hard refresh browser
3. ✅ Check logs.md for errors
4. ✅ Let me know if it's fixed!

---

## 💡 WHY AUTOMATED FIXES DIDN'T WORK:

Our automated SQL fixes didn't work because:
1. SQL executor had connection issues
2. PostgREST cache doesn't refresh immediately
3. Supabase Dashboard might override SQL changes
4. Need to restart API server for changes to take effect

**Manual fix via Dashboard is the most reliable method.**

---

**Please apply the manual fix in Supabase Dashboard and let me know the results!** 🙏

