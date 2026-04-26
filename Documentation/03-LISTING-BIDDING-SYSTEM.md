# 03 - Listing & Bidding System

## System Overview

The Listing & Bidding System implements a comprehensive marketplace solution that enables sellers to list gemstones with detailed specifications and buyers to participate in competitive bidding processes.

### Key Features
- **Multi-step listing creation** with wizard-style interface
- **Dual certification support** (certified and non-certified gemstones)
- **Real-time bidding system** with live updates
- **Automated countdown timers** with 4-day bidding periods
- **AI-powered price prediction** integration
- **Comprehensive notification system** for all bidding activities
- **Purchase history tracking** with detailed transaction records

## Listing Creation System

### Step 1: Certification Type Selection

The certification type determines the entire workflow:

**Certified Gemstones:**
- Require certificate upload and OCR processing
- Auto-populated fields from certificate
- Professional gemstone attributes included

**Non-Certified Gemstones:**
- Manual attribute entry required
- Simpler workflow
- Suitable for inventory or personal collections

### Step 2: Certificate Upload (Certified Only)

**OCR-Based Processing:**
```
Upload Certificate Image
    ↓
OCR Processing
    ↓
Extract Certificate Data
    ↓
Auto-populate Form Fields
    ↓
User Review & Confirm
```

**Extracted Data:**
- Gemstone Species
- Carat Weight
- Color Grade
- Clarity Grade
- Cut Quality
- Origin
- Treatment Information
- Certificate Number & Date
- Certifying Authority

### Step 3: Basic Information Entry

**Manual Data Entry (Non-Certified) or Review (Certified):**

```typescript
interface GemstoneDetails {
  // Gemstone Identification
  species: string;              // Sapphire, Ruby, Emerald, etc.
  variety: string;
  treatment: string;

  // Physical Properties
  caratWeight: float;
  color: string;
  clarity: string;
  cut: string;

  // Geographic Origin
  origin: string;
  region: string;

  // Certification
  isCertified: boolean;
  certificateNumber: string;
  certificateDate: Date;
  certification Authority: string;

  // Seller Information
  stockNumber: string;
  storedLocation: string;
}
```

### Step 4: Pricing Configuration

**Initial Price Setting:**
- **Starting Bid Price**: Minimum bid amount (typically 30-50% of estimated value)
- **Reserve Price**: Minimum acceptable final price (optional)
- **Buy-It-Now Price**: Option to purchase immediately (optional)

**AI Price Prediction Integration:**
- System suggests price range based on ML model
- Historical market data comparison
- Similar gemstone analysis
- Real-time market trends

### Step 5: Image & Media Upload

**Requirements:**
- Minimum 3 high-quality images
- Maximum 20 images per listing
- Supported formats: JPG, PNG, WebP
- Maximum file size: 5MB per image
- Video support for detailed showcase (optional)

**Image Guidelines:**
- Clear, well-lit images
- Multiple angles (top, side, back)
- Size reference (coin or ruler)
- Natural lighting preferred
- No filters or heavy editing

### Step 6: Detailed Description

**Description Template:**
```
[Gemstone Type] - [Carat Weight] CT [Color] [Origin]

Physical Characteristics:
- Weight: X.XX carats
- Color: [Specific shade]
- Clarity: [Grade]
- Cut: [Type/Grade]
- Dimensions: Length x Width x Depth (mm)

Treatments/Enhancements:
[List any treatments]

Certification:
[Certificate number], [Date], [Authority]

History/Background:
[Optional seller notes]

Seller Notes:
[Additional information]
```

### Step 7: Review & Submit

**Final Review Checklist:**
- ✓ All required fields completed
- ✓ At least 3 images uploaded
- ✓ Pricing set appropriately
- ✓ Description complete and accurate
- ✓ Terms & conditions accepted

**Submission:**
- Listing submitted for admin approval
- Seller receives confirmation email
- Listing appears in "Pending Approval" queue for admins

## Bidding System

### Bidding Mechanics

**Timeline:**
```
Listing Approved
    ↓
Bidding Opens (0:00)
    ↓
Product Visible to Buyers
    ↓
Bidding Period: 4 Days (96 Hours)
    ↓
Bidding Ends
    ↓
Winner Announcement
    ↓
Transaction Processing
```

