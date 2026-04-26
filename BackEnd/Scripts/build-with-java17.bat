@echo off
echo Setting JAVA_HOME to Java 17...
set JAVA_HOME=C:\Program Files\Java\jdk-17
set PATH=%JAVA_HOME%\bin;%PATH%

echo Checking Java version...
java -version

echo Building with Maven...
mvnw.cmd clean compile package -DskipTests -e

echo Build completed!
pause
