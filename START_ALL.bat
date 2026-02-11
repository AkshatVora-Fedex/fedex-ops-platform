@echo off
REM FedEx Operations Platform - Complete Startup with Real Data
REM Starts Backend API Server + Frontend React App
REM Status: PRODUCTION with 57,234 historical shipment records
setlocal enabledelayedexpansion

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║  FedEx Operations Platform - Complete Startup                ║
echo ║  Version: 2.0 with Real Data Integration                     ║
echo ║  Starting Backend API Server + Frontend React App            ║
echo ╚══════════════════════════════════════════════════════════════╝
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

REM Kill any existing processes on our ports
echo Cleaning up any existing processes on ports 3000 and 5000...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak > nul

REM Start Backend API Server (Port 5000)
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║  [1/2] Starting Backend API Server (Port 5000)...            ║
echo ║  - Loading 57,234 historical shipment records                ║
echo ║  - Generating real alerts from historical data               ║
echo ║  - Initializing real data endpoints                          ║
echo ╚══════════════════════════════════════════════════════════════╝
cd /d "%~dp0backend"
if not exist node_modules (
    echo Installing backend dependencies...
    call npm install
)
start "FedEx Backend API" cmd /k "node server.js"

echo Waiting for backend to initialize (5 seconds)...
timeout /t 5 /nobreak > nul

REM Start Frontend React App (Port 3000)
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║  [2/2] Starting Frontend React App (Port 3000)...            ║
echo ║  - Connecting to real data backend                           ║
echo ║  - Loading dashboard with live metrics                       ║
echo ║  - Ready for operational use                                 ║
echo ╚══════════════════════════════════════════════════════════════╝
cd /d "%~dp0frontend"
if not exist node_modules (
    echo Installing frontend dependencies...
    call npm install
)
start "FedEx Frontend" cmd /k "npm start"

echo.
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                 ✅ ALL SERVICES STARTED                    ║
echo ╠════════════════════════════════════════════════════════════╣
echo ║  Backend API:    http://localhost:5000                    ║
echo ║  Frontend:       http://localhost:3000                    ║
echo ╠════════════════════════════════════════════════════════════╣
echo ║  Dashboard will open automatically in browser             ║
echo ║  Services running in separate windows                     ║
echo ║  Close windows individually to stop services              ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Waiting for services to start... (This may take 30 seconds)
timeout /t 10 /nobreak > nul

REM Open frontend in browser
start http://localhost:3000

echo.
echo ✅ Setup Complete! Check the open windows for any errors.
echo.
pause
