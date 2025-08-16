@echo off
echo =======================================
echo    GemNet Backend Application Starter
echo =======================================
echo.
echo Starting Spring Boot application...
echo.

REM Change to the backend directory
cd /d "%~dp0"

REM Start the application
mvnw.cmd spring-boot:run

echo.
echo Application stopped.
pause
