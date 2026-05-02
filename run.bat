@echo off
setlocal enabledelayedexpansion

echo ========================================================
echo   Tea Intelligence Platform - Auto Setup ^& Launcher
echo ========================================================
echo.

:: --- 1. Python Environment ---
echo [+] Checking Python Environment...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH.
    pause
    exit /b
)

if not exist "backend\venv" (
    echo [!] Virtual environment not found. Creating...
    python -m venv backend\venv
)

:: --- 2. Checking/Installing Libraries ---
echo [+] Checking Backend Libraries...
:: A quick way to test if libraries are ready is to try to import FastAPI
.\backend\venv\Scripts\python -c "import fastapi, pandas, catboost, statsmodels, joblib" >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Libraries missing. Installing dependencies...
    :: Upgrade pip slowly is not strictly needed, just install requirements
    .\backend\venv\Scripts\python -m pip install -r backend\requirements.txt -q
    echo [OK] Dependencies installed successfully.
) else (
    echo [OK] All required libraries are already installed.
)

:: --- 3. Run The Website ---
echo.
echo ========================================================
echo   Starting the Website Engine...
echo   (A browser window will open automatically)
echo ========================================================
echo.

:: Launch the backend API which statically serves the frontend and handles requests
.\backend\venv\Scripts\python backend\main.py

pause
