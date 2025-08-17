@echo off
echo 🔄 Synchronizing gem images between directories...

set "sourceDir=c:\Users\ASUS\OneDrive\Desktop\frontend+backend-phase 1\FrontEnd-BackEnd-Phase-1\BackEnd\uploads\gems"
set "targetDir=c:\Users\ASUS\OneDrive\Desktop\frontend+backend-phase 1\FrontEnd-BackEnd-Phase-1\uploads\gems"

echo Source: %sourceDir%
echo Target: %targetDir%

if not exist "%targetDir%" (
    echo Creating target directory...
    mkdir "%targetDir%" 2>nul
)

echo.
echo Copying all gem images...
robocopy "%sourceDir%" "%targetDir%" *.jpg *.jpeg *.png *.gif /XD thumbnails /NDL /NP

echo.
echo ✅ Image synchronization complete!
echo All gem images are now available for the frontend.

pause
