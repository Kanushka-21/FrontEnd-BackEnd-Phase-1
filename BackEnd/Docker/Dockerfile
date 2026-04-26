# Use OpenJDK 17 as base image
FROM openjdk:17-jdk-slim

# Set maintainer
LABEL maintainer="GemNet Team <support@gemnet.com>"

# Install system dependencies including Maven
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-eng \
    libopencv-dev \
    maven \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy pom.xml first for better layer caching
COPY pom.xml ./

# Download dependencies (for better caching)
RUN mvn dependency:go-offline -B

# Copy source code
COPY src/ ./src/

# Build the application
RUN mvn clean package -DskipTests

# Create uploads directory
RUN mkdir -p /app/uploads

# Create tessdata directory and download language data
RUN mkdir -p /app/tessdata
RUN cp -r /usr/share/tesseract-ocr/*/tessdata/* /app/tessdata/ || true

# Set environment variables
ENV TESSDATA_PREFIX=/app/tessdata
ENV JAVA_OPTS="-Xms512m -Xmx1024m"

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/api/auth/health || exit 1

# Run the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar target/gemnet-backend-1.0.0.jar"]
