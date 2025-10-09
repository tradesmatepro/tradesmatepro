@echo off
REM ========================================
REM Force Webpack to Reload SettingsService
REM ========================================
REM Touches the file to trigger webpack rebuild
REM ========================================

echo.
echo ========================================
echo FORCE WEBPACK RELOAD
echo ========================================
echo.

echo Step 1: Touching SettingsService.js to trigger rebuild...
copy /b "src\services\SettingsService.js" +,, >nul
echo ✅ File touched - webpack should detect change

echo.
echo Step 2: Wait 5 seconds for webpack to recompile...
timeout /t 5 /nobreak >nul

echo.
echo ✅ Done! Now test in browser:
echo    1. Hard refresh (Ctrl+F5)
echo    2. Go to Quotes -^> Create New Quote
echo    3. Check console for: 🚀🚀🚀 NEW CODE RUNNING
echo.

pause

