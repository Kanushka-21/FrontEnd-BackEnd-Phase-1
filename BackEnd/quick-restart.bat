@echo off
echo 🔄 Quick Backend Restart with Security Fix...
echo ==========================================

REM Set Java 17 environment
set JAVA_HOME=C:\Program Files\Java\jdk-17
set PATH=%JAVA_HOME%\bin;%PATH%

echo ✅ Using Java 17
java -version

echo.
echo 🔧 Compiling Java sources...
javac -cp "target\classes;target\dependency-jars\*" -d target\classes src\main\java\com\gemnet\config\SecurityConfig.java

if %errorlevel% neq 0 (
    echo ❌ Compilation failed, trying Maven build...
    call mvnw.cmd compile -DskipTests -q
    if %errorlevel% neq 0 (
        echo ❌ Maven compile failed! Using existing JAR...
    )
)

echo.
echo 🚀 Starting GemNet Backend...
java -jar target/gemnet-backend-1.0.0.jar

pause
