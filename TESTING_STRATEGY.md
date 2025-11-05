# GemNet Testing Strategy & Implementation Guide

## 📋 Table of Contents
- [Overview](#overview)
- [Frontend Testing Levels](#frontend-testing-levels)
- [Backend Testing Levels](#backend-testing-levels)
- [System-Level Testing](#system-level-testing)
- [Critical Business Logic Testing](#critical-business-logic-testing)
- [Testing Tools & Frameworks](#testing-tools--frameworks)
- [Testing Strategy Implementation](#testing-strategy-implementation)
- [Test Data Management](#test-data-management)
- [CI/CD Integration](#cicd-integration)
- [Performance Testing](#performance-testing)
- [Security Testing](#security-testing)

---

## Overview

The GemNet application is a comprehensive gemstone trading platform built with:
- **Frontend**: React/TypeScript with Vite
- **Backend**: Spring Boot with MongoDB
- **Key Features**: User management, gem listings, AI price prediction, meeting management, commission system

This document outlines the complete testing strategy for ensuring system reliability, security, and performance.

---

## 🎯 Frontend Testing Levels (React/TypeScript)

### 1. Unit Testing

#### **Component Testing**
Test individual React components in isolation:

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
    
    // Should show range within ±5% of seller price
    expect(screen.getByText(/1,240,000 - 1,370,000/)).toBeInTheDocument();
  });

  test('handles missing seller price gracefully', () => {
    const mockGemData = {
      weight: '2.14',
      color: 'Blue',
      species: 'Sapphire'
    };

    render(<AIPricePrediction gemData={mockGemData} />);
    expect(screen.getByText(/Price prediction not available/)).toBeInTheDocument();
  });
});
```

#### **Custom Hook Testing**
```typescript
// __tests__/hooks/useAuth.test.ts
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/contexts/AuthContext';

describe('useAuth Hook', () => {
  test('handles user login flow', async () => {
    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      await result.current.login('user@example.com', 'password');
    });
    
    expect(result.current.user).toBeDefined();
    expect(result.current.isAuthenticated).toBe(true);
  });

  test('restricts unverified user actions', () => {
    const { result } = renderHook(() => useAuth());
    
    // Mock unverified user
    result.current.user = { ...mockUser, isVerified: false };
    
    expect(result.current.canCreateListings()).toBe(false);
  });
});
```

#### **Utility Function Testing**
```typescript
// __tests__/utils/formatters.test.ts
import { formatLKR } from '@/utils/formatters';

describe('formatLKR', () => {
  test('formats Sri Lankan currency correctly', () => {
    expect(formatLKR(1304400)).toBe('LKR 1,304,400');
    expect(formatLKR(0)).toBe('LKR 0');
    expect(formatLKR(null)).toBe('LKR 0');
  });
});
```

### 2. Integration Testing

#### **Component Integration**
```typescript
// __tests__/integration/ListingCreation.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Listings } from '@/pages/dashboard/SellerDashbaordComponents/Listings';

describe('Listing Creation Integration', () => {
  test('complete certified gemstone listing flow', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Listings user={mockVerifiedUser} />
        </AuthProvider>
      </BrowserRouter>
    );

    // Click add new listing
    fireEvent.click(screen.getByText('Add New Listing'));
    
    // Select certified gemstone
    fireEvent.click(screen.getByText('Certified Gemstone'));
    
    // Fill basic info
    fireEvent.change(screen.getByLabelText('Gemstone Name'), {
      target: { value: 'Ceylon Blue Sapphire' }
    });
    
    fireEvent.change(screen.getByLabelText('Price (LKR)'), {
      target: { value: '1304400' }
    });

    // Submit and verify API call
    fireEvent.click(screen.getByText('Submit Listing'));
    
    await waitFor(() => {
      expect(screen.getByText(/Listing submitted successfully/)).toBeInTheDocument();
    });
  });

  test('prevents unverified user from creating listings', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Listings user={mockUnverifiedUser} />
        </AuthProvider>
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Add New Listing'));
    
    expect(screen.getByText(/Verification Required/)).toBeInTheDocument();
  });
});
```

#### **API Integration Testing**
```typescript
// __tests__/integration/api.test.ts
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { gemListingService } from '@/services/gemListingService';

const server = setupServer(
  rest.post('/api/gemsData/list-gem-data', (req, res, ctx) => {
    return res(ctx.json({ success: true, data: { listingId: '123' } }));
  }),
  
  rest.get('/api/gemsData/get-user-listings/:userId', (req, res, ctx) => {
    const { page, size } = req.url.searchParams;
    
    if (size === '50') {
      // Test pagination with 50 items
      return res(ctx.json({
        success: true,
        data: {
          content: Array.from({ length: 16 }, (_, i) => mockListing),
          totalElements: 16,
          totalPages: 1,
          number: 0,
          size: 50
        }
      }));
    }
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('API Integration', () => {
  test('handles pagination correctly for seller dashboard', async () => {
    const response = await gemListingService.getUserListings('userId', 0, 50);
    
    expect(response.data.content).toHaveLength(16);
    expect(response.data.totalElements).toBe(16);
    expect(response.data.size).toBe(50);
  });
});
```

### 3. End-to-End Testing

#### **Cypress E2E Tests**
```typescript
// cypress/e2e/seller-workflow.cy.ts
describe('Seller Complete Workflow', () => {
  beforeEach(() => {
    cy.login('seller@example.com', 'password');
  });

  it('should complete gem listing creation and management', () => {
    // Navigate to seller dashboard
    cy.visit('/dashboard');
    cy.get('[data-testid="add-new-listing"]').click();

    // Create certified gemstone listing
    cy.get('[data-testid="certified-option"]').click();
    cy.get('[data-testid="gem-name"]').type('Ceylon Blue Sapphire');
    cy.get('[data-testid="price-input"]').type('1304400');
    cy.get('[data-testid="weight-input"]').type('2.14');
    
    // Upload images
    cy.get('[data-testid="image-upload"]').attachFile('sapphire.jpg');
    
    // Submit listing
    cy.get('[data-testid="submit-listing"]').click();
    
    // Verify success
    cy.contains('Listing submitted successfully').should('be.visible');
    
    // Verify listing appears in My Listings with correct pagination
    cy.get('[data-testid="my-listings"]').click();
    cy.get('[data-testid="page-size-selector"]').select('50');
    cy.get('[data-testid="listings-table"]').should('contain', 'Ceylon Blue Sapphire');
  });

  it('should handle AI price prediction correctly', () => {
    cy.visit('/marketplace');
    cy.get('[data-testid="gem-listing"]').first().click();
    
    // Check that price prediction is realistic
    cy.get('[data-testid="ai-prediction"]').within(() => {
      cy.get('[data-testid="price-range"]').should(($range) => {
        const text = $range.text();
        const matches = text.match(/LKR ([\d,]+) - LKR ([\d,]+)/);
        if (matches) {
          const minPrice = parseInt(matches[1].replace(/,/g, ''));
          const maxPrice = parseInt(matches[2].replace(/,/g, ''));
          const ratio = maxPrice / minPrice;
          expect(ratio).to.be.lessThan(1.2); // Range should be within 20%
        }
      });
    });
  });
});
```

---

## 🔧 Backend Testing Levels (Spring Boot/Java)

### 1. Unit Testing

#### **Service Layer Testing**
```java
// src/test/java/com/gemnet/service/PricePredictionServiceTest.java
@ExtendWith(MockitoExtension.class)
class PricePredictionServiceTest {

    @Mock
    private SriLankanMarketPriceService mockMarketService;
    
    @Mock
    private MLPredictionService mockMLService;
    
    @InjectMocks
    private PricePredictionService pricePredictionService;

    @Test
    void shouldCalculateRealisticPriceRangeWithSellerPrice() {
        // Given
        PricePredictionRequest request = new PricePredictionRequest();
        request.setSellerPrice(1304400.0);
        request.setCarat(2.14);
        request.setSpecies("Corundum");
        request.setColor("Blue");
        request.setIsCertified(true);

        PricePredictionResponse mockResponse = new PricePredictionResponse();
        mockResponse.setPredictedPrice(BigDecimal.valueOf(1200000));
        
        when(mockMarketService.predictSriLankanPrice(request)).thenReturn(mockResponse);

        // When
        PricePredictionResponse result = pricePredictionService.predictPrice(request);

        // Then
        assertThat(result.isSuccess()).isTrue();
        
        BigDecimal sellerPrice = BigDecimal.valueOf(1304400);
        BigDecimal minExpected = sellerPrice.multiply(BigDecimal.valueOf(0.92)); // -8%
        BigDecimal maxExpected = sellerPrice.multiply(BigDecimal.valueOf(1.08)); // +8%
        
        assertThat(result.getMinPrice()).isGreaterThanOrEqualTo(minExpected);
        assertThat(result.getMaxPrice()).isLessThanOrEqualTo(maxExpected);
        
        // Range should not be unrealistically wide
        BigDecimal range = result.getMaxPrice().subtract(result.getMinPrice());
        BigDecimal maxRange = sellerPrice.multiply(BigDecimal.valueOf(0.16)); // 16% max range
        assertThat(range).isLessThanOrEqualTo(maxRange);
    }

    @Test
    void shouldHandleMissingSellerPriceGracefully() {
        // Given
        PricePredictionRequest request = new PricePredictionRequest();
        request.setCarat(2.14);
        request.setSpecies("Corundum");
        // No seller price set

        // When
        PricePredictionResponse result = pricePredictionService.predictPrice(request);

        // Then
        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getPredictedPrice()).isPositive();
        assertThat(result.getMethodUsed()).contains("Fallback");
    }
}
```

#### **Repository Testing**
```java
// src/test/java/com/gemnet/repository/GemListingRepositoryTest.java
@DataJpaTest
@TestPropertySource(locations = "classpath:application-test.properties")
class GemListingRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private GemListingRepository gemListingRepository;

    @Test
    void shouldFindByUserIdWithPagination() {
        // Given
        String userId = "testUser123";
        
        // Create 20 test listings
        for (int i = 0; i < 20; i++) {
            GemListing listing = createTestListing(userId, "Sapphire " + i);
            entityManager.persistAndFlush(listing);
        }

        // When - Request page 0 with size 50
        Pageable pageable = PageRequest.of(0, 50);
        Page<GemListing> result = gemListingRepository.findByUserId(userId, pageable);

        // Then
        assertThat(result.getContent()).hasSize(20);
        assertThat(result.getTotalElements()).isEqualTo(20);
        assertThat(result.getTotalPages()).isEqualTo(1);
        assertThat(result.getNumber()).isEqualTo(0);
        assertThat(result.getSize()).isEqualTo(50);
    }

    @Test
    void shouldFindByStatusAndIsCertified() {
        // Given
        String userId = "testUser123";
        GemListing certifiedApproved = createTestListing(userId, "Certified Approved");
        certifiedApproved.setListingStatus("APPROVED");
        certifiedApproved.setIsCertified(true);
        
        GemListing nonCertifiedPending = createTestListing(userId, "Non-Certified Pending");
        nonCertifiedPending.setListingStatus("PENDING");
        nonCertifiedPending.setIsCertified(false);

        entityManager.persistAndFlush(certifiedApproved);
        entityManager.persistAndFlush(nonCertifiedPending);

        // When
        List<GemListing> approvedCertified = gemListingRepository
            .findByListingStatusAndIsCertified("APPROVED", true);

        // Then
        assertThat(approvedCertified).hasSize(1);
        assertThat(approvedCertified.get(0).getGemName()).isEqualTo("Certified Approved");
    }

    private GemListing createTestListing(String userId, String gemName) {
        GemListing listing = new GemListing();
        listing.setUserId(userId);
        listing.setGemName(gemName);
        listing.setPrice(BigDecimal.valueOf(100000));
        listing.setListingStatus("PENDING");
        listing.setCreatedAt(LocalDateTime.now());
        return listing;
    }
}
```

### 2. Integration Testing

#### **API Integration Testing**
```java
// src/test/java/com/gemnet/controller/GemCertificateControllerIntegrationTest.java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(locations = "classpath:application-test.properties")
class GemCertificateControllerIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private GemListingRepository gemListingRepository;

    @LocalServerPort
    private int port;

    @Test
    void shouldCreateGemListingSuccessfully() throws Exception {
        // Given
        String createListingUrl = "http://localhost:" + port + "/api/gemsData/list-gem-data";
        
        // Create multipart request
        MultiValueMap<String, Object> parts = new LinkedMultiValueMap<>();
        
        GemListingRequest gemData = new GemListingRequest();
        gemData.setUserId("testUser123");
        gemData.setGemName("Test Blue Sapphire");
        gemData.setPrice(BigDecimal.valueOf(1304400));
        gemData.setWeight("2.14");
        gemData.setIsCertified(true);
        
        parts.add("gemListingData", objectMapper.writeValueAsString(gemData));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        
        HttpEntity<MultiValueMap<String, Object>> requestEntity = 
            new HttpEntity<>(parts, headers);

        // When
        ResponseEntity<ApiResponse> response = restTemplate.postForEntity(
            createListingUrl, requestEntity, ApiResponse.class);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().isSuccess()).isTrue();
        
        // Verify in database
        List<GemListing> listings = gemListingRepository.findByUserId("testUser123");
        assertThat(listings).hasSize(1);
        assertThat(listings.get(0).getGemName()).isEqualTo("Test Blue Sapphire");
    }

    @Test
    void shouldHandlePaginationCorrectly() {
        // Given - Create 16 test listings
        String userId = "testUser123";
        for (int i = 0; i < 16; i++) {
            GemListing listing = createTestListing(userId, "Sapphire " + i);
            gemListingRepository.save(listing);
        }

        String getUserListingsUrl = String.format(
            "http://localhost:%d/api/gemsData/get-user-listings/%s?page=0&size=50",
            port, userId);

        // When
        ResponseEntity<ApiResponse> response = restTemplate.getForEntity(
            getUserListingsUrl, ApiResponse.class);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().isSuccess()).isTrue();
        
        @SuppressWarnings("unchecked")
        Map<String, Object> data = (Map<String, Object>) response.getBody().getData();
        
        assertThat(data.get("totalElements")).isEqualTo(16);
        assertThat(data.get("size")).isEqualTo(50);
        assertThat(data.get("totalPages")).isEqualTo(1);
        
        @SuppressWarnings("unchecked")
        List<Object> content = (List<Object>) data.get("content");
        assertThat(content).hasSize(16);
    }
}
```

### 3. System Testing

#### **Full Application Integration**
```java
// src/test/java/com/gemnet/GemNetApplicationSystemTest.java
@SpringBootTest
@TestPropertySource(locations = "classpath:application-test.properties")
@Transactional
class GemNetApplicationSystemTest {

