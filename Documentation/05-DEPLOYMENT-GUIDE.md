# 05 - Deployment Guide

## Deployment Options

GemNet supports multiple deployment platforms suitable for different needs:

| Platform | Best For | Difficulty | Cost |
|----------|----------|-----------|------|
| Local Development | Testing & Development | Easy | Free |
| Docker Compose | Team Development | Easy | Free |
| Railway | Quick Production | Medium | $5-20/mo |
| AWS | Enterprise Scale | Hard | $50-500+/mo |
| Azure | Enterprise Scale | Hard | $50-500+/mo |

## 1. Local Development Deployment

### Prerequisites
- Java JDK 17
- Node.js 18+
- MongoDB (local or Atlas)
- npm (comes with Node.js)

### Setup Steps

**Backend:**
```bash
cd BackEnd

# Build the application
./apache-maven-3.9.10/bin/mvn clean package -DskipTests

# Run the application
java -jar target/gemnet-backend-0.0.1-SNAPSHOT.jar
```

**Frontend:**
```bash
cd FrontEnd

# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev
```

**Access Points:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:9091
- Swagger UI: http://localhost:9091/swagger-ui.html

## 2. Docker Deployment

### Prerequisites
- Docker Desktop installed
- Docker Compose (included with Docker Desktop)

### Docker Images

**Backend Dockerfile:**
```dockerfile
FROM openjdk:17-jdk-slim

WORKDIR /app

# Copy built JAR
COPY target/gemnet-backend-0.0.1-SNAPSHOT.jar app.jar

# Environment
ENV JAVA_OPTS="-Xmx512m -Xms256m"
ENV MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gemnet_db

EXPOSE 9091

ENTRYPOINT ["java", "-jar", "app.jar"]
```

**Backend Build:**
```bash
cd BackEnd

# Build JAR first
./apache-maven-3.9.10/bin/mvn clean package -DskipTests

# Build Docker image
docker build -t gemnet-backend:latest .
```

**Frontend Dockerfile:**
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Production image
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Frontend Build:**
```bash
cd FrontEnd

# Build Docker image
docker build -t gemnet-frontend:latest .
```

### Docker Compose

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  frontend:
    build: ./FrontEnd
    ports:
      - "3000:80"
    environment:
      - REACT_APP_API_URL=http://localhost:9091
    depends_on:
      - backend

  backend:
    build: ./BackEnd
    ports:
      - "9091:9091"
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - JAVA_OPTS=-Xmx512m
    depends_on:
      - mongodb

  mongodb:
    image: mongo:6.0
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

**Deployment Steps:**
```bash
# Clone repository
git clone your-repo-url
cd FrontEnd-BackEnd-Phase-1

# Set environment variables
export MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gemnet_db

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 3. Railway Deployment

### Prerequisites
- Railway account (https://railway.app)
- Git repository
- GitHub or GitLab connected

### Step 1: Create Railway Project

1. Log in to Railway
2. Click "Start a New Project"
3. Select "Deploy from GitHub"
4. Authorize Railway with GitHub
5. Select your repository

### Step 2: Configure Services

**Backend Service:**
```bash
# Environment Variables:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gemnet_db
JAVA_OPTS=-Xmx512m
PORT=9091
```

**Frontend Service:**
```bash
# Environment Variables:
REACT_APP_API_URL=https://backend-railway-url.railway.app
```

### Step 3: Database (MongoDB Atlas)

1. Create MongoDB Atlas account
2. Set up free M0 cluster
3. Get connection string
4. Add to environment variables in Railway

### Step 4: Deploy

```bash
# Push to repository
git add .
git commit -m "Ready for deployment"
git push origin main

# Railway automatically deploys on push
# Monitor deployment in Railway dashboard
```

## 4. AWS Deployment

### Architecture

```
┌─────────────────────────────────────────────────┐
│              AWS INFRASTRUCTURE                  │
├─────────────────────────────────────────────────┤
│                                                 │
│  Route 53 (DNS)                                │
│      ↓                                          │
│  CloudFront (CDN)                              │
│      ↓                                          │
│  ┌─────────────────────────────────────┐      │
│  │  Application Load Balancer          │      │
│  └──────────────┬──────────────────────┘      │
│                 ├─ Frontend (ECS)               │
│                 └─ Backend (ECS)                │
│                                                 │
│  RDS Database (MongoDB)                        │
│  S3 (File Storage)                             │
│  CloudWatch (Logging)                          │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Deployment Steps

1. **Create EC2 Instance or use ECS**
   ```bash
   # SSH into instance
   ssh -i your-key.pem ubuntu@your-instance
   
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   ```

2. **Push Docker Images to ECR**
   ```bash
   # Create ECR repositories
   aws ecr create-repository --repository-name gemnet-backend
   aws ecr create-repository --repository-name gemnet-frontend
   
   # Push images
   docker tag gemnet-backend:latest AWS_ACCOUNT.dkr.ecr.REGION.amazonaws.com/gemnet-backend:latest
   docker push AWS_ACCOUNT.dkr.ecr.REGION.amazonaws.com/gemnet-backend:latest
   ```

3. **Set up RDS Database**
   ```bash
   # Create MongoDB Atlas cluster for production
   # Or use Amazon DocumentDB (MongoDB-compatible)
   ```

