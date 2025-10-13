-- Test anonymous update as if we're the anon user

-- Set role to anon
SET ROLE anon;

-- Try to update the quote to approved
UPDATE work_orders 
SET 
  status = 'approved',
  approved_at = NOW(),
  customer_approved_at = NOW()
WHERE id = 'a83a2550-a46e-4953-b378-9e093bcbe21a';

-- Reset role
RESET ROLE;

-- Check if it worked
SELECT id, status, approved_at, customer_approved_at 
FROM work_orders 
WHERE id = 'a83a2550-a46e-4953-b378-9e093bcbe21a';

