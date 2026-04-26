# GemNet - Face Recognition Identity Verification & Gemstone Trading Platform

**Status:** ✅ Production Ready | **Version:** 1.0.0

Comprehensive gemstone trading marketplace with advanced user verification, real-time bidding, and AI-powered price prediction.

## 🎯 Project Highlights

- **🔐 Secure User Verification:** Face recognition + NIC document verification
- **📋 Smart Listings:** Multi-step wizard with AI price suggestions
- **🏆 Real-time Auctions:** Live bidding with 4-day countdown timers
- **💰 AI Price Prediction:** Machine learning-based market analysis
- **👥 Role-Based Access:** Buyer, Seller, and Admin dashboards
- **📢 Advertisement Management:** Media gallery with admin approval workflow

## 🚀 Quick Start

### Prerequisites
- Java JDK 17+
- Node.js 18+
- MongoDB (local or Atlas)
- npm (comes with Node.js)

### Start the Application (3 Steps)

**1. Backend**
```bash
cd BackEnd
./apache-maven-3.9.10/bin/mvn clean package -DskipTests
java -jar target/gemnet-backend-0.0.1-SNAPSHOT.jar
```

**2. Frontend** (New Terminal)
```bash
cd FrontEnd
npm install --legacy-peer-deps
npm run dev
```

**3. Access**
- Frontend: http://localhost:3000
- Backend API: http://localhost:9091
- Swagger UI: http://localhost:9091/swagger-ui.html

✨ **That's it! The application is running.**

## 📖 Documentation

Complete documentation is available in the `Documentation/` folder:

| Guide | Purpose |
|-------|---------|
| **[01-PROJECT-SETUP.md](./Documentation/01-PROJECT-SETUP.md)** | Quick start & project structure |
| **[02-USER-REGISTRATION-VERIFICATION.md](./Documentation/02-USER-REGISTRATION-VERIFICATION.md)** | User verification system |
| **[03-LISTING-BIDDING-SYSTEM.md](./Documentation/03-LISTING-BIDDING-SYSTEM.md)** | Marketplace & auction system |
| **[04-ADVERTISEMENT-MANAGEMENT.md](./Documentation/04-ADVERTISEMENT-MANAGEMENT.md)** | Admin advertisement features |
| **[05-DEPLOYMENT-GUIDE.md](./Documentation/05-DEPLOYMENT-GUIDE.md)** | Production deployment options |
| **[06-MONGODB-SETUP.md](./Documentation/06-MONGODB-SETUP.md)** | Database configuration |
| **[07-TESTING-STRATEGY.md](./Documentation/07-TESTING-STRATEGY.md)** | Testing approaches & CI/CD |

👉 **Start with [Documentation/README.md](./Documentation/README.md) for a complete guide index.**

## 🏗️ Project Structure

```
FrontEnd-BackEnd-Phase-1/
├── FrontEnd/                    # React + TypeScript frontend
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Page routes
│   │   ├── services/           # API services
│   │   └── ...
│   ├── package.json
│   └── vite.config.ts
│
├── BackEnd/                     # Spring Boot backend
│   ├── src/main/java/
│   ├── pom.xml
│   └── Dockerfile
│
├── Documentation/               # Comprehensive guides (START HERE!)
│   ├── 01-PROJECT-SETUP.md
│   ├── 02-USER-REGISTRATION-VERIFICATION.md
│   ├── 03-LISTING-BIDDING-SYSTEM.md
│   ├── 04-ADVERTISEMENT-MANAGEMENT.md
│   ├── 05-DEPLOYMENT-GUIDE.md
│   ├── 06-MONGODB-SETUP.md
│   ├── 07-TESTING-STRATEGY.md
│   └── README.md                # Documentation hub
│
├── uploads/                     # File storage (images, videos)
├── .github/                     # GitHub configurations
└── README.md                    # This file
```

## 💻 Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Ant Design |
| **Backend** | Java 17, Spring Boot 3.2, Maven, Spring Security |
| **Database** | MongoDB (Atlas Cloud or Local) |
| **Deployment** | Docker, Railway, AWS, Azure |
| **Testing** | Jest, JUnit 5, Playwright, JMeter |

## 🔑 Key Features

### 🔐 **User Registration & Verification**
- 4-step registration process
- Face biometric verification
- NIC document verification with OCR
- Admin approval workflow
- Role-based access (Buyer/Seller/Admin)

### 📋 **Listings & Bidding**
- Create detailed gemstone listings
- Certified & non-certified support
- Real-time auction bidding
- AI price prediction
- Purchase history tracking

### 📢 **Advertisement Management**
- Create seller advertisements
- Media gallery (images & videos)
- Admin review & approval
- Seller verification integration

### 💰 **Price Prediction**
- Machine learning predictions
- Market trend analysis
- Historical data comparison

### 👥 **Admin Dashboard**
- User verification queue
- Advertisement approval
- Sales monitoring
- Performance analytics

## 🚢 Deployment Options

| Platform | Best For | Setup Time |
|----------|----------|-----------|
| **Local** | Development | 5 min |
| **Docker** | Team development | 10 min |
| **Railway** | Quick production | 15 min |
| **AWS** | Enterprise scale | 30 min |
| **Azure** | Enterprise scale | 30 min |

→ See [Documentation/05-DEPLOYMENT-GUIDE.md](./Documentation/05-DEPLOYMENT-GUIDE.md) for detailed instructions.

## 📚 Getting Help

### Common Questions?

