# GemNet Backend - Project Structure

## Complete Directory Structure

```
GemNet/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── gemnet/
│   │   │           ├── GemNetApplication.java          # Main application class
│   │   │           ├── config/                        # Configuration classes
│   │   │           │   ├── OpenApiConfig.java         # Swagger/OpenAPI configuration
│   │   │           │   └── SecurityConfig.java        # Spring Security configuration
│   │   │           ├── controller/                    # REST Controllers
│   │   │           │   └── AuthController.java        # Authentication endpoints
│   │   │           ├── dto/                          # Data Transfer Objects
│   │   │           │   ├── ApiResponse.java          # Standardized API response
│   │   │           │   ├── AuthenticationResponse.java # Login response DTO
│   │   │           │   ├── LoginRequest.java          # Login request DTO
│   │   │           │   └── UserRegistrationRequest.java # Registration request DTO
│   │   │           ├── exception/                     # Custom exceptions
│   │   │           │   ├── GlobalExceptionHandler.java # Global exception handling
│   │   │           │   ├── InvalidCredentialsException.java
│   │   │           │   ├── UserAlreadyExistsException.java
│   │   │           │   └── UserNotFoundException.java
│   │   │           ├── model/                        # Entity models
│   │   │           │   └── User.java                 # User entity
│   │   │           ├── repository/                   # Data access layer
│   │   │           │   └── UserRepository.java       # User repository
│   │   │           ├── security/                     # Security components
│   │   │           │   ├── CustomUserDetailsService.java # User details service
│   │   │           │   ├── JwtAuthenticationFilter.java   # JWT filter
│   │   │           │   └── JwtTokenProvider.java          # JWT token utility
│   │   │           ├── service/                      # Business logic services
│   │   │           │   ├── FaceRecognitionService.java    # Face recognition logic
│   │   │           │   ├── FileStorageService.java       # File management
│   │   │           │   ├── NicVerificationService.java   # NIC verification logic
│   │   │           │   └── UserService.java              # User business logic
│   │   │           └── util/                         # Utility classes
│   │   │               └── ValidationUtil.java       # Validation utilities
│   │   └── resources/
│   │       └── application.properties                # Application configuration
│   └── test/
│       ├── java/
│       │   └── com/
│       │       └── gemnet/
│       │           ├── GemNetApplicationTest.java    # Application context test
│       │           └── service/
│       │               └── UserServiceTest.java      # User service unit tests
│       └── resources/
│           └── application-test.properties           # Test configuration
├── target/                                          # Maven build output
├── uploads/                                         # File upload directory
├── logs/                                           # Application logs
├── tessdata/                                       # Tesseract OCR data
├── pom.xml                                         # Maven configuration
├── Dockerfile                                      # Docker configuration
├── docker-compose.yml                              # Docker Compose configuration
├── mongo-init.js                                   # MongoDB initialization script
├── run.sh                                         # Application runner script
├── .env.example                                    # Environment variables template
├── .gitignore                                      # Git ignore file
├── README.md                                       # Project documentation
├── KNOWLEDGE_BASE.md                               # Comprehensive technical guide
└── PROJECT_STRUCTURE.md                           # This file
```

## Key Components Overview

### 1. Application Entry Point
- `GemNetApplication.java` - Main Spring Boot application class with MongoDB auditing enabled

### 2. Controllers (API Layer)
- `AuthController.java` - Handles authentication, registration, and verification endpoints
- Includes Swagger documentation annotations
- Implements proper HTTP status codes and error handling

### 3. Services (Business Logic Layer)
- `UserService.java` - Core user management and authentication logic
- `FaceRecognitionService.java` - OpenCV-based face detection and comparison
- `NicVerificationService.java` - OCR processing and NIC validation
- `FileStorageService.java` - Secure file upload and management

### 4. Repository (Data Access Layer)
- `UserRepository.java` - MongoDB data access with custom query methods
- Extends Spring Data MongoDB Repository

### 5. Models (Entity Layer)
- `User.java` - Complete user entity with validation annotations
- MongoDB document mapping with indexes

### 6. DTOs (Data Transfer Objects)
- Request/Response objects for API communication
- Input validation using Bean Validation annotations
- Standardized API response wrapper

### 7. Security Layer
- JWT token-based authentication
- Custom user details service
- Security filter chain configuration
- Password encryption using BCrypt

### 8. Configuration
- Spring Security configuration
- OpenAPI/Swagger documentation setup
- Database configuration
- File upload configuration

### 9. Exception Handling
- Global exception handler for consistent error responses
- Custom exception classes for specific business scenarios
- Proper HTTP status code mapping

### 10. Utilities
- Validation utilities for Sri Lankan specific data (NIC, mobile)
- Common utility functions

## Technology Integration

### Face Recognition (OpenCV)
- Haar Cascade classifier for face detection
- Template matching for face comparison
- Image preprocessing and feature extraction
- Base64 encoding for feature storage

### OCR (Tesseract)
- Text extraction from NIC images
- Image preprocessing for better OCR accuracy
- Regex patterns for NIC number extraction
- Photo region extraction from NIC

### Database (MongoDB)
- Document-based storage for user data
- Proper indexing for performance
- Embedded documents for verification data
- Atomic operations for data consistency

### Security (Spring Security + JWT)
- Stateless authentication using JWT tokens
- Role-based access control
- Password hashing with BCrypt
- CORS configuration for frontend integration

## Development Workflow

### 1. User Registration Flow
```
Client Request → AuthController → UserService → UserRepository → MongoDB
                                    ↓
                              Validation & Business Logic
```

### 2. Face Verification Flow
```
Image Upload → FileStorageService → FaceRecognitionService → Feature Extraction
                                                 ↓
                                           Store Features in DB
```

### 3. NIC Verification Flow
```
NIC Image → FileStorageService → NicVerificationService → OCR Processing
                                        ↓
                              Extract NIC Number & Photo
                                        ↓
                              FaceRecognitionService → Compare Faces
```

### 4. Login Flow
```
Credentials → AuthController → UserService → Validate → JWT Generation
                                   ↓
                            AuthenticationResponse
```

## Testing Strategy

### Unit Tests
- Service layer unit tests with Mockito
- Repository layer tests with test containers
- Utility function tests

### Integration Tests
- Controller integration tests
- Database integration tests
- Security integration tests

### Test Configuration
- Separate test database
- Test-specific application properties
- Mock external services for isolated testing

## Deployment Options

### 1. Local Development
```bash
./run.sh dev
```

### 2. Docker Deployment
```bash
./run.sh docker
```

### 3. Production Deployment
- JAR file deployment
- Docker containerization
- Kubernetes deployment ready

## File Organization Best Practices

### Package Structure
- Controllers: REST endpoint definitions
- Services: Business logic implementation
- Repositories: Data access abstraction
- Models: Entity definitions
- DTOs: Data transfer contracts
- Config: Application configuration
- Security: Authentication and authorization
- Utils: Common utilities

### Naming Conventions
- Classes: PascalCase
- Methods: camelCase
- Constants: UPPER_SNAKE_CASE
- Packages: lowercase
- Files: descriptive names

### Code Organization
- Single responsibility principle
- Dependency injection
- Interface segregation
- Configuration externalization

This structure ensures maintainability, scalability, and follows Spring Boot best practices for enterprise-grade applications.
