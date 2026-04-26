# Docker Images Guide

This folder contains Dockerfile configurations for different deployment scenarios.

## 📦 Available Images

### **1. Dockerfile** (Standard)
Standard Docker image for deployment.

**Use When:**
- Deploying to Docker containers
- Using Docker Compose
- General containerization

**Build:**
```bash
docker build -f Docker/Dockerfile -t gemnet-backend:latest .
```

**Run:**
```bash
docker run -p 9091:9091 -e MONGODB_URI=mongodb://... gemnet-backend:latest
```

---

### **2. Dockerfile.production** (Optimized)
Production-optimized image with minimal size and maximum performance.

**Features:**
- Multi-stage build (smaller image)
- Optimized JVM settings
- Health checks included
- Better logging setup

**Use When:**
- Production deployment
- Cloud deployments requiring small images
- Performance-critical environments

**Build:**
```bash
docker build -f Docker/Dockerfile.production -t gemnet-backend:prod .
```

**Run:**
```bash
docker run -p 9091:9091 \
  -e MONGODB_URI=mongodb://... \
  -e JAVA_OPTS="-Xmx512m -Xms256m" \
  gemnet-backend:prod
```

---

### **3. Dockerfile.railway** (Railway-Specific)
Optimized for Railway.app platform deployment.

**Features:**
- Railway environment variables pre-configured
- Auto port detection
- Railway health check support
- Optimized startup

**Use When:**
- Deploying to Railway.app
- Using Railway's database integrations
- Need Railway-specific optimizations

**Build (via Railway):**
```bash
# Railway builds automatically from git
# Just push to your repository
git push origin main
```

**Manual Build:**
```bash
docker build -f Docker/Dockerfile.railway -t gemnet-backend:railway .
```

---

## 🏗️ Docker Compose Integration

Use these Dockerfiles with the compose files in `/Config/`:

```bash
# Development
docker-compose -f Config/docker-compose.yml up -d

# Production
docker-compose -f Config/docker-compose.production.yml up -d
```

---

## 📋 Comparison

| Feature | Standard | Production | Railway |
|---------|----------|-----------|---------|
| Size | Large | Small | Medium |
| JVM Heap | 1GB | 512MB | Auto |
| Logging | Standard | Enhanced | Railway |
| Health Checks | No | Yes | Yes |
| Multi-stage | No | Yes | Yes |
| Best For | Dev/Test | Prod | Railway Cloud |

---

## 🔧 Environment Variables

All images use these variables:

```bash
# Database Connection
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/gemnet_db

# Server Configuration
SERVER_PORT=9091

# Java Options
JAVA_OPTS=-Xmx512m -Xms256m

# Application Mode
SPRING_PROFILES_ACTIVE=prod
```

---

## 🚀 Common Deployments

### Docker Compose (Recommended for Teams)
```bash
cd ..
docker-compose -f Config/docker-compose.yml up -d
```

### Single Container
```bash
docker build -f Docker/Dockerfile.production -t gemnet:latest .
docker run -p 9091:9091 -e MONGODB_URI="..." gemnet:latest
```

### Kubernetes
```bash
kubectl create deployment gemnet --image=gemnet-backend:latest
kubectl expose deployment gemnet --port=9091
```

---

## 📝 Notes

- All images require Java 17 as base
- Expose port 9091 for the application
- MongoDB URI must be configured
- Use `.production` image for production environments
- Use `.railway` image when deploying to Railway

---

## 🔗 Related Files

- Docker Compose: See `../Config/README.md`
- Deployment Guide: See `../../Documentation/05-DEPLOYMENT-GUIDE.md`
- Scripts: See `../Scripts/deploy*.bat` and `deploy.sh`

---

**Last Updated:** April 26, 2026
