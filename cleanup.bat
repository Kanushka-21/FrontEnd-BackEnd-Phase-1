@echo off
echo === PROJECT CLEANUP BATCH FILE ===
echo Removing unnecessary test and debug files...

cd /d "c:\Users\ASUS\OneDrive\Desktop\frontend+backend-phase 1\FrontEnd-BackEnd-Phase-1"

REM Remove test and debug HTML files from root (specific files found)
if exist "automated-purchase-setup.html" del "automated-purchase-setup.html" && echo Removed automated-purchase-setup.html
if exist "buyer-purchases-test.html" del "buyer-purchases-test.html" && echo Removed buyer-purchases-test.html
if exist "complete-purchase-history-fix.html" del "complete-purchase-history-fix.html" && echo Removed complete-purchase-history-fix.html
if exist "countdown-fix-test.html" del "countdown-fix-test.html" && echo Removed countdown-fix-test.html
if exist "countdown-refresh-test.html" del "countdown-refresh-test.html" && echo Removed countdown-refresh-test.html
if exist "debug-sold-countdown.html" del "debug-sold-countdown.html" && echo Removed debug-sold-countdown.html
if exist "DIRECT-FIX.html" del "DIRECT-FIX.html" && echo Removed DIRECT-FIX.html
if exist "direct-image-test.html" del "direct-image-test.html" && echo Removed direct-image-test.html
if exist "emergency-fix.html" del "emergency-fix.html" && echo Removed emergency-fix.html
if exist "EMERGENCY-PURCHASE-FIX.html" del "EMERGENCY-PURCHASE-FIX.html" && echo Removed EMERGENCY-PURCHASE-FIX.html
if exist "FINAL-PURCHASE-FIX.html" del "FINAL-PURCHASE-FIX.html" && echo Removed FINAL-PURCHASE-FIX.html
if exist "final-sold-items-test.html" del "final-sold-items-test.html" && echo Removed final-sold-items-test.html
if exist "image-debug-test.html" del "image-debug-test.html" && echo Removed image-debug-test.html
if exist "image-test.html" del "image-test.html" && echo Removed image-test.html
if exist "INSTANT-FIX.html" del "INSTANT-FIX.html" && echo Removed INSTANT-FIX.html
if exist "keep-won-items-test.html" del "keep-won-items-test.html" && echo Removed keep-won-items-test.html
if exist "manual-purchase-fix.html" del "manual-purchase-fix.html" && echo Removed manual-purchase-fix.html
if exist "notification-test.html" del "notification-test.html" && echo Removed notification-test.html
if exist "purchase-history-setup.html" del "purchase-history-setup.html" && echo Removed purchase-history-setup.html
if exist "quick-purchase-fix.html" del "quick-purchase-fix.html" && echo Removed quick-purchase-fix.html
if exist "seller-notification-monitor.html" del "seller-notification-monitor.html" && echo Removed seller-notification-monitor.html
if exist "seller-notifications-demo.html" del "seller-notifications-demo.html" && echo Removed seller-notifications-demo.html
if exist "sold-items-debug.html" del "sold-items-debug.html" && echo Removed sold-items-debug.html
if exist "test-complete-flow.html" del "test-complete-flow.html" && echo Removed test-complete-flow.html
if exist "test-countdown-fix.html" del "test-countdown-fix.html" && echo Removed test-countdown-fix.html
if exist "test-countdown-to-sold.html" del "test-countdown-to-sold.html" && echo Removed test-countdown-to-sold.html
if exist "test-marketplace-sold-items.html" del "test-marketplace-sold-items.html" && echo Removed test-marketplace-sold-items.html
if exist "test-notification-navigation.html" del "test-notification-navigation.html" && echo Removed test-notification-navigation.html
if exist "test-purchase-history.html" del "test-purchase-history.html" && echo Removed test-purchase-history.html
if exist "test-sold-items-countdown-fix.html" del "test-sold-items-countdown-fix.html" && echo Removed test-sold-items-countdown-fix.html
if exist "ULTIMATE-FIX.html" del "ULTIMATE-FIX.html" && echo Removed ULTIMATE-FIX.html
if exist "test-sold-items-countdown-fix.html" del "test-sold-items-countdown-fix.html" && echo Removed test-sold-items-countdown-fix.html
if exist "test-purchase-history.html" del "test-purchase-history.html" && echo Removed test-purchase-history.html
if exist "test-notification-navigation.html" del "test-notification-navigation.html" && echo Removed test-notification-navigation.html
if exist "test-marketplace-sold-items.html" del "test-marketplace-sold-items.html" && echo Removed test-marketplace-sold-items.html
if exist "test-countdown-to-sold.html" del "test-countdown-to-sold.html" && echo Removed test-countdown-to-sold.html
if exist "test-countdown-fix.html" del "test-countdown-fix.html" && echo Removed test-countdown-fix.html
if exist "test-complete-flow.html" del "test-complete-flow.html" && echo Removed test-complete-flow.html
if exist "sold-items-debug.html" del "sold-items-debug.html" && echo Removed sold-items-debug.html
if exist "seller-notifications-demo.html" del "seller-notifications-demo.html" && echo Removed seller-notifications-demo.html
if exist "seller-notification-monitor.html" del "seller-notification-monitor.html" && echo Removed seller-notification-monitor.html
if exist "quick-purchase-fix.html" del "quick-purchase-fix.html" && echo Removed quick-purchase-fix.html
if exist "purchase-history-setup.html" del "purchase-history-setup.html" && echo Removed purchase-history-setup.html
if exist "notification-test.html" del "notification-test.html" && echo Removed notification-test.html
if exist "manual-purchase-fix.html" del "manual-purchase-fix.html" && echo Removed manual-purchase-fix.html
if exist "keep-won-items-test.html" del "keep-won-items-test.html" && echo Removed keep-won-items-test.html
if exist "INSTANT-FIX.html" del "INSTANT-FIX.html" && echo Removed INSTANT-FIX.html
if exist "image-test.html" del "image-test.html" && echo Removed image-test.html
if exist "image-debug-test.html" del "image-debug-test.html" && echo Removed image-debug-test.html
if exist "final-sold-items-test.html" del "final-sold-items-test.html" && echo Removed final-sold-items-test.html
if exist "emergency-fix.html" del "emergency-fix.html" && echo Removed emergency-fix.html
if exist "EMERGENCY-PURCHASE-FIX.html" del "EMERGENCY-PURCHASE-FIX.html" && echo Removed EMERGENCY-PURCHASE-FIX.html
if exist "direct-image-test.html" del "direct-image-test.html" && echo Removed direct-image-test.html
if exist "debug-sold-countdown.html" del "debug-sold-countdown.html" && echo Removed debug-sold-countdown.html
if exist "countdown-refresh-test.html" del "countdown-refresh-test.html" && echo Removed countdown-refresh-test.html
if exist "countdown-fix-test.html" del "countdown-fix-test.html" && echo Removed countdown-fix-test.html
if exist "complete-purchase-history-fix.html" del "complete-purchase-history-fix.html" && echo Removed complete-purchase-history-fix.html
if exist "buyer-purchases-test.html" del "buyer-purchases-test.html" && echo Removed buyer-purchases-test.html
if exist "DIRECT-FIX.html" del "DIRECT-FIX.html" && echo Removed DIRECT-FIX.html
if exist "FINAL-PURCHASE-FIX.html" del "FINAL-PURCHASE-FIX.html" && echo Removed FINAL-PURCHASE-FIX.html

