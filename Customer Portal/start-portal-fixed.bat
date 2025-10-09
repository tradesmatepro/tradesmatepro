@echo off
cd /d "%~dp0"
echo ========================================
echo TradeMate Pro Customer Portal
echo ========================================
echo.
echo Working Directory: %CD%
echo.
echo Checking environment...
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
echo Starting Customer Portal...
echo Opening browser at http://localhost:3000
echo.
echo To stop the server, press Ctrl+C
echo.
set BROWSER=none
npm start