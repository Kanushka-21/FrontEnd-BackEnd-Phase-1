#!/bin/bash

# Quick deployment script for Docker

echo "🚀 Starting GemNet Backend Deployment..."

# Stop any existing containers
echo "📦 Stopping existing containers..."
docker-compose -f docker-compose.production.yml down

# Build and start services
echo "🔨 Building and starting services..."
docker-compose -f docker-compose.production.yml up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service health
echo "🏥 Checking service health..."
docker-compose -f docker-compose.production.yml ps

# Test backend health endpoint
echo "🔍 Testing backend health..."
curl -f http://localhost:9092/health || echo "❌ Backend health check failed"

echo "✅ Deployment complete!"
echo "📍 Backend URL: http://localhost:9092"
echo "📊 MongoDB URL: mongodb://admin:password@localhost:27017/gemnet_db"
echo ""
echo "📝 To view logs:"
echo "   docker-compose -f docker-compose.production.yml logs -f backend"
echo ""
echo "🛑 To stop services:"
echo "   docker-compose -f docker-compose.production.yml down"