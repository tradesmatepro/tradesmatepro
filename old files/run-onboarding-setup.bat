@echo off
echo =========================================
echo TRADEMATE PRO ONBOARDING SETUP
echo =========================================
echo.
echo Setting up onboarding infrastructure...
echo.

node -e "const { Client } = require('pg'); const fs = require('fs'); require('dotenv').config(); async function runOnboardingSetup() { const client = new Client({ host: process.env.SUPABASE_DB_HOST, port: process.env.SUPABASE_DB_PORT, database: process.env.SUPABASE_DB_NAME, user: process.env.SUPABASE_DB_USER, password: process.env.SUPABASE_DB_PASSWORD, ssl: { rejectUnauthorized: false } }); try { console.log('🔌 Connecting to database...'); await client.connect(); console.log('✅ Connected successfully'); console.log('📄 Reading SQL file...'); const sql = fs.readFileSync('onboarding-infrastructure.sql', 'utf8'); console.log('🚀 Executing onboarding infrastructure setup...'); await client.query(sql); console.log('✅ Onboarding infrastructure setup complete!'); console.log(''); console.log('📋 Setup includes:'); console.log('   • Onboarding progress tracking'); console.log('   • Step validation functions'); console.log('   • Sample data seeding functions'); console.log('   • Progress management functions'); console.log(''); console.log('🎉 Ready to launch onboarding wizard!'); } catch (error) { console.error('❌ Error setting up onboarding infrastructure:', error.message); process.exit(1); } finally { await client.end(); } } runOnboardingSetup();"

echo.
echo =========================================
echo ONBOARDING SETUP COMPLETE
echo =========================================
pause