    @Autowired
    private UserService userService;
    
    @Autowired
    private GemCertificateService gemCertificateService;
    
    @Autowired
    private MeetingService meetingService;
    
    @Autowired
    private CommissionService commissionService;

    @Test
    void shouldCompleteGemTradingWorkflow() {
        // 1. Create and verify seller
        User seller = createTestUser("seller@example.com", "SELLER");
        seller.setIsVerified(true);
        userService.saveUser(seller);

        // 2. Create and verify buyer  
        User buyer = createTestUser("buyer@example.com", "BUYER");
        buyer.setIsVerified(true);
        userService.saveUser(buyer);

        // 3. Seller creates gem listing
        GemListing listing = createTestGemListing(seller.getUserId());
        ApiResponse<Map<String, Object>> listingResponse = 
            gemCertificateService.saveGemListing(listing, null, null, null);
        
        assertThat(listingResponse.isSuccess()).isTrue();
        String listingId = (String) listingResponse.getData().get("listingId");

        // 4. Admin approves listing
        gemCertificateService.updateListingStatus(listingId, "APPROVED");

        // 5. Buyer requests meeting
        Meeting meeting = createTestMeeting(buyer.getUserId(), seller.getUserId(), listingId);
        ApiResponse<Meeting> meetingResponse = meetingService.createMeeting(meeting);
        
        assertThat(meetingResponse.isSuccess()).isTrue();
        Long meetingId = meetingResponse.getData().getMeetingId();

        // 6. Admin approves meeting
        meetingService.updateMeetingStatus(meetingId, "APPROVED");

        // 7. Meeting completed with final price
        BigDecimal finalPrice = BigDecimal.valueOf(1300000);
        meetingService.completeMeeting(meetingId, finalPrice);

        // 8. Verify commission calculation
        Meeting completedMeeting = meetingService.getMeetingById(meetingId).getData();
        BigDecimal expectedCommission = finalPrice.multiply(BigDecimal.valueOf(0.06)); // 6%
        
        assertThat(completedMeeting.getCommissionAmount()).isEqualByComparingTo(expectedCommission);
        assertThat(completedMeeting.getCommissionRate()).isEqualTo(6.0);
    }
}
```

---

## 🌐 System-Level Testing

### 1. API Contract Testing

#### **OpenAPI Contract Validation**
```java
// src/test/java/com/gemnet/contract/ApiContractTest.java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ApiContractTest {

    @Test
    void shouldValidateGemListingApiContract() {
        given()
            .contentType(ContentType.MULTIPART)
            .multiPart("gemListingData", gemListingJson)
            .multiPart("gemImages", imageFile)
        .when()
            .post("/api/gemsData/list-gem-data")
        .then()
            .statusCode(200)
            .body("success", equalTo(true))
            .body("data.listingId", notNullValue())
            .body("data.gemName", equalTo("Test Sapphire"));
    }

    @Test
    void shouldValidatePaginationContract() {
        given()
            .pathParam("userId", "testUser")
            .queryParam("page", 0)
            .queryParam("size", 50)
        .when()
            .get("/api/gemsData/get-user-listings/{userId}")
        .then()
            .statusCode(200)
            .body("success", equalTo(true))
            .body("data.content", hasSize(lessThanOrEqualTo(50)))
            .body("data.totalElements", instanceOf(Integer.class))
            .body("data.totalPages", instanceOf(Integer.class))
            .body("data.size", equalTo(50));
    }
}
```

### 2. Database Testing

#### **Data Integrity Testing**
```sql
-- src/test/resources/sql/data-integrity-tests.sql

