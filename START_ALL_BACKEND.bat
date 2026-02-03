@echo off
REM FedEx Operations Platform - Backend API Server Only (Alternative)
REM Use this if you prefer to start backend in a separate window
REM Status: PRODUCTION with Real Data Integration
setlocal enabledelayedexpansion

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║  FedEx Operations Platform - Backend API Server           ║
echo ║  Version: 2.0 with Real Data                              ║
echo ║  NOTE: WebSocket server is integrated into main server    ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0backend"

echo Starting Main API Server (Port 5000)...
echo - Loading 57,234 historical records
echo - Initializing real data endpoints
echo - Generating alerts from historical data
echo.

start "FedEx Backend API" cmd /k "node server.js"

echo.
echo ✅ Backend API Server started!
echo   API Endpoint: http://localhost:5000/api
echo.
echo Press any key to close this window...
pause > nul