4. **Configure Application Load Balancer**
   - Route /api* to backend service
   - Route /* to frontend service

5. **Deploy with ECS or Kubernetes**
   - Update task/pod definitions
   - Deploy services
   - Monitor via CloudWatch

## 5. Azure Deployment

### Azure Container Instances

```bash
# Login to Azure
az login

# Create resource group
az group create --name gemnet-rg --location eastus

# Create Container Registry
az acr create --resource-group gemnet-rg --name gemnetregistry --sku Basic

# Build and push images
az acr build --registry gemnetregistry --image gemnet-backend:latest ./BackEnd
az acr build --registry gemnetregistry --image gemnet-frontend:latest ./FrontEnd

# Create Azure Cosmos DB (MongoDB-compatible)
az cosmosdb create --resource-group gemnet-rg --name gemnet-db --kind MongoDB

# Deploy containers
az container create \
  --resource-group gemnet-rg \
  --name gemnet-backend \
  --image gemnetregistry.azurecr.io/gemnet-backend:latest \
  --environment-variables MONGODB_URI=your-cosmos-uri \
  --ports 9091 \
  --cpu 1 --memory 1
```

## Production Checklist

### Security
- [ ] Use HTTPS/SSL certificates
- [ ] Set strong database passwords
- [ ] Enable firewall rules
- [ ] Use environment variables for secrets
- [ ] Enable API rate limiting
- [ ] Set up WAF (Web Application Firewall)
- [ ] Regular security audits

### Performance
- [ ] Enable caching (Redis)
- [ ] Use CDN for static assets
- [ ] Database connection pooling configured
- [ ] Load balancing enabled
- [ ] Monitor response times
- [ ] Set up horizontal scaling

### Monitoring
- [ ] Application logs aggregated
- [ ] Error tracking (Sentry, rollbar)
- [ ] Performance monitoring (New Relic, DataDog)
- [ ] Database monitoring
- [ ] Uptime monitoring
- [ ] Alert system configured

### Backup & Recovery
- [ ] Database backups scheduled (daily)
- [ ] File storage backups configured
- [ ] Backup restoration tested
- [ ] Disaster recovery plan documented
- [ ] RTO/RPO defined

### Scaling
- [ ] Horizontal scaling configured
- [ ] Load balancing in place
- [ ] Database replicas (if needed)
- [ ] Cache layer implemented
- [ ] Auto-scaling rules defined

## Environment Variables

### Backend
```properties
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/gemnet_db

# Server
SERVER_PORT=9091
SERVER_SERVLET_CONTEXT_PATH=/

# Email
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# Security
JWT_SECRET=your-very-secure-secret-key
JWT_EXPIRATION=86400000

# File Upload
FILE_UPLOAD_DIR=/uploads
MAX_FILE_SIZE=10485760

# AWS S3 (if using)
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_S3_BUCKET=gemnet-uploads
AWS_REGION=us-east-1

# Payment Gateway (if integrated)
PAYMENT_GATEWAY_KEY=xxx
PAYMENT_WEBHOOK_SECRET=xxx
```

### Frontend
```bash
REACT_APP_API_URL=https://api.gemnet.com
REACT_APP_ENV=production
REACT_APP_SENTRY_DSN=https://xxx@sentry.io/xxx
```

## Monitoring & Logs

### Application Logs
```bash
# View logs
docker logs container-name

# Stream logs
docker logs -f container-name

# Save logs
docker logs container-name > app-logs.txt
```

### Database Monitoring
- MongoDB Atlas Dashboard
- Monitor connections
- Check performance metrics
- Review slow queries

### Uptime Monitoring
- Use services like UptimeRobot
- Set up alerts
- Monitor response times
- Track error rates

## Troubleshooting Deployment

### Common Issues

**Issue: Connection Refused**
- Check service is running
- Verify ports are open
- Check firewall rules
- Verify environment variables

**Issue: Out of Memory**
- Increase JVM heap size
- Increase container memory allocation
- Optimize queries
- Implement caching

**Issue: Database Connection Failed**
- Verify connection string
- Check credentials
- Verify network access
- Check firewall rules

**Issue: File Upload Failures**
- Check disk space
- Verify permissions
- Check file size limits
- Verify upload directory exists

## Backup & Recovery

### Database Backup

```bash
# MongoDB backup
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/gemnet_db" --out ./backup

# Restore
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/gemnet_db" ./backup
```

### File Storage Backup

```bash
# Backup uploads directory
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz uploads/

# Restore
tar -xzf uploads-backup-20240101.tar.gz
```

## Performance Tuning

### Database Optimization
- Create indexes on frequently queried fields
- Use connection pooling
- Monitor query performance
- Archive old data regularly

### API Optimization
- Implement API caching
- Use pagination for large datasets
- Compress responses
- Optimize database queries

### Frontend Optimization
- Minify and bundle JavaScript
- Compress images
- Use lazy loading
- Implement service workers

## Related Documentation

- See [01-PROJECT-SETUP.md](./01-PROJECT-SETUP.md) for local setup
- See [06-MONGODB-SETUP.md](./06-MONGODB-SETUP.md) for database configuration
- See [07-TESTING-STRATEGY.md](./07-TESTING-STRATEGY.md) for testing before deployment
