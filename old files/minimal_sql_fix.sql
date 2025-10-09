
-- AUTOMATED ANALYSIS RESULT: Minimal SQL fixes needed
-- Run this in Supabase SQL Editor only if automated tests showed failures

-- Only add created_via column if it's missing (test will show if needed)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'created_via'
    ) THEN
        ALTER TABLE public.customers ADD COLUMN created_via TEXT DEFAULT 'manual';
        UPDATE public.customers SET created_via = 'manual' WHERE created_via IS NULL;
    END IF;
END $$;

-- Verify the fix worked
SELECT 'created_via column:' as check_type, 
       CASE WHEN COUNT(*) > 0 THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
FROM information_schema.columns 
WHERE table_name = 'customers' AND column_name = 'created_via';
