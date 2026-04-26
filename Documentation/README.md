# GemNet Documentation Hub

**Welcome to the GemNet Project Documentation**

This folder contains comprehensive guides for the GemNet Face Recognition Identity Verification & Gemstone Trading Platform.

## 📚 Documentation Files (In Reading Order)

### 1. **[Project Setup & Structure](./01-PROJECT-SETUP.md)**
   - Project overview and tech stack
   - Quick start guide for local development
   - Project folder structure
   - Default ports and configuration
   - Common issues and solutions

### 2. **[User Registration & Verification System](./02-USER-REGISTRATION-VERIFICATION.md)**
   - Multi-step registration process
   - Face biometric verification
   - NIC document verification with OCR
   - Admin approval workflow
   - Database schemas
   - API endpoints

### 3. **[Listing & Bidding System](./03-LISTING-BIDDING-SYSTEM.md)**
   - Creating gemstone listings
   - Multi-step listing wizard
   - Dual certification support (certified/non-certified)
   - Real-time bidding mechanics
   - Automated countdown timers
   - Purchase history tracking
   - Transaction processing

### 4. **[Advertisement Management System](./04-ADVERTISEMENT-MANAGEMENT.md)**
   - Creating advertisements
   - Media management (images and videos)
   - Admin review dashboard
   - Seller profile integration
   - Verification indicators
   - Communication tools

### 5. **[Deployment Guide](./05-DEPLOYMENT-GUIDE.md)**
   - Local deployment
   - Docker & Docker Compose deployment
   - Railway deployment
   - AWS deployment
   - Azure deployment
   - Production checklist
   - Environment configuration
   - Monitoring and logs
   - Backup & recovery

### 6. **[MongoDB Setup & Configuration](./06-MONGODB-SETUP.md)**
   - MongoDB Atlas cloud setup
   - Local MongoDB installation
   - Connection configuration
   - Database structure and collections
   - Backup and restore procedures
   - Database optimization
   - Connection troubleshooting
   - Security best practices

### 7. **[Testing Strategy & Implementation](./07-TESTING-STRATEGY.md)**
   - Frontend unit testing (React)
   - Backend unit testing (Spring Boot)
   - Integration testing
   - E2E testing with Playwright
   - API testing
   - Performance testing
   - Security testing
   - CI/CD integration
   - Test reporting and coverage

---

## Quick Start

### First Time Setup?
1. Read **[01-PROJECT-SETUP.md](./01-PROJECT-SETUP.md)** - Get the project running locally
2. Read **[06-MONGODB-SETUP.md](./06-MONGODB-SETUP.md)** - Configure your database
3. Start developing!

### Want to Deploy?
1. Read **[05-DEPLOYMENT-GUIDE.md](./05-DEPLOYMENT-GUIDE.md)** - Choose your platform
2. Read **[07-TESTING-STRATEGY.md](./07-TESTING-STRATEGY.md)** - Test before deploying

### Understanding Features?
- **User System:** [02-USER-REGISTRATION-VERIFICATION.md](./02-USER-REGISTRATION-VERIFICATION.md)
- **Marketplace:** [03-LISTING-BIDDING-SYSTEM.md](./03-LISTING-BIDDING-SYSTEM.md)
- **Admin Features:** [04-ADVERTISEMENT-MANAGEMENT.md](./04-ADVERTISEMENT-MANAGEMENT.md)

---

## Project Structure

```
Documentation/
├── 01-PROJECT-SETUP.md                 # Project overview and quick start
├── 02-USER-REGISTRATION-VERIFICATION.md # Registration system details
├── 03-LISTING-BIDDING-SYSTEM.md        # Marketplace and bidding
├── 04-ADVERTISEMENT-MANAGEMENT.md      # Admin advertisement features
├── 05-DEPLOYMENT-GUIDE.md              # Deployment to various platforms
├── 06-MONGODB-SETUP.md                 # Database configuration
├── 07-TESTING-STRATEGY.md              # Testing approaches
└── README.md                           # This file
```

---

## Key Features Overview

### 🔐 User Management
- Multi-step registration with face recognition
- Biometric verification
- Document (NIC) verification
- Admin approval workflow
- Role-based access control

### 📋 Marketplace
- Create and manage listings
- Real-time bidding system
- Automated auctions
- AI-powered price predictions
- Purchase history tracking

### 📢 Advertisement System
- Create product advertisements
- Media gallery management
- Admin review and approval
- Seller profile integration

### 🛠️ Admin Dashboard
- User verification queue
- Advertisement approval workflow
- Sales monitoring
- Performance analytics

---

## Technology Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | Java 17, Spring Boot 3.2, Maven |
| Database | MongoDB Atlas (Cloud) / Local MongoDB |
| Deployment | Docker, Railway, AWS, Azure |
| Testing | Jest, JUnit, Playwright, JMeter |
| CI/CD | GitHub Actions |

---

## Running the Project

### All in OneCommand

