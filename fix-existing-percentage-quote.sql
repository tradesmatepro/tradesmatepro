-- Fix the existing percentage quote by deleting wrong line items and creating correct one

-- First, let's see what we have
SELECT 
  wo.id,
  wo.work_order_number,
  wo.pricing_model,
  wo.percentage,
  wo.percentage_base_amount,
  wo.subtotal,
  COUNT(li.id) as line_item_count
FROM work_orders wo
LEFT JOIN work_order_line_items li ON li.work_order_id = wo.id
WHERE wo.id = 'a83a2550-a46e-4953-b378-9e093bcbe21a'
GROUP BY wo.id, wo.work_order_number, wo.pricing_model, wo.percentage, wo.percentage_base_amount, wo.subtotal;

-- Delete the wrong line items
DELETE FROM work_order_line_items 
WHERE work_order_id = 'a83a2550-a46e-4953-b378-9e093bcbe21a';

-- Insert the correct percentage line item
INSERT INTO work_order_line_items (
  work_order_id,
  company_id,
  line_type,
  description,
  quantity,
  unit_price,
  total_price,
  sort_order
)
SELECT 
  wo.id,
  wo.company_id,
  'service',
  wo.percentage || '% of $' || wo.percentage_base_amount,
  1,
  wo.subtotal,
  wo.subtotal,
  0
FROM work_orders wo
WHERE wo.id = 'a83a2550-a46e-4953-b378-9e093bcbe21a';

-- Verify the fix
SELECT 
  li.description,
  li.quantity,
  li.unit_price,
  li.total_price,
  li.line_type
FROM work_order_line_items li
WHERE li.work_order_id = 'a83a2550-a46e-4953-b378-9e093bcbe21a';

