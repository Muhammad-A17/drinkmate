@echo off
echo Starting backend server...
start cmd /k "cd server && npm install && node server.js"
echo Starting frontend server...
start cmd /k "npm install && npm run dev"
echo Both servers should be starting now.
echo Backend: http://localhost:3000
echo Frontend: http://localhost:3001
