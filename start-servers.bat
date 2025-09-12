@echo off
echo Starting backend server...
start cmd /k "cd server && npm install && node server.js"
echo Starting frontend server...
start cmd /k "cd drinkmate-main && npm install && npm run dev"
echo Both servers should be starting now.
echo Backend: http://localhost:3000
echo Frontend: http://localhost:3001
echo.
echo Waiting for servers to be ready...
echo Checking if servers are running...

:wait_loop
echo Checking frontend server...
curl -s http://localhost:3001 >nul 2>&1
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
