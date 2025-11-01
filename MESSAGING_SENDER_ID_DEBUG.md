# Messaging Sender ID Debug Guide

## Issue
When sending a message via `send_customer_message` RPC, getting error:
```
ERROR: 23503: insert or update on table "messages" violates foreign key constraint "messages_sender_id_fkey"
Key (sender_id)=(b9ea92d6-73ca-4b0f-8d4f-2e7a99662f9b) is not present in table "users".
```

This means the `sender_id` being passed is a **customer ID**, not a **user ID**.

## Root Cause Analysis

### UserContext Structure
In `src/contexts/UserContext.js`, the user object is structured as:
```javascript
const userSession = {
  id: userData.user_id,           // ✅ Business user ID (from users table)
  user_id: userData.user_id,      // ✅ Alias for compatibility
  email: userData.email,
  company_id: userData.company_id,
  // ... other fields
};
```

**Key Point:** `user.id` IS the business user ID from the `users` table, NOT a customer ID.

### The Real Problem
If `user.id` is a customer ID, it means:
1. The logged-in user is NOT being loaded from the `users` table
2. The user is being treated as a customer instead of an employee
3. The UserContext authentication is failing or loading the wrong user record

## Verification Steps

### 1. Check UserContext Authentication
The UserContext queries the `users` table:
```javascript
const { data: businessUser, error: userError } = await supabase
  .from('users')
  .select('id,company_id,role,status,created_at,updated_at')
  .eq('auth_user_id', session.user.id)
  .single();
```

**Debug:** Check browser console for:
- Is `businessUser` being found?
- What is the value of `businessUser.id`?
- Is it a valid UUID from the `users` table?

### 2. Check User Object in Console
Add this to Messages.js:
```javascript
console.log('👤 Current user object:', user);
console.log('📍 user.id:', user.id);
console.log('📍 user.user_id:', user.user_id);
console.log('📍 user.company_id:', user.company_id);
console.log('📍 user.role:', user.role);
```

### 3. Verify Users Table
In Supabase SQL Editor, run:
```sql
SELECT id, email, company_id, role, auth_user_id 
FROM users 
WHERE email = 'your-email@example.com';
```

Check if:
- User record exists
- `auth_user_id` matches your Supabase auth user
- `id` is a valid UUID

### 4. Check Customers Table
If `user.id` is actually a customer ID, run:
```sql
SELECT id, name, email, company_id 
FROM customers 
WHERE id = 'b9ea92d6-73ca-4b0f-8d4f-2e7a99662f9b';
```

## Solution

### If User Record Missing
Create the user record:
```sql
INSERT INTO users (id, email, company_id, role, auth_user_id, status)
VALUES (
  gen_random_uuid(),
  'your-email@example.com',
  'your-company-id',
  'technician',
  'your-auth-user-id',
  'active'
);
```

### If Auth User ID Mismatch
Update the user record with correct auth_user_id:
```sql
UPDATE users 
SET auth_user_id = 'correct-auth-user-id'
WHERE email = 'your-email@example.com';
```

### If UserContext Not Loading User
Check browser console for errors during authentication:
1. Open DevTools → Console
2. Look for "❌ Business user record not found" or similar errors
3. Check if Supabase session is valid
4. Verify RLS policies aren't blocking the query

## Code Locations

### Messages.js (Work Order Messages)
- **File:** `src/pages/Messages.js`
- **Line:** 100
- **Code:** `p_sender_id: user.id`
- **Status:** ✅ Correct (uses user.id which is the business user ID)

### CustomerMessages.js (Customer Dashboard)
- **File:** `src/components/CustomerDashboard/CustomerMessages.js`
- **Line:** 100
- **Code:** `sender_id: user.id`
- **Status:** ✅ Correct (uses user.id which is the business user ID)

### RPC Function
- **File:** Database (send_customer_message)
- **Parameter:** `p_sender_id uuid`
- **Constraint:** Foreign key to `users.id`
- **Status:** ✅ Correct

## Testing

After fixing the user record, test with:
```javascript
// In Messages.js console
console.log('Testing message send...');
console.log('Sender ID:', user.id);
console.log('Company ID:', user.company_id);
console.log('Customer ID:', selectedWorkOrder.customer_id);
```

Then try sending a message and check:
1. No foreign key constraint error
2. Message appears in messages table
3. `sender_id` is a valid user ID
4. `customer_id` is a valid customer ID

