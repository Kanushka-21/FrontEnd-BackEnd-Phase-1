# GemNet Backend - Face Recognition Identity Verification System

## Project Overview

GemNet is a comprehensive identity verification system that uses face recognition technology to verify user identities through NIC (National Identity Card) validation. The system implements a three-step verification process:

1. **Personal Data Registration** - Users enter their personal information
2. **Face Verification** - Users capture their face within an oval frame
3. **NIC Verification** - Users upload their NIC image for OCR and face matching

## Technology Stack

- **Backend Framework**: Spring Boot 3.2.0
- **Database**: MongoDB
- **Security**: Spring Security + JWT
- **Face Recognition**: OpenCV
- **OCR**: Tesseract4J
- **Documentation**: SpringDoc OpenAPI (Swagger)
- **Java Version**: 17

## Project Structure

```
src/
├── main/
│   ├── java/com/gemnet/
│   │   ├── controller/          # REST Controllers
│   │   ├── service/             # Business Logic Services
│   │   ├── repository/          # Data Access Layer
│   │   ├── model/               # Entity Models
│   │   ├── dto/                 # Data Transfer Objects
│   │   ├── security/            # Security & JWT Configuration
│   │   ├── config/              # Application Configuration
│   │   ├── exception/           # Custom Exceptions
│   │   └── GemNetApplication.java
│   └── resources/
│       └── application.properties
└── test/
    └── java/com/gemnet/         # Test Classes
```

## Key Features

### User Registration & Verification
- Multi-step registration process
- Face capture and feature extraction
- NIC OCR for number extraction
- Face matching between captured image and NIC photo
- JWT-based authentication

### Security
- Password encryption using BCrypt
- JWT token-based authentication
- Role-based access control
- CORS configuration for frontend integration

### File Management
- Secure file upload and storage
- Image validation and processing
- Automatic file organization by user and type

## API Endpoints

### Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user with personal data |
| POST | `/verify-face/{userId}` | Upload and verify face image |
| POST | `/verify-nic/{userId}` | Upload and verify NIC image |
| POST | `/login` | User login with JWT token response |
| GET | `/health` | Health check endpoint |

### Request/Response Examples

#### User Registration
```json
POST /api/auth/register
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "password123",
  "phoneNumber": "+94771234567",
  "address": "123 Main St, Colombo",
  "dateOfBirth": "1990-01-01",
  "nicNumber": "901234567V"
}
```

#### Face Verification
```http
POST /api/auth/verify-face/{userId}
Content-Type: multipart/form-data
faceImage: [image file]
```

#### Login
```json
POST /api/auth/login
{
  "email": "john.doe@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzUxMiJ9...",
    "type": "Bearer",
    "userId": "64a7b8c9d1e2f3a4b5c6d7e8",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isVerified": true,
    "verificationStatus": "VERIFIED"
  }
}
```

## Database Schema

### User Collection
```javascript
{
  "_id": ObjectId,
  "firstName": String,
  "lastName": String,
  "email": String (unique),
  "password": String (encrypted),
  "phoneNumber": String,
  "address": String,
  "dateOfBirth": String,
  "nicNumber": String (unique),
  "faceImagePath": String,
  "faceFeatures": String,
  "nicImagePath": String,
  "extractedNicNumber": String,
  "extractedNicImagePath": String,
  "isVerified": Boolean,
  "isFaceVerified": Boolean,
  "isNicVerified": Boolean,
  "verificationStatus": String, // PENDING, VERIFIED, REJECTED
  "roles": Array,
  "isActive": Boolean,
  "isLocked": Boolean,
  "createdAt": DateTime,
  "updatedAt": DateTime
}
```

## Setup Instructions

### Prerequisites
1. Java 17 or higher
2. Maven 3.6+
3. MongoDB 4.4+
4. Tesseract OCR

### Installation Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd GemNet-Backend
```

2. **Install MongoDB**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mongodb

# macOS
brew install mongodb-community
```

3. **Install Tesseract OCR**
```bash
# Ubuntu/Debian
sudo apt install tesseract-ocr

# macOS
brew install tesseract
```

4. **Configure Database**
- Start MongoDB service
- Database will be created automatically on first run

5. **Build and Run**
```bash
mvn clean install
mvn spring-boot:run
```

6. **Access the application**
- API Base URL: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html

## Configuration

### application.properties
```properties
# Server Configuration
server.port=8080

# MongoDB Configuration
spring.data.mongodb.host=localhost
spring.data.mongodb.port=27017
spring.data.mongodb.database=gemnet_db

# JWT Configuration
app.jwt.secret=your-secret-key-here
app.jwt.expiration=86400000

# File Upload Configuration
spring.servlet.multipart.max-file-size=10MB
app.file-storage.base-path=./uploads
```

## Development

### Adding New Endpoints
1. Create DTO classes in `dto` package
2. Add business logic in `service` package
3. Create controller methods in `controller` package
4. Update security configuration if needed

### Testing
```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=UserServiceTest
```

## Deployment

### Production Checklist
- [ ] Update JWT secret key
- [ ] Configure production MongoDB connection
- [ ] Set up proper file storage location
- [ ] Configure CORS for production frontend URL
- [ ] Enable HTTPS
- [ ] Set up logging configuration
- [ ] Configure monitoring and health checks

### Docker Deployment
```dockerfile
FROM openjdk:17-jdk-slim
COPY target/gemnet-backend-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

## Troubleshooting

### Common Issues

1. **OpenCV Loading Error**
   - Ensure OpenCV native libraries are properly loaded
   - Check system compatibility

2. **Tesseract OCR Error**
   - Verify Tesseract installation
   - Check tessdata path configuration

3. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string and credentials

4. **File Upload Issues**
   - Check file size limits
   - Verify upload directory permissions

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact:
- Email: support@gemnet.com
- Documentation: [API Documentation](http://localhost:8080/swagger-ui.html)
