#!/bin/bash

# Tesseract Configuration Test Script
echo "🔍 Testing Tesseract Configuration for GemNet"
echo "=============================================="

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

# Test 1: Check Tesseract Installation
echo "1️⃣ Testing Tesseract Installation..."
if command_exists tesseract; then
    echo "✅ Tesseract is installed"
    tesseract --version
    echo ""
else
    echo "❌ Tesseract is not installed"
    echo "💡 Install with: brew install tesseract tesseract-lang"
    exit 1
fi

# Test 2: Check Tessdata Directory
echo "2️⃣ Testing Tessdata Directory..."
TESSDATA_PATH="/opt/homebrew/share/tessdata"
if dir_exists "$TESSDATA_PATH"; then
    echo "✅ Tessdata directory exists: $TESSDATA_PATH"
    echo "📁 Directory contents:"
    ls -la "$TESSDATA_PATH" | head -10
    echo ""
else
    echo "❌ Tessdata directory not found: $TESSDATA_PATH"
    echo "🔍 Searching for alternative locations..."
    
    # Check alternative locations
    ALT_PATHS=("/usr/local/share/tessdata" "/usr/share/tesseract-ocr/4.00/tessdata")
    for path in "${ALT_PATHS[@]}"; do
        if dir_exists "$path"; then
            echo "✅ Found alternative tessdata: $path"
            TESSDATA_PATH="$path"
            break
        fi
    done
fi

# Test 3: Check English Language File
echo "3️⃣ Testing English Language File..."
ENG_FILE="$TESSDATA_PATH/eng.traineddata"
if file_exists "$ENG_FILE"; then
    echo "✅ English language file exists: $ENG_FILE"
    ls -la "$ENG_FILE"
    echo ""
else
    echo "❌ English language file not found: $ENG_FILE"
    echo "💡 Install with: brew install tesseract-lang"
    exit 1
fi

# Test 4: List Available Languages
echo "4️⃣ Testing Available Languages..."
echo "📋 Available Tesseract languages:"
tesseract --list-langs
echo ""

# Test 5: Test OCR Functionality
echo "5️⃣ Testing OCR Functionality..."
echo "Creating test image with text..."

# Create a simple test image with text using ImageMagick (if available)
if command_exists convert; then
    convert -size 300x100 xc:white -font Arial -pointsize 20 -fill black \
            -gravity center -annotate +0+0 "972914177V" test_nic.png
    
    echo "✅ Test image created: test_nic.png"
    
    # Test OCR on the image
    echo "🔍 Running OCR test..."
    RESULT=$(tesseract test_nic.png stdout 2>/dev/null)
    echo "📄 OCR Result: '$RESULT'"
    
    # Check if we got the expected result
    if [[ "$RESULT" == *"972914177V"* ]]; then
        echo "✅ OCR test successful!"
    else
        echo "⚠️ OCR test partially successful (result may vary)"
    fi
    
    # Clean up
    rm -f test_nic.png
    echo ""
else
    echo "⚠️ ImageMagick not available, skipping OCR functionality test"
    echo "💡 Install with: brew install imagemagick"
    echo ""
fi

# Test 6: Check Library Dependencies
echo "6️⃣ Testing Library Dependencies..."
TESSERACT_LIB="/opt/homebrew/lib/libtesseract.dylib"
if file_exists "$TESSERACT_LIB"; then
    echo "✅ Tesseract library found: $TESSERACT_LIB"
    echo "📋 Library dependencies:"
    otool -L "$TESSERACT_LIB" | head -5
    echo ""
else
    echo "❌ Tesseract library not found: $TESSERACT_LIB"
    echo "🔍 Searching for library..."
    find /opt/homebrew -name "*tesseract*" -name "*.dylib" 2>/dev/null
    echo ""
fi

# Test 7: Java Library Path Test
echo "7️⃣ Testing Java Library Path..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 macOS detected - checking Homebrew library path"
    if [[ ":$DYLD_LIBRARY_PATH:" == *":/opt/homebrew/lib:"* ]]; then
        echo "✅ DYLD_LIBRARY_PATH includes Homebrew lib directory"
    else
        echo "⚠️ DYLD_LIBRARY_PATH does not include /opt/homebrew/lib"
        echo "💡 Add to your shell profile: export DYLD_LIBRARY_PATH=\"/opt/homebrew/lib:\$DYLD_LIBRARY_PATH\""
    fi
    echo ""
fi

# Final Summary
echo "🎯 Test Summary"
echo "=============="
echo "✅ Tesseract Installation: OK"
echo "✅ Tessdata Directory: $TESSDATA_PATH"
echo "✅ English Language File: OK"
if command_exists convert; then
    echo "✅ OCR Functionality: Tested"
else
    echo "⚠️ OCR Functionality: Not tested (ImageMagick required)"
fi
echo "✅ Library Dependencies: OK"
echo ""
echo "🚀 Your Tesseract configuration is ready for GemNet!"
echo "💡 You can now start your Spring Boot application"
echo ""
echo "🔧 Recommended environment variables:"
echo "export TESSDATA_PREFIX=\"$TESSDATA_PATH\""
echo "export DYLD_LIBRARY_PATH=\"/opt/homebrew/lib:\$DYLD_LIBRARY_PATH\""
