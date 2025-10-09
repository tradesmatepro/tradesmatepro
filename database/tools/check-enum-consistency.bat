@echo off
REM ========================================
REM ENUM CONSISTENCY CHECKER
REM ========================================
REM Purpose: Automatically check database for uppercase/lowercase enum inconsistencies
REM Usage: Just double-click this file or run from command line
REM ========================================

setlocal enabledelayedexpansion

echo.
echo ========================================
echo   ENUM CONSISTENCY CHECKER
echo ========================================
echo.
echo Checking database for enum inconsistencies...
echo.

REM Set database credentials
set PGPASSWORD=Alphaecho19!
set PGHOST=aws-1-us-west-1.pooler.supabase.com
set PGPORT=5432
set PGDATABASE=postgres
set PGUSER=postgres.cxlqzejzraczumqmsrcx

REM Create temp directory for reports
if not exist "database\reports" mkdir "database\reports"
set REPORT_FILE=database\reports\enum-check-%date:~-4,4%%date:~-10,2%%date:~-7,2%-%time:~0,2%%time:~3,2%%time:~6,2%.txt
set REPORT_FILE=%REPORT_FILE: =0%

echo Report will be saved to: %REPORT_FILE%
echo.

REM Start report
echo ======================================== > "%REPORT_FILE%"
echo   ENUM CONSISTENCY CHECK REPORT >> "%REPORT_FILE%"
echo   Date: %date% %time% >> "%REPORT_FILE%"
echo ======================================== >> "%REPORT_FILE%"
echo. >> "%REPORT_FILE%"

REM ========================================
REM CHECK 1: List all enum types
REM ========================================
echo [1/6] Checking enum types... >> "%REPORT_FILE%"
echo. >> "%REPORT_FILE%"

psql -h %PGHOST% -p %PGPORT% -d %PGDATABASE% -U %PGUSER% -P pager=off -c "SELECT typname FROM pg_type WHERE typtype = 'e' ORDER BY typname;" >> "%REPORT_FILE%" 2>&1

echo. >> "%REPORT_FILE%"

REM ========================================
REM CHECK 2: Check work_order_status_enum for mixed case
REM ========================================
echo [2/6] Checking work_order_status_enum for mixed case... >> "%REPORT_FILE%"
echo. >> "%REPORT_FILE%"

psql -h %PGHOST% -p %PGPORT% -d %PGDATABASE% -U %PGUSER% -P pager=off -c "SELECT enumlabel, CASE WHEN enumlabel = LOWER(enumlabel) THEN 'lowercase' WHEN enumlabel = UPPER(enumlabel) THEN 'UPPERCASE' ELSE 'MixedCase' END as case_type FROM pg_enum WHERE enumtypid = 'work_order_status_enum'::regtype ORDER BY enumsortorder;" >> "%REPORT_FILE%" 2>&1

echo. >> "%REPORT_FILE%"

REM ========================================
REM CHECK 3: Find duplicate enum values (case-insensitive)
REM ========================================
echo [3/6] Checking for duplicate enum values (case-insensitive)... >> "%REPORT_FILE%"
echo. >> "%REPORT_FILE%"

psql -h %PGHOST% -p %PGPORT% -d %PGDATABASE% -U %PGUSER% -P pager=off -c "SELECT LOWER(enumlabel) as normalized_value, COUNT(*) as count, STRING_AGG(enumlabel, ', ') as variants FROM pg_enum WHERE enumtypid = 'work_order_status_enum'::regtype GROUP BY LOWER(enumlabel) HAVING COUNT(*) > 1 ORDER BY count DESC;" >> "%REPORT_FILE%" 2>&1

echo. >> "%REPORT_FILE%"

REM ========================================
REM CHECK 4: Check actual data in work_orders table
REM ========================================
echo [4/6] Checking actual status values in work_orders table... >> "%REPORT_FILE%"
echo. >> "%REPORT_FILE%"

psql -h %PGHOST% -p %PGPORT% -d %PGDATABASE% -U %PGUSER% -P pager=off -c "SELECT status, COUNT(*) as count, CASE WHEN status::text = LOWER(status::text) THEN 'lowercase' WHEN status::text = UPPER(status::text) THEN 'UPPERCASE' ELSE 'MixedCase' END as case_type FROM work_orders GROUP BY status ORDER BY count DESC;" >> "%REPORT_FILE%" 2>&1

echo. >> "%REPORT_FILE%"

REM ========================================
REM CHECK 5: Check for uppercase values in data
REM ========================================
echo [5/6] Checking for UPPERCASE status values in data... >> "%REPORT_FILE%"
echo. >> "%REPORT_FILE%"

psql -h %PGHOST% -p %PGPORT% -d %PGDATABASE% -U %PGUSER% -P pager=off -c "SELECT status, COUNT(*) as count FROM work_orders WHERE status::text != LOWER(status::text) GROUP BY status ORDER BY count DESC;" >> "%REPORT_FILE%" 2>&1

