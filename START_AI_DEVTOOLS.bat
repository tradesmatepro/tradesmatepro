@echo off
echo ========================================
echo Starting TradeMate Pro with AI DevTools
echo ========================================
echo.
echo This will start:
echo   1. Main app on port 3004
echo   2. Error logging server on port 4000
echo   3. WebSocket server on port 4001
echo   4. AI Command Executor
echo.
echo AI Teammates (Claude/GPT-5) can now:
echo   - Read logs from logs.md
echo   - Send commands via devtools/ai_commands.json
echo   - Read responses from devtools/ai_responses.json
echo.
echo Press Ctrl+C to stop all servers
echo ========================================
echo.

REM Start all servers using concurrently
start "AI Command Executor" cmd /k "node devtools/commandExecutor.js"
timeout /t 2 /nobreak > nul
npm run dev-all

