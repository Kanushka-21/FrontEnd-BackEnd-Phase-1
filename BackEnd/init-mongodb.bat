@echo off
echo ==================================
echo MongoDB Initialization for GemNet
echo ==================================
echo.

REM Check if MongoDB service is running
echo Checking MongoDB service status...
sc query MongoDB | findstr STATE | findstr RUNNING >nul
if %ERRORLEVEL% NEQ 0 (
    echo MongoDB service is not running.
    echo Attempting to start MongoDB service...
    
    net start MongoDB >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo Failed to start MongoDB service.
        echo Make sure MongoDB is properly installed.
        goto :error
    else
        echo MongoDB service started successfully.
    )
) else (
    echo MongoDB service is already running.
)

REM Check if mongosh is available (MongoDB 5.0+)
where mongosh >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set MONGO_SHELL=mongosh
    goto :use_shell
)

REM Check if mongo is available (older MongoDB)
where mongo >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set MONGO_SHELL=mongo
    goto :use_shell
)

echo Neither mongosh nor mongo CLI tools found.
echo Will attempt direct database initialization without CLI tools.
goto :no_shell

:use_shell
echo Using %MONGO_SHELL% to initialize database...

REM Create collections and indexes
%MONGO_SHELL% localhost:27017/gemnet_db --eval "db.createCollection('users'); db.users.createIndex({email: 1}, {unique: true}); db.users.createIndex({nicNumber: 1}, {unique: true}); db.users.createIndex({verificationStatus: 1}); print('Database initialized successfully.');"

if %ERRORLEVEL% NEQ 0 (
    echo Error occurred while initializing the database.
    goto :error
) else (
    echo Database initialization completed.
    goto :success
)

:no_shell
echo Creating database without MongoDB CLI tools.
echo Note: This is a limited initialization.

REM Check if port 27017 is listening
netstat -ano | findstr 27017 >nul
if %ERRORLEVEL% NEQ 0 (
    echo MongoDB does not appear to be listening on port 27017.
    echo Please check your MongoDB installation.
    goto :error
)

echo MongoDB detected on port 27017.
echo You will need to manually initialize the database collections.
echo Use the mongo-init.js script with the MongoDB shell.

echo Example:
echo mongosh localhost:27017/gemnet_db mongo-init.js

:success
echo.
echo ===========================================
echo MongoDB should now be ready for use by GemNet.
echo You can now start the GemNet backend application.
echo ===========================================

echo.
pause
exit /b 0

:error
echo.
echo Database initialization failed.
echo Please check MongoDB installation and configuration.
echo.
pause
exit /b 1
