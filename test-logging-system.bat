@echo off
echo ========================================
echo Testing Logging System
echo ========================================
echo.

echo Step 1: Checking if error server is running...
curl -s http://localhost:4000/health > nul 2>&1
if %errorlevel% equ 0 (
    echo   ✅ Error server is running on port 4000
) else (
    echo   ❌ Error server is NOT running
    echo   Run: npm run dev-error-server
    echo.
    pause
    exit /b 1
)

echo.
echo Step 2: Checking if main app is running...
curl -s http://localhost:3004 > nul 2>&1
if %errorlevel% equ 0 (
    echo   ✅ Main app is running on port 3004
) else (
    echo   ❌ Main app is NOT running
    echo   Run: npm run dev-main
    echo.
    pause
    exit /b 1
)

echo.
echo Step 3: Checking for latest logs...
if exist "error_logs\latest.json" (
    echo   ✅ latest.json exists
    echo   Last modified: 
    dir "error_logs\latest.json" | findstr /C:"latest.json"
) else (
    echo   ⚠️  No logs captured yet (this is normal if you just started)
    echo   Wait 30 seconds after navigating the app
)

echo.
echo Step 4: Checking logs.md...
if exist "logs.md" (
    echo   ✅ logs.md exists
    echo   Size: 
    dir "logs.md" | findstr /C:"logs.md"
) else (
    echo   ⚠️  logs.md doesn't exist yet
)

echo.
echo ========================================
echo Logging System Status: READY
echo ========================================
echo.
echo Next steps:
echo   1. Navigate to http://localhost:3004/jobs
echo   2. Perform some actions (edit job, change status)
echo   3. Wait 30 seconds
echo   4. Check logs.md or error_logs\latest.json
echo.
pause

