@echo off
echo ========================================
echo TradeMate Pro - Kill All Ports
echo ========================================
echo.

echo 🔧 Killing all TradeMate Pro processes...
echo.

echo 🔴 Killing Main App (Port 3004)...
npx kill-port 3004

echo 🔴 Killing Admin Dashboard (Port 3003)...
npx kill-port 3003

echo 🔴 Killing Customer Portal (Port 3001)...
npx kill-port 3001

echo 🔴 Killing Dev Tools (Port 3002)...
npx kill-port 3002

echo 🔴 Killing Error Logger (Port 4000)...
npx kill-port 4000

echo 🔴 Killing Ghost Ports (3005-3009)...
npx kill-port 3005 3006 3007 3008 3009

echo.
echo ✅ All TradeMate Pro ports cleared!
echo.
echo 📋 Available commands:
echo   - start-main.bat         (TradeMate Pro - Port 3004)
echo   - launch_onboarding.bat  (Admin Dashboard - Port 3003)
echo   - start-customer.bat     (Customer Portal - Port 3001)
echo   - start-devtools.bat     (Dev Tools - Port 3002)
echo.
pause
