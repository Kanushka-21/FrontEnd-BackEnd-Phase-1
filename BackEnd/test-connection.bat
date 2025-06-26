@echo off
echo 📡 Testing GemNet Backend API Connection
echo =====================================
echo.

REM Define the URL for the health check endpoint
set API_URL=http://localhost:9091/api/auth/health

echo 🔍 Testing connection to: %API_URL%
echo.

REM Use curl to test the connection
curl -s -X GET %API_URL%

echo.
echo.
echo 🔍 Testing CORS with OPTIONS request
curl -v -X OPTIONS %API_URL% -H "Origin: http://example.com" -H "Access-Control-Request-Method: GET"

echo.
echo.
echo 🔍 Testing public ping endpoint
curl -s -X GET http://localhost:9091/api/public/ping

echo.
echo.
echo Press any key to exit...
pause