**"How do I get started?"**
→ Read [Documentation/01-PROJECT-SETUP.md](./Documentation/01-PROJECT-SETUP.md)

**"How does user verification work?"**
→ Read [Documentation/02-USER-REGISTRATION-VERIFICATION.md](./Documentation/02-USER-REGISTRATION-VERIFICATION.md)

**"How do I deploy to production?"**
→ Read [Documentation/05-DEPLOYMENT-GUIDE.md](./Documentation/05-DEPLOYMENT-GUIDE.md)

**"How do I set up MongoDB?"**
→ Read [Documentation/06-MONGODB-SETUP.md](./Documentation/06-MONGODB-SETUP.md)

**"How do I write tests?"**
→ Read [Documentation/07-TESTING-STRATEGY.md](./Documentation/07-TESTING-STRATEGY.md)

## ⚙️ Configuration

### Environment Variables

**Backend** (`BackEnd/src/main/resources/application.properties`):
```properties
# Database
spring.data.mongodb.uri=mongodb+srv://user:pass@cluster.mongodb.net/gemnet_db

# Server
server.port=9091

# Email (if configured)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
```

**Frontend** (`.env.local`):
```bash
REACT_APP_API_URL=http://localhost:9091
REACT_APP_ENV=development
```

## 🧪 Testing

### Run Tests

**Backend**
```bash
cd BackEnd
./apache-maven-3.9.10/bin/mvn test
```

**Frontend**
```bash
cd FrontEnd
npm test
```

**E2E Tests**
```bash
cd FrontEnd
npm run e2e
```

→ See [Documentation/07-TESTING-STRATEGY.md](./Documentation/07-TESTING-STRATEGY.md) for complete testing guide.

## 🔧 Build & Compile

### Frontend
```bash
cd FrontEnd
npm run build              # Production build
npm run preview           # Preview build
npm run lint              # ESLint check
```

### Backend
```bash
cd BackEnd
./apache-maven-3.9.10/bin/mvn clean package    # Build JAR
./apache-maven-3.9.10/bin/mvn clean verify     # Run all tests
```

## 📊 API Documentation

When running the backend, access Swagger UI:

**http://localhost:9091/swagger-ui.html**

Or see documentation:
- **User API:** [Documentation/02-USER-REGISTRATION-VERIFICATION.md](./Documentation/02-USER-REGISTRATION-VERIFICATION.md#api-endpoints)
- **Listing API:** [Documentation/03-LISTING-BIDDING-SYSTEM.md](./Documentation/03-LISTING-BIDDING-SYSTEM.md#api-endpoints)
- **Advertisement API:** [Documentation/04-ADVERTISEMENT-MANAGEMENT.md](./Documentation/04-ADVERTISEMENT-MANAGEMENT.md#api-endpoints)

## 🌐 Default Ports & URLs

| Service | URL | Port |
|---------|-----|------|
| Frontend | http://localhost:3000 | 3000 |
| Backend API | http://localhost:9091 | 9091 |
| Swagger UI | http://localhost:9091/swagger-ui.html | 9091 |
| MongoDB | localhost | 27017 |

## 📦 Using Docker

### Quick Start with Docker Compose
```bash
docker-compose up -d
```

### Build Individual Images
```bash
# Backend
cd BackEnd && docker build -t gemnet-backend:latest .

# Frontend
cd FrontEnd && docker build -t gemnet-frontend:latest .
```

→ See [Documentation/05-DEPLOYMENT-GUIDE.md](./Documentation/05-DEPLOYMENT-GUIDE.md#docker-deployment) for details.

## ✅ Production Checklist

Before deploying to production:
- [ ] All tests passing (>80% coverage)
- [ ] Security vulnerabilities checked
- [ ] Performance benchmarks met
- [ ] Database backups configured
- [ ] SSL/TLS certificates installed
- [ ] Environment variables configured
- [ ] Monitoring & logging enabled
- [ ] Disaster recovery plan ready

→ See [Documentation/05-DEPLOYMENT-GUIDE.md](./Documentation/05-DEPLOYMENT-GUIDE.md#production-checklist)

## 🚀 Next Steps

1. **Read Documentation:** Start with [Documentation/README.md](./Documentation/README.md)
2. **Run Locally:** Follow quick start above
3. **Explore Features:** Check each feature guide
4. **Write Tests:** See [Documentation/07-TESTING-STRATEGY.md](./Documentation/07-TESTING-STRATEGY.md)
5. **Deploy:** Choose platform in [Documentation/05-DEPLOYMENT-GUIDE.md](./Documentation/05-DEPLOYMENT-GUIDE.md)

## 📝 Notes

- Frontend automatically uses the next available port if 3000 is in use
- Ensure MongoDB is running before starting backend
- Use `npm install --legacy-peer-deps` for frontend dependencies
- Java 17+ required for backend

## 🤝 Contributing

1. Read relevant documentation
2. Follow the testing strategy
3. Write tests for new features
4. Commit with clear messages
5. Update documentation

## 📄 License

[Your License Here]

## 💬 Support

For issues or questions:
1. Check [Documentation/README.md](./Documentation/README.md)
2. Review troubleshooting sections in relevant guides
3. Check GitHub issues
4. Contact team

---

**Ready to get started?** → Jump to [Documentation/01-PROJECT-SETUP.md](./Documentation/01-PROJECT-SETUP.md) 🎉

**Last Updated:** April 26, 2026 | **Version:** 1.0.0