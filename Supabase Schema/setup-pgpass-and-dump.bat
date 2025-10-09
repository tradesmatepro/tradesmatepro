@echo off
echo ========================================
echo TradeMate Pro Schema Dumper Setup
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
set DB_PASSWORD=Alphaecho19!

REM pgpass file setup
set PGPASS_DIR=%APPDATA%\postgresql
set PGPASS_FILE=%PGPASS_DIR%\pgpass.conf

echo Setting up pgpass file for passwordless authentication...

REM Create postgresql directory if it doesn't exist
if not exist "%PGPASS_DIR%" (
    mkdir "%PGPASS_DIR%"
    echo Created directory: %PGPASS_DIR%
)

REM Create or update pgpass.conf
echo %DB_HOST%:%DB_PORT%:%DB_NAME%:%DB_USER%:%DB_PASSWORD% > "%PGPASS_FILE%"
echo ✅ pgpass.conf updated at: %PGPASS_FILE%

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
) else if exist "C:\Program Files\PostgreSQL\13\bin\pg_dump.exe" (
    set PG_DUMP_PATH=C:\Program Files\PostgreSQL\13\bin\pg_dump.exe
) else (
    echo.
    echo ❌ ERROR: pg_dump not found in standard PostgreSQL installation paths
    echo.
    echo Please install PostgreSQL client tools from:
    echo https://www.postgresql.org/download/windows/
    echo.
    echo After installation, you can use the simpler pg-dump-schema.bat file
    echo.
    pause
    exit /b 1
)

echo ✅ Found pg_dump at: %PG_DUMP_PATH%
echo.

echo Connecting to: %DB_HOST%:%DB_PORT%
echo Database: %DB_NAME%
echo User: %DB_USER%
echo.

REM Run pg_dump (no password needed due to pgpass.conf)
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
    echo 📁 Timestamped file: %SCHEMA_FILE%
    
    REM Copy to latest file
    copy "%SCHEMA_FILE%" "%LATEST_FILE%" >nul
    echo 📁 Latest copy: %LATEST_FILE%
    
    REM Show file size
    for %%A in ("%SCHEMA_FILE%") do (
        set /a FILE_SIZE_KB=%%~zA/1024
        echo 📄 File size: %%~zA bytes (approx. !FILE_SIZE_KB! KB)
    )
    
    echo.
    echo 🎉 Setup complete! You can now use pg-dump-schema.bat for future dumps
    echo    (no password prompts needed thanks to pgpass.conf)
    echo.
    echo Opening output folder...
    start "" explorer "%OUTPUT_DIR%"
    
) else (
    echo.
    echo ❌ Schema dump failed with error code: %ERRORLEVEL%
    echo.
    echo Common issues:
    echo - Network connectivity problems
    echo - Database server not accessible
    echo - Incorrect credentials in pgpass.conf
    echo - Firewall blocking connection
    echo.
    echo Try running: telnet %DB_HOST% %DB_PORT%
    echo to test basic connectivity
)

echo.
echo Press any key to exit...
pause >nul
