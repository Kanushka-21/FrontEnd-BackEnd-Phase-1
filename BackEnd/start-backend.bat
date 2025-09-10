@echo off
echo 🚀 Starting GemNet Backend with Java 17...
echo ========================================

REM Set JAVA_HOME to Java 17
set JAVA_HOME=C:\Program Files\Java\jdk-17
set PATH=%JAVA_HOME%\bin;%PATH%

echo ✅ Using Java 17
java -version

echo.
echo 🔧 Building application with Maven...
call mvnw.cmd clean package -DskipTests

if %errorlevel% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo.
echo 🚀 Starting GemNet Backend on port 9092...
echo Press Ctrl+C to stop the server
echo.
echo Available endpoints after startup:
echo   - Health Check: http://localhost:9092/api/auth/health
echo   - API Documentation: http://localhost:9092/swagger-ui.html
echo   - Admin Interface: http://localhost:3006 (run frontend separately)
echo.

java -jar target/gemnet-backend-1.0.0.jar

pause
