@echo off
title OBS PRO REMOTE - Local Server
echo ========================================================
echo       OBS PRO REMOTE - Windows Local Server
echo ========================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed on this computer!
    echo Please download and install Node.js from: https://nodejs.org
    echo.
    pause
    exit /b
)

echo [1/2] Checking dependencies...
if not exist node_modules (
    echo Installing npm dependencies...
    call npm install --legacy-peer-deps
)

echo [2/2] Starting OBS PRO REMOTE server...
echo.
echo ========================================================
echo  Open Safari on your iPhone and visit:
echo  http://localhost:3000  (or your PC's IP, e.g. http://192.168.1.43:3000)
echo ========================================================
echo.
call npm run dev
pause
