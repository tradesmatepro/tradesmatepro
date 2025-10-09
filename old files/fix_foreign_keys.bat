@echo off
title TradeMate Pro - Fix Foreign Keys
color 0C

echo.
echo ==========================================
echo   🔧 TradeMate Pro Foreign Key Fix 🔧
echo ==========================================
echo.
echo This will fix the foreign key relationship
echo between users and profiles tables.
echo.

REM Check if the SQL runner exists
if not exist "scripts\run-sql.js" (
    echo ❌ ERROR: SQL runner not found at scripts\run-sql.js
    echo Please make sure the SQL runner script exists
    pause
    exit /b 1
)

echo ✅ Running foreign key fix...
echo.

REM Run the SQL fix
node scripts\run-sql.js fix_foreign_keys.sql

echo.
echo ✅ Foreign key fix completed!
echo.
echo 🔄 You may need to restart your Supabase project
echo    to refresh the schema cache.
echo.

pause
