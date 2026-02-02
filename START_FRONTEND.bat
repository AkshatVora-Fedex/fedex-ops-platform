@echo off
REM FedEx Ops Platform - Frontend Startup
setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════╗
echo ║   FedEx Operations Platform - Frontend    ║
echo ║   Starting on http://localhost:3000       ║
echo ╚════════════════════════════════════════════╝
echo.

REM Set Node path
set PATH=C:\Program Files\nodejs;%PATH%

REM Change to frontend directory
cd /d "%~dp0frontend"

echo Installing dependencies...
call npm install

echo.
echo Starting frontend server...
echo This will open automatically in your browser
echo Press Ctrl+C to stop
echo.
call npm start

pause
