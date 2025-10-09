-- Simple count of remaining triggers
SELECT COUNT(*) as remaining_triggers
FROM information_schema.triggers
WHERE trigger_schema = 'public';

