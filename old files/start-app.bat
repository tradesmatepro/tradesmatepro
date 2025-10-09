@echo off
echo.
echo ========================================
echo   TradeMate Pro - Starting Web App
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed or not in PATH
    echo Please install Node.js which includes npm
    pause
    exit /b 1
)

echo Node.js and npm are installed ✓
echo.

REM Check if package.json exists
if not exist "package.json" (
    echo ERROR: package.json not found
    echo Make sure you're running this from the project root directory
    pause
    exit /b 1
)

echo Installing dependencies...
npm install

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to install dependencies
    echo Please check the error messages above
    pause
    exit /b 1
)

echo.
echo Dependencies installed successfully ✓
echo.
echo Starting TradeMate Pro development server...
echo.
echo The app will open in your browser at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the development server
npm start

REM If we get here, the server was stopped
echo.
echo Development server stopped.
pause
