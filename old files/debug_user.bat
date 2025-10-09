@echo off
title TradeMate Pro - Debug Users
color 0E

echo.
echo ==========================================
echo   🔍 TradeMate Pro User Debug Tool 🔍
echo ==========================================
echo.
echo This will check what users exist and help
echo debug login issues.
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

REM Install dependencies if needed
if not exist "node_modules\@supabase" (
    echo 📦 Installing required dependencies...
    npm install @supabase/supabase-js
)

echo ✅ Running user debug tool...
echo.

REM Run the debug script
node debug_user.js

echo.
echo ✅ Debug completed!
echo.
echo Press any key to continue...
pause >nul
