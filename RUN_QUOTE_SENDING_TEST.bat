@echo off
REM ========================================
REM TradeMate Pro - Quote Sending Test
REM With Screenshot Analysis
REM ========================================

echo.
echo ========================================
echo   Quote Sending Test with AI Vision
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    pause
    exit /b 1
)

echo [1/3] Starting Screenshot API Server...
echo.
start "Screenshot API" cmd /k "cd /d %~dp0 && node devtools/screenshotApiServer.js"
timeout /t 3 >nul

echo [2/3] Waiting for server to be ready...
timeout /t 2 >nul
echo.

echo [3/3] Running Quote Sending Test...
echo.
echo ========================================
echo.
node devtools/testQuoteSending.js

echo.
echo ========================================
echo   Test Complete!
echo ========================================
echo.
echo View results:
echo   - Screenshots: devtools\screenshots\quote-test\
echo   - Results JSON: devtools\screenshots\quote-test\test-results.json
echo   - Analysis: AIDevTools\visual_analysis_results.json
echo.
pause

