@echo off
echo 🚀 Starting GemNet Backend Application
echo =====================================
echo.

REM Check if Java is installed
java -version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Java is not installed or not in PATH
    echo Please install Java JDK 17 or higher
    pause
    exit /b 1
)

REM Check if the JAR file exists
set JAR_FILE=target\gemnet-backend-1.0.0.jar
if not exist %JAR_FILE% (
    echo ❌ JAR file not found: %JAR_FILE%
    echo Please build the project first using: mvn clean package
    pause
    exit /b 1
)

echo ✅ Java is installed and JAR file exists
echo Starting application on port 9091...
echo.

java -jar %JAR_FILE%
pause
