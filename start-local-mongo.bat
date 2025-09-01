@echo off
echo Starting MongoDB locally...

REM Check if MongoDB is installed
where mongod >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo MongoDB is not installed or not in PATH.
    echo Please install MongoDB or use the cloud version.
    pause
    exit /b
)

REM Create data directory if it doesn't exist
if not exist ".\data\db" mkdir ".\data\db"

REM Start MongoDB in the background
start "MongoDB Server" mongod --dbpath=./data/db

echo MongoDB started locally. Data will be stored in ./data/db
echo.
echo Starting server...
cd server
npm start
echo.
echo Waiting for server to be ready...
echo Checking if server is running...

:wait_loop
echo Checking frontend server...
curl -s http://localhost:3000 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Frontend server is ready!
    goto open_browser
) else (
    echo Frontend server not ready yet, waiting...
    ping -n 3 127.0.0.1 >nul
    goto wait_loop
)

:open_browser
echo Attempting to open in Brave browser...
if exist "C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe" (
    start "" "C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe" "http://localhost:3000"
    echo Website opened in Brave browser!
) else if exist "C:\Program Files (x86)\BraveSoftware\Brave-Browser\Application\brave.exe" (
    start "" "C:\Program Files (x86)\BraveSoftware\Brave-Browser\Application\brave.exe" "http://localhost:3000"
    echo Website opened in Brave browser!
) else if exist "%LOCALAPPDATA%\BraveSoftware\Brave-Browser\Application\brave.exe" (
    start "" "%LOCALAPPDATA%\BraveSoftware\Brave-Browser\Application\brave.exe" "http://localhost:3000"
    echo Website opened in Brave browser!
) else (
    echo Brave browser not found in common locations.
    echo Please open http://localhost:3000 manually in your preferred browser.
    start "" "http://localhost:3000"
)
echo.
echo If the website doesn't load, wait a bit longer and refresh the page.
pause
