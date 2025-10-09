@echo off
echo 🚨 ERROR EXPORT INSTRUCTIONS FOR CUSTOMER PORTAL
echo.
echo Customer Portal is a React-only app with no Express server.
echo The Node.js export script won't work.
echo.
echo ✅ CORRECT WORKFLOW:
echo 1. Open: http://localhost:3001/developer-tools
echo 2. Open browser console (F12)
echo 3. Run: startAutoExport(30)
echo 4. Files auto-download every 30 seconds
echo.
echo ✅ MANUAL EXPORT:
echo 1. Open: http://localhost:3001/developer-tools
echo 2. Open browser console (F12)
echo 3. Run: exportAllErrors()
echo 4. File downloads immediately
echo.
echo Opening /developer-tools page now...

start http://localhost:3001/developer-tools

pause
