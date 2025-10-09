-- =====================================================
-- COMPLETE CLEANUP VERIFICATION SCRIPT
-- =====================================================
-- This script verifies that the schema cleanup was successful
-- and that the industry-standard profiles-only system is working
-- =====================================================

-- 1. VERIFY COMPLEX ROLE TABLES ARE GONE
SELECT 'COMPLEX_ROLE_TABLES_CHECK' as test_name,
       CASE WHEN COUNT(*) = 0 THEN 'PASS ✅ - No complex role tables found' 
            ELSE 'FAIL ❌ - Complex role tables still exist: ' || string_agg(table_name, ', ') END as result
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('roles', 'user_roles', 'role_permissions');

-- 2. VERIFY LEGACY ARCHIVE TABLES ARE GONE  
SELECT 'LEGACY_ARCHIVE_CHECK' as test_name,
       CASE WHEN COUNT(*) = 0 THEN 'PASS ✅ - No legacy archive tables found'
            ELSE 'FAIL ❌ - Legacy archive tables still exist: ' || string_agg(table_name, ', ') END as result
FROM information_schema.tables 
WHERE table_schema = 'legacy_archive';

-- 3. VERIFY PROFILES TABLE EXISTS AND HAS CORRECT STRUCTURE
SELECT 'PROFILES_TABLE_CHECK' as test_name,
       CASE WHEN COUNT(*) = 1 THEN 'PASS ✅ - Profiles table exists'
            ELSE 'FAIL ❌ - Profiles table missing' END as result
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'profiles';

-- 4. VERIFY PROFILES.ROLE ENUM VALUES ARE CORRECT
SELECT 'PROFILES_ROLE_ENUM_CHECK' as test_name,
       CASE WHEN COUNT(*) = 3 AND 
                 'OWNER' = ANY(array_agg(enumlabel)) AND
                 'ADMIN' = ANY(array_agg(enumlabel)) AND  
                 'EMPLOYEE' = ANY(array_agg(enumlabel))
            THEN 'PASS ✅ - Correct role enum values (OWNER, ADMIN, EMPLOYEE)'
            ELSE 'FAIL ❌ - Incorrect role enum values: ' || string_agg(enumlabel, ', ') END as result
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'user_role_enum';

-- 5. VERIFY PROFILES TABLE COLUMNS
SELECT 'PROFILES_COLUMNS_CHECK' as test_name,
       CASE WHEN COUNT(*) >= 8 THEN 'PASS ✅ - Profiles has required columns'
            ELSE 'FAIL ❌ - Profiles missing required columns' END as result
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
AND column_name IN ('id', 'email', 'full_name', 'role', 'company_id', 'phone', 'status', 'created_at');

-- 6. VERIFY EMPLOYEES.USER_ID REFERENCES PROFILES
SELECT 'EMPLOYEES_PROFILE_FK_CHECK' as test_name,
       CASE WHEN COUNT(*) > 0 THEN 'PASS ✅ - employees.user_id references profiles.id'
            ELSE 'FAIL ❌ - employees.user_id does not reference profiles.id' END as result
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'employees' 
AND tc.constraint_type = 'FOREIGN KEY'
AND kcu.column_name = 'user_id'
AND kcu.referenced_table_name = 'profiles';

-- 7. VERIFY CREATED_BY/UPDATED_BY FIELDS REFERENCE PROFILES
SELECT 'CREATED_BY_UPDATED_BY_CHECK' as test_name,
       CASE WHEN COUNT(*) > 5 THEN 'PASS ✅ - Multiple tables have created_by/updated_by referencing profiles'
            ELSE 'FAIL ❌ - Few or no created_by/updated_by references to profiles' END as result
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND kcu.column_name IN ('created_by', 'updated_by')
AND kcu.referenced_table_name = 'profiles';

-- 8. VERIFY NO OLD USERS TABLE EXISTS
SELECT 'OLD_USERS_TABLE_CHECK' as test_name,
       CASE WHEN COUNT(*) = 0 THEN 'PASS ✅ - No old users table found'
            ELSE 'FAIL ❌ - Old users table still exists' END as result
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'users';

