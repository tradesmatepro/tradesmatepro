@echo off
title TradeMate Pro Admin Dashboard
color 0A

echo.
echo ==========================================
echo   🔧 TradeMate Pro Admin Dashboard 🔧
echo ==========================================
echo.
echo 🚨 SUPER_ADMIN ACCESS ONLY 🚨
echo.

REM Navigate to admin dashboard directory
cd /d "%~dp0admin-dashboard"

REM Quick checks
if not exist "package.json" (
    echo ❌ ERROR: Admin dashboard not found
    echo Please ensure admin-dashboard folder exists
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo 📦 Installing admin dashboard dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
)

echo ✅ Starting TradeMate Pro Admin Dashboard...
echo 🌐 Admin Dashboard will open at: http://localhost:3003
echo 🔐 Only SUPER_ADMIN users can access this dashboard
echo ⏹️  Press Ctrl+C to stop
echo.

REM Kill port 3003 first to prevent conflicts
echo 🔥 Clearing port 3003...
npx kill-port 3003

REM Start React server on port 3003
echo ✅ Starting Admin Dashboard on port 3003...
set BROWSER=none
set PORT=3003
start /b npm start

REM Wait for server to start
echo ⏳ Waiting for admin dashboard to start...
timeout /t 15 /nobreak >nul

REM Open admin dashboard
echo 🚀 Opening Admin Dashboard...
start http://localhost:3003

echo.
echo ✅ Admin Dashboard is ready!
echo.
echo 🔧 Admin Functions:
echo    • Create new customer companies
echo    • Set up company owners
echo    • View company details
echo    • Manage company employees
echo    • Industry-standard 3-step workflow
echo    • Automatic profile creation
echo.
echo 🚨 IMPORTANT: Only users with SUPER_ADMIN role can access this dashboard
echo.

pause
