@echo off
echo =========================================
echo GemNet System Connection Fix Script
echo =========================================
echo.
echo This script will:
echo 1. Stop any existing MongoDB process
echo 2. Start MongoDB on port 27017
echo 3. Initialize the database with required collections
echo 4. Start the GemNet backend server on port 9092
echo.

REM Check if running as administrator
net session >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo This script requires administrator privileges.
    echo Please right-click and select "Run as administrator"
    pause
    exit /b 1
)

REM Define paths
set MONGODB_PATH=C:\Program Files\MongoDB\Server\8.0\bin
set MONGOD_CMD="%MONGODB_PATH%\mongod.exe"
set MONGO_DATA_PATH=C:\data\db
set BACKEND_JAR=%~dp0target\gemnet-backend-1.0.0.jar

REM Check if data directory exists, create if not
if not exist "%MONGO_DATA_PATH%" (
    echo Creating MongoDB data directory...
    mkdir "%MONGO_DATA_PATH%"
)

REM Step 1: Stop any existing MongoDB process
echo Stopping any running MongoDB processes...
tasklist /fi "imagename eq mongod.exe" | find "mongod.exe" > nul
if %ERRORLEVEL% EQU 0 (
    taskkill /f /im mongod.exe > nul 2>&1
    echo MongoDB process terminated.
    timeout /t 2 > nul
) else (
    echo No MongoDB process found running.
)

REM Step 2: Start MongoDB on port 27017
echo Starting MongoDB on port 27017...
start "MongoDB" /b %MONGOD_CMD% --dbpath="%MONGO_DATA_PATH%" --port=27017
timeout /t 5 > nul

REM Check if MongoDB started successfully
netstat -ano | findstr ":27017" > nul
if %ERRORLEVEL% NEQ 0 (
    echo Failed to start MongoDB on port 27017.
    echo Please check your MongoDB installation.
    pause
    exit /b 1
) else (
    echo MongoDB started successfully.
)

REM Step 3: Initialize the database
echo Creating database initialization script...
echo // MongoDB initialization for GemNet > init_script.js
echo db = db.getSiblingDB('gemnet_db'); >> init_script.js
echo db.createCollection('users'); >> init_script.js
echo db.createCollection('gem_listings'); >> init_script.js
echo db.users.createIndex({ "email": 1 }, { unique: true }); >> init_script.js
echo db.users.createIndex({ "nicNumber": 1 }, { unique: true }); >> init_script.js
echo. >> init_script.js

echo // Insert sample admin user >> init_script.js
echo db.users.insertOne({ >> init_script.js
echo     firstName: "Admin", >> init_script.js
echo     lastName: "User", >> init_script.js
echo     email: "admin@gemnet.com", >> init_script.js
echo     password: "$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a", >> init_script.js
echo     phoneNumber: "+94771234567", >> init_script.js
echo     address: "Admin Address", >> init_script.js
echo     dateOfBirth: "1990-01-01", >> init_script.js
echo     nicNumber: "123456789V", >> init_script.js
echo     isVerified: true, >> init_script.js
echo     verificationStatus: "VERIFIED", >> init_script.js
echo     roles: ["ADMIN", "USER"], >> init_script.js
echo     isActive: true, >> init_script.js
echo     isLocked: false, >> init_script.js
echo     createdAt: new Date(), >> init_script.js
echo     updatedAt: new Date() >> init_script.js
echo }); >> init_script.js
echo. >> init_script.js

echo // Insert sample gemstone listing >> init_script.js
echo db.gem_listings.insertOne({ >> init_script.js
echo     title: "Blue Sapphire", >> init_script.js
echo     description: "Beautiful blue sapphire from Sri Lanka", >> init_script.js
echo     caratWeight: 2.5, >> init_script.js
echo     color: "Deep Blue", >> init_script.js
echo     clarity: "VS", >> init_script.js
echo     cut: "Oval", >> init_script.js
echo     origin: "Sri Lanka", >> init_script.js
echo     treatment: "Heat Treated", >> init_script.js
echo     certificateNumber: "GEM123456", >> init_script.js
echo     basePrice: 2000, >> init_script.js
echo     currentBid: 2000, >> init_script.js
echo     status: "APPROVED", >> init_script.js
echo     imageUrls: ["IMG_1751571383560_0.jpg"], >> init_script.js
echo     certificateUrl: "certificate1.pdf", >> init_script.js
echo     dimensions: "8x6x4 mm", >> init_script.js
echo     seller: { >> init_script.js
echo         id: "user123", >> init_script.js
echo         firstName: "John", >> init_script.js
echo         lastName: "Doe", >> init_script.js
echo         email: "john@example.com" >> init_script.js
echo     }, >> init_script.js
echo     createdAt: new Date(), >> init_script.js
echo     updatedAt: new Date(), >> init_script.js
echo     expiresAt: new Date(new Date().getTime() + 7*24*60*60*1000) >> init_script.js
echo }); >> init_script.js

echo Initializing database...
echo This may take a moment, please wait...
"%MONGODB_PATH%\mongo.exe" localhost:27017 init_script.js
if %ERRORLEVEL% NEQ 0 (
    echo Failed to initialize database. Trying alternative method...
    "%MONGODB_PATH%\mongosh.exe" localhost:27017 init_script.js
    if %ERRORLEVEL% NEQ 0 (
        echo Database initialization failed, but we will continue.
        echo The application will attempt to initialize the database on startup.
    ) else (
        echo Database initialized successfully with mongosh.
    )
) else (
    echo Database initialized successfully.
)

REM Step 4: Start the GemNet backend server
echo.
echo Starting GemNet backend server on port 9092...
echo.
echo The backend will be available at:
echo http://localhost:9092/
echo.
echo API Health Check: http://localhost:9092/api/auth/health
echo Database Status: http://localhost:9092/api/system/db-status
echo.
echo You can now open the frontend application in your browser.
echo.
echo Press Ctrl+C to stop the server when done.
echo.

java -jar "%BACKEND_JAR%"

exit /b 0
