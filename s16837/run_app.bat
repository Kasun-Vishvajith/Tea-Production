@echo off
setlocal enabledelayedexpansion

echo ========================================================
echo   Tea Intelligence Platform - Setup ^& Launcher
echo ========================================================
echo.

:: --- 1. Check Prerequisites ---
echo [+] Checking for Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH. 
    echo Please install Python from https://www.python.org/
    pause
    exit /b
)

echo [+] Checking for Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH. 
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b
)

:: --- 2. Backend Setup ---
echo.
echo [+] Setting up Python Backend...

if not exist "backend\venv" (
    echo [!] Virtual environment not found. Creating 'backend\venv'...
    python -m venv backend\venv
    echo [!] Installing backend dependencies...
    .\backend\venv\Scripts\python -m pip install --upgrade pip
    .\backend\venv\Scripts\pip install -r backend\requirements.txt
) else (
    echo [OK] Backend virtual environment found.
)

:: --- 3. Frontend Setup ---
echo.
echo [+] Setting up Frontend (Next.js)...

cd frontend
if not exist "node_modules" (
    echo [!] node_modules not found. Running 'npm install'...
    call npm install
) else (
    echo [OK] Frontend dependencies installed.
)

if not exist "out" (
    echo [!] Frontend build (out/) not found. Building...
    call npm run build
) else (
    echo [OK] Frontend build found.
    echo.
    set /p rebuild="[?] Do you want to rebuild the frontend? (y/n, default=n): "
    if "!rebuild!"=="y" (
        echo [!] Rebuilding...
        call npm run build
    )
)
cd ..

:: --- 4. Launch Application ---
echo.
echo ========================================================
echo   Launching Tea Intelligence Platform...
echo   Backend: http://localhost:8000
echo ========================================================
echo.

:: Launch the backend (which also serves the frontend)
.\backend\venv\Scripts\python backend\main.py

pause
