@echo off
echo 🚀 ENHANCED SUPABASE SCHEMA DEPLOYER - ALL PHASES
echo.
echo 📋 Deploying Complete FSM System:
echo    Phase 1: Core FSM (Jobber/Housecall Pro level)
echo    Phase 2: Enterprise Features (ServiceTitan level)
echo    Phase 3: Marketplace (Contractor network)
echo    Phase 4: AI/IoT (Future enhancements)
echo.
echo ⚠️  WARNING: This will deploy the complete system!
echo    Only run this if you want all phases deployed.
echo.
set /p confirm="Continue? (y/N): "
if /i not "%confirm%"=="y" (
    echo Deployment cancelled.
    pause
    exit /b
)
echo.
echo 📡 Starting full deployment...
echo.

node deploy-enhanced.js --phase=all

echo.
echo 📊 Full deployment complete! Check logs/ directory for detailed results.
echo 📄 Also check error_logs/latest.json for integration with existing tools.
echo.
pause
