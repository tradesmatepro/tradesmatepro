@echo off
echo ========================================
echo TradeMate Pro - Main App (Port 3004)
echo ========================================
echo.

REM Kill any existing processes on port 3004
echo 🔧 Killing processes on port 3004...
npx kill-port 3004

echo ✅ Port 3004 cleared
echo.

echo 🚀 Starting TradeMate Pro Main App...
echo 📱 App URL: http://localhost:3004
echo ⏹️  Press Ctrl+C to stop
echo.

REM Start the main app
npm run dev-main

echo.
echo 🛑 TradeMate Pro Main App stopped.
pause
