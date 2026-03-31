@echo off
setlocal
title Ceylon Tea Intelligence Control Center

:: Navigate to the directory where the script is located
cd /d "%~dp0"

echo.
echo ============================================================
echo   CEYLON TEA INTELLIGENCE - STARTUP SCRIPT
echo ============================================================
echo.

:: Check for node_modules
if not exist "node_modules\" (
    echo [!] node_modules not found. Installing dependencies...
    call npm install
)

:: Start Backend in a new terminal window
echo [^>] Starting Backend Engine (FastAPI) on port 8000...
start "CTI_BACKEND" cmd /k "echo Starting Backend... && uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000"

:: Start Frontend in a new terminal window
echo [^>] Starting Frontend Interface (Next.js) on port 3000...
start "CTI_FRONTEND" cmd /k "echo Starting Frontend... && npm run dev"

:: Wait for services to warm up
echo.
echo [^>] Waiting for neural networks to initialize...
echo     (This takes about 10-15 seconds)
echo.
timeout /t 15 /nobreak > nul

:: Open the browser
echo [^>] Launching Dashboard...
start http://localhost:3000

echo.
echo ============================================================
echo   DASHBOARD READY: http://localhost:3000
echo   Maintain both background windows to keep the app live.
echo ============================================================
echo.

pause
