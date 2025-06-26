#!/bin/bash

# Diagnose Tesseract Issues for GemNet
echo "🔍 GemNet Tesseract Diagnostics"
echo "==============================="

echo "1️⃣ System Information"
echo "OS: $(uname -a)"
echo "Architecture: $(uname -m)"
echo ""

echo "2️⃣ Java Information"
java -version
echo ""

echo "3️⃣ Tesseract Installation"
if command -v tesseract >/dev/null 2>&1; then
    echo "✅ Tesseract found"
    tesseract --version
    echo ""
    echo "Available languages:"
    tesseract --list-langs
else
    echo "❌ Tesseract not found"
    echo "Install with: brew install tesseract tesseract-lang"
fi
echo ""

echo "4️⃣ Library Files"
LIB_PATHS="/opt/homebrew/lib /usr/local/lib /usr/lib"
for path in $LIB_PATHS; do
    echo "Checking $path:"
    if [ -d "$path" ]; then
        ls -la "$path" | grep tesseract || echo "  No tesseract libraries found"
    else
        echo "  Directory not found"
    fi
done
echo ""

echo "5️⃣ Tessdata Directory"
TESSDATA_PATHS="/opt/homebrew/share/tessdata /usr/local/share/tessdata /usr/share/tesseract-ocr/4.00/tessdata"
for path in $TESSDATA_PATHS; do
    echo "Checking $path:"
    if [ -d "$path" ]; then
        echo "  ✅ Directory exists"
        ls -la "$path" | grep eng.traineddata || echo "  ❌ eng.traineddata not found"
    else
        echo "  ❌ Directory not found"
    fi
done
echo ""

echo "6️⃣ Environment Variables"
echo "DYLD_LIBRARY_PATH: ${DYLD_LIBRARY_PATH:-'not set'}"
echo "TESSDATA_PREFIX: ${TESSDATA_PREFIX:-'not set'}"
echo "JNA_LIBRARY_PATH: ${JNA_LIBRARY_PATH:-'not set'}"
echo "JAVA_LIBRARY_PATH: ${JAVA_LIBRARY_PATH:-'not set'}"
echo ""

echo "7️⃣ Recommended Environment Setup"
echo "Add these to your ~/.zshrc or ~/.bash_profile:"
echo "export DYLD_LIBRARY_PATH=\"/opt/homebrew/lib:\$DYLD_LIBRARY_PATH\""
echo "export TESSDATA_PREFIX=\"/opt/homebrew/share/tessdata\""
echo "export JNA_LIBRARY_PATH=\"/opt/homebrew/lib:/usr/local/lib:/usr/lib\""
echo ""

echo "8️⃣ Quick Test"
if [ -f "/opt/homebrew/lib/libtesseract.dylib" ]; then
    echo "✅ Main library found: /opt/homebrew/lib/libtesseract.dylib"
    echo "Library info:"
    file /opt/homebrew/lib/libtesseract.dylib
    echo "Dependencies:"
    otool -L /opt/homebrew/lib/libtesseract.dylib | head -5
else
    echo "❌ Main library not found: /opt/homebrew/lib/libtesseract.dylib"
fi
echo ""

echo "🎯 Diagnosis Complete"
echo "If issues persist, try:"
echo "1. brew reinstall tesseract tesseract-lang"
echo "2. Set environment variables as shown above"
echo "3. Restart terminal and try again"
