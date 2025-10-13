@echo off
echo.
echo ========================================
echo SETUP: Full Auto Testing
echo ========================================
echo.
echo This will install Playwright for browser automation.
echo.
pause

echo.
echo Installing Playwright...
npm install --save-dev playwright

echo.
echo Installing Playwright browsers...
npx playwright install chromium

echo.
echo ========================================
echo SETUP COMPLETE
echo ========================================
echo.
echo You can now run full auto tests with:
echo   devtools\RUN_FULL_AUTO_TEST.bat
echo.
pause

