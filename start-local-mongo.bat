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