-- Test 1: User verification constraints
INSERT INTO users (user_id, email, is_verified) VALUES ('test1', 'test@example.com', false);
-- This should fail: INSERT INTO gem_listings (user_id, gem_name) VALUES ('test1', 'Test Gem');

-- Test 2: Commission calculation integrity
INSERT INTO meetings (meeting_id, final_price, commission_rate) VALUES (1, 1000000, 6.0);
UPDATE meetings SET commission_amount = final_price * (commission_rate / 100) WHERE meeting_id = 1;
-- Verify: SELECT commission_amount FROM meetings WHERE meeting_id = 1; -- Should be 60000

-- Test 3: Price prediction range validation
INSERT INTO price_predictions (prediction_id, seller_price, min_price, max_price) 
VALUES (1, 1304400, 1240000, 1370000);
-- Verify range is within ±5% of seller price
```

### 3. Security Testing

#### **Authentication & Authorization**
```java
// src/test/java/com/gemnet/security/SecurityTest.java
@SpringBootTest
@AutoConfigureMockMvc
class SecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @WithMockUser(roles = "ADMIN")
    void shouldAllowAdminAccessToUserManagement() throws Exception {
        mockMvc.perform(get("/api/admin/users"))
            .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "SELLER")
    void shouldDenySellerAccessToAdminEndpoints() throws Exception {
        mockMvc.perform(get("/api/admin/users"))
            .andExpect(status().isForbidden());
    }

    @Test
    void shouldRequireAuthenticationForProtectedEndpoints() throws Exception {
        mockMvc.perform(get("/api/gemsData/get-user-listings/123"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "unverified@example.com", roles = "SELLER")
    void shouldPreventUnverifiedUserFromCreatingListings() throws Exception {
        // Mock unverified user
        when(userService.isUserVerified("unverified@example.com")).thenReturn(false);

        mockMvc.perform(post("/api/gemsData/list-gem-data")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .param("gemListingData", "{}"))
            .andExpect(status().isForbidden())
            .andExpected(jsonPath("$.message").value("User verification required"));
    }
}
```

#### **Input Validation & XSS Prevention**
```java
@Test
void shouldRejectMaliciousInput() throws Exception {
    String maliciousJson = """
        {
            "gemName": "<script>alert('xss')</script>Sapphire",
            "description": "javascript:alert('xss')",
            "price": -1000
        }
        """;

    mockMvc.perform(post("/api/gemsData/list-gem-data")
            .contentType(MediaType.APPLICATION_JSON)
            .content(maliciousJson))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.errors").exists());
}
```

---

## 🎯 Critical Business Logic Testing

### 1. Price Prediction System Testing

```java
@Test
void shouldProvideRealisticPriceRangeNotExtremeValues() {
    // Given: Seller lists sapphire for LKR 1,304,400
    PricePredictionRequest request = new PricePredictionRequest();
    request.setSellerPrice(1304400.0);
    request.setCarat(2.14);
    request.setColor("Cornflower Blue");
    request.setSpecies("Corundum");
    request.setIsCertified(true);

    // When: AI predicts price
    PricePredictionResponse response = pricePredictionService.predictPrice(request);

    // Then: Range should be realistic, not LKR 47,751 - LKR 36,400,000
    assertThat(response.getMinPrice()).isGreaterThan(BigDecimal.valueOf(1200000)); // >1.2M
    assertThat(response.getMaxPrice()).isLessThan(BigDecimal.valueOf(1400000));   // <1.4M
    
    // Range should not exceed 10% of seller price
    BigDecimal range = response.getMaxPrice().subtract(response.getMinPrice());
    BigDecimal maxAllowedRange = BigDecimal.valueOf(130440); // 10% of 1,304,400
    assertThat(range).isLessThanOrEqualTo(maxAllowedRange);
}
```

### 2. Meeting & Commission System Testing

```java
@Test 
void shouldCalculateCorrectCommissionForCompletedMeetings() {
    // Given: Meeting completed with final price
    Meeting meeting = new Meeting();
    meeting.setFinalPrice(BigDecimal.valueOf(1300000)); // LKR 1.3M
    
    // When: Commission is calculated
    BigDecimal commission = commissionService.calculateCommission(meeting.getFinalPrice());
    
    // Then: Should be exactly 6%
    BigDecimal expected = BigDecimal.valueOf(78000); // 6% of 1.3M
    assertThat(commission).isEqualByComparingTo(expected);
    
    // Verify commission email notifications are triggered
    verify(emailService).sendCommissionNotification(any(Meeting.class), eq(commission));
}
```

### 3. User Verification & Permissions Testing

```java
@Test
void shouldEnforceUserVerificationRules() {
    // Given: Unverified user attempts to create listing
    User unverifiedUser = new User();
    unverifiedUser.setUserId("unverified123");
    unverifiedUser.setIsVerified(false);
    
    GemListing listing = createTestListing();
    listing.setUserId("unverified123");
    
    // When: User tries to create listing
    ApiResponse<Map<String, Object>> response = 
        gemCertificateService.saveGemListing(listing, null, null, null);
    
    // Then: Should be rejected
    assertThat(response.isSuccess()).isFalse();
    assertThat(response.getMessage()).contains("verification required");
}
```

### 4. Pagination System Testing

```java
@Test
void shouldHandleLargePaginationCorrectly() {
    // Given: User with 16 listings
    String userId = "testUser123";
    createMultipleTestListings(userId, 16);
    
    // When: Request 50 items per page (previously failing)
    ApiResponse<Map<String, Object>> response = 
        gemCertificateService.getUserSpecificListings(userId, 0, 50, null);
    
    // Then: Should return all 16 items without error
    assertThat(response.isSuccess()).isTrue();
    
    @SuppressWarnings("unchecked")
    Map<String, Object> data = response.getData();
    assertThat(data.get("totalElements")).isEqualTo(16);
    assertThat(data.get("size")).isEqualTo(50);
    
    @SuppressWarnings("unchecked")
    List<Object> content = (List<Object>) data.get("content");
    assertThat(content).hasSize(16);
}
```

---

## 🛠️ Testing Tools & Frameworks

### Frontend Testing Stack

```json
{
  "devDependencies": {
    "@testing-library/react": "^13.0.0",
    "@testing-library/jest-dom": "^5.16.4",
    "@testing-library/user-event": "^14.0.0",
    "vitest": "^0.28.0",
    "jsdom": "^20.0.0",
    "msw": "^0.49.0",
    "cypress": "^12.0.0",
    "@percy/cypress": "^3.1.0"
  },
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "cypress run",
    "test:e2e:open": "cypress open"
  }
}
```

### Backend Testing Dependencies

```xml
<dependencies>
    <!-- Spring Boot Test Starter -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
    
    <!-- Testcontainers for MongoDB -->
    <dependency>
        <groupId>org.testcontainers</groupId>
        <artifactId>mongodb</artifactId>
        <scope>test</scope>
    </dependency>
    
    <!-- REST Assured for API Testing -->
    <dependency>
        <groupId>io.rest-assured</groupId>
        <artifactId>rest-assured</artifactId>
        <scope>test</scope>
    </dependency>
    
    <!-- WireMock for External Service Mocking -->
    <dependency>
        <groupId>com.github.tomakehurst</groupId>
        <artifactId>wiremock-jre8</artifactId>
        <scope>test</scope>
    </dependency>
    
    <!-- H2 Database for Testing -->
    <dependency>
        <groupId>com.h2database</groupId>
        <artifactId>h2</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

