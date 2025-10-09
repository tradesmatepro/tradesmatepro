-- Check the actual data for the ghvac quote
SELECT 
  id,
  title,
  customer_id,
  status,
  labor_summary,
  subtotal,
  tax_amount,
  total_amount,
  customer_notes,
  internal_notes,
  notes,
  description,
  created_at
FROM work_orders 
WHERE id = 'd285505f-2d9b-42ee-bd6e-134d627ec5f2';

-- Check if there are any line items for this quote
SELECT 
  id,
  line_type,
  description,
  quantity,
  unit_price,
  total_price
FROM work_order_line_items
WHERE work_order_id = 'd285505f-2d9b-42ee-bd6e-134d627ec5f2';

