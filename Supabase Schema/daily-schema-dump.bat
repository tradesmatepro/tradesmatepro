@echo off
REM ========================================
REM TradeMate Pro Daily Schema Dumper
REM For use with Windows Task Scheduler
REM ========================================

REM Set variables (silent mode for scheduled runs)
set TIMESTAMP=%date:~-4,4%-%date:~-10,2%-%date:~-7,2%_%time:~0,2%-%time:~3,2%-%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set OUTPUT_DIR=%~dp0
set SCHEMA_FILE=%OUTPUT_DIR%daily_schema_%TIMESTAMP%.sql
set LATEST_FILE=%OUTPUT_DIR%full_schema_latest.sql
set LOG_FILE=%OUTPUT_DIR%dump_log.txt

REM Database connection details
set DB_HOST=aws-0-us-east-1.pooler.supabase.com
set DB_PORT=5432
set DB_NAME=postgres
set DB_USER=postgres.amgtktrwpdsigcomavlg

REM Try to find pg_dump
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
    echo %date% %time% - ERROR: pg_dump not found >> "%LOG_FILE%"
    exit /b 1
)

REM Log start
echo %date% %time% - Starting daily schema dump >> "%LOG_FILE%"

REM Run pg_dump (relies on pgpass.conf for authentication)
"%PG_DUMP_PATH%" --schema-only --no-owner --no-privileges ^
  -h %DB_HOST% ^
  -p %DB_PORT% ^
  -U %DB_USER% ^
  -d %DB_NAME% ^
  -f "%SCHEMA_FILE%" 2>>"%LOG_FILE%"

REM Check result and log
if %ERRORLEVEL% EQU 0 (
    copy "%SCHEMA_FILE%" "%LATEST_FILE%" >nul 2>&1
    echo %date% %time% - SUCCESS: Schema dumped to %SCHEMA_FILE% >> "%LOG_FILE%"
    
    REM Clean up old daily dumps (keep only last 7 days)
    forfiles /p "%OUTPUT_DIR%" /m daily_schema_*.sql /d -7 /c "cmd /c del @path" 2>nul
    
) else (
    echo %date% %time% - FAILED: Schema dump failed with error code %ERRORLEVEL% >> "%LOG_FILE%"
)

REM Exit silently (no pause for scheduled runs)
exit /b %ERRORLEVEL%
