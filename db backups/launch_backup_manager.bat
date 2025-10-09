@echo off
echo ========================================
echo   Supabase Backup Manager Launcher
echo ========================================
echo.

REM Change to the script directory
cd /d "%~dp0"

REM Check if Python is installed
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.7+ from python.org
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo ✅ Python found
echo.

REM Check if requirements are installed
echo Checking dependencies...
python -c "import schedule, tkinter" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo 📦 Installing required packages...
    pip install -r requirements.txt
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Failed to install dependencies
        echo Please run: pip install -r requirements.txt
        echo.
        echo Press any key to exit...
        pause >nul
        exit /b 1
    )
    echo ✅ Dependencies installed successfully
) else (
    echo ✅ Dependencies already installed
)

echo.
echo 🚀 Starting Backup Manager GUI...
echo.

REM Launch the Python GUI application
python backup_manager.py

REM If we get here, the app has closed
echo.
echo Backup Manager closed.
echo Press any key to exit...
pause >nul
