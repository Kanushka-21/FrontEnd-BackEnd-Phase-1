# Check and Install Tesseract for Windows
Write-Host "🔍 Checking Tesseract OCR installation..." -ForegroundColor Cyan

# Check if Tesseract is installed
$tesseractPath = "C:\Program Files\Tesseract-OCR\tesseract.exe"
if (Test-Path -Path $tesseractPath) {
    # Tesseract is installed
    $tesseractVersion = & $tesseractPath --version 2>&1
    Write-Host "✅ Tesseract OCR is installed: $tesseractVersion" -ForegroundColor Green
    
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
            Write-Host "   Please download from: https://github.com/tesseract-ocr/tessdata/raw/main/eng.traineddata" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Tessdata directory not found: $tessdataPath" -ForegroundColor Red
    }
    
    # Check if Tesseract is in PATH
    $tesseractInPath = $false
    $env:Path.Split(';') | ForEach-Object {
        if ($_ -like "*Tesseract-OCR*") {
            $tesseractInPath = $true
        }
    }
    
    if ($tesseractInPath) {
        Write-Host "✅ Tesseract-OCR is in your PATH" -ForegroundColor Green
    } else {
        Write-Host "❌ Tesseract-OCR is NOT in your PATH" -ForegroundColor Red
        Write-Host "   Please add 'C:\Program Files\Tesseract-OCR' to your PATH" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Tesseract OCR is not installed" -ForegroundColor Red
    Write-Host "Please install Tesseract OCR:" -ForegroundColor Yellow
    Write-Host "1. Download from: https://github.com/UB-Mannheim/tesseract/wiki" -ForegroundColor Yellow
    Write-Host "2. Install with 'Additional language data (download)' option" -ForegroundColor Yellow
    Write-Host "3. Make sure to add Tesseract to your PATH during installation" -ForegroundColor Yellow
}

# Advise on application.properties configuration
$appPropsPath = Join-Path -Path $PSScriptRoot -ChildPath "src\main\resources\application.properties"
if (Test-Path -Path $appPropsPath) {
    Write-Host "`n📋 Your application.properties should contain:" -ForegroundColor Cyan
    Write-Host "# Tesseract OCR Configuration" -ForegroundColor White
    Write-Host "tesseract.datapath=C:/Program Files/Tesseract-OCR/tessdata" -ForegroundColor White
    Write-Host "tesseract.language=eng" -ForegroundColor White
    Write-Host "tesseract.ocrEngineMode=1" -ForegroundColor White
    Write-Host "tesseract.pageSegMode=3" -ForegroundColor White
}

Write-Host "`n⚠️ Note: If you just installed Tesseract, you may need to restart your computer" -ForegroundColor Yellow
Write-Host "   for the environment variables to take effect." -ForegroundColor Yellow

# Wait for keypress before closing
Write-Host "`nPress any key to continue..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
