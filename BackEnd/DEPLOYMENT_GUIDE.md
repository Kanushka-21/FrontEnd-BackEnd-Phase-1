# GemNet Backend Deployment Guide

## 🚀 QUICK START FOR YOUR PROJECT (Recommended)

### Step 1: Migrate Your Local Database to Atlas
1. **Run the migration script:**
   ```bash
   cd BackEnd
   migrate-to-atlas.bat
   ```
2. **Follow the prompts** to migrate your existing `gemnet_db` to MongoDB Atlas
3. **Get your Atlas connection string** (script will generate it for you)

### Step 2: Update Application Properties
1. **Keep your current `application.properties` as backup**
2. **Copy settings from generated `application-atlas-configured.properties`** 
3. **Update your main application.properties** with Atlas connection string

### Step 3: Share with Contributors
1. **Commit your changes** (without passwords in Git - use environment variables)
2. **Contributors clone and run:**
   ```bash
   git clone your-repo-url
   cd FrontEnd-BackEnd-Phase-1/BackEnd
   deploy.bat  # Windows
   ```
3. **Everyone uses the same Atlas database** - your data is already there!

---

This guide provides multiple options for sharing your backend with repository contributors.

## Option 1: Docker Deployment (Recommended)

### For Contributors to Run Locally

1. **Prerequisites**
   ```bash
   # Install Docker Desktop
   # Download from: https://www.docker.com/products/docker-desktop/
   ```

2. **Clone and Deploy**
   ```bash
   git clone [your-repository-url]
   cd FrontEnd-BackEnd-Phase-1/BackEnd
   
   # Run deployment script
   ./deploy.sh       # Linux/Mac
   deploy.bat        # Windows
   ```

3. **Manual Deployment**
   ```bash
   # Build and start services
   docker-compose -f docker-compose.production.yml up --build -d
   
   # View logs
   docker-compose -f docker-compose.production.yml logs -f
   
   # Stop services
   docker-compose -f docker-compose.production.yml down
   ```

## Option 2: Cloud Deployment

### A. Railway (Easiest)

1. **Setup Railway Account**
   - Go to https://railway.app/
   - Sign up with GitHub

2. **Deploy Backend**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login and deploy
   railway login
   railway init
   railway up
   ```

3. **Environment Variables on Railway**
   ```
   MONGODB_URI=mongodb://admin:password@mongo:27017/gemnet_db
   SERVER_PORT=9092
   UPLOAD_DIR=/app/uploads
   ```

### B. Heroku

1. **Create Heroku App**
   ```bash
   # Install Heroku CLI
   heroku create your-gemnet-backend
   
   # Add MongoDB addon
   heroku addons:create mongolab:sandbox
   
   # Deploy
   git push heroku main
   ```

2. **Heroku Configuration**
   ```bash
   heroku config:set MONGODB_URI=[from mongolab addon]
   heroku config:set SERVER_PORT=9092
   ```

### C. AWS EC2 (Advanced)

1. **Launch EC2 Instance**
   - Ubuntu 20.04 LTS
   - t3.micro (free tier)
   - Security groups: 22 (SSH), 9092 (Backend), 27017 (MongoDB)

2. **Setup Script**
   ```bash
   # Install Docker
   sudo apt update
   sudo apt install docker.io docker-compose -y
   sudo usermod -aG docker ubuntu
   
   # Clone and deploy
   git clone [your-repository-url]
   cd FrontEnd-BackEnd-Phase-1/BackEnd
   docker-compose -f docker-compose.production.yml up -d
   ```

## Option 3: Shared Development Database

### MongoDB Atlas (Cloud Database)

1. **Create Atlas Account**
   - Go to https://www.mongodb.com/atlas
   - Create free cluster

2. **Update Application Properties**
   ```properties
   # application-production.properties
   spring.data.mongodb.uri=mongodb+srv://username:password@cluster.mongodb.net/gemnet_db
   ```

3. **Contributors Configuration**
   ```bash
   # Each contributor uses same database
   export MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/gemnet_db"
   ```

## Option 4: GitHub Codespaces

1. **Create .devcontainer/devcontainer.json**
   ```json
   {
     "name": "GemNet Development",
     "dockerComposeFile": "../BackEnd/docker-compose.production.yml",
     "service": "backend",
     "workspaceFolder": "/workspace",
     "forwardPorts": [9092, 27017],
     "postCreateCommand": "echo 'GemNet backend ready!'"
   }
   ```

2. **Contributors Usage**
   - Click "Code" → "Codespaces" → "Create codespace"
   - Automatic setup with backend running

## Recommended Approach

### For Small Team (2-5 developers):
**Docker + MongoDB Atlas**
- Each developer runs backend locally with Docker
- Shared MongoDB Atlas database
- Cost: Free (Atlas free tier)

### For Larger Team (5+ developers):
**Railway/Heroku Deployment**
- Single shared backend instance
- All developers connect to same endpoint
- Cost: ~$5-10/month

### For Production:
**AWS/Google Cloud + Docker**
- Full control over infrastructure
- Scalable and secure
- Cost: ~$20-50/month

## Quick Start for Contributors

1. **Install Docker Desktop**
2. **Clone repository**
3. **Run deployment script**
   ```bash
   cd BackEnd
   ./deploy.bat    # Windows
   ./deploy.sh     # Linux/Mac
   ```
4. **Access backend at**: http://localhost:9092

## Environment Variables Reference

```bash
# Required for all deployment methods
MONGODB_URI=mongodb://admin:password@localhost:27017/gemnet_db
SERVER_PORT=9092
UPLOAD_DIR=./uploads

# Optional
TESSERACT_PATH=/usr/bin/tesseract  # Linux
TESSERACT_PATH=C:\Program Files\Tesseract-OCR\tesseract.exe  # Windows
```

## Troubleshooting

### Common Issues
1. **Port 9092 already in use**
   ```bash
   netstat -ano | findstr :9092  # Windows
   lsof -i :9092                 # Linux/Mac
   ```

2. **MongoDB connection failed**
   ```bash
   # Check MongoDB is running
   docker-compose -f docker-compose.production.yml ps
   ```

3. **File upload permissions**
   ```bash
   # Fix upload directory permissions
   chmod 755 uploads/
   ```

## Support

For issues with deployment:
1. Check Docker Desktop is running
2. Verify ports 9092 and 27017 are available
3. Check logs: `docker-compose -f docker-compose.production.yml logs`
4. Create GitHub issue with error logs