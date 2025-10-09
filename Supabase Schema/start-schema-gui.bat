@echo off
title TradeMate Pro - Database Schema Manager
echo.
echo 🚀 Starting TradeMate Pro Database Schema Manager...
echo.
echo This GUI application allows you to:
echo   • Manually dump database schema using WORKING db-dumper.js
echo   • Set up automatic schema dumping with custom intervals
echo   • Manage schema files and settings
echo   • View real-time logs
echo.
echo ⚠️  NOTE: Using db-dumper.js (working connection) instead of pg-dump-equivalent.js (failing)
echo.
echo Starting GUI...
echo.

REM First try to run a quick schema dump to test connection
echo 🧪 Testing database connection with working dumper...
node db-dumper.js --test-connection

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Database connection test failed
    echo The working db-dumper.js cannot connect to database
    echo Check your database credentials and network connection
    echo.
    pause
    exit /b 1
)

echo ✅ Database connection successful!
echo.

python db-schema-gui.py

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Error starting the GUI application
    echo Make sure Python is installed and psycopg2-binary is available
    echo.
    echo 💡 Alternative: Run manual schema dump with:
    echo    node db-dumper.js
    echo.
    pause
)
