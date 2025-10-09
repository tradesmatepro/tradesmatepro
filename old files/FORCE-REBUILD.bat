@echo off
REM ========================================
REM FORCE REBUILD - Nuclear Option
REM ========================================
REM Kills server, deletes ALL caches, restarts
REM ========================================

echo.
echo ========================================
echo FORCE REBUILD - NUCLEAR OPTION
echo ========================================
echo.

echo Step 1: Killing all Node processes...
taskkill /F /IM node.exe 2>nul
if %errorlevel% == 0 (
    echo ✅ Killed Node processes
    timeout /t 2 /nobreak >nul
) else (
    echo ⚠️ No Node processes found
)

echo.
echo Step 2: Deleting node_modules\.cache...
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo ✅ Deleted node_modules\.cache
) else (
    echo ⚠️ node_modules\.cache not found
)

echo.
echo Step 3: Deleting build directory...
if exist "build" (
    rmdir /s /q "build"
    echo ✅ Deleted build directory
) else (
    echo ⚠️ build directory not found
)

echo.
echo Step 4: Deleting .cache directory...
if exist ".cache" (
    rmdir /s /q ".cache"
    echo ✅ Deleted .cache directory
) else (
    echo ⚠️ .cache directory not found
)

echo.
echo Step 5: Waiting 3 seconds for cleanup...
timeout /t 3 /nobreak >nul

echo.
echo Step 6: Starting development server...
echo.
echo ========================================
echo WATCH FOR THIS MESSAGE IN CONSOLE:
echo 🚀🚀🚀 NEW CODE RUNNING
echo ========================================
echo.

npm start

pause

