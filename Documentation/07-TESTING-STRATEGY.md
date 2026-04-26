# 07 - Testing Strategy & Implementation Guide

## Overview

Comprehensive testing approach for GemNet's multi-layered architecture:

**Frontend:** React/TypeScript with Vite
**Backend:** Spring Boot 3.2 with Java 17
**Database:** MongoDB
**Key Features:** User management, listings, bidding, AI price prediction

## Testing Pyramid

```
        △
       / \
      / E2E \
     /  Tests \
    /─────────\
   /           \
  / Integration \
 /    Tests    \
/─────────────\
/       │      \
/   Unit Tests   \
/─────────────────\
```

**Ratio:**
- 70% Unit Tests
- 20% Integration Tests
- 10% E2E Tests

## 1. Frontend Testing (React/TypeScript)

### Unit Testing - Components

**Framework:** Jest + React Testing Library

**Example: AIPricePrediction Component**

```typescript
// __tests__/components/AIPricePrediction.test.tsx
import { render, screen } from '@testing-library/react';
import { AIPricePrediction } from '@/components/common/AIPricePrediction';

describe('AIPricePrediction Component', () => {
  test('displays realistic price range based on seller price', () => {
    const mockGemData = {
      weight: '2.14',
      color: 'Cornflower Blue',
      species: 'Sapphire',
      sellerPrice: 1304400
    };

    render(<AIPricePrediction gemData={mockGemData} />);

    expect(screen.getByText(/predicted price/i)).toBeInTheDocument();
    expect(screen.getByText(/LKR 1,200,000 - LKR 1,400,000/)).toBeInTheDocument();
  });

  test('shows confidence score', () => {
    const mockGemData = {
      weight: '2.14',
      color: 'Cornflower Blue',
      species: 'Sapphire',
      sellerPrice: 1304400
    };

    render(<AIPricePrediction gemData={mockGemData} />);
    
    expect(screen.getByText(/confidence: 87%/i)).toBeInTheDocument();
  });
});
```

### Unit Testing - Utilities

**Example: Price Formatting Utility**

```typescript
// __tests__/utils/formatPrice.test.ts
import { formatPrice } from '@/utils/formatPrice';

describe('formatPrice utility', () => {
  test('formats large numbers with commas', () => {
    expect(formatPrice(1304400)).toBe('LKR 1,304,400');
    expect(formatPrice(12450)).toBe('LKR 12,450');
  });

  test('handles decimal prices', () => {
    expect(formatPrice(1234.56)).toBe('LKR 1,234.56');
  });

  test('handles zero', () => {
    expect(formatPrice(0)).toBe('LKR 0');
  });

  test('handles negative values', () => {
    expect(formatPrice(-1000)).toBe('-LKR 1,000');
  });
});
```

### Unit Testing - Hooks

**Example: useAuth Hook**

```typescript
// __tests__/hooks/useAuth.test.ts
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';

describe('useAuth Hook', () => {
  test('provides login functionality', async () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(false);

    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toBe('test@example.com');
  });

  test('provides logout functionality', async () => {
    const { result } = renderHook(() => useAuth());

    // Login first
    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    // Logout
    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
  });
});
```

### Setup & Run Frontend Tests

```bash
cd FrontEnd

# Install testing dependencies (usually already installed)
npm install --save-dev @testing-library/react @testing-library/jest-dom jest

# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- AIPricePrediction.test.tsx
```

### Coverage Thresholds

**Target Coverage:**
- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

**jest.config.js Configuration:**
```javascript
module.exports = {
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx'
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80
    }
  }
};
```

## 2. Backend Testing (Spring Boot)

### Unit Testing - Services

**Framework:** JUnit 5 + Mockito

**Example: UserRegistrationService**

