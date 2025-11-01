# Company Creation Workflow - Complete Documentation

## Overview
The Admin Dashboard company creation workflow creates all necessary data for a new company and its owner in a single atomic operation.

## Required Data Tables

### 1. **auth.users** (Supabase Auth)
- **Purpose**: Authentication credentials (email/password)
- **Created by**: `supabaseAdmin.auth.admin.createUser()`
- **Key fields**: `id` (UUID), `email`, `encrypted_password`

### 2. **public.companies**
- **Purpose**: Company/organization record
- **Created by**: Direct INSERT via admin client
- **Key fields**: `id` (UUID), `name`, `company_number` (auto-generated)

### 3. **public.users**
- **Purpose**: App-level user data linking auth to company
- **Created by**: RPC function `create_user_record()` (bypasses PostgREST cache)
- **Key fields**: `id` (matches auth.users.id), `email`, `company_id`, `role`, `full_name`, `phone`
- **Foreign keys**: 
  - `id` → `auth.users.id`
  - `company_id` → `companies.id`

### 4. **public.profiles**
- **Purpose**: User profile/display data
- **Created by**: Direct INSERT via admin client
- **Key fields**: `id` (matches users.id), `first_name`, `last_name`, `phone`, `role`, `company_id`
- **Foreign keys**:
  - `id` → `users.id` (CASCADE DELETE)
  - `company_id` → `companies.id`

## Workflow Steps (Atomic)

### Step 1: Check if auth user exists (Idempotent)
- Query `auth.users` via `supabaseAdmin.auth.admin.listUsers()`
- If user with email exists, reuse their ID
- If not, proceed to create

### Step 2: Create auth user (if needed)
- Call `adminCreateUser()` which uses `supabaseAdmin.auth.admin.createUser()`
- Sets email, password, user_metadata (first_name, last_name, role, job_title)
- Track `createdAuthUserId` for rollback

### Step 3: Create company
- INSERT into `companies` table via admin client
- Auto-generates `company_number`
- Track `createdCompanyId` for rollback

### Step 4: Create users table record
- Call RPC function `create_user_record()` to bypass PostgREST schema cache
- Links auth user ID to company ID
- Sets role, full_name, phone

### Step 5: Create/update profile
- Check if profile exists (idempotent)
- INSERT or UPDATE `profiles` table
- Sets first_name, last_name, phone, role, company_id

### Step 6: Return success
- Returns all created records
- Logs verification details

## Error Handling & Rollback

If any step fails:
1. Log the error
2. Rollback created data:
   - Delete company if `createdCompanyId` exists
   - Delete auth user if `createdAuthUserId` exists
3. Throw error to UI

## Key Design Decisions

### Why RPC for users table?
PostgREST schema cache can be stale after recent column additions (like `full_name`). The RPC function bypasses PostgREST entirely and uses raw SQL INSERT.

### Why check auth user first?
Previous failed attempts may have created the auth user but failed on subsequent steps. Checking first makes the workflow idempotent and prevents "user already exists" errors.

### Why admin client everywhere?
The Admin Dashboard is local-only (not deployed online). Using the service role key directly bypasses RLS and Edge Functions for simplicity. This is acceptable for local dev tools.

### Why rollback?
Prevents orphaned data from partial failures. Without rollback, failed attempts leave:
- Companies with no users
- Auth users with no public.users records
- Inconsistent state requiring manual cleanup

## Database Functions

### create_user_record(p_id, p_email, p_company_id, p_role, p_full_name, p_phone)
```sql
CREATE OR REPLACE FUNCTION public.create_user_record(...)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (id, email, company_id, role, full_name, phone, status, created_at, updated_at)
  VALUES (p_id, p_email, p_company_id, p_role, p_full_name, p_phone, 'ACTIVE', NOW(), NOW())
  RETURNING json_build_object(...) INTO v_result;
  RETURN v_result;
END;
$$;
```

## Testing

To test the workflow:
1. Open Admin Dashboard (http://localhost:3003)
2. Navigate to Create Company
3. Fill in all fields:
   - Company Name
   - Owner First/Last Name
   - Owner Email (must be unique)
   - Owner Phone (optional, auto-formatted to +1XXXXXXXXXX)
   - Owner Role (default: OWNER)
   - Temporary Password
4. Submit
5. Check console logs for step-by-step progress
6. Verify all 4 tables have records

## Cleanup Scripts

### cleanup-orphaned-data.sql
Deletes companies with no associated users

### cleanup-auth-user.js
Deletes auth users with no public.users records

Run these after failed attempts to clean up orphaned data.

## Future Improvements

1. **Database transaction**: Wrap all steps in a single PostgreSQL transaction for true atomicity
2. **Edge Function**: Move entire workflow to a single Edge Function for production deployment
3. **Email verification**: Send welcome email with password reset link
4. **Audit logging**: Log all company creation attempts to audit table
5. **Validation**: Add email format validation, password strength requirements

