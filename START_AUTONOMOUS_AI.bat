@echo off
REM ========================================
REM TradeMate Pro - Autonomous AI Teammate
REM Startup Script
REM ========================================

echo.
echo ========================================
echo   TradeMate Pro - Autonomous AI Teammate
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/5] Checking Node.js installation...
node --version
echo.

echo [2/5] Starting Health Monitor (this will start all servers)...
echo.
start "Health Monitor" cmd /k "cd /d %~dp0 && node devtools/healthMonitor.js start"
timeout /t 3 >nul

echo [3/5] Waiting for servers to start...
timeout /t 5 >nul
echo.

echo [4/5] Checking system health...
node devtools/healthMonitor.js check
echo.

echo [5/5] System ready!
echo.
echo ========================================
echo   Autonomous AI Teammate is READY
echo ========================================
echo.
echo Available commands:
echo.
echo   Run all tests:
echo   node devtools/autoTestRunner.js
echo.
echo   Run specific scenario:
echo   node devtools/autoTestRunner.js --scenario=quoteFlow
echo.
echo   Check health:
echo   node devtools/healthMonitor.js check
echo.
echo   View session state:
echo   type devtools\session_state.json
echo.
echo   View test results:
echo   type devtools\test_results\latest.json
echo.
echo ========================================
echo.
echo Press any key to run autonomous tests...
pause >nul

echo.
echo Running autonomous tests...
echo.
node devtools/autoTestRunner.js

echo.
echo ========================================
echo   Test run complete!
echo ========================================
echo.
echo View results: devtools\test_results\latest.json
echo View logs: devtools\logs\
echo View screenshots: devtools\screenshots\
echo.
pause

