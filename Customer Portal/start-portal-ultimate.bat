@echo off
echo ========================================
echo TradeMate Pro Customer Portal
echo ========================================
echo.

REM Change to the Customer Portal directory
cd /d "%~dp0"

REM Kill any existing processes on ports 3000-3002
echo 🔧 Cleaning up existing processes...
for %%p in (3000 3001 3002) do (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%%p') do (
        if not "%%a"=="0" (
            taskkill /F /PID %%a >nul 2>&1
        )
    )
)

echo ✅ Port cleanup complete
echo.

REM Verify Node.js and NPM
where node >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found in PATH
    pause
    exit /b 1
)

where npm >nul 2>&1
if errorlevel 1 (
    echo ❌ NPM not found in PATH
    pause
    exit /b 1
)

echo ✅ Node.js and NPM found
echo.

REM Clear any compilation cache
if exist "node_modules\.cache" (
    echo 🔧 Clearing compilation cache...
    rmdir /s /q "node_modules\.cache" >nul 2>&1
)

REM Set environment to prevent browser conflicts
set BROWSER=none
set PORT=3000

echo 🚀 Starting Customer Portal on port 3000...
echo 📋 Open your browser to: http://localhost:3000
echo.
echo To stop the server, press Ctrl+C
echo.

npm start

pause