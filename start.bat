@echo off
REM python Server_start
REM Check if a parameter (port) was provided
if "%~1"=="" (
    set PORT=7000
) else (
    set PORT=%~1
)

start "" http://localhost:7000/index.html

echo Starting server on port %PORT%...
python -m http.server %PORT%
