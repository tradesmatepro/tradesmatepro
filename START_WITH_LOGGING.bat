@echo off
echo ========================================
echo Starting TradeMate Pro with Error Logging
echo ========================================
echo.
echo This will start:
echo   1. Main app on port 3004
echo   2. Error logging server on port 4000
echo.
echo Press Ctrl+C to stop both servers
echo ========================================
echo.

REM Start both servers using npm script
npm run dev-all

