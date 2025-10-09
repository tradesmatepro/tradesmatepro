@echo off
title TradeMate Pro - Universal Launcher
color 0B
cls

echo.
echo ==========================================
echo   🚀 TRADEMATE PRO UNIVERSAL LAUNCHER 🚀
echo ==========================================
echo.
echo Testing basic functionality...
echo Current directory: %cd%
echo Script location: %~dp0
echo.

:MAIN_MENU
echo.
echo 🎯 Available Applications:
echo.
echo   [1] Admin Dashboard      (Port 3003)
echo   [2] TradeMate Pro Main   (Port 3004)  
echo   [3] Kill All Ports
echo   [4] Show Status
echo   [Q] Quit
echo.

set /p choice="Select option [1-4, Q]: "

if /i "%choice%"=="1" goto ADMIN_DASHBOARD
if /i "%choice%"=="2" goto MAIN_APP
if /i "%choice%"=="3" goto KILL_ALL
if /i "%choice%"=="4" goto SHOW_STATUS
if /i "%choice%"=="Q" goto QUIT

echo.
echo ❌ Invalid choice. Please try again.
timeout /t 2 >nul
goto MAIN_MENU

:ADMIN_DASHBOARD
echo.
echo ==========================================
echo   🔧 STARTING ADMIN DASHBOARD (Port 3003)
echo ==========================================
echo.
echo 📂 Current directory: %cd%
echo 📂 Script directory: %~dp0
echo 📂 Target directory: %~dp0admin-dashboard
echo.

if not exist "%~dp0admin-dashboard" (
    echo ❌ ERROR: admin-dashboard folder not found
    echo 📂 Listing current directory:
    dir /b
    pause
    goto MAIN_MENU
)

echo ✅ admin-dashboard folder found
cd /d "%~dp0admin-dashboard"
echo ✅ Changed to: %cd%

if not exist "package.json" (
    echo ❌ ERROR: package.json not found
    echo 📂 Listing admin-dashboard contents:
    dir /b
    pause
    goto MAIN_MENU
)

echo ✅ package.json found
echo.
echo 🚀 Starting Admin Dashboard...
echo 📋 Command: npm start
echo.

set PORT=3003
start cmd /k "npm start"

echo.
echo ✅ Admin Dashboard starting in new window
echo 📱 URL: http://localhost:3003
echo.
pause
cd /d "%~dp0"
goto MAIN_MENU

:MAIN_APP
echo.
echo ==========================================
echo   🏢 STARTING TRADEMATE PRO (Port 3004)
echo ==========================================
echo.
echo 📂 Current directory: %cd%
echo 📂 Script directory: %~dp0
echo.

cd /d "%~dp0"
echo ✅ In main directory: %cd%

if not exist "package.json" (
    echo ❌ ERROR: package.json not found in main directory
    echo 📂 Listing main directory:
    dir /b
    pause
    goto MAIN_MENU
)

echo ✅ package.json found
echo.
echo 🚀 Starting TradeMate Pro...
echo 📋 Command: npm run dev-main
echo.

set PORT=3004
start cmd /k "npm run dev-main"

echo.
echo ✅ TradeMate Pro starting in new window
echo 📱 URL: http://localhost:3004
echo.
pause
goto MAIN_MENU

:KILL_ALL
echo.
echo ==========================================
echo   🔥 KILLING ALL PROCESSES
echo ==========================================
echo.
echo 🔥 Killing Node processes...
taskkill /IM node.exe /F 2>nul
taskkill /IM npm.exe /F 2>nul
echo ✅ Processes killed
echo.
pause
goto MAIN_MENU

:SHOW_STATUS
echo.
echo ==========================================
echo   📊 CURRENT STATUS
echo ==========================================
echo.
echo 🔍 Checking ports 3001-3009...
netstat -ano | findstr :300
echo.
echo 🔍 Checking port 4000...
netstat -ano | findstr :4000
echo.
pause
goto MAIN_MENU

:QUIT
echo.
echo 👋 Goodbye!
timeout /t 2 >nul
exit
