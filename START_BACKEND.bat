@echo off
REM FedEx Ops Platform - Backend Startup
setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════╗
echo ║   FedEx Operations Platform - Backend     ║
echo ║   Starting on http://localhost:5000       ║
echo ╚════════════════════════════════════════════╝
echo.

REM Set Node path
set PATH=C:\Program Files\nodejs;%PATH%

REM Change to backend directory
cd /d "%~dp0backend"

echo Installing dependencies...
call npm install

echo.
echo Starting backend server...
echo Press Ctrl+C to stop
echo.
call npm run dev

pause
