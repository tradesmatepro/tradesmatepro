@echo off
echo 🔧 Connecting to Supabase...
echo.

REM Connect to Supabase PostgreSQL database using IPv4 session pooler
psql "host=aws-0-us-east-1.pooler.supabase.com port=5432 dbname=postgres user=postgres.amgtktrwpdsigcomavlg password=Alphaecho19! sslmode=require"

REM Check if psql command failed
if %ERRORLEVEL% neq 0 (
    echo.
    echo ❌ Connection failed!
    echo.
    echo Possible issues:
    echo - psql is not installed or not in PATH
    echo - Network connectivity issues
    echo - Database credentials may have changed
    echo.
    echo Make sure PostgreSQL client tools are installed and psql.exe is in your PATH.
    echo.
    pause
) else (
    echo.
    echo ✅ Connection closed successfully.
    pause
)