---

## 📊 Testing Strategy Implementation

### Testing Pyramid Structure

```
        🔺 E2E Tests (10%)
       🔺🔺 Integration Tests (30%)  
      🔺🔺🔺 Unit Tests (60%)
```

#### **Unit Tests (60%)**
- Component logic testing
- Service method testing
- Utility function testing
- Individual API endpoint testing

#### **Integration Tests (30%)**
- Component + API integration
- Database operations
- Multi-service workflows
- External service integration

#### **E2E Tests (10%)**
- Complete user journeys
- Cross-browser testing
- Critical business flows
- Performance validation

### Test Configuration

#### **Frontend Test Setup**
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'c8',
      reporter: ['text', 'html', 'lcov'],
      exclude: ['node_modules/', 'src/test/']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

#### **Backend Test Configuration**
```yaml
# src/test/resources/application-test.properties
spring.profiles.active=test
spring.datasource.url=jdbc:h2:mem:testdb
spring.jpa.hibernate.ddl-auto=create-drop
logging.level.com.gemnet=DEBUG

# MongoDB Test Configuration
spring.data.mongodb.host=localhost
spring.data.mongodb.port=27017
spring.data.mongodb.database=gemnet_test

# Disable external services for testing
app.ml.service.enabled=false
app.email.service.enabled=false
```

