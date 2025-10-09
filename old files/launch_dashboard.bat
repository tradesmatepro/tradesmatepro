@echo off
title TradeMate Pro Dashboard
color 0A

echo.
echo ==========================================
echo   🔨 TradeMate Pro Dashboard 🔨
echo ==========================================
echo.

REM Quick checks
if not exist "package.json" (
    echo ❌ ERROR: package.json not found
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
)

echo ✅ Starting TradeMate Pro Dashboard...
echo 🌐 Browser will open automatically at: http://localhost:3003
echo ⏹️  Press Ctrl+C to stop
echo.

REM Start React server and open browser
start http://localhost:3003
npm start

pause
