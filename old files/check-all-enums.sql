-- Check ALL enum values in database to see if they're UPPERCASE or lowercase
-- This will tell us which enums need frontend fixes

-- Marketplace enums
SELECT 'marketplace_response_status_enum' as enum_name, enumlabel as value
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'marketplace_response_status_enum') 
ORDER BY enumsortorder;

SELECT 'marketplace_request_status_enum' as enum_name, enumlabel as value
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'marketplace_request_status_enum') 
ORDER BY enumsortorder;

-- Communication enums
SELECT 'customer_communication_type_enum' as enum_name, enumlabel as value
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'customer_communication_type_enum') 
ORDER BY enumsortorder;

-- Status enums
SELECT 'customer_status_enum' as enum_name, enumlabel as value
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'customer_status_enum') 
ORDER BY enumsortorder;

SELECT 'user_status_enum' as enum_name, enumlabel as value
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_status_enum') 
ORDER BY enumsortorder;

SELECT 'company_status_enum' as enum_name, enumlabel as value
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'company_status_enum') 
ORDER BY enumsortorder;

SELECT 'invoice_status_enum' as enum_name, enumlabel as value
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'invoice_status_enum') 
ORDER BY enumsortorder;

SELECT 'notification_status_enum' as enum_name, enumlabel as value
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'notification_status_enum') 
ORDER BY enumsortorder;

-- Service agreement enum
SELECT 'service_agreement_status_enum' as enum_name, enumlabel as value
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'service_agreement_status_enum') 
ORDER BY enumsortorder;

