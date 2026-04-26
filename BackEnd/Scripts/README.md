# BackEnd Scripts Guide

This folder contains utility scripts for building, running, and deploying the GemNet backend application.

## 🚀 Quick Start Scripts

### **Windows Users**

#### Development (Recommended)
```bash
# Start backend with Java 17 check
.\build-with-java17.bat
```

#### Quick Restart (Already Built)
```bash
# Fastest way to restart the application
.\quick-restart.bat
```

#### Run with Enhanced Output
```bash
# Start with detailed logging
.\run-backend-enhanced.bat
```

### **PowerShell/All Platforms**
```bash
# Run using PowerShell script
.\run-backend.ps1
```

### **Linux/Mac**
```bash
# Deploy on Linux/Mac
./deploy.sh
```

---

## 🗂️ Script Descriptions

### Build & Run Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| **build-with-java17.bat** | Builds app with Java 17 verification | `.\build-with-java17.bat` |
| **run-backend.ps1** | PowerShell script to run backend | `.\run-backend.ps1` |
| **run-backend-enhanced.bat** | Run with enhanced logging/output | `.\run-backend-enhanced.bat` |
| **start-backend.bat** | Simple start script | `.\start-backend.bat` |
| **quick-restart.bat** | Restart if already built | `.\quick-restart.bat` |

### Deployment Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| **deploy.bat** | Deploy to production (Windows) | `.\deploy.bat` |
| **deploy.sh** | Deploy to production (Linux/Mac) | `./deploy.sh` |
| **deploy-railway.bat** | Deploy to Railway platform | `.\deploy-railway.bat` |
| **config-switcher.bat** | Switch between configurations | `.\config-switcher.bat` |

### Database Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| **init-mongodb.bat** | Initialize local MongoDB | `.\init-mongodb.bat` |
| **migrate-to-atlas.bat** | Migrate local DB to MongoDB Atlas | `.\migrate-to-atlas.bat` |
| **export-mongodb.bat** | Export MongoDB database | `.\export-mongodb.bat` |
| **import-to-railway.bat** | Import to Railway MongoDB | `.\import-to-railway.bat` |
| **mongo-init.js** | MongoDB initialization script | Used by init scripts |
| **init_script.js** | Initial data population script | Used by init scripts |

### Utility Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| **verify-tesseract-installation.bat** | Verify OCR library installation | `.\verify-tesseract-installation.bat` |

---

## 📋 Common Workflows

### First Time Setup
```bash
# 1. Initialize MongoDB
.\Scripts\init-mongodb.bat

# 2. Build the application
.\Scripts\build-with-java17.bat

# Application will start automatically
```

### Development Work
```bash
# Quick restart after changes
.\Scripts\quick-restart.bat
```

### Deploy to Railway
```bash
# Deploy to Railway production
.\Scripts\deploy-railway.bat
```

### Migrate Database to Atlas
```bash
# Migrate your local database to MongoDB Atlas
.\Scripts\migrate-to-atlas.bat
```

---

## ✅ Prerequisites

### Windows
- Java JDK 17 or higher
- MongoDB (local or Atlas)
- PowerShell 5.0+
- Maven (included in ../apache-maven-3.9.10/)

### Linux/Mac
- Java JDK 17 or higher
- MongoDB
- Bash shell
- Maven

---

## 🔧 Configuration

### Before Running Scripts

1. **Set JAVA_HOME** (if scripts fail to find Java)
   ```bash
   set JAVA_HOME=C:\Program Files\Java\jdk-17
   ```

2. **MongoDB Connection** (if using Atlas)
   - Update `application.properties`:
   ```properties
   spring.data.mongodb.uri=mongodb+srv://user:pass@cluster.mongodb.net/gemnet_db
   ```

3. **Port Configuration**
   - Default port is 9091
   - Change in `application.properties` if needed

---

## 📊 Script Execution Order

**For First Run:**
```
init-mongodb.bat
    ↓
build-with-java17.bat
    ↓
Application Running (http://localhost:9091)
```

**For Subsequent Runs:**
```
quick-restart.bat
    ↓
Application Running (http://localhost:9091)
```

**For Production Deployment:**
```
build-with-java17.bat (or maven directly)
    ↓
deploy-railway.bat (or deploy.sh)
    ↓
Application Deployed
```

---

## 🐛 Troubleshooting

### Scripts Won't Run
**Solution:** Check execution policy in PowerShell
```bash
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Java Not Found
**Solution:** Verify Java 17 is installed
```bash
java -version
```

### MongoDB Connection Error
**Solution:** Ensure MongoDB is running
```bash
# Windows
Get-Service MongoDB | Start-Service

# Linux
sudo systemctl start mongod
```

### Permission Denied (Linux/Mac)
**Solution:** Make scripts executable
```bash
chmod +x *.sh
```

---

## 📝 Notes

- All scripts require you to run from the `BackEnd/` directory
- Use `Scripts/` prefix if running from parent directory
- Batch files (.bat) are Windows-only
- Shell scripts (.sh) are for Linux/Mac
- PowerShell scripts (.ps1) work on all platforms with PowerShell installed

---

## 🔗 Related Documentation

- **Setup Guide:** See [../Documentation/01-PROJECT-SETUP.md](../Documentation/01-PROJECT-SETUP.md)
- **Deployment Guide:** See [../Documentation/05-DEPLOYMENT-GUIDE.md](../Documentation/05-DEPLOYMENT-GUIDE.md)
- **Database Setup:** See [../Documentation/06-MONGODB-SETUP.md](../Documentation/06-MONGODB-SETUP.md)

---

**Last Updated:** April 26, 2026
