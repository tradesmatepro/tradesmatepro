-- Debug customer address data for Crimson Equipment
-- Run this in Supabase SQL Editor to see what address data exists

-- 1. Check customer record and all address fields
SELECT 
  id,
  name,
  -- Legacy address fields
  street_address,
  city,
  state,
  zip_code,
  -- New billing address fields  
  billing_address_line_1,
  billing_address_line_2,
  billing_city,
  billing_state,
  billing_zip_code,
  customer_type
FROM customers 
WHERE name ILIKE '%Crimson Equipment%'
ORDER BY name;

-- 2. Check if there are any service addresses in customer_addresses table
SELECT 
  ca.*,
  c.name as customer_name
FROM customer_addresses ca
JOIN customers c ON ca.customer_id = c.id
WHERE c.name ILIKE '%Crimson Equipment%'
ORDER BY ca.is_primary DESC, ca.address_name;

-- 3. Check the work order address fields
SELECT
  id,
  title,
  customer_id,
  work_location,
  service_address_id,  -- This might be referencing customer_addresses
  service_address_line_1,
  service_address_line_2,
  service_city,
  service_state,
  service_zip_code
FROM work_orders
WHERE title ILIKE '%Powerbreak%'
ORDER BY created_at DESC;

-- 4. Check for foreign key relationships that might prevent deletion
SELECT
  wo.id as work_order_id,
  wo.title,
  wo.service_address_id,
  ca.id as address_id,
  ca.address_name,
  ca.address_line_1
FROM work_orders wo
LEFT JOIN customer_addresses ca ON wo.service_address_id = ca.id
WHERE wo.customer_id = (SELECT id FROM customers WHERE name ILIKE '%Crimson Equipment%' LIMIT 1);
