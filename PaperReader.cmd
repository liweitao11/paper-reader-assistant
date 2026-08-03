@echo off
setlocal
cd /d "%~dp0"

echo PaperFlow Launcher
echo ===============================

rem === 1. py launcher ===
where py >nul 2>nul
if not errorlevel 1 (
  py -3 "%~dp0launcher.py"
  exit /b %errorlevel%
)
if exist "%LOCALAPPDATA%\Programs\Python\Launcher\py.exe" (
  "%LOCALAPPDATA%\Programs\Python\Launcher\py.exe" -3 "%~dp0launcher.py"
  exit /b %errorlevel%
)

rem === 2. python.exe ===
for %%V in (314 313 312 311 310 39 38) do (
  if exist "%LOCALAPPDATA%\Programs\Python\Python%%V\python.exe" (
    "%LOCALAPPDATA%\Programs\Python\Python%%V\python.exe" "%~dp0launcher.py"
    exit /b %errorlevel%
  )
)
where python.exe >nul 2>nul
if not errorlevel 1 (
  python.exe "%~dp0launcher.py"
  exit /b %errorlevel%
)

rem === 3. pythonw.exe ===
for %%V in (314 313 312 311 310 39 38) do (
  if exist "%LOCALAPPDATA%\Programs\Python\Python%%V\pythonw.exe" (
    start "" "%LOCALAPPDATA%\Programs\Python\Python%%V\pythonw.exe" "%~dp0Æô¶¯.pyw"
    exit /b 0
  )
)
where pythonw.exe >nul 2>nul
if not errorlevel 1 (
  start "" pythonw.exe "%~dp0Æô¶¯.pyw"
  exit /b 0
)

rem === 4. Program Files ===
for %%V in (314 313 312 311 310 39 38) do (
  if exist "C:\Program Files\Python%%V\python.exe" (
    "C:\Program Files\Python%%V\python.exe" "%~dp0launcher.py"
    exit /b %errorlevel%
  )
)

echo.
echo [ERROR] Python not found.
echo Install Python 3.10+ from https://www.python.org/downloads/
pause
