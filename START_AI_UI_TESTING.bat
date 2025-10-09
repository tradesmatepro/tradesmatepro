@echo off
echo ========================================
echo  TradeMate Pro - AI UI Testing System
echo ========================================
echo.
echo Starting AI DevTools with UI Interaction...
echo.
echo This will start:
echo   1. Main App (port 3004)
echo   2. Error Logging Server (port 4000)
echo   3. AI Command Executor (with UI commands)
echo.
echo AI assistants can now:
echo   - Click buttons in the browser
echo   - Type into forms
echo   - Verify DOM state
echo   - Capture screenshots
echo   - Run complete test scenarios
echo.
echo ========================================
echo.

REM Start all services
start "TradeMate Pro Main App" cmd /k "npm run dev-main"
timeout /t 5 /nobreak >nul

start "Error Logging Server" cmd /k "npm run dev-error-server"
timeout /t 3 /nobreak >nul

start "AI Command Executor" cmd /k "node devtools/commandExecutor.js"

echo.
echo ========================================
echo  All services started!
echo ========================================
echo.
echo Main App: http://localhost:3004
echo Error Server: http://localhost:4000
echo.
echo AI assistants can now write commands to:
echo   devtools/ai_commands.json
echo.
echo And read responses from:
echo   devtools/ai_responses.json
echo.
echo Read the guide:
echo   AIDevTools/UI_INTERACTION_GUIDE.md
echo.
echo ========================================

