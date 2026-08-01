@echo off
REM Setup script for run_agent.py with virtual environment (Windows)

echo.
echo ========================================
echo Setting up Python virtual environment
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python not found. Please install Python from https://python.org
    exit /b 1
)

echo OK: Python found
python --version
echo.

REM Create virtual environment
echo Creating virtual environment...
python -m venv venv

if errorlevel 1 (
    echo Error: Failed to create virtual environment
    exit /b 1
)

echo OK: Virtual environment created
echo.

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

if errorlevel 1 (
    echo Error: Failed to activate virtual environment
    exit /b 1
)

echo OK: Virtual environment activated
echo.

REM Install requirements
echo Installing dependencies...
pip install -q -r requirements.txt

if errorlevel 1 (
    echo Error: Failed to install dependencies
    exit /b 1
)

echo OK: Dependencies installed
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To use run_agent.py:
echo.
echo 1. Activate the virtual environment:
echo    venv\Scripts\activate
echo.
echo 2. Set your API key (PowerShell):
echo    $env:ANTHROPIC_API_KEY='sk-...'
echo.
echo    Or (Command Prompt):
echo    set ANTHROPIC_API_KEY=sk-...
echo.
echo 3. Run the agent:
echo    python run_agent.py
echo.
echo ========================================
echo.
