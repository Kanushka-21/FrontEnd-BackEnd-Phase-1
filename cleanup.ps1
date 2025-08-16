# Project Cleanup Script
# Removes all unnecessary test files, debug files, and fix tools

Write-Host "=== PROJECT CLEANUP SCRIPT ===" -ForegroundColor Green
Write-Host "Removing unnecessary files..." -ForegroundColor Yellow

$rootPath = "c:\Users\ASUS\OneDrive\Desktop\frontend+backend-phase 1\FrontEnd-BackEnd-Phase-1"
Set-Location $rootPath

# List of files to remove (test files, debug files, fix tools)
$filesToRemove = @(
    "ULTIMATE-FIX.html",
    "test-sold-items-countdown-fix.html",
    "test-purchase-history.html", 
    "test-notification-navigation.html",
    "test-marketplace-sold-items.html",
    "test-countdown-to-sold.html",
    "test-countdown-fix.html",
    "test-complete-flow.html",
    "sold-items-debug.html",
    "seller-notifications-demo.html",
    "seller-notification-monitor.html",
    "quick-purchase-fix.html",
    "purchase-history-setup.html",
    "notification-test.html",
    "manual-purchase-fix.html",
    "keep-won-items-test.html",
    "INSTANT-FIX.html",
    "image-test.html",
    "image-debug-test.html",
    "final-sold-items-test.html",
    "emergency-fix.html",
    "emergency-purchase-fix.html",
    "EMERGENCY-PURCHASE-FIX.html",
    "direct-image-test.html",
    "debug-sold-countdown.html",
    "countdown-refresh-test.html",
    "countdown-fix-test.html",
    "complete-purchase-history-fix.html",
    "buyer-purchases-test.html",
    "DIRECT-FIX.html",
    "FINAL-PURCHASE-FIX.html",
    "API_TEST_SUITE.html"
)

# Remove files from root directory
foreach ($file in $filesToRemove) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "Removed: $file" -ForegroundColor Red
    }
}

# Remove BackEnd test files
$backendTestFiles = @(
    "BackEnd\test_images.html",
    "BackEnd\quick-test.html", 
    "BackEnd\image_test_fixed.html",
    "BackEnd\face-verification-test.html",
    "BackEnd\instant-fix.html",
    "BackEnd\fix-purchase-history.html",
    "BackEnd\fix-purchase-history-db.html",
    "BackEnd\urgent-purchase-fix.html",
    "BackEnd\fix-images.html",
    "BackEnd\fix-image-order.html",
    "BackEnd\debug-notifications.html",
    "BackEnd\backend-fix-verification.html",
    "BackEnd\complete-test-suite.html",
    "BackEnd\api-test.html"
)

foreach ($file in $backendTestFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "Removed: $file" -ForegroundColor Red
    }
}

# Remove markdown documentation files (keep only essential ones)
$docsToRemove = @(
    "PURCHASE_HISTORY_SOLUTION.md",
    "MANUAL_DATABASE_SOLUTION.md", 
    "BUYER_PURCHASE_HISTORY_IMPLEMENTATION.md"
)

foreach ($file in $docsToRemove) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "Removed: $file" -ForegroundColor Red
    }
}

# Remove test scripts
$scriptsToRemove = @(
    "BackEnd\test-tesseract.sh",
    "BackEnd\test-notifications.ps1",
    "BackEnd\test-connection.bat"
)

foreach ($file in $scriptsToRemove) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "Removed: $file" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== CLEANUP COMPLETE ===" -ForegroundColor Green
Write-Host "Remaining files are essential for the application" -ForegroundColor Yellow

# Show remaining structure
Write-Host ""
Write-Host "=== REMAINING PROJECT STRUCTURE ===" -ForegroundColor Cyan
Get-ChildItem -Recurse -Directory | Select-Object FullName | Format-Table -AutoSize
