# 🔍 ERROR PATTERNS AND FIXES - Technical Reference

---

## Pattern 1: Infinite Loop from Object References

### ❌ PROBLEM
```javascript
const [data, setData] = useState(null);

useEffect(() => {
  loadData();
}, [user]);  // ❌ WRONG: user object changes on every render
```

**Why it fails**:
1. Component renders → `user` object created (reference A)
2. useEffect runs → calls `loadData()`
3. State updates → component re-renders
4. **New `user` object created** (reference B, different from A)
5. useEffect sees different reference → runs again
6. **Infinite loop!** 🔄

### ✅ SOLUTION
```javascript
useEffect(() => {
  loadData();
}, [user?.id, user?.company_id]);  // ✅ GOOD: primitive values
```

**Why it works**:
- Strings are compared by value, not reference
- `user?.id` is always the same string for the same user
- useEffect only runs when the actual user ID changes

---

## Pattern 2: 406 Error from .single() on GET Queries

### ❌ PROBLEM
```javascript
const { data, error } = await supabase
  .from('profiles')
  .select('preferences')
  .eq('user_id', user.id)
  .single();  // ❌ Expects exactly 1 row
```

**Error**: `406 Not Acceptable`

**Why it fails**:
- `.single()` expects exactly 1 row
- If 0 rows returned → 406 error
- If 2+ rows returned → 406 error
- User might not have a profile yet

### ✅ SOLUTION
```javascript
const { data: profileData, error } = await supabase
  .from('profiles')
  .select('preferences')
  .eq('user_id', user.id);

const data = profileData && profileData.length > 0 ? profileData[0] : null;
```

**Why it works**:
- Returns array (even if empty)
- Safely checks array length
- Handles 0 rows gracefully

---

## Pattern 3: 406 Error from .single() on UPDATE Queries

### ❌ PROBLEM
```javascript
const { data, error } = await supabase
  .from('profiles')
  .update({ preferences: newPrefs })
  .eq('user_id', user.id)
  .select()
  .single();  // ❌ Fails if 0 rows updated
```

**Error**: `406 Not Acceptable`

**Why it fails**:
- `.single()` on update expects exactly 1 row to be updated
- If profile doesn't exist → 0 rows updated → 406 error

### ✅ SOLUTION
```javascript
const { data, error } = await supabase
  .from('profiles')
  .update({ preferences: newPrefs })
  .eq('user_id', user.id)
  .select();  // ✅ Returns array, handles 0 rows
```

**Why it works**:
- Returns array of updated rows
- If 0 rows → returns empty array (no error)
- If 1+ rows → returns array with updated data

---

## Pattern 4: 404 Error from Non-Existent Table

### ❌ PROBLEM
```javascript
const response = await fetch(
  `${SUPABASE_URL}/rest/v1/user_permissions?...`
);

if (!response.ok) {
  throw new Error(`Failed: ${response.statusText}`);  // ❌ Throws error
}
```

**Error**: `404 Not Found` (table doesn't exist)

**Why it fails**:
- Querying table that doesn't exist
- Error thrown to console
- App continues but logs are cluttered

### ✅ SOLUTION
```javascript
const response = await fetch(
  `${SUPABASE_URL}/rest/v1/user_permissions?...`
);

if (response.status === 404) {
  console.warn('⚠️ user_permissions table not found, returning default');
  return null;  // ✅ Handle gracefully
}

if (!response.ok) {
  throw new Error(`Failed: ${response.statusText}`);
}
```

**Why it works**:
- Checks for 404 specifically
- Logs as warning, not error
- Returns sensible default
- App continues normally

---

## 📊 **Error Summary**

| Error | HTTP Code | Cause | Fix |
|-------|-----------|-------|-----|
| Infinite Loop | N/A | Object refs in deps | Use primitive values |
| 406 Not Acceptable | 406 | `.single()` on 0 rows | Remove `.single()` |
| 404 Not Found | 404 | Non-existent table | Handle gracefully |

---

## 🎯 **Prevention Checklist**

- [ ] Never use object references in useEffect dependency arrays
- [ ] Never use `.single()` on queries that might return 0 rows
- [ ] Always handle 404 errors gracefully
- [ ] Use `.maybeSingle()` only if you need a single object (not array)
- [ ] Test with empty data sets
- [ ] Check browser console for errors
- [ ] Monitor logs.md for patterns

---

**Last Updated**: 2025-10-28

