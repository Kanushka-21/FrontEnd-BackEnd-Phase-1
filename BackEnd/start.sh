#!/bin/bash

# Quick Start Script for GemNet - Sets up environment and runs the application
echo "🚀 GemNet Quick Start"
echo "===================="

# Set environment variables for Tesseract
export DYLD_LIBRARY_PATH="/opt/homebrew/lib:/usr/local/lib:$DYLD_LIBRARY_PATH"
export TESSDATA_PREFIX="/opt/homebrew/share/tessdata"
export JNA_LIBRARY_PATH="/opt/homebrew/lib:/usr/local/lib:/usr/lib"

echo "✅ Environment configured"
echo "📍 DYLD_LIBRARY_PATH: $DYLD_LIBRARY_PATH"
echo "📍 TESSDATA_PREFIX: $TESSDATA_PREFIX"
echo "📍 JNA_LIBRARY_PATH: $JNA_LIBRARY_PATH"
echo ""

# Run with Maven directly
mvn spring-boot:run \
    -Dspring-boot.run.jvmArguments="-Djava.library.path=/opt/homebrew/lib:/usr/local/lib -Djna.library.path=/opt/homebrew/lib:/usr/local/lib -DTESSDATA_PREFIX=/opt/homebrew/share/tessdata -Djava.awt.headless=true" \
    -q
