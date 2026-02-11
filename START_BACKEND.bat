@echo off
REM FedEx Operations Platform - Backend API Server Only
REM Status: PRODUCTION with Real Data Integration
setlocal enabledelayedexpansion

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║  FedEx Operations Platform - Backend API Server           ║
echo ║  Version: 2.0 with Real Data                              ║
echo ║  API Endpoint: http://localhost:5000/api                  ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

REM Set Node path
set PATH=C:\Program Files\nodejs;%PATH%

REM Verify Node is installed
where /q node
if errorlevel 1 (
    echo ❌ ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

REM Change to backend directory
cd /d "%~dp0backend"

echo.
echo Checking dependencies...
if not exist node_modules (
    echo Installing backend dependencies...
    call npm install
) else (
    echo Dependencies already installed
)

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║  Backend Server Startup Information                        ║
echo ╠═══════════════════════════════════════════════════════════╣
echo ║  Status: STARTING                                         ║
echo ║  Data: 57,234 Historical Shipment Records                 ║
echo ║  Alerts: Real Alerts from Historical Data                 ║
echo ║  Endpoints: All real data endpoints enabled               ║
echo ║  Press Ctrl+C to stop the server                          ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

call node server.js

pause
