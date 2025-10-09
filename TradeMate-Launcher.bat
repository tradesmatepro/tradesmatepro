@echo off
title TradeMate Pro - Universal Launcher
color 0B
cls

:MAIN_MENU
echo.
echo ==========================================
echo   🚀 TRADEMATE PRO UNIVERSAL LAUNCHER 🚀
echo ==========================================
echo.
echo 🎯 Available Applications:
echo.
echo   [1] Admin Dashboard      (Port 3003) - Create Companies
echo   [2] TradeMate Pro Main   (Port 3004) - Contractor App  
echo   [3] Customer Portal      (Port 3001) - Customer Interface
echo   [4] Dev Tools            (Port 3002) - Development Utils
echo   [5] Error Logger         (Port 4000) - Error Collection
echo.
echo 🔧 Maintenance Options:
echo.
echo   [K] Kill All Ports       - Clean shutdown all apps
echo   [S] Show Port Status     - See what's running
echo   [R] Restart All          - Kill all + restart main apps
echo.
echo   [Q] Quit
echo.

set /p choice="Select option [1-5, K, S, R, Q]: "

if /i "%choice%"=="1" goto ADMIN_DASHBOARD
if /i "%choice%"=="2" goto MAIN_APP
if /i "%choice%"=="3" goto CUSTOMER_PORTAL
if /i "%choice%"=="4" goto DEV_TOOLS
if /i "%choice%"=="5" goto ERROR_LOGGER
if /i "%choice%"=="K" goto KILL_ALL
if /i "%choice%"=="S" goto SHOW_STATUS
if /i "%choice%"=="R" goto RESTART_ALL
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
echo 🔥 Clearing port 3003...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3003') do taskkill /PID %%a /F >nul 2>&1
echo ✅ Port cleared
echo.
echo 🚀 Starting Admin Dashboard...
echo 📱 URL: http://localhost:3003
echo 🔐 SUPER_ADMIN access only
echo.
echo 📂 Checking admin-dashboard directory...
if not exist "%~dp0admin-dashboard" (
    echo ❌ ERROR: admin-dashboard folder not found at %~dp0admin-dashboard
    echo 📂 Current directory: %cd%
    echo 📂 Script location: %~dp0
    pause
    goto MAIN_MENU
)
cd /d "%~dp0admin-dashboard"
echo ✅ Changed to: %cd%
if not exist "package.json" (
    echo ❌ ERROR: package.json not found in admin-dashboard
    dir
    pause
    goto MAIN_MENU
)
echo ✅ Found package.json
echo.
echo 🔄 Setting environment and starting...
set PORT=3003
set BROWSER=none
echo 📋 PORT=%PORT%
echo 📋 Starting npm start...
start /b npm start
echo ✅ npm start command issued
echo ⏳ Waiting 8 seconds for startup...
timeout /t 8 /nobreak >nul
echo 🌐 Opening browser...
start http://localhost:3003
echo.
echo ✅ Admin Dashboard should be starting!
echo 📋 Use this to create new companies
echo ⏹️  Press any key to return to menu
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
echo 🔥 Clearing port 3004...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3004') do taskkill /PID %%a /F >nul 2>&1
echo ✅ Port cleared
echo.
echo 🚀 Starting TradeMate Pro Main App...
echo 📱 URL: http://localhost:3004
echo 👷 Contractor application
echo.
echo 📂 Checking main directory...
cd /d "%~dp0"
echo ✅ In directory: %cd%
if not exist "package.json" (
    echo ❌ ERROR: package.json not found in main directory
    dir
    pause
    goto MAIN_MENU
)
echo ✅ Found package.json
echo.
echo 🔄 Setting environment and starting...
set PORT=3004
echo 📋 PORT=%PORT%
echo 📋 Starting npm run dev-main...
start /b npm run dev-main
echo ✅ npm run dev-main command issued
echo ⏳ Waiting 8 seconds for startup...
timeout /t 8 /nobreak >nul
echo 🌐 Opening browser...
start http://localhost:3004
echo.
echo ✅ TradeMate Pro should be starting!
echo 📋 Main contractor application
echo ⏹️  Press any key to return to menu
echo.
pause
goto MAIN_MENU

