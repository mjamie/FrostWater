@echo off
cd /d "%~dp0"
echo === FrostWater Dev Setup ===
echo.

where pnpm >nul 2>&1
if %ERRORLEVEL% == 0 (
    echo [pnpm found] Installing dependencies...
    pnpm install
    echo.
    echo Starting dev server at http://localhost:3000
    pnpm dev
) else (
    echo [pnpm not found] Using npm instead...
    npm install
    echo.
    echo Starting dev server at http://localhost:3000
    npm run dev
)
pause
