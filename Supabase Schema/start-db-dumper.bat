@echo off
echo 🚀 Starting TradeMate Pro Database Schema Dumper...
echo.
echo This will automatically dump your Supabase schema every hour
echo Output: ./supabase schema/latest.json
echo.
echo Press Ctrl+C to stop the dumper
echo.
npm run dev-db-dumper
