@echo off
title TradeMate Pro - Create App Owner
color 0B

echo.
echo ==========================================
echo   🔧 TradeMate Pro App Owner Creator 🔧
echo ==========================================
echo.
echo This will create your first APP_OWNER user
echo for the TradeMate Pro Admin Dashboard.
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if the script exists
if not exist "create_super_user.js" (
    echo ❌ ERROR: create_super_user.js not found
    echo Please ensure the script is in the current directory
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

echo ✅ Running app owner creator...
echo.

REM Run the Node.js script
node create_super_user.js

echo.
echo ✅ App owner creation process completed!
echo.
echo 🚀 Next steps:
echo    1. Run launch_onboarding.bat to start the admin dashboard
echo    2. Login with the email and password you just created
echo    3. Start creating customer companies and users
echo.

pause
