@echo off
REM FedEx Operations Platform - Frontend React App Only
REM Status: PRODUCTION with Real Data Display
setlocal enabledelayedexpansion

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║  FedEx Operations Platform - Frontend React App           ║
echo ║  Version: 2.0 with Real Data Integration                  ║
echo ║  Application: http://localhost:3000                       ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

REM Set Node path
set PATH=C:\Program Files\nodejs;%PATH%

REM Change to frontend directory
cd /d "%~dp0frontend"

echo.
echo Checking dependencies...
call npm install --silent

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║  Frontend Server Startup Information                       ║
echo ╠═══════════════════════════════════════════════════════════╣
echo ║  Status: STARTING                                         ║
echo ║  Features:                                                ║
echo ║  - Real data dashboard with 57,234 shipments              ║
echo ║  - Live alert system (6 real alerts)                      ║
echo ║  - Regional performance analytics                         ║
echo ║  - Advanced shipment search                               ║
echo ║  Opens automatically in your default browser              ║
echo ║  Press Ctrl+C to stop the server                          ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

call npm start

pause
