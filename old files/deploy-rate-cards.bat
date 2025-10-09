@echo off
REM ========================================
REM Deploy Rate Cards Fix
REM ========================================
REM Uses execute-sql.js for direct SQL execution
REM Self-healing SQL with comprehensive checks
REM ========================================

echo.
echo ========================================
echo DEPLOYING RATE CARDS FIX
echo ========================================
echo.
echo This will:
echo   1. Verify rate_cards table exists
echo   2. Check current state
echo   3. Seed default rate cards for companies
echo   4. Verify data integrity
echo.

REM Run the deployment
node execute-sql.js deploy/seed-rate-cards.sql

echo.
echo ========================================
echo DEPLOYMENT COMPLETE
echo ========================================
echo.
echo Next steps:
echo 1. Restart frontend server (npm start)
echo 2. Hard refresh browser (Ctrl+F5)
echo 3. Check console for "Using rate_cards table"
echo 4. Check logs.md for no more 404 errors
echo.

pause