**Development Environment:**
```bash
# Terminal 1: Backend
cd BackEnd
./apache-maven-3.9.10/bin/mvn clean package -DskipTests
java -jar target/gemnet-backend-0.0.1-SNAPSHOT.jar

# Terminal 2: Frontend
cd FrontEnd
npm install --legacy-peer-deps
npm run dev
```

**Access Points:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:9091
- Swagger Docs: http://localhost:9091/swagger-ui.html

### Using Docker
```bash
docker-compose up -d
```

---

## Common Tasks

### 📖 How to...

**Set up development environment?**
→ See [01-PROJECT-SETUP.md](./01-PROJECT-SETUP.md)

**Register a user?**
→ See [02-USER-REGISTRATION-VERIFICATION.md](./02-USER-REGISTRATION-VERIFICATION.md)

**Create a listing?**
→ See [03-LISTING-BIDDING-SYSTEM.md](./03-LISTING-BIDDING-SYSTEM.md)

**Manage advertisements?**
→ See [04-ADVERTISEMENT-MANAGEMENT.md](./04-ADVERTISEMENT-MANAGEMENT.md)

**Deploy to production?**
→ See [05-DEPLOYMENT-GUIDE.md](./05-DEPLOYMENT-GUIDE.md)

**Configure MongoDB?**
→ See [06-MONGODB-SETUP.md](./06-MONGODB-SETUP.md)

**Write and run tests?**
→ See [07-TESTING-STRATEGY.md](./07-TESTING-STRATEGY.md)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend won't start | Check Java 17 is installed, see [01-PROJECT-SETUP.md](./01-PROJECT-SETUP.md#troubleshooting) |
| Frontend port in use | Vite uses next available port, see [01-PROJECT-SETUP.md](./01-PROJECT-SETUP.md#troubleshooting) |
| Database connection failed | Check MongoDB setup in [06-MONGODB-SETUP.md](./06-MONGODB-SETUP.md#troubleshooting) |
| Tests not working | Review test setup in [07-TESTING-STRATEGY.md](./07-TESTING-STRATEGY.md) |

---

## Development Workflow

1. **Read relevant documentation** for the feature you're working on
2. **Set up environment** using [01-PROJECT-SETUP.md](./01-PROJECT-SETUP.md)
3. **Understand the system** by reading related guides
4. **Write tests** following [07-TESTING-STRATEGY.md](./07-TESTING-STRATEGY.md)
5. **Implement feature**
6. **Test thoroughly**
7. **Deploy** using [05-DEPLOYMENT-GUIDE.md](./05-DEPLOYMENT-GUIDE.md)

---

## Database Models Reference

### Key Collections
- **users** - User accounts and profiles
- **listings** - Gemstone listings
- **advertisements** - Seller advertisements
- **bids** - Auction bids
- **purchases** - Transaction records

→ See [06-MONGODB-SETUP.md](./06-MONGODB-SETUP.md#database-structure-collections) for detailed schemas

---

## API Documentation

Complete API documentation is available via Swagger UI when running the backend:

**Swagger UI:** http://localhost:9091/swagger-ui.html

Or see individual guides:
- Authentication: [02-USER-REGISTRATION-VERIFICATION.md](./02-USER-REGISTRATION-VERIFICATION.md#api-endpoints)
- Listings: [03-LISTING-BIDDING-SYSTEM.md](./03-LISTING-BIDDING-SYSTEM.md#api-endpoints)
- Advertisements: [04-ADVERTISEMENT-MANAGEMENT.md](./04-ADVERTISEMENT-MANAGEMENT.md#api-endpoints)

---

## Best Practices

### Code Quality
- Follow the testing strategy in [07-TESTING-STRATEGY.md](./07-TESTING-STRATEGY.md)
- Maintain >80% test coverage
- Write meaningful commit messages
- Use TypeScript for type safety (frontend)

### Security
- Never commit passwords or secrets
- Use environment variables for sensitive data
- Follow security checklist before deployment
- Regular security audits

### Performance
- Optimize database queries with indexes
- Implement caching where appropriate
- Use pagination for large datasets
- Monitor application performance

---

## Contribution Guidelines

1. Ensure you understand the relevant documentation
2. Follow the testing strategy
3. Write clear commit messages
4. Update documentation if adding features
5. Run all tests before submitting changes

---

## Support & Resources

- **Frontend Issues:** Check [01-PROJECT-SETUP.md](./01-PROJECT-SETUP.md) troubleshooting
- **Backend Issues:** Review backend service documentation
- **Database Issues:** See [06-MONGODB-SETUP.md](./06-MONGODB-SETUP.md)
- **Testing Issues:** Refer to [07-TESTING-STRATEGY.md](./07-TESTING-STRATEGY.md)
- **Deployment Issues:** Check [05-DEPLOYMENT-GUIDE.md](./05-DEPLOYMENT-GUIDE.md)

---

## Document Version

**Last Updated:** April 26, 2026
**Version:** 1.0.0
**Status:** Production Ready

---

**Start with [01-PROJECT-SETUP.md](./01-PROJECT-SETUP.md) if you're new to the project!** ✨