---

## 🗄️ Test Data Management

### Test Data Factory

```java
// src/test/java/com/gemnet/TestDataFactory.java
@Component
public class TestDataFactory {

    public static User createTestUser(String email, String role) {
        User user = new User();
        user.setUserId(UUID.randomUUID().toString());
        user.setEmail(email);
        user.setFirstName("Test");
        user.setLastName("User");
        user.setRole(role);
        user.setIsVerified(true);
        user.setCreatedAt(LocalDateTime.now());
        return user;
    }

    public static GemListing createTestListing(String userId, String gemName) {
        GemListing listing = new GemListing();
        listing.setId(UUID.randomUUID().toString());
        listing.setUserId(userId);
        listing.setGemName(gemName);
        listing.setPrice(BigDecimal.valueOf(1304400));
        listing.setWeight("2.14");
        listing.setColor("Blue");
        listing.setSpecies("Corundum");
        listing.setIsCertified(true);
        listing.setListingStatus("PENDING");
        listing.setCreatedAt(LocalDateTime.now());
        return listing;
    }

    public static Meeting createTestMeeting(String buyerId, String sellerId, String listingId) {
        Meeting meeting = new Meeting();
        meeting.setBuyerId(buyerId);
        meeting.setSellerId(sellerId);
        meeting.setListingId(listingId);
        meeting.setRequestedDate(LocalDate.now().plusDays(7));
        meeting.setRequestedTime("14:00");
        meeting.setLocation("Colombo Gem Exchange");
        meeting.setStatus("PENDING");
        meeting.setCreatedAt(LocalDateTime.now());
        return meeting;
    }
}
```

