@echo off
REM ========================================
REM   Automated Backup Scheduler
REM   Runs every 2 hours via Task Scheduler
REM ========================================

REM Get current timestamp
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "TIMESTAMP=%YYYY%%MM%%DD%_%HH%%Min%"

REM Set backup filename with "auto" prefix
set "BACKUP_DIR=C:\Users\CGREL\Desktop\SupabaseBackups"
set "BACKUP_FILE=%BACKUP_DIR%\auto_backup_%TIMESTAMP%.dump"

REM Create backup directory if it doesn't exist
if not exist "%BACKUP_DIR%" (
    mkdir "%BACKUP_DIR%"
)

REM Log file for automated backups
set "LOG_FILE=%BACKUP_DIR%\auto_backup.log"

REM Log start
echo [%date% %time%] Starting automated backup >> "%LOG_FILE%"

REM Run pg_dump
pg_dump --no-owner --no-privileges --format=custom --file="%BACKUP_FILE%" "postgresql://postgres:Alphaecho19!@db.amgtktrwpdsigcomavlg.supabase.co:5432/postgres" 2>>"%LOG_FILE%"

REM Check if backup was successful
if %ERRORLEVEL% EQU 0 (
    REM Get file size
    for %%A in ("%BACKUP_FILE%") do set "size=%%~zA"
    set /a "sizeMB=%size% / 1048576"
    
    echo [%date% %time%] ✅ Automated backup completed successfully >> "%LOG_FILE%"
    echo [%date% %time%] File: %BACKUP_FILE% >> "%LOG_FILE%"
    echo [%date% %time%] Size: %sizeMB% MB >> "%LOG_FILE%"
    
    REM Clean up old backups (keep last 24 = 48 hours worth)
    forfiles /p "%BACKUP_DIR%" /m "auto_backup_*.dump" /d -2 /c "cmd /c del @path" 2>nul
    
) else (
    echo [%date% %time%] ❌ Automated backup failed with error code %ERRORLEVEL% >> "%LOG_FILE%"
)

echo [%date% %time%] Automated backup process completed >> "%LOG_FILE%"
echo. >> "%LOG_FILE%"
