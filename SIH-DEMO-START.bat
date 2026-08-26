@echo off
setlocal
cd /d %~dp0

echo ===============================================
echo  SIH 2026 - Freight Intelligence Demo
echo ===============================================
echo.
echo Starting backend on http://127.0.0.1:8001 ...
start "SIH Backend" cmd /k "cd /d %~dp0backend && if not exist .venv py -m venv .venv && call .venv\Scripts\activate && python -m pip install -r requirements.txt && set PYTHONPATH=%%CD%% && python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8001"

timeout /t 3 /nobreak >nul

echo Starting frontend ...
start "SIH Frontend" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo Backend:  http://127.0.0.1:8001/docs
echo Health:   http://127.0.0.1:8001/health
echo Frontend: http://localhost:5173
echo.
echo Keep both terminal windows open during the demo.
endlocal
