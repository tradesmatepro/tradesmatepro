@echo off
echo ========================================
echo TradeMate Pro - Customer Portal (Port 3001)
echo ========================================
echo.

REM Change to Customer Portal directory
cd /d "%~dp0\Customer Portal"

REM Kill any existing processes on port 3001
echo 🔧 Killing processes on port 3001...
npx kill-port 3001

echo ✅ Port 3001 cleared
echo.

echo 🚀 Starting Customer Portal...
echo 📱 Portal URL: http://localhost:3001
echo ⏹️  Press Ctrl+C to stop
echo.

REM Start the customer portal
npm run dev-customer

echo.
echo 🛑 Customer Portal stopped.
pause
