@echo off
REM ========================================
REM Start TradeMate Pro Main (Port 3004) CLEAN
REM ========================================
REM Kills all ports, clears cache, starts fresh
REM ========================================

echo.
echo ========================================
echo STARTING TRADEMATE PRO MAIN - CLEAN
echo ========================================
echo.

echo Step 1: Killing all Node processes...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM npm.exe 2>nul
timeout /t 2 /nobreak >nul
echo ✅ All Node processes killed

echo.
echo Step 2: Clearing webpack cache...
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo ✅ Deleted node_modules\.cache
) else (
    echo ⚠️ node_modules\.cache not found
)

echo.
echo Step 3: Clearing build directory...
if exist "build" (
    rmdir /s /q "build"
    echo ✅ Deleted build directory
) else (
    echo ⚠️ build directory not found
)

echo.
echo Step 4: Starting TradeMate Pro Main on port 3004...
echo.
echo ========================================
echo WATCH FOR THIS IN BROWSER CONSOLE:
echo 🚀🚀🚀 NEW CODE RUNNING - TIMESTAMP: ...
echo ========================================
echo.
echo Starting server...
set PORT=3004
set BROWSER=none
npm run dev-main

pause

