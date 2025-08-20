@echo off
echo =======================================
echo    Manual Backend Startup
echo =======================================
echo.

REM Change to the backend directory
cd /d "%~dp0"

REM Compile Java files manually
echo Compiling Java files...
javac -cp "apache-maven-3.9.10/lib/*;lib/*" -d target/classes src/main/java/com/gemnet/*.java src/main/java/com/gemnet/*/*.java src/main/java/com/gemnet/*/*/*.java

if %errorlevel% neq 0 (
    echo Compilation failed!
    pause
    exit /b 1
)

echo Compilation successful!

REM Start the application
echo Starting application...
java -cp "target/classes;apache-maven-3.9.10/lib/*" com.gemnet.GemNetApplication

echo.
echo Application stopped.
pause
