-- Check what data exists for the "ghvac" quote
SELECT 
  id,
  title,
  customer_id,
  status,
  labor_summary,
  subtotal,
  discount_total,
  tax_total,
  grand_total,
  customer_notes,
  internal_notes,
  notes,
  pricing_model,
  created_at
FROM work_orders 
WHERE title ILIKE '%ghvac%'
ORDER BY created_at DESC
LIMIT 5;

-- Check work_order_items for this quote
SELECT 
  wo.title as quote_title,
  woi.id,
  woi.item_name,
  woi.item_type,
  woi.quantity,
  woi.rate,
  woi.description,
  woi.is_overtime
FROM work_orders wo
LEFT JOIN work_order_items woi ON wo.id = woi.work_order_id
WHERE wo.title ILIKE '%ghvac%'
ORDER BY wo.created_at DESC, woi.created_at ASC;

