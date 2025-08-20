@echo off
echo =======================================
echo    Quick Backend Recovery Script
echo =======================================
echo.

REM Check if Java is available
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Java is not installed or not in PATH
    pause
    exit /b 1
)

REM Change to the backend directory
cd /d "%~dp0"

echo Attempting to start backend with available resources...

REM Try method 1: Use existing compiled classes if available
if exist "target\classes\com\gemnet\GemNetApplication.class" (
    echo Method 1: Using compiled classes...
    REM This would need proper classpath with all Spring Boot dependencies
    echo Compiled classes found but need dependency JARs
)

REM Try method 2: Download minimal Maven
echo.
echo Method 2: Attempting to download Maven...
if not exist "maven-minimal" (
    mkdir maven-minimal
    echo Downloading Maven... This may take a moment...
    powershell -Command "& {try {Invoke-WebRequest -Uri 'https://archive.apache.org/dist/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.zip' -OutFile 'maven-minimal\maven.zip' -ErrorAction Stop; Expand-Archive -Path 'maven-minimal\maven.zip' -DestinationPath 'maven-minimal' -ErrorAction Stop; echo 'Maven downloaded successfully'} catch {echo 'Download failed - check internet connection'}}"
)

if exist "maven-minimal\apache-maven-3.9.6\bin\mvn.cmd" (
    echo Starting backend with Maven...
    set "MAVEN_HOME=%CD%\maven-minimal\apache-maven-3.9.6"
    set "PATH=%MAVEN_HOME%\bin;%PATH%"
    mvn.cmd spring-boot:run
) else (
    echo.
    echo =======================================
    echo    MANUAL SETUP REQUIRED
    echo =======================================
    echo.
    echo The backend cannot start automatically.
    echo Please do one of the following:
    echo.
    echo Option 1: Use your IDE (IntelliJ IDEA, Eclipse, VS Code with Java extension)
    echo   - Open the BackEnd folder as a project
    echo   - Run GemNetApplication.java as a Spring Boot application
    echo.
    echo Option 2: Install Maven manually
    echo   - Download Maven from https://maven.apache.org/download.cgi
    echo   - Extract it and add to PATH
    echo   - Run: mvn spring-boot:run
    echo.
    echo Option 3: Use command line with Java directly
    echo   - Requires downloading Spring Boot dependencies
    echo.
    echo The backend must run on port 9092 for the frontend to work.
    echo.
)

pause
