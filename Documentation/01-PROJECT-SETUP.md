# 01 - GemNet Project Setup & Structure

## Project Overview

**GemNet** is a comprehensive Face Recognition Identity Verification System for a gemstone trading marketplace. It combines modern web technologies with AI/ML capabilities for secure, efficient gemstone trading.

### Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Ant Design (UI components)
- Axios (HTTP client)

**Backend:**
- Java 17 with Spring Boot 3.2
- Maven (build tool)
- MongoDB (database)
- Spring Security (authentication)
- Swagger (API documentation)

**Additional:**
- Docker & Docker Compose
- MongoDB Atlas (cloud database)
- Railway (deployment platform)

## Project Structure

```
FrontEnd-BackEnd-Phase-1/
├── FrontEnd/                           # React + TypeScript application
│   ├── src/
│   │   ├── components/                 # React components
│   │   ├── pages/                      # Page components
│   │   ├── services/                   # API services
│   │   ├── contexts/                   # React contexts
│   │   ├── types/                      # TypeScript types
│   │   └── utils/                      # Utility functions
│   ├── public/                         # Static assets
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── BackEnd/                            # Spring Boot application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/gemnet/
│   │   │   │   ├── controller/         # REST controllers
│   │   │   │   ├── service/            # Business logic
│   │   │   │   ├── repository/         # Data access
│   │   │   │   ├── model/              # Domain entities
│   │   │   │   └── config/             # Spring configuration
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── templates/
│   │   └── test/                       # Tests
│   ├── pom.xml                         # Maven configuration
│   ├── Dockerfile                      # Container image
│   └── docker-compose.yml              # Container orchestration
│
├── ml-model/                           # ML price prediction service
├── uploads/                            # File storage (images, videos, etc.)
├── dataset/                            # Training data
└── Documentation/                      # Project documentation (this folder)
```

## Quick Start

### Prerequisites
- Java JDK 17 or higher
- Node.js 18+ with npm
- MongoDB (local or Atlas cloud)
- Docker & Docker Compose (optional, for containerized deployment)

### Running the Application

#### 1. Backend Setup
```bash
cd BackEnd

# Option A: Run with Maven
./apache-maven-3.9.10/bin/mvn clean package -DskipTests
java -jar target/gemnet-backend-0.0.1-SNAPSHOT.jar

# Option B: Run with script (Windows)
./run-backend.ps1

# Backend will be available at:
# - Application: http://localhost:9091
# - Swagger UI: http://localhost:9091/swagger-ui.html
```

#### 2. Frontend Setup
```bash
cd FrontEnd

# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev

# Frontend will be available at:
# - Application: http://localhost:3000
```

#### 3. MongoDB Setup
- See [06-MONGODB-SETUP.md](./06-MONGODB-SETUP.md) for database configuration

## Key Features

### 🔐 User Registration & Verification
- Multi-step registration process
- Face biometric verification using AI
- NIC document verification with OCR
- Admin approval workflow
- Role-based access control (Buyer, Seller, Admin)

### 📢 Advertisement Management
- Create and manage gemstone advertisements
- Media gallery (images and videos)
- Admin review and approval system
- Seller profile integration

### 📋 Listing & Bidding System
- Create detailed gemstone listings
- Certified and non-certified gemstone support
- Real-time bidding with countdown timers
- AI-powered price predictions
- Purchase history tracking

### 💰 Price Prediction
- Machine learning-based price prediction
- Historical data analysis
- Market trend analysis

### 👥 User Management
- Role-based dashboards (Buyer, Seller, Admin)
- User profile management
- Commission and payment tracking

## Environment Configuration

Create a `.env` file in the BackEnd folder:
```properties
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gemnet_db

# Application
SERVER_PORT=9091
SERVER_SERVLET_CONTEXT_PATH=/

# Email
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

## Deployment Options

1. **Local Development** - See section above
2. **Docker** - See [05-DEPLOYMENT-GUIDE.md](./05-DEPLOYMENT-GUIDE.md)
3. **Railway** - See [05-DEPLOYMENT-GUIDE.md](./05-DEPLOYMENT-GUIDE.md)
4. **AWS/Azure/GCP** - Standard Docker image deployment

## Build & Package

### Frontend
```bash
cd FrontEnd
npm run build        # Creates dist/ folder
npm run preview      # Preview production build
```

### Backend
```bash
cd BackEnd
./apache-maven-3.9.10/bin/mvn clean package
# Creates target/gemnet-backend-0.0.1-SNAPSHOT.jar
```

## Useful Commands

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build
npm install          # Install dependencies
```

### Backend
```bash
# Using Maven script
./apache-maven-3.9.10/bin/mvn clean compile
./apache-maven-3.9.10/bin/mvn clean package TestSkipTests

# Check Java version
java -version

# Run application
java -jar target/gemnet-backend-0.0.1-SNAPSHOT.jar
```

## Default Ports

| Service | Port |
|---------|------|
| Frontend (Vite) | 3000 |
| Backend (Spring Boot) | 9091 |
| MongoDB (local) | 27017 |
| Swagger UI | 9091/swagger-ui.html |

## Documentation Files

Navigate to the `Documentation/` folder for detailed guides:

1. **01-PROJECT-SETUP.md** - This file
2. **02-USER-REGISTRATION-VERIFICATION.md** - User verification system
3. **03-LISTING-BIDDING-SYSTEM.md** - Marketplace features
4. **04-ADVERTISEMENT-MANAGEMENT.md** - Admin features
5. **05-DEPLOYMENT-GUIDE.md** - Production deployment
6. **06-MONGODB-SETUP.md** - Database configuration
7. **07-TESTING-STRATEGY.md** - Testing approach

## Common Issues & Solutions

### Issue: Port 3000 already in use
**Solution:** Vite will automatically use the next available port (e.g., 3001, 3002)

### Issue: MongoDB connection refused
**Solution:** Ensure MongoDB is running or use MongoDB Atlas cloud database

### Issue: Java version mismatch
**Solution:** Ensure Java 17+ is installed: `java -version`

### Issue: npm packages conflicts
**Solution:** Use `npm install --legacy-peer-deps` flag

## Support & Resources

- **API Documentation**: http://localhost:9091/swagger-ui.html (when running)
- **Frontend Code**: See `FrontEnd/src` directory
- **Backend Code**: See `BackEnd/src/main/java` directory
- **Database Scripts**: See `BackEnd/*.bat` files

## Next Steps

1. Complete your [DATABASE SETUP](./06-MONGODB-SETUP.md)
2. Review the [USER REGISTRATION SYSTEM](./02-USER-REGISTRATION-VERIFICATION.md)
3. Understand the [LISTING & BIDDING SYSTEM](./03-LISTING-BIDDING-SYSTEM.md)
4. Learn about [DEPLOYMENT OPTIONS](./05-DEPLOYMENT-GUIDE.md)
