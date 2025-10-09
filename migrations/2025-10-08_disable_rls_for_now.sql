-- Disable RLS temporarily per user request (dev only)
-- Date: 2025-10-08

-- Note: storage.objects RLS requires table ownership by storage extension owner; this script does not change it.
-- We disable RLS on app tables we control so uploads/metadata and approvals flow without auth blockers during beta.

ALTER TABLE IF EXISTS documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS expense_approvals DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS approval_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS employee_delegates DISABLE ROW LEVEL SECURITY;

