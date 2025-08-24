@echo off
echo =================================================
echo   GemNet Backend Startup Script with Java 17
echo =================================================

echo Setting up Java 17 environment...
set JAVA_HOME=C:\Program Files\Java\jdk-17
set PATH=%JAVA_HOME%\bin;%PATH%

echo Checking Java version...
java -version
echo.

echo Cleaning previous build...
call mvnw.cmd clean

echo.
echo Compiling the application...
call mvnw.cmd compile

if %ERRORLEVEL% neq 0 (
    echo ERROR: Compilation failed!
    pause
    exit /b 1
)

echo.
echo Starting the application...
call mvnw.cmd spring-boot:run

pause
