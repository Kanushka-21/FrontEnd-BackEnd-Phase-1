# 👥 Contributors Setup Guide

## Quick Setup for New Contributors

### Prerequisites
- **Git** installed
- **Docker Desktop** installed and running
- **Java 17** (if running without Docker)

### 🚀 One-Command Setup

```bash
git clone [repository-url]
cd FrontEnd-BackEnd-Phase-1/BackEnd
deploy.bat
```

That's it! The backend will be running at `http://localhost:9092`

## What Happens During Setup

1. **Docker downloads MongoDB Atlas configuration**
2. **Connects to shared database** (your data is already there)
3. **Starts backend with all your existing data**
4. **File uploads work immediately**

## Verification Steps

After setup, verify everything works:

1. **Backend Health Check:**
   ```
   Open: http://localhost:9092/swagger-ui.html
   ```

2. **Database Connection:**
   ```bash
   curl http://localhost:9092/health
   ```

3. **File Upload Test:**
   ```bash
   curl http://localhost:9092/uploads/
   ```

## Frontend Setup

If you also need the frontend:

```bash
cd ../FrontEnd
npm install
npm run dev
```

Frontend will be at: `http://localhost:5173`

## Common Issues & Solutions

### ❌ "Port 9092 is already in use"
```bash
# Windows
netstat -ano | findstr :9092
taskkill /PID [PID_NUMBER] /F

# Then retry: deploy.bat
```

### ❌ "Docker not found"
1. Install Docker Desktop
2. Start Docker Desktop
3. Retry: `deploy.bat`

### ❌ "MongoDB connection failed"
```bash
# Check container status
docker-compose -f docker-compose.production.yml ps

# View logs
docker-compose -f docker-compose.production.yml logs backend
```

### ❌ "File upload not working"
Check uploads directory permissions:
```bash
ls -la uploads/  # Linux/Mac
dir uploads\     # Windows
```

## Development Workflow

### Starting Development
```bash
deploy.bat
```

### Stopping Services
```bash
docker-compose -f docker-compose.production.yml down
```

### Viewing Logs
```bash
docker-compose -f docker-compose.production.yml logs -f backend
```

### Restarting After Code Changes
```bash
docker-compose -f docker-compose.production.yml restart backend
```

## Database Information

- **Database Type:** MongoDB Atlas (Cloud)
- **Shared Database:** Everyone uses the same data
- **No Local MongoDB Needed:** Everything is in the cloud
- **Data Persistence:** All your data is preserved across restarts

## Support

If you encounter issues:

1. **Check logs:** `docker-compose -f docker-compose.production.yml logs backend`
2. **Verify Docker:** `docker ps`
3. **Test connection:** `curl http://localhost:9092/health`
4. **Create GitHub issue** with error logs

## What's Included

✅ **Backend API** (Spring Boot)  
✅ **MongoDB Atlas Database** (shared)  
✅ **File Upload System** (videos, images)  
✅ **Authentication System** (JWT)  
✅ **Price Prediction ML Model**  
✅ **Email System** (notifications)  
✅ **Face Recognition** (Tesseract OCR)  
✅ **Swagger API Documentation**  

## Environment Variables

The setup automatically configures:
- `MONGODB_URI`: Atlas connection string
- `SERVER_PORT`: 9092
- `UPLOAD_DIR`: ./uploads
- `JWT_SECRET`: Pre-configured
- `EMAIL_CONFIG`: Gmail SMTP

## Folder Structure After Setup

```
BackEnd/
├── src/                 # Source code
├── uploads/            # File storage
├── docker-compose.production.yml
├── Dockerfile.production
├── deploy.bat          # Setup script
└── target/             # Built application
```

---

🎉 **You're ready to contribute to GemNet!**

The backend is running with all the original data and functionality intact.