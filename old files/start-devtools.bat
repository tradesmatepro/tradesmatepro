@echo off
echo ========================================
echo TradeMate Pro - Dev Tools Server (Port 3002)
echo ========================================
echo.

REM Change to devtools directory
cd /d "%~dp0\devtools"

REM Kill any existing processes on port 3002
echo 🔧 Killing processes on port 3002...
npx kill-port 3002

echo ✅ Port 3002 cleared
echo.

echo 🚀 Starting Dev Tools Server...
echo 📱 Dev Tools URL: http://localhost:3002
echo ⏹️  Press Ctrl+C to stop
echo.

REM Start the dev tools server
npm run dev-devtools

echo.
echo 🛑 Dev Tools Server stopped.
pause
