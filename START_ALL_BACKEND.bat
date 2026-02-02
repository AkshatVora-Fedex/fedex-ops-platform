@echo off
echo Starting FedEx Operations Platform - Backend Services
echo.

cd /d "%~dp0backend"

echo Starting Main API Server (Port 5000)...
start "FedEx API Server" cmd /k "npm start"

timeout /t 2 /nobreak > nul

echo Starting WebSocket Server (Port 5001)...
start "FedEx WebSocket Server" cmd /k "node websocket-server.js"

echo.
echo ✅ All backend services started!
echo   - API Server: http://localhost:5000
echo   - WebSocket Server: http://localhost:5001
echo.
pause
