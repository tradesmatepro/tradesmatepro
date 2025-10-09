-- ============================================================================
-- ENUM CASE MISMATCH FIX
-- ============================================================================
-- PROBLEM: Database has lowercase enums (draft, quote, scheduled, in_progress)
--          Frontend sends UPPERCASE (DRAFT, QUOTE, SCHEDULED, IN_PROGRESS)
-- RESULT: All queries fail with 400 errors
-- ============================================================================

-- Current enum values (lowercase):
-- draft, quote, approved, scheduled, parts_ordered, on_hold, in_progress, 
-- requires_approval, rework_needed, completed, invoiced, cancelled, 
-- sent, rejected, paid, closed

-- Frontend expects (UPPERCASE):
-- DRAFT, QUOTE, SENT, ACCEPTED, REJECTED, SCHEDULED, IN_PROGRESS, 
-- COMPLETED, CANCELLED, INVOICED

-- ============================================================================
-- SOLUTION: Add UPPERCASE values to enum (keep lowercase for compatibility)
-- ============================================================================

-- Add UPPERCASE values to work_order_status_enum
ALTER TYPE work_order_status_enum ADD VALUE IF NOT EXISTS 'DRAFT';
ALTER TYPE work_order_status_enum ADD VALUE IF NOT EXISTS 'QUOTE';
ALTER TYPE work_order_status_enum ADD VALUE IF NOT EXISTS 'SENT';
ALTER TYPE work_order_status_enum ADD VALUE IF NOT EXISTS 'ACCEPTED';
ALTER TYPE work_order_status_enum ADD VALUE IF NOT EXISTS 'REJECTED';
ALTER TYPE work_order_status_enum ADD VALUE IF NOT EXISTS 'SCHEDULED';
ALTER TYPE work_order_status_enum ADD VALUE IF NOT EXISTS 'IN_PROGRESS';
ALTER TYPE work_order_status_enum ADD VALUE IF NOT EXISTS 'COMPLETED';
ALTER TYPE work_order_status_enum ADD VALUE IF NOT EXISTS 'CANCELLED';
ALTER TYPE work_order_status_enum ADD VALUE IF NOT EXISTS 'INVOICED';
ALTER TYPE work_order_status_enum ADD VALUE IF NOT EXISTS 'PAID';
ALTER TYPE work_order_status_enum ADD VALUE IF NOT EXISTS 'CLOSED';

-- Verify the fix
SELECT 'Enum values after fix:' as message;
SELECT unnest(enum_range(NULL::work_order_status_enum))::text as value
ORDER BY value;

