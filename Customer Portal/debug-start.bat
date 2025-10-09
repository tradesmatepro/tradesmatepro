@echo off
echo ========================================
echo DEBUG: TradeMate Pro Customer Portal
echo ========================================
echo.
echo Current Directory: %CD%
echo Node Version:
node --version
echo.
echo NPM Version:
npm --version
echo.
echo Checking package.json...
if exist package.json (
    echo ✅ package.json found
) else (
    echo ❌ package.json NOT found
    pause
    exit /b 1
)
echo.
echo Checking node_modules...
if exist node_modules (
    echo ✅ node_modules found
) else (
    echo ❌ node_modules NOT found - running npm install...
    npm install
)
echo.
echo Environment Variables:
echo NODE_ENV=%NODE_ENV%
echo PORT=%PORT%
echo.
echo ========================================
echo Starting Customer Portal...
echo ========================================
echo.
echo Opening browser at http://localhost:3000
echo.
echo To stop the server, press Ctrl+C
echo.
echo ========================================
npm start
pause
