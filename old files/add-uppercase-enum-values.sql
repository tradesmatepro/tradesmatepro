-- ============================================================================
-- ADD UPPERCASE ENUM VALUES (Keep lowercase for compatibility)
-- ============================================================================
-- This adds UPPERCASE values without breaking existing data
-- Frontend can send lowercase, database accepts both
-- ============================================================================

-- Add UPPERCASE values (these will be added to the existing enum)
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

-- Show all enum values
SELECT unnest(enum_range(NULL::work_order_status_enum))::text as value
ORDER BY value;

