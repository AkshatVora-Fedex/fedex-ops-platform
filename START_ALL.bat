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
start "FedEx Backend API" node server.js

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
start "FedEx Frontend" node node_modules/react-scripts/bin/react-scripts.js start

echo.
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                 ✅ ALL SERVICES STARTED                    ║
echo ╠════════════════════════════════════════════════════════════╣
echo ║  Backend API:    http://localhost:5000                    ║
echo ║  WebSocket:      ws://localhost:5001                      ║
echo ║  Frontend:       http://localhost:3000                    ║
echo ╠════════════════════════════════════════════════════════════╣
echo ║  Dashboard will open automatically in browser             ║
echo ║  Login with: admin / admin123                             ║
echo ║                                                            ║
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
