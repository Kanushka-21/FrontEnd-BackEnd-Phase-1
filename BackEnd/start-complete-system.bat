@echo off
echo ===================================
echo GemNet System Startup
echo ===================================
echo.

REM Set paths
set MONGODB_PATH=C:\Program Files\MongoDB\Server\8.0\bin
set BACKEND_PATH=%~dp0
set JAR_FILE=%BACKEND_PATH%target\gemnet-backend-1.0.0.jar

echo Checking if MongoDB is running...
netstat -ano | findstr "27017" > nul
if %ERRORLEVEL% EQU 0 (
    echo MongoDB is already running on port 27017
) else (
    echo Starting MongoDB Server...
    start "MongoDB" /b "%MONGODB_PATH%\mongod.exe" --dbpath="%MONGODB_PATH%\..\data" --port=27017
    
    echo Waiting for MongoDB to initialize...
    timeout /t 5 > nul
    
    echo Checking MongoDB connection...
    "%MONGODB_PATH%\mongo.exe" --eval "db.version()" > nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo Failed to connect to MongoDB. Please check MongoDB installation.
        goto :error
    )
    
    echo MongoDB started successfully
)

echo.
echo Checking for JAR file...
if not exist "%JAR_FILE%" (
    echo ERROR: Backend JAR file not found: %JAR_FILE%
    echo Please build the project first using: mvn clean package
    goto :error
)

echo.
echo Starting GemNet Backend...
echo Backend will be available at http://localhost:9092/
echo.
echo Press Ctrl+C to stop the server when done

java -jar "%JAR_FILE%"
goto :end

:error
echo.
echo Error starting GemNet system
echo Please check the error messages above
pause
exit /b 1

:end
pause
exit /b 0
