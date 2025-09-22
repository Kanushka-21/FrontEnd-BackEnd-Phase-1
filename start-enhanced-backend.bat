@echo off
echo Starting GemNet Backend (Enhanced Video Response)...
echo =================================================

cd /d "C:\Users\ASUS\OneDrive\Desktop\frontend+backend-phase 1\FrontEnd-BackEnd-Phase-1\BackEnd"
set JAVA_HOME=C:\Program Files\Java\jdk-17
set PATH=%JAVA_HOME%\bin;%PATH%

echo Using Java:
java -version

echo.
echo Starting Spring Boot application...
call mvnw.cmd spring-boot:run -Dserver.port=9092

pause