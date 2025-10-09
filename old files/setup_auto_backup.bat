@echo off
echo ========================================
echo   Setup Automated Backup Scheduler
echo ========================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ This script requires administrator privileges
    echo Please right-click and "Run as administrator"
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo ✅ Running with administrator privileges
echo.

REM Get current directory
set "CURRENT_DIR=%~dp0"
set "BACKUP_SCRIPT=%CURRENT_DIR%auto_backup_scheduler.bat"

REM Check if backup script exists
if not exist "%BACKUP_SCRIPT%" (
    echo ❌ Backup script not found: %BACKUP_SCRIPT%
    echo Please ensure auto_backup_scheduler.bat exists
    pause >nul
    exit /b 1
)

echo 📋 Setting up Windows Task Scheduler job...
echo.

REM Delete existing task if it exists
schtasks /delete /tn "TradeMate_Auto_Backup" /f >nul 2>&1

REM Create new scheduled task (every 2 hours)
schtasks /create ^
    /tn "TradeMate_Auto_Backup" ^
    /tr "\"%BACKUP_SCRIPT%\"" ^
    /sc hourly ^
    /mo 2 ^
    /st 00:00 ^
    /ru "SYSTEM" ^
    /rl highest ^
    /f

if %ERRORLEVEL% EQU 0 (
    echo ✅ Automated backup task created successfully!
    echo.
    echo 📅 Schedule: Every 2 hours, starting at midnight
    echo 📁 Backup location: C:\Users\CGREL\Desktop\SupabaseBackups\
    echo 📝 Log file: C:\Users\CGREL\Desktop\SupabaseBackups\auto_backup.log
    echo.
    echo 🔧 Task details:
    echo   Name: TradeMate_Auto_Backup
    echo   Script: %BACKUP_SCRIPT%
    echo   Frequency: Every 2 hours
    echo   User: SYSTEM (runs even when logged out)
    echo.
    
    REM Show the created task
    echo 📋 Verifying task creation...
    schtasks /query /tn "TradeMate_Auto_Backup" /fo table
    
    echo.
    echo ✅ Setup completed successfully!
    echo.
    echo 💡 You can manage this task in Windows Task Scheduler:
    echo    Start → Task Scheduler → Task Scheduler Library → TradeMate_Auto_Backup
    echo.
    echo 🧪 To test the backup manually, run:
    echo    auto_backup_scheduler.bat
    echo.
    
) else (
    echo ❌ Failed to create scheduled task
    echo Error code: %ERRORLEVEL%
    echo.
    echo Please check:
    echo - Administrator privileges
    echo - Windows Task Scheduler service is running
    echo - Path to backup script is correct
    echo.
)

echo Press any key to exit...
pause >nul