REM Remove backend test files
if exist "BackEnd\api-test.html" del "BackEnd\api-test.html" && echo Removed BackEnd\api-test.html
if exist "BackEnd\test_images.html" del "BackEnd\test_images.html" && echo Removed BackEnd\test_images.html
if exist "BackEnd\quick-test.html" del "BackEnd\quick-test.html" && echo Removed BackEnd\quick-test.html
if exist "BackEnd\image_test_fixed.html" del "BackEnd\image_test_fixed.html" && echo Removed BackEnd\image_test_fixed.html
if exist "BackEnd\face-verification-test.html" del "BackEnd\face-verification-test.html" && echo Removed BackEnd\face-verification-test.html
if exist "BackEnd\instant-fix.html" del "BackEnd\instant-fix.html" && echo Removed BackEnd\instant-fix.html
if exist "BackEnd\fix-purchase-history.html" del "BackEnd\fix-purchase-history.html" && echo Removed BackEnd\fix-purchase-history.html
if exist "BackEnd\fix-purchase-history-db.html" del "BackEnd\fix-purchase-history-db.html" && echo Removed BackEnd\fix-purchase-history-db.html
if exist "BackEnd\urgent-purchase-fix.html" del "BackEnd\urgent-purchase-fix.html" && echo Removed BackEnd\urgent-purchase-fix.html
if exist "BackEnd\fix-images.html" del "BackEnd\fix-images.html" && echo Removed BackEnd\fix-images.html
if exist "BackEnd\fix-image-order.html" del "BackEnd\fix-image-order.html" && echo Removed BackEnd\fix-image-order.html
if exist "BackEnd\debug-notifications.html" del "BackEnd\debug-notifications.html" && echo Removed BackEnd\debug-notifications.html
if exist "BackEnd\backend-fix-verification.html" del "BackEnd\backend-fix-verification.html" && echo Removed BackEnd\backend-fix-verification.html
if exist "BackEnd\complete-test-suite.html" del "BackEnd\complete-test-suite.html" && echo Removed BackEnd\complete-test-suite.html

REM Remove documentation files
if exist "PURCHASE_HISTORY_SOLUTION.md" del "PURCHASE_HISTORY_SOLUTION.md" && echo Removed PURCHASE_HISTORY_SOLUTION.md
if exist "MANUAL_DATABASE_SOLUTION.md" del "MANUAL_DATABASE_SOLUTION.md" && echo Removed MANUAL_DATABASE_SOLUTION.md
if exist "BUYER_PURCHASE_HISTORY_IMPLEMENTATION.md" del "BUYER_PURCHASE_HISTORY_IMPLEMENTATION.md" && echo Removed BUYER_PURCHASE_HISTORY_IMPLEMENTATION.md

REM Remove test scripts
if exist "BackEnd\test-tesseract.sh" del "BackEnd\test-tesseract.sh" && echo Removed BackEnd\test-tesseract.sh
if exist "BackEnd\test-notifications.ps1" del "BackEnd\test-notifications.ps1" && echo Removed BackEnd\test-notifications.ps1
if exist "BackEnd\test-connection.bat" del "BackEnd\test-connection.bat" && echo Removed BackEnd\test-connection.bat

REM Remove this cleanup script itself
if exist "cleanup.ps1" del "cleanup.ps1" && echo Removed cleanup.ps1

echo.
echo === CLEANUP COMPLETE ===
echo All unnecessary test and debug files have been removed.
echo.
pause
