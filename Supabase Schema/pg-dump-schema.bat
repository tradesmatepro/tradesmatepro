@echo off
echo ========================================
echo TradeMate Pro Schema Dumper (pg_dump)
echo ========================================
echo.

REM Set variables
set TIMESTAMP=%date:~-4,4%-%date:~-10,2%-%date:~-7,2%_%time:~0,2%-%time:~3,2%-%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set OUTPUT_DIR=%~dp0
set SCHEMA_FILE=%OUTPUT_DIR%full_schema_%TIMESTAMP%.sql
set LATEST_FILE=%OUTPUT_DIR%full_schema_latest.sql

REM Database connection details
set DB_HOST=aws-0-us-east-1.pooler.supabase.com
set DB_PORT=5432
set DB_NAME=postgres
set DB_USER=postgres.cxlqzejzraczumqmsrcx
set PGPASSWORD=Alphaecho19!

echo Connecting to: %DB_HOST%:%DB_PORT%
echo Database: %DB_NAME%
echo User: %DB_USER%
echo.

REM Try to find pg_dump in common locations
set PG_DUMP_PATH=
if exist "C:\Program Files\PostgreSQL\17\bin\pg_dump.exe" (
    set PG_DUMP_PATH=C:\Program Files\PostgreSQL\17\bin\pg_dump.exe
) else if exist "C:\Program Files\PostgreSQL\16\bin\pg_dump.exe" (
    set PG_DUMP_PATH=C:\Program Files\PostgreSQL\16\bin\pg_dump.exe
) else if exist "C:\Program Files\PostgreSQL\15\bin\pg_dump.exe" (
    set PG_DUMP_PATH=C:\Program Files\PostgreSQL\15\bin\pg_dump.exe
) else if exist "C:\Program Files\PostgreSQL\14\bin\pg_dump.exe" (
    set PG_DUMP_PATH=C:\Program Files\PostgreSQL\14\bin\pg_dump.exe
) else (
    echo ERROR: pg_dump not found in standard PostgreSQL installation paths
    echo.
    echo Please install PostgreSQL client tools from:
    echo https://www.postgresql.org/download/windows/
    echo.
    echo Or update this script with the correct path to pg_dump.exe
    pause
    exit /b 1
)

echo Found pg_dump at: %PG_DUMP_PATH%
echo.

REM Run pg_dump
echo Running schema dump...
"%PG_DUMP_PATH%" --schema-only --no-owner --no-privileges ^
  -h %DB_HOST% ^
  -p %DB_PORT% ^
  -U %DB_USER% ^
  -d %DB_NAME% ^
  -f "%SCHEMA_FILE%"

REM Check if dump was successful
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Schema dump completed successfully!
    echo 📁 Saved to: %SCHEMA_FILE%
    
    REM Copy to latest file
    copy "%SCHEMA_FILE%" "%LATEST_FILE%" >nul
    echo 📁 Latest copy: %LATEST_FILE%
    
    REM Show file size
    for %%A in ("%SCHEMA_FILE%") do (
        echo 📄 File size: %%~zA bytes
    )
    
    echo.
    echo Opening output folder...
    explorer "%OUTPUT_DIR%"
    
) else (
    echo.
    echo ❌ Schema dump failed with error code: %ERRORLEVEL%
    echo.
    echo Common issues:
    echo - PostgreSQL client tools not installed
    echo - Network connectivity issues
    echo - Incorrect credentials
    echo - Database server not accessible
)

echo.
echo Press any key to exit...
pause >nul
