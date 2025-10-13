-- ============================================
-- FIX: user_company_id() Function
-- ============================================
-- Problem: Function looks for user_id = auth.uid() in employees table
--          But employees.user_id points to public.users.id, not auth.users.id
-- Solution: Join through users table to get the correct user_id

-- Use CREATE OR REPLACE to avoid dropping (many policies depend on this)
CREATE OR REPLACE FUNCTION public.user_company_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  -- Get company_id by joining users → employees
  -- auth.uid() returns auth.users.id
  -- users.auth_user_id = auth.users.id
  -- employees.user_id = users.id
  SELECT e.company_id
  FROM public.users u
  JOIN public.employees e ON e.user_id = u.id
  WHERE u.auth_user_id = auth.uid()
  LIMIT 1;
$$;

-- ============================================
-- VERIFICATION
-- ============================================
-- This should now work:
-- 1. User logs in → auth.uid() = '268b99b5-907d-4b48-ad0e-92cdd4ac388a'
-- 2. Query users table: WHERE auth_user_id = auth.uid()
-- 3. Get users.id = '44475f47-be87-45ef-b465-2ecbbc0616ea'
-- 4. Query employees table: WHERE user_id = users.id
-- 5. Get employees.company_id = 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e'
-- 6. RLS policies now work correctly!

