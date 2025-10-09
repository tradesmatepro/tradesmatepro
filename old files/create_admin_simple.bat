@echo off
title TradeMate Pro - Create Admin (Simple)
color 0B

echo.
echo ==========================================
echo   🔧 TradeMate Pro Simple Admin Creator 🔧
echo ==========================================
echo.
echo This will create a test admin user with:
echo   Email: admin@trademate.com
echo   Password: admin123!
echo   Name: Admin User
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Install required dependencies if needed
if not exist "node_modules\@supabase" (
    echo 📦 Installing required dependencies...
    npm install @supabase/supabase-js
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
)

echo ✅ Running simple admin creator...
echo.

REM Run the Node.js script
node create_admin_simple.js

echo.
echo ✅ Simple admin creation process completed!
echo.
