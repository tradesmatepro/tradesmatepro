@echo off
echo ========================================
echo   Starting Supabase Dev Proxy Server
echo ========================================
echo.

REM Change to the script directory
cd /d "%~dp0"

REM Check if Node.js is installed
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from nodejs.org
    pause >nul
    exit /b 1
)

echo ✅ Node.js found

REM Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Failed to install dependencies
        pause >nul
        exit /b 1
    )
)

echo ✅ Dependencies ready
echo.
echo 🚀 Starting Dev SQL Proxy Server...
echo 🚀 Claude/GPT can now execute SQL at: http://localhost:4000/dev/sql/exec
echo.
echo Press Ctrl+C to stop the server
echo ========================================

REM Start the server
npm start
