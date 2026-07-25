@echo off
setlocal
cd /d "%~dp0"

where py >nul 2>nul
if not errorlevel 1 goto start_with_py

where python >nul 2>nul
if not errorlevel 1 goto start_with_python

set "BUNDLED_PY=C:\Users\Shankar Kumar\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
if exist "%BUNDLED_PY%" goto start_with_bundled_python

echo Python was not found. Install Python 3, then run this file again.
pause
exit /b 1

:start_with_py
start "Advocate Chamber Server" cmd /k py -3 app.py
goto open_site

:start_with_python
start "Advocate Chamber Server" cmd /k python app.py
goto open_site

:start_with_bundled_python
start "Advocate Chamber Server" cmd /k ""%BUNDLED_PY%" app.py"

:open_site

timeout /t 2 /nobreak >nul
start "" http://127.0.0.1:8000
