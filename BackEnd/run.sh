#!/bin/bash

# GemNet Backend Start Script
echo "🚀 Starting GemNet Backend Application"
echo "================================================="

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a file exists
file_exists() {
    test -f "$1"
}

# Function to check if a directory exists
dir_exists() {
    test -d "$1"
}

# System checks
echo "🔍 Performing system checks..."

# Check Java
if command_exists java; then
    JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2)
    echo "✅ Java found: $JAVA_VERSION"
else
    echo "❌ Java not found. Please install Java 17 or higher."
    exit 1
fi

# Check Maven
if command_exists mvn; then
    MVN_VERSION=$(mvn -version 2>&1 | head -n 1 | cut -d' ' -f3)
    echo "✅ Maven found: $MVN_VERSION"
else
    echo "❌ Maven not found. Please install Maven."
    exit 1
fi

# Check Tesseract
if command_exists tesseract; then
    TESSERACT_VERSION=$(tesseract --version 2>&1 | head -n 1)
    echo "✅ Tesseract found: $TESSERACT_VERSION"
    
    # Check tessdata directory
    TESSDATA_PATHS=("/opt/homebrew/share/tessdata" "/usr/local/share/tessdata" "/usr/share/tesseract-ocr/4.00/tessdata")
    TESSDATA_FOUND=false
    
    for path in "${TESSDATA_PATHS[@]}"; do
        if dir_exists "$path"; then
            echo "✅ Tessdata directory found: $path"
            
            # Check for English language file
            if file_exists "$path/eng.traineddata"; then
                echo "✅ English language file found: $path/eng.traineddata"
                export TESSDATA_PREFIX="$path"
                TESSDATA_FOUND=true
                break
            else
                echo "⚠️ English language file not found in: $path"
            fi
        fi
    done
    
    if [ "$TESSDATA_FOUND" = false ]; then
        echo "⚠️ No valid tessdata directory found. OCR will use fallback method."
    fi
    
    # List available languages
    echo "📋 Available Tesseract languages:"
    tesseract --list-langs 2>/dev/null | head -10
    
else
    echo "⚠️ Tesseract not found."
    echo "💡 To install Tesseract on macOS: brew install tesseract tesseract-lang"
    echo "💡 To install Tesseract on Ubuntu: sudo apt install tesseract-ocr"
    echo "🔄 OCR functionality will use fallback method."
fi

# Check MongoDB
if command_exists mongod; then
    echo "✅ MongoDB found"
elif command_exists mongo; then
    echo "✅ MongoDB client found"
else
    echo "⚠️ MongoDB not found locally. Make sure MongoDB is running."
    echo "💡 To install MongoDB on macOS: brew install mongodb-community"
    echo "💡 To start MongoDB: brew services start mongodb-community"
fi

# Set environment variables
echo "🔧 Setting up environment variables..."

# Java library path for macOS Homebrew
if [[ "$OSTYPE" == "darwin"* ]]; then
    export DYLD_LIBRARY_PATH="/opt/homebrew/lib:/usr/local/lib:$DYLD_LIBRARY_PATH"
    export JAVA_LIBRARY_PATH="/opt/homebrew/lib:/usr/local/lib:$JAVA_LIBRARY_PATH"
    echo "✅ macOS library paths configured"
    echo "   • DYLD_LIBRARY_PATH: $DYLD_LIBRARY_PATH"
fi

# Tesseract environment variables
if [ ! -z "$TESSDATA_PREFIX" ]; then
    export TESSDATA_PREFIX="$TESSDATA_PREFIX"
    echo "✅ TESSDATA_PREFIX set to: $TESSDATA_PREFIX"
fi

# JNA library path for Java Native Access
export JNA_LIBRARY_PATH="/opt/homebrew/lib:/usr/local/lib:/usr/lib"
echo "✅ JNA_LIBRARY_PATH set to: $JNA_LIBRARY_PATH"

# Build and run application
echo "🔨 Building application..."
mvn clean compile -q

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

echo "🚀 Starting application..."
echo "================================================="
echo "📍 Server will be available at: http://localhost:9091"
echo "📚 API Documentation: http://localhost:9091/swagger-ui.html"
echo "🔧 Service Status: http://localhost:9091/api/test/service-status"
echo "📊 Health Check: http://localhost:9091/api/auth/health"
echo "================================================="

# Prepare JVM arguments
JVM_ARGS="-Djava.library.path=/opt/homebrew/lib:/usr/local/lib:/usr/lib"
JVM_ARGS="$JVM_ARGS -Djna.library.path=/opt/homebrew/lib:/usr/local/lib:/usr/lib"
JVM_ARGS="$JVM_ARGS -DTESSDATA_PREFIX=$TESSDATA_PREFIX"
JVM_ARGS="$JVM_ARGS -Djava.awt.headless=true"
JVM_ARGS="$JVM_ARGS -Xmx2g -Xms512m"

echo "🎛️ JVM Arguments: $JVM_ARGS"
echo "================================================="

# Run the application with optimized JVM settings
mvn spring-boot:run \
    -Dspring-boot.run.jvmArguments="$JVM_ARGS" \
    -Dspring-boot.run.profiles=dev \
    -q
