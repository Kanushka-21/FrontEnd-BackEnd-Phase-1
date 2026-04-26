@echo off
REM Quick deployment script for Docker (Windows)

echo 🚀 Starting GemNet Backend Deployment...

REM Stop any existing containers
echo 📦 Stopping existing containers...
docker-compose -f docker-compose.production.yml down

REM Build and start services
echo 🔨 Building and starting services...
docker-compose -f docker-compose.production.yml up --build -d

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 30

REM Check service health
echo 🏥 Checking service health...
docker-compose -f docker-compose.production.yml ps

REM Test backend health endpoint
echo 🔍 Testing backend health...
curl -f http://localhost:9092/health || echo ❌ Backend health check failed

echo ✅ Deployment complete!
echo 📍 Backend URL: http://localhost:9092
echo 📊 MongoDB URL: mongodb://admin:password@localhost:27017/gemnet_db
echo.
echo 📝 To view logs:
echo    docker-compose -f docker-compose.production.yml logs -f backend
echo.
echo 🛑 To stop services:
echo    docker-compose -f docker-compose.production.yml down

pause