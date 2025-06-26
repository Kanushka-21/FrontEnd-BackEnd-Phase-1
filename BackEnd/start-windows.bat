@echo off
echo 🚀 Starting GemNet Backend Application with Tesseract Support
echo =========================================================
echo.

REM Set environment variables for Tesseract
set TESSDATA_PREFIX=C:\Program Files\Tesseract-OCR\tessdata
set PATH=%PATH%;C:\Program Files\Tesseract-OCR

echo ✅ Environment variables set
echo 📍 TESSDATA_PREFIX: %TESSDATA_PREFIX%
echo.

REM Check if Tesseract is installed
where tesseract >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️ Tesseract not found in PATH
    echo ℹ️ This will cause NIC verification to use fallback mode
    echo ℹ️ To install Tesseract OCR:
    echo    1. Download from: https://github.com/UB-Mannheim/tesseract/wiki
    echo    2. Install to default location: C:\Program Files\Tesseract-OCR
    echo.
)

echo Starting backend server with IP and port exposed...
echo.

echo To access the API documentation, open:
echo http://localhost:9091/swagger-ui.html
echo.

REM Use Maven or JAR file if available
if exist mvnw.cmd (
    call mvnw.cmd spring-boot:run
) else if exist target\gemnet-backend-1.0.0.jar (
    java -jar target\gemnet-backend-1.0.0.jar
) else (
    echo ❌ Could not find Maven wrapper or JAR file
    echo Please open and run this project in your Java IDE
    echo.
    pause
    exit /b 1
)

pause