### Bid Placement

**Bid Rules:**
1. Minimum bid must be ≥ Starting Price
2. Each new bid must exceed previous by minimum increment
3. Automatic increment calculation based on price range
4. Bid cannot exceed Buy-It-Now price (if set)
5. Bids are binding - cannot be withdrawn

**Bid Increments:**
```
$0 - $100       → $1 minimum increment
$100 - $500     → $5 minimum increment
$500 - $1000    → $10 minimum increment
$1000 - $5000   → $25 minimum increment
$5000+          → $50 minimum increment
```

### Automatic Bidding (Proxy Bidding)

**How it Works:**
1. User enters maximum willing bid
2. System places minimum bids on their behalf
3. If outbid, system automatically places next increment
4. Bids placed until maximum is reached or auction ends

**Benefits:**
- No need to monitor auction constantly
- Ensures competitive bidding
- Prevents accidental overpayment

### Real-time Notifications

**Buyer Notifications:**
- Bid confirmation
- Outbid alert
- Auction ending soon (24, 12, 6, 1 hour warnings)
- Auction ended - Win/Loss notification
- Invoice/Payment link sent
- Shipment notifications

**Seller Notifications:**
- Bid received
- Sales milestone reached
- Auction ending soon
- Auction ended - Final price and winner
- Payment received
- Shipping reminder

## Admin Approval Workflow

### Listing Review Queue

**Admin Dashboard:**
```
┌─────────────────────────────────────┐
│  PENDING LISTINGS QUEUE             │
├─────────────────────────────────────┤
│  [Listing 1] - Seller Name - Preview
│  - Category: Sapphire               │
│  - Weight: 2.14 CT                  │
│  - Asking Price: $5,200             │
│  - Status: PENDING REVIEW           │
│                                     │
│  [Review] [Approve] [Reject]        │
└─────────────────────────────────────┘
```

**Review Checks:**
- Image quality verification
- Pricing reasonableness
- Description accuracy
- Category appropriateness
- No prohibited items/prohibited keywords
- Compliance with marketplace policies

**Actions:**
- **Approve**: Listing goes live immediately
- **Reject**: Seller receives rejection reason, can edit and resubmit
- **Request Changes**: Seller prompted to make specific modifications
- **Hold**: Listing placed on hold for further investigation

## Transaction & Delivery

### After Auction Ends

**Winner Selection:**
- Highest bid wins (or Buy-It-Now purchase)
- System automatically selects winner
- Winner notified immediately
- Invoice generated with payment link

**Payment Processing:**
- Multiple payment options supported
- Payment gateway integration
- Secure transaction processing
- Payment confirmation to both parties

**Shipping:**
- Seller receives shipping instructions
- Seller prepares item for shipment
- Insured courier arranged (recommended)
- Tracking number provided to buyer
- Delivery confirmation required

### Purchase History

**Buyer View:**
```
Purchase History
├── Purchased Items
│   ├── Item 1 - Status: Delivered
│   ├── Item 2 - Status: In Transit
│   └── Item 3 - Status: Payment Processing
└── Bids
    ├── Active Auctions (outbid)
    ├── Completed (not won)
    └── Pending Review
```

**Seller View:**
```
Sales History
├── Sold Items
│   ├── Item 1 - Delivered
│   ├── Item 2 - In Transit
│   └── Item 3 - Payment Processing
└── Active Listings
    ├── Bidding in Progress
    ├── Pending Approval
    └── Sold Out
```

## API Endpoints

### Listing Management
```
POST   /api/listings/create              Create new listing
GET    /api/listings/{id}                Get listing details
PUT    /api/listings/{id}/update         Update pending listing
DELETE /api/listings/{id}                Delete listing (seller only)
GET    /api/listings/search              Search listings
GET    /api/listings/seller/{id}         Get seller's listings
POST   /api/listings/{id}/approve        Approve listing (admin)
POST   /api/listings/{id}/reject         Reject listing (admin)
```

### Bidding
```
POST   /api/bids/place                   Place a bid
GET    /api/bids/listing/{id}            Get all bids for listing
GET    /api/bids/user/{id}               Get user's bid history
GET    /api/auctions/active              Get active auctions
GET    /api/auctions/ending              Get auctions ending soon
```