```java
// src/test/java/com/gemnet/service/UserRegistrationServiceTest.java
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.BeforeEach;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@DisplayName("UserRegistrationService Tests")
public class UserRegistrationServiceTest {

    private UserRegistrationService userRegistrationService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        userRegistrationService = new UserRegistrationService(
            userRepository, 
            passwordEncoder
        );
    }

    @Test
    @DisplayName("Should successfully register a new user")
    void testRegisterUser_Success() {
        // Arrange
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@example.com");
        request.setPassword("Test@123");
        request.setFirstName("John");
        request.setLastName("Doe");

        when(passwordEncoder.encode("Test@123"))
            .thenReturn("$2a$10$hashedPassword");
        when(userRepository.save(any(User.class)))
            .thenReturn(new User("test@example.com", "John", "Doe"));

        // Act
        User result = userRegistrationService.registerUser(request);

        // Assert
        assertNotNull(result);
        assertEquals("test@example.com", result.getEmail());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw exception for duplicate email")
    void testRegisterUser_DuplicateEmail() {
        // Arrange
        RegisterRequest request = new RegisterRequest();
        request.setEmail("existing@example.com");

        when(userRepository.existsByEmail("existing@example.com"))
            .thenReturn(true);

        // Act & Assert
        assertThrows(EmailAlreadyExistsException.class, 
            () -> userRegistrationService.registerUser(request));
    }

    @Test
    @DisplayName("Should validate NIC number format")
    void testValidateNIC_ValidFormat() {
        // Arrange
        String validNIC = "123456789V";

        // Act
        boolean isValid = userRegistrationService.isValidNIC(validNIC);

        // Assert
        assertTrue(isValid);
    }

    @Test
    @DisplayName("Should reject invalid NIC format")
    void testValidateNIC_InvalidFormat() {
        // Arrange
        String invalidNIC = "INVALID";

        // Act
        boolean isValid = userRegistrationService.isValidNIC(invalidNIC);

        // Assert
        assertFalse(isValid);
    }
}
```

### Unit Testing - Controllers

**Example: UserController**

```java
// src/test/java/com/gemnet/controller/UserControllerTest.java
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
public class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @Test
    @DisplayName("Should return user profile by ID")
    void testGetUserProfile() throws Exception {
        // Arrange
        UUID userId = UUID.randomUUID();
        User mockUser = new User();
        mockUser.setId(userId);
        mockUser.setEmail("test@example.com");

        when(userService.getUserById(userId)).thenReturn(mockUser);

        // Act & Assert
        mockMvc.perform(get("/api/users/{id}", userId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    @Test
    @DisplayName("Should return 404 for non-existent user")
    void testGetUserProfile_NotFound() throws Exception {
        // Arrange
        UUID userId = UUID.randomUUID();
        when(userService.getUserById(userId))
            .thenThrow(new UserNotFoundException("User not found"));

        // Act & Assert
        mockMvc.perform(get("/api/users/{id}", userId))
            .andExpect(status().isNotFound());
    }
}
```

### Integration Testing

**Test database setup with Testcontainers:**

```java
// src/test/java/com/gemnet/integration/UserRegistrationIntegrationTest.java
import org.testcontainers.containers.MongoDBContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Testcontainers
public class UserRegistrationIntegrationTest {

    @Container
    static MongoDBContainer mongoDBContainer = 
        new MongoDBContainer("mongo:6.0")
        .withExposedPorts(27017);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserRegistrationService userRegistrationService;

    @Test
    @DisplayName("Should register user and persist in database")
    void testCompleteUserRegistration() {
        // Arrange
        RegisterRequest request = new RegisterRequest();
        request.setEmail("integration@test.com");
        request.setPassword("Test@123456");
        request.setFirstName("Test");
        request.setLastName("User");

        // Act
        User registeredUser = userRegistrationService.registerUser(request);

        // Assert
        assertNotNull(registeredUser.getId());
        User foundUser = userRepository.findByEmail("integration@test.com");
        assertNotNull(foundUser);
        assertEquals("Test", foundUser.getFirstName());
    }
}
```

### Setup & Run Backend Tests

