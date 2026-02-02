@echo off
REM FedEx Ops Platform - Complete Startup
setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║   FedEx Operations Platform - Complete Startup            ║
echo ║   Starting Backend + Frontend + WebSocket                 ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Set Node path
set PATH=C:\Program Files\nodejs;%PATH%

echo Starting Backend API Server (Port 5000)...
cd /d "%~dp0backend"
start "FedEx Backend API" cmd /k "npm start"

timeout /t 3 /nobreak > nul

echo Starting WebSocket Server (Port 5001)...
start "FedEx WebSocket" cmd /k "node websocket-server.js"

timeout /t 2 /nobreak > nul

echo Starting Frontend React App (Port 3000)...
cd /d "%~dp0frontend"
start "FedEx Frontend" cmd /k "npm start"

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                    ✅ ALL SERVICES STARTED                 ║
echo ╠════════════════════════════════════════════════════════════╣
echo ║  Backend API:    http://localhost:5000                    ║
echo ║  WebSocket:      ws://localhost:5001                      ║
echo ║  Frontend:       http://localhost:3000                    ║
echo ╠════════════════════════════════════════════════════════════╣
echo ║  The frontend will open in your browser automatically     ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
pause
