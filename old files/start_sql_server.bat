@echo off
echo ========================================
echo   TradeMate Pro SQL Automation Server
echo ========================================
echo.

REM Change to the script directory
cd /d "%~dp0"

REM Check if Node.js is installed
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from nodejs.org
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo ✅ Node.js found
echo.

REM Check if package.json exists (renamed from package-sql-server.json)
if not exist "package.json" (
    if exist "package-sql-server.json" (
        echo 📦 Setting up package.json...
        copy "package-sql-server.json" "package.json" >nul
    ) else (
        echo ❌ package.json not found
        echo Please ensure package-sql-server.json exists
        pause >nul
        exit /b 1
    )
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Failed to install dependencies
        echo Please run: npm install
        echo.
        echo Press any key to exit...
        pause >nul
        exit /b 1
    )
    echo ✅ Dependencies installed successfully
) else (
    echo ✅ Dependencies already installed
)

echo.
echo ⚠️  WARNING: This server can execute ANY SQL!
echo ⚠️  Only use in development/beta environments!
echo.
echo 🚀 Starting SQL Automation Server...
echo 🚀 Server will be available at: http://localhost:4000
echo.
echo Available endpoints:
echo   POST /dev/sql/exec     - Execute single SQL
echo   POST /dev/sql/batch    - Execute multiple SQL  
echo   GET  /dev/schema/tables - Get table schema
echo   GET  /dev/test-connection - Test DB connection
echo   GET  /health           - Health check
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

REM Start the server
node devSqlExec.js

REM If we get here, the server has stopped
echo.
echo SQL Automation Server stopped.
echo Press any key to exit...
pause >nul
