-- Test updating the quote with the same status
UPDATE work_orders
SET 
    title = 'hvac install test',
    description = 'install hvac test',
    subtotal = 625,
    tax_rate = 8.25,
    tax_amount = 51.15,
    total_amount = 676.5625,
    status = 'quote',
    updated_at = NOW()
WHERE id = '92333880-d0fe-4b21-9310-c1af14ecd4c7';

-- Check if it worked
SELECT id, title, status, updated_at FROM work_orders WHERE id = '92333880-d0fe-4b21-9310-c1af14ecd4c7';

