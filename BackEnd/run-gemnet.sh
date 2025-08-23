#!/bin/bash
echo "==================================================="
echo "  Starting GemNet Backend with Fixed Environment"
echo "==================================================="

export JAVA_HOME="C:/Program Files/Java/jdk-17"
export PATH="$JAVA_HOME/bin:$PATH"

echo "Java Version:"
java -version

echo ""
echo "Maven Version:"
./mvnw --version

echo ""
echo "Starting application with Spring Boot..."
./mvnw spring-boot:run -Dspring-boot.run.jvmArguments="-Dserver.port=9091"
