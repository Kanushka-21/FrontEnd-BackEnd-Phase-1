@echo off
echo =======================================
echo GemNet MongoDB Database Initialization
echo =======================================
echo.

set MONGO_PATH=C:\Program Files\MongoDB\Server\8.0\bin
set MONGODB_PORT=27017
set MONGODB_DB=gemnet_db

echo Checking if MongoDB is running...
netstat -ano | findstr ":%MONGODB_PORT%" > nul
if %ERRORLEVEL% NEQ 0 (
    echo MongoDB is not running on port %MONGODB_PORT%
    echo Starting MongoDB...
    start "MongoDB" /b "%MONGO_PATH%\mongod.exe" --dbpath="%MONGO_PATH%\..\data" --port=%MONGODB_PORT%
    timeout /t 5 > nul
)

echo Creating initialization script...
echo // MongoDB initialization for GemNet > init_script.js
echo db = db.getSiblingDB('%MONGODB_DB%'); >> init_script.js
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

echo Running initialization script...
"%MONGO_PATH%\mongod.exe" --eval "load('init_script.js')" --quiet

echo.
echo Database initialization completed.
echo.
echo Now starting the GemNet backend...

cd %~dp0
java -jar target\gemnet-backend-1.0.0.jar
