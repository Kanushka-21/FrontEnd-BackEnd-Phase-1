@echo off
setlocal EnableDelayedExpansion

echo ====================================
echo GemNet Backend - Full Diagnostic Run
echo ====================================
echo.

REM Check if Java is installed
echo Checking Java installation...
java -version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Java not found. Please install Java JDK 17 or higher.
    goto :error
) else (
    for /f "tokens=3" %%g in ('java -version 2^>^&1 ^| findstr /i "version"') do (
        set JAVA_VERSION=%%g
    )
    echo [OK] Java installed: !JAVA_VERSION!
)

REM Check MongoDB service
echo Checking MongoDB service...
sc query MongoDB >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] MongoDB service not found or not accessible.
    echo Please make sure MongoDB is installed and running.
) else (
    echo [OK] MongoDB service exists.
    
    REM Check if MongoDB is running
    for /f "tokens=4" %%g in ('sc query MongoDB ^| findstr STATE') do (
        set STATE=%%g
    )
    if "!STATE!"=="RUNNING" (
        echo [OK] MongoDB service is running.
    ) else (
        echo [ERROR] MongoDB service is not running.
        echo Starting MongoDB service...
        net start MongoDB >nul 2>&1
        if %ERRORLEVEL% NEQ 0 (
            echo [ERROR] Failed to start MongoDB service.
            goto :error
        ) else (
            echo [OK] MongoDB service started successfully.
        )
    )
)

REM Test MongoDB connection
echo Testing MongoDB connection on port 27017...
netstat -ano | findstr 27017 >nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] No service found listening on port 27017.
    echo Make sure MongoDB is properly configured.
) else (
    echo [OK] Service detected on MongoDB port 27017.
)

REM Check for Tesseract OCR
echo Checking Tesseract OCR installation...
where tesseract >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Tesseract OCR not found in PATH.
    echo NIC verification will use fallback mode.
    echo To install Tesseract OCR:
    echo 1. Download from: https://github.com/UB-Mannheim/tesseract/wiki
    echo 2. Install to default location: C:\Program Files\Tesseract-OCR
) else (
    echo [OK] Tesseract OCR is installed.
    for /f "tokens=1,2" %%g in ('tesseract -v ^| findstr /i "tesseract"') do (
        echo [INFO] Tesseract version: %%h
    )
    
    REM Check Tesseract data path
    if exist "C:\Program Files\Tesseract-OCR\tessdata" (
        echo [OK] Tesseract data directory exists.
    ) else (
        echo [WARNING] Tesseract data directory not found at expected location.
        echo Please make sure tessdata is properly installed.
    )
)

REM Create required folders if they don't exist
echo Checking required directories...
if not exist uploads mkdir uploads
if not exist uploads\face-images mkdir uploads\face-images
if not exist uploads\nic-images mkdir uploads\nic-images
if not exist uploads\extracted-photos mkdir uploads\extracted-photos
echo [OK] Required directories verified.

REM Check if backend can be started
echo Checking if backend can be started...
set JAR_FILE=target\gemnet-backend-1.0.0.jar

if exist %JAR_FILE% (
    echo [OK] JAR file found at %JAR_FILE%
    echo Ready to start backend using: java -jar %JAR_FILE%
) else (
    echo [INFO] JAR file not found. Will try to use Maven or direct execution.
    if exist "src\main\java\com\gemnet\GemNetApplication.java" (
        echo [OK] Main application class found.
    ) else (
        echo [ERROR] Cannot locate main application class.
        goto :error
    )
)

echo.
echo ======================================
echo All checks completed. Choose an option:
echo ======================================
echo 1. Start the backend server
echo 2. Test MongoDB connection
echo 3. Open API test page in browser
echo 4. Exit
echo.

set /p CHOICE="Enter your choice (1-4): "

if "%CHOICE%"=="1" (
    echo Starting GemNet backend server...
    
    if exist %JAR_FILE% (
        start "GemNet Backend" java -jar %JAR_FILE%
    ) else if exist "mvnw.cmd" (
        start "GemNet Backend" mvnw.cmd spring-boot:run
    ) else (
        echo [ERROR] Cannot find suitable method to start the backend.
        echo Please start the application using your IDE or with Maven directly.
        goto :error
    )
    
    echo The backend server should now be starting...
    echo If successful, you can access:
    echo - API health check: http://localhost:9091/api/auth/health
    echo - API documentation: http://localhost:9091/swagger-ui.html
    
    REM Wait for service to start
    echo.
    echo Waiting for server to start (30 seconds)...
    timeout /t 30 /nobreak >nul
    
    REM Test if server is responding
    echo Testing if service is running...
    curl -s -o nul -w "%%{http_code}" http://localhost:9091/api/auth/health >temp_status.txt
    set /p STATUS=<temp_status.txt
    del temp_status.txt
    
    if "!STATUS!"=="200" (
        echo [OK] Backend server is running and responding!
        start "" "http://localhost:9091/swagger-ui.html"
    ) else (
        echo [WARNING] Backend server may not be running properly.
        echo Status code: !STATUS!
    )
    
) else if "%CHOICE%"=="2" (
    echo Starting MongoDB connection test...
    powershell -File check-mongodb.ps1
) else if "%CHOICE%"=="3" (
    echo Opening API test page in browser...
    start "" "file://%CD%\face-verification-test.html"
) else (
    echo Exiting...
)

goto :eof

:error
echo.
echo Error occurred during diagnostic check.
pause
exit /b 1
