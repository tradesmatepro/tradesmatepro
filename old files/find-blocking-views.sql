-- Find views and rules that reference work_orders.status column
SELECT 
    v.table_name as view_name,
    v.view_definition
FROM information_schema.views v
WHERE v.view_definition LIKE '%work_orders%'
  AND v.view_definition LIKE '%status%'
  AND v.table_schema = 'public';

