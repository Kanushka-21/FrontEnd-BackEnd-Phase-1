# Quick Tesseract verification script
Write-Host "🔍 Quick Tesseract verification" -ForegroundColor Cyan

# Check if Tesseract executable exists
$tesseractPath = "C:\Program Files\Tesseract-OCR\tesseract.exe"
if (Test-Path -Path $tesseractPath) {
    Write-Host "✅ Tesseract executable found at: $tesseractPath" -ForegroundColor Green
    
    # Try to get version
    try {
        $tesseractVersion = & $tesseractPath --version 2>&1
        Write-Host "✅ Tesseract version info:" -ForegroundColor Green
        Write-Host $tesseractVersion -ForegroundColor White
    }
    catch {
        Write-Host "❌ Failed to get Tesseract version: $_" -ForegroundColor Red
    }
    
    # Check tessdata directory
    $tessdataPath = "C:\Program Files\Tesseract-OCR\tessdata"
    if (Test-Path -Path $tessdataPath) {
        Write-Host "✅ Tessdata directory exists at: $tessdataPath" -ForegroundColor Green
        
        # Check for English language file
        $engFile = Join-Path -Path $tessdataPath -ChildPath "eng.traineddata"
        if (Test-Path -Path $engFile) {
            Write-Host "✅ English language file exists: $engFile" -ForegroundColor Green
        } else {
            Write-Host "❌ English language file not found: $engFile" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Tessdata directory not found: $tessdataPath" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Tesseract executable not found at: $tesseractPath" -ForegroundColor Red
}

# Check if tesseract is in PATH
Write-Host "`n🔍 Checking if Tesseract is in PATH..." -ForegroundColor Cyan
try {
    $whereResult = where.exe tesseract 2>&1
    if ($whereResult -like "*tesseract.exe*") {
        Write-Host "✅ Tesseract is in PATH: $whereResult" -ForegroundColor Green
    } else {
        Write-Host "❌ Tesseract not found in PATH" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Tesseract not found in PATH" -ForegroundColor Red
}

Write-Host "`nVerification complete." -ForegroundColor Cyan
