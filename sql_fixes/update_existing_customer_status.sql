-- ========================================
-- UPDATE EXISTING CUSTOMER STATUS VALUES
-- Convert all uppercase status values to lowercase
-- ========================================

-- Update all customer status values to lowercase
UPDATE customers 
SET status = 'active'
WHERE UPPER(status) = 'ACTIVE';

UPDATE customers 
SET status = 'inactive'
WHERE UPPER(status) = 'INACTIVE';

-- Verify the update
SELECT 'Status values updated!' as result;
SELECT status, COUNT(*) as count
FROM customers 
GROUP BY status;
