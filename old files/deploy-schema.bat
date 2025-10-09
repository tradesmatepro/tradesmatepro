@echo off
echo ========================================
echo TradeMate Pro - Master Schema Deployment
echo ========================================
echo.
echo This will deploy the complete master database schema
echo to the new TradesMatePro Supabase project.
echo.
echo Project: cxlqzejzraczumqmsrcx
echo URL: https://cxlqzejzraczumqmsrcx.supabase.co
echo.
pause
echo.
echo Starting deployment...
echo.

node deploy-master-schema.js

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
pause
