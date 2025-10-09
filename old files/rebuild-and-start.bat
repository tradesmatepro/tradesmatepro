@echo off
REM ========================================
REM Full Rebuild and Start
REM ========================================
REM Clears all caches and rebuilds from scratch
REM ========================================

echo.
echo ========================================
echo FULL REBUILD - CLEARING ALL CACHES
echo ========================================
echo.

echo Step 1: Deleting node_modules/.cache...
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo ✅ Deleted node_modules/.cache
) else (
    echo ⚠️ node_modules/.cache not found
)

echo.
echo Step 2: Deleting build directory...
if exist "build" (
    rmdir /s /q "build"
    echo ✅ Deleted build directory
) else (
    echo ⚠️ build directory not found
)

echo.
echo Step 3: Starting development server...
echo.
npm start

pause