```bash
cd BackEnd

# Run all tests
./apache-maven-3.9.10/bin/mvn test

# Run specific test class
./apache-maven-3.9.10/bin/mvn test -Dtest=UserRegistrationServiceTest

# Run with coverage report
./apache-maven-3.9.10/bin/mvn test jacoco:report

# View coverage report
# target/site/jacoco/index.html
```

## 3. API Testing

### Using Postman/Insomnia

**Test Collection Structure:**
```
GemNet API Tests
├── Authentication
│   ├── User Registration
│   ├── Login
│   └── Logout
├── Users
│   ├── Get Profile
│   ├── Update Profile
│   └── Get Users (Admin)
├── Listings
│   ├── Create Listing
│   ├── Get Listings
│   ├── Update Listing
│   └── Delete Listing
├── Bidding
│   ├── Place Bid
│   ├── Get Bid History
│   └── Get Active Auctions
└── Advertisements
    ├── Create Advertisement
    ├── Get Advertisements
    └── Admin Review
```

**Example Test: User Registration**

```
POST /api/auth/register
Headers:
  Content-Type: application/json

Body:
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "Test@123456",
  "phoneNumber": "+94701234567",
  "address": "123 Main St",
  "dateOfBirth": "1990-01-01",
  "nicNumber": "123456789V",
  "userRole": "BUYER"
}

Expected Response:
{
  "id": "uuid",
  "email": "john@example.com",
  "token": "jwt-token",
  "userRole": "BUYER"
}
```

### Automated API Testing

```bash
# Using REST Assured in Java
npm install --save-dev newman

# Run Postman collection
newman run collection.json --environment environment.json
```

## 4. End-to-End (E2E) Testing

### User Registration Flow

**Scenario: Complete user registration process**

```typescript
// e2e/registration.e2e.ts
import { test, expect } from '@playwright/test';

test.describe('User Registration Flow', () => {
  test('should complete full registration and be approved by admin', async ({ page }) => {
    // Step 1: Navigate to registration
    await page.goto('http://localhost:3000/register');
    
    // Step 2: Fill personal information
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="email"]', `john${Date.now()}@example.com`);
    await page.fill('input[name="password"]', 'Test@123456');
    await page.fill('input[name="phoneNumber"]', '+94701234567');
    await page.fill('input[name="address"]', '123 Main St');
    await page.fill('input[name="dateOfBirth"]', '1990-01-01');
    await page.fill('input[name="nicNumber"]', '123456789V');

    // Step 3: Click next
    await page.click('button:has-text("Next")');

    // Step 4: Wait for face verification step
    await page.waitForSelector('text=Face Verification');

    // Step 5: Capture face (simulated)
    await page.click('button:has-text("Capture Face")');
    await page.waitForTimeout(2000);
    await page.click('button:has-text("Use Photo")');

    // Step 6: Upload NIC documents
    await page.setInputFiles('input[type="file"]', 'test-assets/nic-front.jpg');
    await page.click('button:has-text("Upload NIC Back")');
    await page.setInputFiles('input[type="file"]', 'test-assets/nic-back.jpg');

    // Step 7: Complete registration
    await page.click('button:has-text("Complete Registration")');

    // Step 8: Verify success message
    await expect(page.locator('text=Registration submitted')).toBeVisible();

    // Step 9: Admin approves (separate admin session)
    const adminPage = async () => {
      const newContext = await page.context().browser().newContext();
      const adminTab = await newContext.newPage();
      await adminTab.goto('http://localhost:3000/admin');
      await adminTab.fill('input[name="email"]', 'admin@gemnet.local');
      await adminTab.fill('input[name="password"]', 'admin123');
      await adminTab.click('button:has-text("Login")');
      
      // Find user and approve
      await adminTab.click('text=Pending Approvals');
      await adminTab.click(`text=${userEmail}`);
      await adminTab.click('button:has-text("Approve")');
      
      await expect(adminTab.locator('text=Approved')).toBeVisible();
      await newContext.close();
    };

    await adminPage();

    // Step 10: Verify user can now login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', userEmail);
    await page.fill('input[name="password"]', 'Test@123456');
    await page.click('button:has-text("Login")');

    // Step 11: Verify dashboard appears
    await expect(page.locator('text=Welcome')).toBeVisible();
  });
});
```

