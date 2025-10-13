-- Reset the quote to 'sent' status for testing

UPDATE work_orders 
SET 
  status = 'sent',
  approved_at = NULL,
  customer_approved_at = NULL,
  rejected_at = NULL,
  quote_rejected_at = NULL
WHERE id = 'a83a2550-a46e-4953-b378-9e093bcbe21a';

-- Verify
SELECT 
  id, 
  work_order_number,
  status, 
  approved_at, 
  rejected_at 
FROM work_orders 
WHERE id = 'a83a2550-a46e-4953-b378-9e093bcbe21a';