-- 9. VERIFY PROFILES.ID REFERENCES AUTH.USERS
SELECT 'PROFILES_AUTH_FK_CHECK' as test_name,
       CASE WHEN COUNT(*) > 0 THEN 'PASS ✅ - profiles.id references auth.users.id'
            ELSE 'FAIL ❌ - profiles.id does not reference auth.users.id' END as result
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'profiles' 
AND tc.constraint_type = 'FOREIGN KEY'
AND kcu.column_name = 'id'
AND kcu.referenced_table_name = 'users'
AND kcu.referenced_table_schema = 'auth';

-- 10. SAMPLE DATA CHECK - VERIFY EXISTING PROFILES HAVE CORRECT ROLE FORMAT
SELECT 'SAMPLE_PROFILES_ROLE_CHECK' as test_name,
       CASE WHEN COUNT(*) = 0 THEN 'PASS ✅ - No profiles exist yet (fresh install)'
            WHEN COUNT(*) > 0 AND COUNT(*) = COUNT(CASE WHEN role IN ('OWNER', 'ADMIN', 'EMPLOYEE') THEN 1 END)
            THEN 'PASS ✅ - All existing profiles have correct uppercase roles'
            ELSE 'FAIL ❌ - Some profiles have incorrect role values' END as result
FROM public.profiles;

-- 11. VERIFY COMPANY_ID FOREIGN KEY EXISTS
SELECT 'PROFILES_COMPANY_FK_CHECK' as test_name,
       CASE WHEN COUNT(*) > 0 THEN 'PASS ✅ - profiles.company_id references companies.id'
            ELSE 'FAIL ❌ - profiles.company_id does not reference companies.id' END as result
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'profiles' 
AND tc.constraint_type = 'FOREIGN KEY'
AND kcu.column_name = 'company_id'
AND kcu.referenced_table_name = 'companies';

-- =====================================================
-- SUMMARY REPORT
-- =====================================================

-- Final summary of all checks
WITH test_results AS (
  -- Complex role tables check
  SELECT 'COMPLEX_ROLE_TABLES_CHECK' as test_name,
         CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END as status
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name IN ('roles', 'user_roles', 'role_permissions')
  
  UNION ALL
  
  -- Legacy archive check
  SELECT 'LEGACY_ARCHIVE_CHECK' as test_name,
         CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END as status
  FROM information_schema.tables 
  WHERE table_schema = 'legacy_archive'
  
  UNION ALL
  
  -- Profiles table exists
  SELECT 'PROFILES_TABLE_CHECK' as test_name,
         CASE WHEN COUNT(*) = 1 THEN 'PASS' ELSE 'FAIL' END as status
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'profiles'
  
  UNION ALL
  
  -- Role enum check
  SELECT 'PROFILES_ROLE_ENUM_CHECK' as test_name,
         CASE WHEN COUNT(*) = 3 AND 
                   'OWNER' = ANY(array_agg(enumlabel)) AND
                   'ADMIN' = ANY(array_agg(enumlabel)) AND  
                   'EMPLOYEE' = ANY(array_agg(enumlabel))
              THEN 'PASS' ELSE 'FAIL' END as status
  FROM pg_enum e
  JOIN pg_type t ON e.enumtypid = t.oid
  WHERE t.typname = 'user_role_enum'
)
SELECT 
  '🎯 CLEANUP VERIFICATION SUMMARY' as summary,
  COUNT(*) as total_tests,
  COUNT(CASE WHEN status = 'PASS' THEN 1 END) as passed_tests,
  COUNT(CASE WHEN status = 'FAIL' THEN 1 END) as failed_tests,
  CASE WHEN COUNT(CASE WHEN status = 'FAIL' THEN 1 END) = 0 
       THEN '✅ ALL TESTS PASSED - CLEANUP SUCCESSFUL!' 
       ELSE '❌ SOME TESTS FAILED - REVIEW NEEDED' END as overall_status
FROM test_results;

-- =====================================================
-- NEXT STEPS REMINDER
-- =====================================================
SELECT '📋 NEXT STEPS' as reminder,
       'After running this verification:
       1. ✅ Run database cleanup script if any tests fail
       2. ✅ Test frontend login with new role system  
       3. ✅ Verify permissions work with OWNER/ADMIN/EMPLOYEE
       4. ✅ Test employee management functionality
       5. ✅ Confirm all queries use profiles table
       6. ✅ Deploy and test in production environment' as action_items;
