@echo off
echo ========================================
echo TradeMate Pro - Quote Portal Deployment
echo ========================================
echo.

echo Step 1: Building React app...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)
echo Build complete!
echo.

echo Step 2: Deploying to Vercel...
echo.
echo Please run this command manually:
echo.
echo vercel --prod
echo.
echo Then configure these environment variables in Vercel dashboard:
echo.
echo REACT_APP_SUPABASE_URL=https://cxlqzejzraczumqmsrcx.supabase.co
echo REACT_APP_SUPABASE_ANON_KEY=[from .env file]
echo REACT_APP_PUBLIC_URL=https://www.tradesmatepro.com
echo RESEND_API_KEY=re_a7hbhZUG_8hQoDfPGZsHmgDHUjmgEvt1t
echo.

pause

