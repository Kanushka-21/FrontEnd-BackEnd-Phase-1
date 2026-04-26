@echo off
echo ========================================
echo Tesseract OCR Installation Verification
echo ========================================
echo.

REM Check if Tesseract executable exists
where tesseract >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Tesseract executable found in PATH
    
    REM Get Tesseract version
    echo.
    echo Tesseract version:
    tesseract --version
) else (
    echo [ERROR] Tesseract not found in PATH
    echo.
    echo Please make sure Tesseract is installed and added to your PATH:
    echo 1. Install from: https://github.com/UB-Mannheim/tesseract/wiki
    echo 2. Add C:\Program Files\Tesseract-OCR to your PATH environment variable
)

echo.
echo Checking Tesseract data directory...

REM Check tessdata directory
set TESSDATA_PATH=C:\Program Files\Tesseract-OCR\tessdata
if exist "%TESSDATA_PATH%" (
    echo [OK] Tessdata directory found at: %TESSDATA_PATH%
    
    REM Check for English language file
    if exist "%TESSDATA_PATH%\eng.traineddata" (
        echo [OK] English language file found
    ) else (
        echo [ERROR] English language file not found
        echo Please make sure you selected language data during installation
    )
) else (
    echo [ERROR] Tessdata directory not found at: %TESSDATA_PATH%
    echo This will cause OCR functionality to fail
)

echo.
echo Checking for GemNet application integration...

REM Check application.properties file for proper Tesseract configuration
set APP_PROPS_PATH=src\main\resources\application.properties
if exist "%APP_PROPS_PATH%" (
    echo [INFO] Checking configuration in application.properties...
    findstr "tesseract.datapath" "%APP_PROPS_PATH%" >nul
    if %ERRORLEVEL% EQU 0 (
        echo [OK] Tesseract configuration found in application.properties
    ) else (
        echo [WARNING] Tesseract configuration may be missing in application.properties
    )
) else (
    echo [WARNING] application.properties not found at expected location
)

echo.
echo ========================================
echo Verification Complete
echo ========================================
echo.
echo If all checks passed, Tesseract OCR should be properly installed
echo and configured for use with GemNet application.
echo.
echo Press any key to exit...
pause >nul
