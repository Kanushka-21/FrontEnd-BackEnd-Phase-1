@echo off
echo Starting Backend with Enhanced Video Response...
echo ================================================

REM Set Java 17
set JAVA_HOME=C:\Program Files\Java\jdk-17
set PATH=%JAVA_HOME%\bin;%PATH%

echo Using Java:
java -version

echo.
echo Building with Maven...
call mvnw.cmd clean package -DskipTests

if %errorlevel% neq 0 (
    echo Build failed!
    pause
    exit /b 1
)

echo.
echo Starting Enhanced Backend...
java -jar target/gemnet-backend-1.0.0.jar