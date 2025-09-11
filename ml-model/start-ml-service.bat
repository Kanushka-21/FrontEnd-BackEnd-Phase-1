@echo off
echo Starting ML Price Prediction Service...
cd /d "C:\Users\ASUS\OneDrive\Desktop\frontend+backend-phase 1\FrontEnd-BackEnd-Phase-1\ml-model\gemstone-price-predictor-main"

echo Checking Python installation...
python --version
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    pause
    exit /b 1
)

echo Installing required packages...
pip install numpy pandas scikit-learn==1.2.2 flask flask-cors catboost xgboost dill matplotlib seaborn

echo Starting Flask ML API on port 5000...
python app.py

pause