:CUSTOMER_PORTAL
echo.
echo ==========================================
echo   👥 STARTING CUSTOMER PORTAL (Port 3001)
echo ==========================================
echo.
echo 🔥 Clearing port 3001...
npx kill-port 3001 >nul 2>&1
echo ✅ Port cleared
echo.
echo 🚀 Starting Customer Portal...
echo 📱 URL: http://localhost:3001
echo 🏠 Customer-facing interface
echo.
cd /d "%~dp0Customer Portal"
if not exist "package.json" (
    echo ❌ ERROR: Customer Portal not found
    pause
    goto MAIN_MENU
)
set PORT=3001
start /b npm start
timeout /t 5 >nul
start http://localhost:3001
echo.
echo ✅ Customer Portal started!
echo 📋 Customer interface
echo ⏹️  Close this window or press Ctrl+C to stop
echo.
pause
goto MAIN_MENU

:DEV_TOOLS
echo.
echo ==========================================
echo   🛠️ STARTING DEV TOOLS (Port 3002)
echo ==========================================
echo.
echo 🔥 Clearing port 3002...
npx kill-port 3002 >nul 2>&1
echo ✅ Port cleared
echo.
echo 🚀 Starting Dev Tools...
echo 📱 URL: http://localhost:3002
echo 🔧 Development utilities
echo.
cd /d "%~dp0devtools"
if not exist "package.json" (
    echo ❌ ERROR: Dev Tools not found
    pause
    goto MAIN_MENU
)
set PORT=3002
start /b npm start
timeout /t 5 >nul
start http://localhost:3002
echo.
echo ✅ Dev Tools started!
echo 📋 Development utilities
echo ⏹️  Close this window or press Ctrl+C to stop
echo.
pause
goto MAIN_MENU

:ERROR_LOGGER
echo.
echo ==========================================
echo   📊 STARTING ERROR LOGGER (Port 4000)
echo ==========================================
echo.
echo 🔥 Clearing port 4000...
npx kill-port 4000 >nul 2>&1
echo ✅ Port cleared
echo.
echo 🚀 Starting Error Logger...
echo 📱 URL: http://localhost:4000
echo 📊 Error collection server
echo.
cd /d "%~dp0"
start /b npm run dev-error-server
timeout /t 3 >nul
echo.
echo ✅ Error Logger started!
echo 📋 Collecting application errors
echo ⏹️  Close this window or press Ctrl+C to stop
echo.
pause
goto MAIN_MENU

:KILL_ALL
echo.
echo ==========================================
echo   🔥 KILLING ALL TRADEMATE PROCESSES
echo ==========================================
echo.
echo 🔍 Current port usage:
netstat -ano | findstr :300
netstat -ano | findstr :4000
echo.
echo 🔥 Killing all TradeMate processes...
for %%p in (3001 3002 3003 3004 3005 3006 3007 3008 3009 4000) do (
    echo Killing port %%p...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%%p') do taskkill /PID %%a /F >nul 2>&1
)
echo.
echo 🔥 Killing remaining Node processes...
taskkill /IM node.exe /F >nul 2>&1
taskkill /IM npm.exe /F >nul 2>&1
echo.
echo ✅ All processes killed!
echo.
pause
goto MAIN_MENU

:SHOW_STATUS
echo.
echo ==========================================
echo   📊 CURRENT PORT STATUS
echo ==========================================
echo.
echo 🔍 Checking ports 3001-3009 and 4000...
echo.
netstat -ano | findstr :300
netstat -ano | findstr :4000
echo.
if %errorlevel% equ 0 (
    echo ⚠️  Some ports are in use
) else (
    echo ✅ All TradeMate ports are free!
)
echo.
pause
goto MAIN_MENU

:RESTART_ALL
echo.
echo ==========================================
echo   🔄 RESTARTING ALL APPLICATIONS
echo ==========================================
echo.
echo 🔥 Killing all processes first...
call :KILL_ALL_SILENT
echo.
echo 🚀 Starting core applications...
echo.
echo Starting Admin Dashboard...
cd /d "%~dp0admin-dashboard"
set PORT=3003
start /b npm start >nul 2>&1
timeout /t 3 >nul
echo.
echo Starting TradeMate Pro Main...
cd /d "%~dp0"
set PORT=3004
start /b npm run dev-main >nul 2>&1
timeout /t 3 >nul
echo.
echo ✅ Core applications restarted!
echo 📱 Admin Dashboard: http://localhost:3003
echo 📱 TradeMate Pro: http://localhost:3004
echo.
pause
goto MAIN_MENU

:KILL_ALL_SILENT
for %%p in (3001 3002 3003 3004 3005 3006 3007 3008 3009 4000) do (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%%p') do taskkill /PID %%a /F >nul 2>&1
)
taskkill /IM node.exe /F >nul 2>&1
taskkill /IM npm.exe /F >nul 2>&1
goto :eof

:QUIT
echo.
echo 👋 Thanks for using TradeMate Pro Universal Launcher!
echo.
timeout /t 2 >nul
exit