echo. >> "%REPORT_FILE%"

REM ========================================
REM CHECK 6: Summary and recommendations
REM ========================================
echo [6/6] Generating summary... >> "%REPORT_FILE%"
echo. >> "%REPORT_FILE%"
echo ======================================== >> "%REPORT_FILE%"
echo   SUMMARY >> "%REPORT_FILE%"
echo ======================================== >> "%REPORT_FILE%"
echo. >> "%REPORT_FILE%"

REM Count total enum values
for /f "tokens=*" %%a in ('psql -h %PGHOST% -p %PGPORT% -d %PGDATABASE% -U %PGUSER% -t -c "SELECT COUNT(*) FROM pg_enum WHERE enumtypid = 'work_order_status_enum'::regtype;"') do set TOTAL_ENUMS=%%a

REM Count lowercase enum values
for /f "tokens=*" %%a in ('psql -h %PGHOST% -p %PGPORT% -d %PGDATABASE% -U %PGUSER% -t -c "SELECT COUNT(*) FROM pg_enum WHERE enumtypid = 'work_order_status_enum'::regtype AND enumlabel = LOWER(enumlabel);"') do set LOWERCASE_ENUMS=%%a

REM Count uppercase enum values
for /f "tokens=*" %%a in ('psql -h %PGHOST% -p %PGPORT% -d %PGDATABASE% -U %PGUSER% -t -c "SELECT COUNT(*) FROM pg_enum WHERE enumtypid = 'work_order_status_enum'::regtype AND enumlabel = UPPER(enumlabel);"') do set UPPERCASE_ENUMS=%%a

REM Count total work orders
for /f "tokens=*" %%a in ('psql -h %PGHOST% -p %PGPORT% -d %PGDATABASE% -U %PGUSER% -t -c "SELECT COUNT(*) FROM work_orders;"') do set TOTAL_RECORDS=%%a

REM Count uppercase data values
for /f "tokens=*" %%a in ('psql -h %PGHOST% -p %PGPORT% -d %PGDATABASE% -U %PGUSER% -t -c "SELECT COUNT(*) FROM work_orders WHERE status::text != LOWER(status::text);"') do set UPPERCASE_DATA=%%a

echo Total enum values: %TOTAL_ENUMS% >> "%REPORT_FILE%"
echo Lowercase enum values: %LOWERCASE_ENUMS% >> "%REPORT_FILE%"
echo UPPERCASE enum values: %UPPERCASE_ENUMS% >> "%REPORT_FILE%"
echo. >> "%REPORT_FILE%"
echo Total work_orders records: %TOTAL_RECORDS% >> "%REPORT_FILE%"
echo Records with UPPERCASE status: %UPPERCASE_DATA% >> "%REPORT_FILE%"
echo. >> "%REPORT_FILE%"

REM Determine status
if %UPPERCASE_ENUMS% GTR 0 (
    echo STATUS: INCONSISTENT - Enum has uppercase values >> "%REPORT_FILE%"
    echo RECOMMENDATION: Run cleanup_status_enum.sql migration >> "%REPORT_FILE%"
    set STATUS_COLOR=91
    set STATUS_MSG=INCONSISTENT
) else if %UPPERCASE_DATA% GTR 0 (
    echo STATUS: DATA ISSUE - Enum is clean but data has uppercase values >> "%REPORT_FILE%"
    echo RECOMMENDATION: Run data cleanup script >> "%REPORT_FILE%"
    set STATUS_COLOR=93
    set STATUS_MSG=DATA ISSUE
) else (
    echo STATUS: CLEAN - All enums and data are lowercase >> "%REPORT_FILE%"
    echo RECOMMENDATION: No action needed >> "%REPORT_FILE%"
    set STATUS_COLOR=92
    set STATUS_MSG=CLEAN
)

echo. >> "%REPORT_FILE%"
echo ======================================== >> "%REPORT_FILE%"
echo   END OF REPORT >> "%REPORT_FILE%"
echo ======================================== >> "%REPORT_FILE%"

REM ========================================
REM Display results to console
REM ========================================
echo.
echo ========================================
echo   CHECK COMPLETE
echo ========================================
echo.
echo Total enum values: %TOTAL_ENUMS%
echo Lowercase: %LOWERCASE_ENUMS%
echo UPPERCASE: %UPPERCASE_ENUMS%
echo.
echo Total work_orders: %TOTAL_RECORDS%
echo UPPERCASE data: %UPPERCASE_DATA%
echo.

REM Display colored status
echo STATUS: [%STATUS_COLOR%m%STATUS_MSG%[0m
echo.
echo Full report saved to:
echo %REPORT_FILE%
echo.

REM Open report in notepad
echo Opening report...
start notepad "%REPORT_FILE%"

echo.
echo Press any key to exit...
pause >nul

endlocal

