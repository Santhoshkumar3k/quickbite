@echo off
title QuickBite Food Delivery Platform
cd /d "%~dp0"

echo ========================================================
echo   QuickBite - Food Delivery and Restaurant Platform
echo   C# .NET 10 Web API + Microsoft SQL Server + React
echo ========================================================
echo.

echo [1/3] Ensuring Microsoft SQL Server (PersonalProjects) is active...
sqllocaldb start PersonalProjects >nul 2>&1

echo [2/3] Checking ports 5004 and 5149...
for /f "tokens=5" %%a in ('netstat -a -n -o ^| findstr :5004 ^| findstr LISTENING') do (
    taskkill /f /pid %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -a -n -o ^| findstr :5149 ^| findstr LISTENING') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo [3/3] Starting QuickBite Backend and UI...
echo  - Live Application: http://localhost:5004
echo  - Swagger API Console: http://localhost:5004/swagger
echo.
echo Browser will automatically open the moment the server is ready...
echo.

:: Silent background monitor that opens browser only after server responds HTTP 200
start "" powershell -WindowStyle Hidden -Command "$w=0; while($w -lt 40){ try { if((Invoke-WebRequest 'http://localhost:5004/api/health' -UseBasicParsing -TimeoutSec 1).StatusCode -eq 200){ Start-Process 'http://localhost:5004'; break; } }catch{} Start-Sleep -Milliseconds 800; $w++ }"

dotnet run --project QuickBite.Api/QuickBite.Api.csproj
