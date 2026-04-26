# Backend Configuration Files

This folder contains all configuration files for the GemNet Backend.

## 📂 Folder Contents

```
Config/
├── docker-compose.yml              (Development environment)
├── docker-compose.production.yml   (Production environment)
├── .env.example                    (Environment variables template)
├── railway.json                    (Railway deployment config)
└── README.md                       (This file)
```

### Files Description

| File | Purpose | Usage |
|------|---------|-------|
| **docker-compose.yml** | Development Docker orchestration | `docker-compose -f Config/docker-compose.yml up -d` |
| **docker-compose.production.yml** | Production Docker orchestration | Railway, AWS, Azure, manual servers |
| **.env.example** | Environment variables template | Copy to `.env` and fill values |
| **railway.json** | Railway.app deployment config | Auto-deployed via Railway CLI |

---

## 📦 Available Configurations

### **1. docker-compose.yml** (Development)
Development environment with local/cloud services.

**Includes:**
- GemNet Backend (Java/Spring Boot)
- MongoDB (local or Atlas)
- Automatic startup on dependencies

**Use When:**
- Team development
- Testing with containers
- Local environment with Docker

**Start:**
```bash
cd ../..
docker-compose -f BackEnd/Config/docker-compose.yml up -d
```

**Stop:**
```bash
docker-compose -f BackEnd/Config/docker-compose.yml down
```

**View Logs:**
```bash
docker-compose -f BackEnd/Config/docker-compose.yml logs -f backend
```

**Configuration:**

```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Docker/Dockerfile
    ports:
      - "9091:9091"
    environment:
      - MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/gemnet_db
    depends_on:
      - mongodb (if using local)

  mongodb: (optional for local)
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
```

---

### **2. docker-compose.production.yml** (Production)
Production-optimized environment with best practices.

**Features:**
- Production-optimized images
- Resource limits configured
- Health checks enabled
- Proper logging setup
- Security best practices

**Use When:**
- Production deployment
- Enterprise environments
- Performance-critical systems

**Start:**
```bash
cd ../..
docker-compose -f BackEnd/Config/docker-compose.production.yml up -d
```

**Configuration:**

```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Docker/Dockerfile.production
    ports:
      - "9091:9091"
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - JAVA_OPTS=-Xmx512m -Xms256m
      - SPRING_PROFILES_ACTIVE=prod
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9091/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 1G
        reservations:
          cpus: '1'
          memory: 512M
```

---

## 🔄 Service Management

### Check Status
```bash
docker-compose -f Config/docker-compose.yml ps
```

### Rebuild Images
```bash
docker-compose -f Config/docker-compose.yml build --no-cache
```

### View Real-time Logs
```bash
docker-compose -f Config/docker-compose.yml logs -f
```

### Execute Commands in Container
```bash
docker-compose -f Config/docker-compose.yml exec backend bash
```

### Remove All Services & Data
```bash
docker-compose -f Config/docker-compose.yml down -v
```

---

## 🔐 Environment Variables

### Setup

1. Copy the template file:
```bash
copy .env.example ..\.env  # Windows
# or
cp .env.example ../.env    # macOS/Linux
```

2. Edit `.env` with your values:
```bash
# .env file (in BackEnd root)
MONGODB_URI=mongodb+srv://gemnet_admin:password@cluster.mongodb.net/gemnet_db
JAVA_OPTS=-Xmx512m -Xms256m
SERVER_PORT=9091
SPRING_PROFILES_ACTIVE=prod
```

3. Spring Boot loads from `.env` automatically when using Docker Compose

### .env.example Template

See `.env.example` in this folder for all available variables:
- `MONGODB_URI` - MongoDB connection string for all environments
- `SPRING_PROFILES_ACTIVE` - Active profile (dev/prod)
- `JAVA_OPTS` - JVM memory and options
- `SERVER_PORT` - Application port
- Face detection settings
- Advertisement settings
- And more...

**Important:** Never commit `.env` file - it contains secrets!

Reference in compose file:
```yaml
environment:
  - MONGODB_URI=${MONGODB_URI}
  - JAVA_OPTS=${JAVA_OPTS}
```

---

## 📊 Comparison

| Feature | Development | Production |
|---------|-------------|-----------|
| Docker Image | standard | optimized |
| Resource Limits | None | Limited |
| Health Checks | No | Yes |
| Restart Policy | No | Auto |
| Logging | Standard | Enhanced |
| Database | Local/Atlas | Atlas only |
| Performance | Standard | Optimized |

---

## 🚀 Common Workflows

### Quick Start (Development)
```bash
docker-compose -f Config/docker-compose.yml up -d
# Access at http://localhost:9091
```

### Production Deployment
```bash
# Set environment variables
export MONGODB_URI="mongodb+srv://..."

# Start with production config
docker-compose -f Config/docker-compose.production.yml up -d
```

### Development with Logs
```bash
docker-compose -f Config/docker-compose.yml up
# Ctrl+C to stop
```

### Multi-service Setup
```bash
# If you have frontend too:
docker-compose -f FrontEnd/docker-compose.yml up -d
docker-compose -f BackEnd/Config/docker-compose.yml up -d
```

---

## � Railway Deployment

The `railway.json` file contains Railway.app deployment configuration.

### Quick Deploy to Railway

1. **Install Railway CLI:**
```bash
npm install -g @railway/cli
```

2. **Login to Railway:**
```bash
railway login
```

3. **Link your project:**
```bash
railway link
```

4. **Deploy:**
```bash
railway up
```

### railway.json Configuration

The `railway.json` file specifies:
- Build command: `mvn clean package -DskipTests`
- Start command: `java -jar target/gemnet-*.jar`
- Environment: Java runtime
- Port: 9091

See [Railway Deployment Guide](../../Documentation/05-DEPLOYMENT-GUIDE.md) for detailed instructions.

---

## �🐛 Troubleshooting

### Port Already in Use
```bash
# Find what's using port 9091
netstat -ano | findstr :9091

# Stop container using that port
docker stop container-name
```

### MongoDB Connection Error
```bash
# Verify MongoDB is running
docker-compose -f Config/docker-compose.yml ps mongodb

# Check logs
docker-compose -f Config/docker-compose.yml logs mongodb
```

### Out of Memory
```bash
# Increase memory in docker-compose.production.yml
# Or increase Docker Desktop memory in settings
```

### Service Won't Start
```bash
# View detailed logs
docker-compose -f Config/docker-compose.yml logs --tail=100 backend

# Rebuild image
docker-compose -f Config/docker-compose.yml build --no-cache
```

---

## 📝 Notes

- Both files are in this directory for organization
- Use `-f` flag to specify which file to use
- Environment variables can be in `.env` file
- Production config recommended for any non-local deployment
- Always set MONGODB_URI for external databases

---

## 🔗 Related Files

- Dockerfiles: See `../Docker/README.md`
- Deployment Scripts: See `../Scripts/`
- Deployment Guide: See `../../Documentation/05-DEPLOYMENT-GUIDE.md`

---

**Last Updated:** April 26, 2026