### Database Test Data Setup

```sql
-- src/test/resources/data.sql
-- Test users
INSERT INTO users (user_id, email, first_name, last_name, role, is_verified) VALUES 
('seller1', 'seller@example.com', 'John', 'Seller', 'SELLER', true),
('buyer1', 'buyer@example.com', 'Jane', 'Buyer', 'BUYER', true),
('admin1', 'admin@example.com', 'Admin', 'User', 'ADMIN', true);

-- Test gem listings
INSERT INTO gem_listings (id, user_id, gem_name, price, weight, color, species, is_certified, listing_status) VALUES
('listing1', 'seller1', 'Ceylon Blue Sapphire', 1304400, '2.14', 'Blue', 'Corundum', true, 'APPROVED'),
('listing2', 'seller1', 'Ruby Red', 2500000, '3.05', 'Red', 'Corundum', true, 'PENDING');

-- Test meetings
INSERT INTO meetings (meeting_id, buyer_id, seller_id, listing_id, requested_date, requested_time, location, status) VALUES
(1, 'buyer1', 'seller1', 'listing1', '2025-10-15', '14:00', 'Colombo', 'APPROVED');
```

---

## 🚀 CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: 'FrontEnd/package-lock.json'
      
      - name: Install dependencies
        working-directory: ./FrontEnd
        run: npm ci
      
      - name: Run unit tests
        working-directory: ./FrontEnd
        run: npm run test:coverage
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          directory: ./FrontEnd/coverage

  backend-tests:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:latest
        ports:
          - 27017:27017
          
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'
      
      - name: Cache Maven packages
        uses: actions/cache@v3
        with:
          path: ~/.m2
          key: ${{ runner.os }}-m2-${{ hashFiles('**/pom.xml') }}
          restore-keys: ${{ runner.os }}-m2
      
      - name: Run tests
        working-directory: ./BackEnd
        run: mvn clean test
      
      - name: Generate test report
        uses: dorny/test-reporter@v1
        if: success() || failure()
        with:
          name: Maven Tests
          path: 'BackEnd/target/surefire-reports/*.xml'
          reporter: java-junit

  e2e-tests:
    runs-on: ubuntu-latest
    needs: [frontend-tests, backend-tests]
    if: github.event_name == 'pull_request'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup full application
        run: |
          docker-compose -f docker-compose.test.yml up -d
          sleep 30  # Wait for services to be ready
      
      - name: Run E2E tests
        working-directory: ./FrontEnd
        run: npm run test:e2e:ci
      
      - name: Upload test videos
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: cypress-videos
          path: FrontEnd/cypress/videos
