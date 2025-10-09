@echo off
echo ========================================
echo    Supabase Database Backup Tool
echo ========================================
echo.

REM Get current timestamp
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "TIMESTAMP=%YYYY%%MM%%DD%_%HH%%Min%"

REM Set backup filename
set "BACKUP_FILE=C:\Users\CGREL\Desktop\SupabaseBackups\supabase_backup_%TIMESTAMP%.dump"

echo Starting backup at %date% %time%
echo Backup file: %BACKUP_FILE%
echo.

REM Create backup directory if it doesn't exist
if not exist "C:\Users\CGREL\Desktop\SupabaseBackups" (
    echo Creating backup directory...
    mkdir "C:\Users\CGREL\Desktop\SupabaseBackups"
)

REM Run pg_dump
echo Running pg_dump...
pg_dump --no-owner --no-privileges --format=custom --file="%BACKUP_FILE%" "postgresql://postgres:Alphaecho19!@db.amgtktrwpdsigcomavlg.supabase.co:5432/postgres"

REM Check if backup was successful
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   ✅ BACKUP COMPLETED SUCCESSFULLY!
    echo ========================================
    echo File: %BACKUP_FILE%
    
    REM Get file size
    for %%A in ("%BACKUP_FILE%") do (
        set "size=%%~zA"
        set /a "sizeMB=!size! / 1048576"
    )
    setlocal enabledelayedexpansion
    echo Size: !sizeMB! MB
    echo Time: %date% %time%
    echo.
) else (
    echo.
    echo ========================================
    echo   ❌ BACKUP FAILED!
    echo ========================================
    echo Error code: %ERRORLEVEL%
    echo.
    echo Possible issues:
    echo - pg_dump not installed or not in PATH
    echo - Database connection failed
    echo - Insufficient permissions
    echo.
)

echo Press any key to exit...
pause >nul
