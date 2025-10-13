-- Check the actual quote data to see what's wrong

-- Get the quote details
SELECT 
  id,
  work_order_number,
  quote_number,
  status,
  total_amount,
  subtotal,
  tax_amount,
  discount_amount,
  deposit_amount,
  deposit_percentage,
  created_at
FROM work_orders 
WHERE id = 'a83a2550-a46e-4953-b378-9e093bcbe21a';

-- Get the line items
SELECT 
  id,
  work_order_id,
  line_type,
  description,
  quantity,
  unit_price,
  total_price,
  tax_rate,
  discount_percent,
  sort_order
FROM work_order_line_items 
WHERE work_order_id = 'a83a2550-a46e-4953-b378-9e093bcbe21a'
ORDER BY sort_order;

-- Check company settings for this quote
SELECT 
  wo.id as quote_id,
  c.name as company_name,
  s.require_deposit_on_approval,
  s.default_deposit_percentage,
  s.allow_customer_scheduling,
  s.require_signature_on_approval,
  s.auto_schedule_after_approval
FROM work_orders wo
JOIN companies c ON c.id = wo.company_id
LEFT JOIN settings s ON s.company_id = wo.company_id
WHERE wo.id = 'a83a2550-a46e-4953-b378-9e093bcbe21a';