```

---

## ⚡ Performance Testing

### Load Testing with Artillery

```yaml
# performance/load-test.yml
config:
  target: 'http://localhost:9092'
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 50
    - duration: 60
      arrivalRate: 100

scenarios:
  - name: "Gem Listing API Load Test"
    flow:
      - post:
          url: "/api/gemsData/list-gem-data"
          json:
            userId: "testUser{{ $randomString() }}"
            gemName: "Load Test Sapphire"
            price: 1000000
            weight: "2.0"
          expect:
            - statusCode: 200
            - hasProperty: "success"

  - name: "Price Prediction Load Test"
    flow:
      - post:
          url: "/api/ml/predict-price"
          json:
            carat: 2.14
            color: "Blue"
            species: "Corundum"
            sellerPrice: 1304400
          expect:
            - statusCode: 200
            - property: "minPrice"
              min: 1200000
              max: 1400000
```

### Database Performance Testing

```java
@Test
@Sql(scripts = "/sql/large-dataset.sql")
void shouldHandleLargeDatasetQueries() {
    long startTime = System.currentTimeMillis();
    
    // Query with 10,000+ listings
    Page<GemListing> results = gemListingRepository.findBySpecies(
        "Corundum", PageRequest.of(0, 50));
    
    long executionTime = System.currentTimeMillis() - startTime;
    
    assertThat(executionTime).isLessThan(1000); // Should complete within 1 second
    assertThat(results.getContent()).hasSize(50);
}
```

---

## 🔐 Security Testing

### Authentication Flow Testing

```java
@Test
void shouldValidateJWTTokenSecurity() {
    // Test token expiration
    String expiredToken = createExpiredJWTToken();
    
    mockMvc.perform(get("/api/gemsData/get-user-listings/123")
            .header("Authorization", "Bearer " + expiredToken))
        .andExpect(status().isUnauthorized());
    
    // Test invalid token signature
    String tamperedToken = tamperWithJWTSignature(validToken);
    
    mockMvc.perform(get("/api/gemsData/get-user-listings/123")
            .header("Authorization", "Bearer " + tamperedToken))
        .andExpect(status().isUnauthorized());
}
```

### File Upload Security Testing

```java
@Test
void shouldRejectMaliciousFileUploads() throws Exception {
    // Test executable file upload
    MockMultipartFile maliciousFile = new MockMultipartFile(
        "gemImages", "malicious.exe", "application/x-msdownload", 
        "malicious content".getBytes());
    
    mockMvc.perform(multipart("/api/gemsData/list-gem-data")
            .file(maliciousFile)
            .param("gemListingData", "{}"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.message").value(containsString("Invalid file type")));
    
    // Test oversized file
    byte[] oversizedContent = new byte[11 * 1024 * 1024]; // 11MB
    MockMultipartFile oversizedFile = new MockMultipartFile(
        "gemImages", "large.jpg", "image/jpeg", oversizedContent);
    
    mockMvc.perform(multipart("/api/gemsData/list-gem-data")
            .file(oversizedFile)
            .param("gemListingData", "{}"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.message").value(containsString("File size exceeds limit")));
}
```

---

## 📈 Test Metrics & Reporting

### Coverage Targets

- **Unit Tests**: ≥ 80% line coverage
- **Integration Tests**: ≥ 70% feature coverage  
- **E2E Tests**: 100% critical path coverage

### Test Reporting

```bash
# Generate comprehensive test report
mvn clean test jacoco:report
npm run test:coverage

# Combine reports
npm run test:report:combined
```

### Quality Gates

```yaml
# sonar-project.properties
sonar.coverage.exclusions=**/*Test*.java,**/*test*.ts,**/node_modules/**
sonar.coverage.jacoco.xmlReportPaths=target/site/jacoco/jacoco.xml
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.qualitygate.wait=true
```

---

## 🎯 Test Execution Strategy

### Test Phases

1. **Developer Testing**: Unit tests run locally before commit
2. **CI Testing**: Automated unit + integration tests on push
3. **Staging Testing**: Full E2E suite on staging environment  
4. **Production Monitoring**: Smoke tests and health checks

### Test Environment Management

```bash
# Local development testing
npm run test:dev
mvn test -Dspring.profiles.active=test

# Staging environment testing  
npm run test:staging
mvn test -Dspring.profiles.active=staging

# Production smoke tests
npm run test:smoke
mvn test -Dtest=SmokeTest
```

This comprehensive testing strategy ensures the GemNet system maintains high quality, security, and performance standards across all components and user workflows.