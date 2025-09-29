@echo off
REM GemNet Configuration Switcher
REM Safely switch between local MongoDB and Atlas without losing configurations

echo 🔧 GemNet Configuration Manager
echo ================================

echo.
echo Current configurations:
if exist "src\main\resources\application.properties" echo ✅ Local MongoDB (application.properties)
if exist "src\main\resources\application-atlas.properties" echo ✅ Atlas Template (application-atlas.properties)
if exist "application-atlas-configured.properties" echo ✅ Atlas Configured (application-atlas-configured.properties)

echo.
echo Select configuration:
echo 1. Use Local MongoDB (current setup)
echo 2. Switch to MongoDB Atlas
echo 3. Create backup of current configuration
echo 4. Restore from backup
echo 5. Exit

choice /c 12345 /m "Choose option"

if %ERRORLEVEL%==1 goto use_local
if %ERRORLEVEL%==2 goto use_atlas  
if %ERRORLEVEL%==3 goto backup
if %ERRORLEVEL%==4 goto restore
if %ERRORLEVEL%==5 goto end

:use_local
echo.
echo 🔄 Switching to Local MongoDB...
if exist "src\main\resources\application.properties.backup" (
    copy "src\main\resources\application.properties.backup" "src\main\resources\application.properties" >nul
    echo ✅ Switched to Local MongoDB configuration
) else (
    echo ℹ️  Already using Local MongoDB configuration
)
goto restart_prompt

:use_atlas
echo.
echo 🔄 Switching to MongoDB Atlas...
if exist "application-atlas-configured.properties" (
    if not exist "src\main\resources\application.properties.backup" (
        copy "src\main\resources\application.properties" "src\main\resources\application.properties.backup" >nul
        echo ✅ Backed up current configuration
    )
    copy "application-atlas-configured.properties" "src\main\resources\application.properties" >nul
    echo ✅ Switched to MongoDB Atlas configuration
    echo ⚠️  Make sure to restart your Spring Boot application
) else (
    echo ❌ Atlas configuration not found. Run migrate-to-atlas.bat first.
)
goto restart_prompt

:backup
echo.
echo 💾 Creating backup...
copy "src\main\resources\application.properties" "src\main\resources\application.properties.backup" >nul
echo ✅ Configuration backed up as application.properties.backup
goto menu

:restore
echo.
echo 🔄 Restoring from backup...
if exist "src\main\resources\application.properties.backup" (
    copy "src\main\resources\application.properties.backup" "src\main\resources\application.properties" >nul
    echo ✅ Configuration restored from backup
) else (
    echo ❌ No backup found
)
goto restart_prompt

:restart_prompt
echo.
echo 📝 Note: If your Spring Boot application is running, you need to restart it
echo    to apply the new database configuration.
echo.
goto menu

:menu
echo.
choice /m "Return to menu"
if %ERRORLEVEL%==1 goto start
goto end

:start
cls
goto begin

:begin
echo 🔧 GemNet Configuration Manager
echo ================================

echo.
echo Current configurations:
if exist "src\main\resources\application.properties" echo ✅ Local MongoDB (application.properties)
if exist "src\main\resources\application-atlas.properties" echo ✅ Atlas Template (application-atlas.properties)
if exist "application-atlas-configured.properties" echo ✅ Atlas Configured (application-atlas-configured.properties)

echo.
echo Select configuration:
echo 1. Use Local MongoDB (current setup)
echo 2. Switch to MongoDB Atlas
echo 3. Create backup of current configuration
echo 4. Restore from backup
echo 5. Exit

choice /c 12345 /m "Choose option"

if %ERRORLEVEL%==1 goto use_local
if %ERRORLEVEL%==2 goto use_atlas  
if %ERRORLEVEL%==3 goto backup
if %ERRORLEVEL%==4 goto restore
if %ERRORLEVEL%==5 goto end

:end
echo.
echo 👋 GemNet Configuration Manager closed
pause