### Purchase & History
```
GET    /api/purchases/history/{userId}   Get purchase history
GET    /api/purchases/{id}               Get purchase details
POST   /api/purchases/{id}/confirm-delivery  Confirm delivery
POST   /api/reviews/create               Create review/rating
GET    /api/reviews/listing/{id}         Get listing reviews
```

## Database Models

### Listing Entity
```
{
  id: UUID
  sellerId: UUID
  title: String
  description: Text
  category: Enum
  isCertified: Boolean
  certificateNumber: String
  certificateIssuer: String
  gemstoneDetails: JSON
  imageUrls: Array[String]
  videoUrls: Array[String]
  startingPrice: BigDecimal
  reservePrice: BigDecimal (optional)
  buyItNowPrice: BigDecimal (optional)
  status: Enum [PENDING, APPROVED, ACTIVE, ENDED, SOLD, REJECTED]
  approvedBy: UUID (admin)
  rejectionReason: String
  createdAt: Timestamp
  auctionStartTime: Timestamp
  auctionEndTime: Timestamp
  updatedAt: Timestamp
}
```

### Bid Entity
```
{
  id: UUID
  listingId: UUID
  bidderId: UUID
  bidAmount: BigDecimal
  maxAutoBidAmount: BigDecimal (optional)
  bidTime: Timestamp
  isWinningBid: Boolean
  isAutoBid: Boolean
  ipAddress: String (fraud detection)
}
```

### Purchase Entity
```
{
  id: UUID
  listingId: UUID
  winnerId: UUID
  sellerId: UUID
  biddingId: UUID
  finalPrice: BigDecimal
  transactionStatus: Enum [PENDING, PAID, PROCESSING, SHIPPED, DELIVERED]
  paymentMethod: String
  transactionId: String
  shippingAddress: String
  trackingNumber: String
  deliveryDate: Timestamp
  createdAt: Timestamp
  completedAt: Timestamp
}
```

## Price Prediction Integration

### AI Price Suggestion

**Model Inputs:**
- Gemstone species and variety
- Carat weight
- Color grade
- Clarity grade
- Cut quality
- Origin
- Age of gemstone
- Market conditions

**Model Outputs:**
```
{
  predictedPrice: $4,500
  priceRange: {
    low: $3,800,
    high: $5,200
  },
  confidence: 0.87,
  reasoning: [
    "2.14 CT sapphire with similar specs avg $3,900-$4,600",
    "Market trending +3% this month",
    "Good clarity for this species"
  ]
}
```

## Notifications System

### Email Notifications

**Triggers:**
- Bidding activity updates
- Auction ending alerts
- Winner notification
- Payment received
- Shipping updates
- Delivery confirmation
- Review requests

**Template Variables:**
- Listing title and image
- Bid amount and time
- Auction end time countdown
- Winner details
- Transaction details

### In-App Notifications

**Real-time Updates:**
- New bids received
- Outbid alerts
- Auction events
- Payment updates
- Shipping notifications

## Performance & Scalability

### Optimization Strategies
- Bid history indexed by listing and user
- Real-time updates via WebSocket
- Caching of popular listings
- Thumbnail generation for images
- Batch notification sending

### Capacity Planning
- Support concurrent bidders per auction
- Database connection pooling
- Load balancing for API servers
- CDN for image delivery

## Security Considerations

### Fraud Prevention
- Bid verification checks
- User reputation system
- Suspicious activity detection
- Rate limiting on bid placement
- User IP tracking
- Email verification for buyers

### Payment Security
- PCI-DSS compliance for payment processing
- SSL/TLS encryption
- Secure payment gateway integration
- Payment confirmation verification

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Bid placed but not recorded | Check internet connection, retry |
| Auction ended but no winner selected | Database integrity check needed |
| Images not displaying | Check image URLs and permissions |
| Bidding frozen | Check auction status and time |
| Notification not received | Check email settings and spam folder |

## Related Documentation

- See [01-PROJECT-SETUP.md](./01-PROJECT-SETUP.md) for initial setup
- See [02-USER-REGISTRATION-VERIFICATION.md](./02-USER-REGISTRATION-VERIFICATION.md) for user system
- See [07-TESTING-STRATEGY.md](./07-TESTING-STRATEGY.md) for testing approach
