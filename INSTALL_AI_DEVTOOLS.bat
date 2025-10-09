@echo off
echo ========================================
echo Installing AI DevTools Dependencies
echo ========================================
echo.
echo This will install:
echo   - ws (WebSocket library)
echo   - @playwright/test (E2E testing)
echo.
echo ========================================
echo.

echo Installing WebSocket library...
call npm install ws
echo.

echo Installing Playwright (optional - for automated testing)...
set /p install_playwright="Install Playwright? (y/n): "
if /i "%install_playwright%"=="y" (
    call npm install --save-dev @playwright/test
    call npx playwright install
    echo.
    echo ✅ Playwright installed!
) else (
    echo ⏭️  Skipping Playwright installation
)

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Next steps:
echo   1. Run: START_AI_DEVTOOLS.bat
echo   2. Tell Claude/GPT-5: "Read devtools/AI_TEAMMATE_GUIDE.md"
echo   3. Let AI teammates help you debug!
echo.
pause

