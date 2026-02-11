@echo off
REM FedEx Operations Platform - Backend API Server Only
REM This is an alternative to START_BACKEND.bat - opens in separate window
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

cd /d "%~dp0backend"

echo Checking dependencies...
if not exist node_modules (
    echo Installing backend dependencies...
    call npm install
) else (
    echo Dependencies already installed
)

echo.
echo Starting Main API Server (Port 5000)...
echo - Loading 57,234 historical records
echo - Initializing real data endpoints
echo - Generating alerts from historical data
echo.

start "FedEx Backend API" cmd /k "node server.js"

echo.
echo ✅ Backend API Server started in separate window!
echo    API Endpoint: http://localhost:5000/api
echo.
echo To start the frontend:
echo   1. Open another command prompt
echo   2. Run: START_FRONTEND.bat
echo.
timeout /t 3 /nobreak > nul
