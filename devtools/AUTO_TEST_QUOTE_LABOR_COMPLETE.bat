@echo off
echo.
echo ========================================
echo AUTO TEST: Quote Labor Line Items
echo ========================================
echo.
echo This script will:
echo 1. Start the error server
echo 2. Start the frontend
echo 3. Wait for you to test quote creation
echo 4. Analyze the smart logs
echo 5. Report findings
echo.
echo Press Ctrl+C to stop at any time.
echo.
pause

echo.
echo [1/5] Starting error server...
start "Error Server" cmd /k "npm run dev-error-server"
timeout /t 3 /nobreak >nul

echo [2/5] Starting frontend...
start "Frontend" cmd /k "npm run dev-main"
timeout /t 10 /nobreak >nul

echo.
echo [3/5] Frontend should be running at http://localhost:3000
echo.
echo ========================================
echo MANUAL TEST STEPS:
echo ========================================
echo 1. Go to http://localhost:3000
echo 2. Login
echo 3. Go to Quotes page
echo 4. Click "Create Quote"
echo 5. Add labor: 1 employee × 8 hours = $600
echo 6. Add 1 material item
echo 7. Save the quote
echo 8. Check if labor appears in the quote
echo.
echo When done testing, press any key to analyze logs...
pause >nul

echo.
echo [4/5] Running AI Auto-Analyzer...
echo.
node devtools/ai_analyze_quote_labor.js

echo.
echo [5/5] Generating detailed logs...
echo.
node devtools/read_smart_logs.js labor
echo.
node devtools/read_smart_logs.js quote

echo.
echo ========================================
echo TEST COMPLETE
echo ========================================
echo.
echo AI Analysis Report:
echo - devtools/labor_analysis_report.json
echo.
echo Detailed Logs:
echo - devtools/smart_logs_labor.json
echo - devtools/smart_logs_quote.json
echo.
echo Check the AI analysis above for:
echo - Root cause diagnosis
echo - Execution flow analysis
echo - Next steps to fix
echo.
pause