### Setup Playwright E2E

```bash
cd FrontEnd

# Install Playwright
npm install -D @playwright/test

# Run E2E tests
npm run e2e

# Run specific test
npm run e2e -- registration.e2e.ts

# View reports
npx playwright show-report
```

## 5. Performance Testing

### Load Testing with JMeter

**Create test plan:**
1. Open JMeter
2. Add Thread Group (number of users)
3. Add HTTP Samplers for endpoints
4. Add Listeners for results

```
Test Plan
├── Thread Group (100 users, 10 sec ramp-up)
│   ├── HTTP Sampler - GET /api/listings
│   ├── HTTP Sampler - GET /api/listings/{id}
│   └── HTTP Sampler - POST /api/bids/place
├── Response Time Listener
└── Throughput Listener
```

**Expected Performance Metrics:**
- API Response Time: < 500ms (p95)
- Throughput: > 100 requests/sec
- Error Rate: < 1%

## 6. Security Testing

### OWASP Top 10 Checks

1. **SQL Injection**
   - Test with: `'; DROP TABLE users; --`
   - Verify: Should be rejected

2. **XSS (Cross-Site Scripting)**
   - Test: `<script>alert('XSS')</script>` in text fields
   - Verify: Should be escaped/sanitized

3. **CSRF (Cross-Site Request Forgery)**
   - Check: CSRF tokens in forms
   - Verify: Tokens validated server-side

4. **Authentication Bypass**
   - Test: Access protected endpoints without token
   - Verify: Returns 401 Unauthorized

5. **Data Exposure**
   - Test: Check SSL/TLS encryption
   - Verify: All sensitive data encrypted

## Testing Checklist

### Pre-Release Checklist

- [ ] All unit tests passing (>80% coverage)
- [ ] All integration tests passing
- [ ] E2E tests passing
- [ ] No critical security vulnerabilities
- [ ] Performance meets SLA
- [ ] Database migrations tested
- [ ] Backup/restore tested
- [ ] Documentation updated
- [ ] Code review completed
- [ ] Known issues documented

### Regression Testing

Before each release:
- [ ] Re-run all unit tests
- [ ] Re-run critical E2E tests
- [ ] Re-run security tests
- [ ] Re-run performance tests
- [ ] Manual smoke tests

## Continuous Integration

### GitHub Actions Configuration

```yaml
# .github/workflows/test.yml
name: Run Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Java
        uses: actions/setup-java@v3
        with:
          java-version: '17'
      - name: Run Backend Tests
        run: cd BackEnd && ./apache-maven-3.9.10/bin/mvn test

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install Dependencies
        run: cd FrontEnd && npm install --legacy-peer-deps
      - name: Run Frontend Tests
        run: cd FrontEnd && npm test
```

## Test Reporting

### Coverage Reports

```bash
# Backend (JaCoCo)
./apache-maven-3.9.10/bin/mvn jacoco:report
# View: target/site/jacoco/index.html

# Frontend (Istanbul)
npm test -- --coverage
# View: coverage/lcov-report/index.html
```

### Test Reports

- Generate after each test run
- Upload to CI/CD system
- Track coverage trends
- Set minimum thresholds

## Related Documentation

- See [01-PROJECT-SETUP.md](./01-PROJECT-SETUP.md) for project setup
- See [02-USER-REGISTRATION-VERIFICATION.md](./02-USER-REGISTRATION-VERIFICATION.md) for registration testing
- See [05-DEPLOYMENT-GUIDE.md](./05-DEPLOYMENT-GUIDE.md) for production testing before deployment
