# 🔧 THREE ISSUES TO FIX

## ❌ **ISSUE 1: Delete Employee Doesn't Remove auth.users**

### **Problem:**
When you delete an employee from the Employees page, it only deletes from:
- ✅ `employees` table
- ✅ `users` table  
- ✅ `profiles` table

But it **does NOT delete** from:
- ❌ `auth.users` (Supabase Auth)

So when you try to recreate the employee with the same email, it says "user already exists" because the auth record still exists!

### **Solution:**
Update the delete function to also delete from `auth.users` using the Supabase Admin API.

**Need to find and update the delete function in `src/pages/Employees.js`**

---

## ❌ **ISSUE 2: Random 406 and 404 Errors in Logs**

### **406 Error - Profile Not Found:**
```
GET .../profiles?select=avatar_url,preferences,timezone,language,notification_preferences&user_id=eq.44475f47-be87-45ef-b465-2ecbbc0616ea 406 (Not Acceptable)

⚠️ Profile not found, using defaults
```

**Problem:**
- Code is querying `profiles` table for user `44475f47-be87-45ef-b465-2ecbbc0616ea` (Jerry Smith)
- But profile doesn't exist for this user!
- The code handles it gracefully ("using defaults") but it's noisy

**Solution:**
Create a profile record for Jerry Smith, or update the code to not query profiles if it's not critical.

### **404 Error - PTO Tables Missing:**
```
GET .../pto_policies?order=created_at.desc&select=* 404 (Not Found)
GET .../pto_ledger?order=created_at.desc&limit=100&select=* 404 (Not Found)
```

**Problem:**
- `Employees.js` is trying to load PTO data
- But `pto_policies` and `pto_ledger` tables don't exist in the database!

**Solution:**
Either:
- **Option A:** Create the PTO tables (if you want PTO functionality)
- **Option B:** Remove PTO loading from Employees page (if you don't need it yet)

---

## ❌ **ISSUE 3: No Password Reset Functionality**

### **Problem:**
- Temp password works for initial login ✅
- But there's no way for employee to change their password!
- No "Reset Password" button in the app

### **Solution:**
Add password reset functionality. Options:

**Option A: Profile Page with Change Password**
- Add "Change Password" section to user profile page
- User enters: Old Password, New Password, Confirm New Password
- Uses Supabase `updateUser()` API

**Option B: Forgot Password Flow**
- Add "Forgot Password?" link on login page
- User enters email
- Supabase sends password reset email
- User clicks link and sets new password

**Option C: Both!**
- Logged-in users can change password from profile
- Logged-out users can reset via email

---

## 🔧 **FIXES TO IMPLEMENT**

### **Fix 1: Update Delete Employee Function**

**Location:** `src/pages/Employees.js` - Find the delete function

**Add this step:**
```javascript
// Step 1: Delete from auth.users (Supabase Auth)
const authResponse = await fetch(
  `${SUPABASE_URL}/auth/v1/admin/users/${authUserId}`,
  {
    method: 'DELETE',
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
    }
  }
);

if (!authResponse.ok) {
  console.error('Failed to delete auth user');
  // Continue anyway - delete other records
}

// Step 2: Delete from employees table
// Step 3: Delete from users table
// Step 4: Delete from profiles table
```

### **Fix 2A: Create Profile for Jerry Smith**

**Run this SQL:**
```sql
INSERT INTO profiles (user_id, avatar_url, preferences, timezone, language, notification_preferences)
VALUES (
  '44475f47-be87-45ef-b465-2ecbbc0616ea',
  NULL,
  '{}',
  'America/Los_Angeles',
  'en',
  '{"email": true, "sms": false, "push": true}'
)
ON CONFLICT (user_id) DO NOTHING;
```

### **Fix 2B: Remove PTO Loading (Temporary)**

**Location:** `src/pages/Employees.js` - Line 316 and 323

**Comment out PTO loading:**
```javascript
useEffect(() => {
  loadEmployees();
  // loadPTOData(); // ❌ Commented out - PTO tables don't exist yet
}, [user?.company_id]);
```

### **Fix 3: Add Password Reset**

**Option A: Quick Fix - Add to Profile Page**

Create a "Change Password" section in the user profile page:

```javascript
const handlePasswordChange = async (oldPassword, newPassword) => {
  try {
    // Verify old password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: oldPassword
    });
    
    if (signInError) {
      throw new Error('Current password is incorrect');
    }
    
    // Update to new password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (updateError) {
      throw new Error(updateError.message);
    }
    
    alert('Password changed successfully!');
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
};
```

**Option B: Full Solution - Forgot Password Flow**

Add to login page:
```javascript
const handleForgotPassword = async (email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  });
  
  if (error) {
    alert(`Error: ${error.message}`);
  } else {
    alert('Password reset email sent! Check your inbox.');
  }
};
```

---

## 📋 **PRIORITY ORDER**

### **High Priority:**
1. ✅ **Fix Delete Employee** - Prevents "user already exists" error
2. ✅ **Add Password Reset** - Critical for usability

### **Medium Priority:**
3. ✅ **Fix Profile 406 Error** - Noisy but not breaking

### **Low Priority:**
4. ✅ **Fix PTO 404 Errors** - Can wait until PTO feature is needed

---

## 🎯 **RECOMMENDED APPROACH**

### **Step 1: Fix Delete Employee (5 minutes)**
- Find delete function in `Employees.js`
- Add auth.users deletion step
- Test by deleting and recreating Brad

### **Step 2: Add Quick Password Reset (10 minutes)**
- Add "Change Password" button to user profile dropdown
- Simple modal with: Old Password, New Password, Confirm
- Uses Supabase `updateUser()` API

### **Step 3: Create Profile for Jerry (1 minute)**
- Run SQL to create profile record
- Eliminates 406 errors

### **Step 4: Comment Out PTO Loading (1 minute)**
- Comment out `loadPTOData()` call
- Eliminates 404 errors
- Can uncomment when PTO tables are created

---

## 🚀 **WANT ME TO IMPLEMENT THESE FIXES?**

I can:
1. ✅ Update delete function to remove auth.users
2. ✅ Add password reset functionality (profile page or login page)
3. ✅ Create SQL to fix profile issue
4. ✅ Comment out PTO loading

**Which fixes do you want me to implement first?**

