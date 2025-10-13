@echo off
echo.
echo ========================================
echo FULL AUTO TEST - Quote Labor Line Items
echo ========================================
echo.
echo This test runs COMPLETELY AUTOMATICALLY:
echo - Starts servers
echo - Logs into app
echo - Creates test quote
echo - Analyzes logs
echo - Reports results
echo.
echo NO MANUAL INTERVENTION REQUIRED!
echo.
echo Press Ctrl+C to cancel, or any key to start...
pause >nul

echo.
echo Starting full auto test...
echo.

node devtools/full_auto_quote_labor_test.js

echo.
echo ========================================
echo TEST COMPLETE
echo ========================================
echo.
echo Check the output above for results.
echo Full report saved to: devtools/full_auto_test_results.json
echo.
pause

