# 04 - Advertisement Management System

## System Overview

The Advertisement Management system allows sellers to create and manage gemstone advertisements, provides admins with comprehensive review and approval capabilities, and integrates seller profile information for complete marketplace trust.

### Key Features
- **Create detailed gemstone advertisements** with media gallery
- **Media management** - images and video uploads
- **Admin review & approval workflow** 
- **Seller profile integration** with verification status
- **Communication tools** for admin-seller interaction
- **Sales tracking** and performance analytics

## Advertisement Creation

### Step 1: Advertisement Details

**Required Information:**

```typescript
interface AdvertisementDetails {
  // Basic Information
  title: string;                    // Short catchy title
  description: string;              // Detailed product description
  category: string;                 // Gemstone category
  
  // Gemstone Specifications
  gemstoneType: string;             // Ruby, Sapphire, Emerald, etc.
  color: string;                    // Color/shade description
  weight: number;                   // Weight in carats
  quality: string;                  // Quality grade
  
  // Pricing
  askingPrice: number;              // Base price
  currency: string;                 // LKR, USD, etc.
  
  // Contact Information
  sellerName: string;               // Automatically filled from profile
  phoneNumber: string;              // Direct contact
  email: string;                    // Contact email
  location: string;                 // Geographic location
  
  // Additional Options
  isCertified: boolean;
  certificateNumber: string;        // If certified
  negotiable: boolean;              // Price negotiable?
  urgent: boolean;                  // Mark as urgent sale
}
```

**Validation Rules:**
- Title: 10-100 characters
- Description: 50-5000 characters
- Price: Must be positive number
- At least one image required
- Email must be verified
- Contact info must be current

### Step 2: Media Upload

**Image Management:**

```
Image Upload Interface
├── Drag & Drop Zone
├── Browse Files
└── Direct Camera Capture

Image Processing
├── Size Verification (max 10MB)
├── Format Validation (JPG, PNG, WebP)
├── Quality Check
├── Automatic Optimization
└── Thumbnail Generation
```

**Image Requirements:**
- Minimum 1 image, maximum 20
- Recommended dimensions: 800x600px or larger
- Good lighting and clear visibility
- No watermarks or branding
- High contrast for gemstone visibility

**Video Management:**
- Optional video showcase
- Maximum duration: 5 minutes
- Supported formats: MP4, WebM
- Maximum file size: 50MB
- Auto-play (muted) in gallery

**Gallery Features:**
- Drag-to-reorder images
- Preview before upload
- Delete individual images
- Set thumbnail
- Lightbox viewer
- Zoom functionality

### Step 3: Pricing Strategy

**Pricing Considerations:**
```
Market Analysis
    ↓
Comparable Items
    ↓
Condition Factor
    ↓
Urgency Premium/Discount
    ↓
Final Price
```

**Pricing Guidance:**
- **Competitive Analysis**: System shows similar items' prices
- **Market Trends**: Current demand/supply indicators
- **Condition Multiplier**: Certified vs non-certified adjustment
- **Urgency Pricing**: 10-20% discount for quick sales

**Price Flexibility:**
- Option to mark price as "Negotiable"
- Shows willingness to discuss price
- May increase inquiry rate
- Used for premium/unique items

## Admin Review Dashboard

### Pending Advertisements Queue

**Dashboard Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│          PENDING ADVERTISEMENTS FOR REVIEW                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [1] Ruby Specimen - 2.5CT Premium Quality        PENDING   │
│     Seller: John Gemstone                                  │
│     Posted: 2 days ago                                     │
│     Status: Awaiting Admin Review                          │
│                                                             │
│  [View Details] [Approve] [Reject] [Request Edit]         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Advertisement View Modal

**Complete Advertisement Details:**
- Title, description, specifications
- Image gallery with thumbnails
- Video preview (if included)
- Asking price and terms
- Seller contact information
- Posted/Modified timestamps

**Seller Profile Integration:**
- Profile picture
- Verification status badge
  - ✓ Verified
  - ⚠ Under Review
  - ✗ Not Verified
- Member since date
- Last activity
- Contact buttons (Call/Email)
- Review/reputation score

**Verification Images:**
- Face verification image
- NIC verification image
- Helps admin assess seller authenticity

### Review Criteria

**Content Compliance:**
- ✓ Appropriate title and description
- ✓ No offensive or prohibited content
- ✓ Accurate product representation
- ✓ No fake/misleading claims
- ✓ Proper category selection
- ✓ Reasonable pricing

**Seller Compliance:**
- ✓ Seller account verified
- ✓ No previous violations
- ✓ Good seller rating (if applicable)
- ✓ Complete profile information
- ✓ Valid contact information

**Image Quality:**
- ✓ Clear, visible images
- ✓ Good lighting
- ✓ Professional presentation
- ✓ No inappropriate content
- ✓ Images match description

### Admin Actions

**Decision Options:**

1. **Approve**
   - Advertisement goes live immediately
   - Seller receives approval email
   - Listing appears in marketplace
   - Notification sent to followers

2. **Reject**
   - Reason required for rejection
   - Seller receives detailed rejection email
   - Can edit and resubmit after 48 hours
   - Options: Provide specific feedback

3. **Request Changes**
   - Specific edit requests provided
   - Seller prompted to make modifications
   - 7-day window to make changes
   - Auto-reject if not addressed

4. **Put on Hold**
   - Need more investigation time
   - Seller notified of hold status
   - Cannot be edited while on hold
   - 14-day investigation window

### Bulk Operations

**Admin Efficiency Features:**
- Batch approve multiple listings
- Bulk reject with reason template
- Schedule mass notifications
- Export pending list
- Filter by category, date, seller

## Seller Profile Integration

### Profile Information Display

**In Advertisement View:**
```
┌────────────────────────────┐
│    SELLER INFORMATION      │
├────────────────────────────┤
│ [Profile Picture]          │
│ John Gemstone             │
│ ✓ Verified Member         │
│                            │
│ Member Since: Jan 2023     │
│ Last Active: 2 hours ago   │
│                            │
│ Total Listings: 45         │
│ Completed Sales: 38        │
│ Rating: 4.8/5 (42 reviews) │
│                            │
│ Verification Status:       │
│ • Face Verified ✓          │
│ • ID Verified ✓            │
│ • Email Verified ✓         │
│ • Phone Verified ✓         │
│                            │
│ [Call] [Email] [Message]   │
└────────────────────────────┘
```

### Verification Indicators

**Badge System:**
- **Gold Badge**: Premium seller, 4.5+ rating
- **Blue Badge**: Verified seller
- **Gray Badge**: New seller (<10 listings)
- **Red Icon**: Flagged for violations

**Verification Details:**
- Face recognition verification: ✓/✗
- NIC/ID document verified: ✓/✗
- Email address verified: ✓/✗
- Phone number verified: ✓/✗
- Payment method verified: ✓/✗

### Communication Tools

**Direct Contact Options:**
```
Seller Profile
├── Call Button
│   └── Displays phone number
├── Email Button
│   └── Opens email client
├── Message Button
│   └── In-app messaging (future)
└── Share Button
    └── Share profile on social media
```

**Admin-to-Seller Communication:**
- Pre-filled email templates
- Phone call logging
- Message history tracking
- Auto-response management

## Advertisement Lifecycle

### Timeline

```
Created by Seller
    ↓
Submitted for Approval
    ↓
Pending Admin Review Queue
    ↓
[Approved] → Live in Marketplace
    ↓
Available for Viewing & Inquiry
    ↓
[Mark Sold / Removed by Seller]
    ↓
Archived
```

### Status Transitions

```
States:
├── DRAFT (Seller editing)
├── PENDING (Awaiting review)
├── APPROVED (Live in marketplace)
├── REJECTED (Failed review)
├── ON_HOLD (Under investigation)
├── SOLD (Transaction completed)
└── ARCHIVED (Removed from display)
```

## Notifications

### Seller Notifications

**Event-based Emails:**
- Listing submitted successfully
- Approval notification
- Rejection with reason
- Request for changes
- Listing went live
- New inquiry received
- Item marked as sold

**Template Example:**
```
Subject: Your Advertisement [Ruby 2.5CT] is Now Live!

Hi John,

Good news! Your advertisement for "Ruby Specimen - 2.5CT Premium Quality" 
has been approved and is now visible in the marketplace.

View Your Listing: [Link]
View All Your Listings: [Link]

Best regards,
GemNet Admin Team
```

### Buyer Notifications

**When Browsing:**
- New listings in followed categories
- Price drops on saved listings
- Similar items to purchased gems
- Seller recommendations

## API Endpoints

### Advertisement Management
```
POST   /api/advertisements/create        Create new advertisement
GET    /api/advertisements/{id}          Get advertisement details
PUT    /api/advertisements/{id}/update   Update pending advertisement
DELETE /api/advertisements/{id}          Delete advertisement (seller)
GET    /api/advertisements/seller/{id}   Get seller's advertisements
```

### Admin Operations
```
GET    /api/admin/advertisements         List pending reviews
POST   /api/admin/advertisements/{id}/approve  Approve advertisement
POST   /api/admin/advertisements/{id}/reject   Reject advertisement
POST   /api/admin/advertisements/{id}/request-changes
GET    /api/admin/advertisements/statistics
```

### Search & Discovery
```
GET    /api/advertisements/search        Search advertisements
GET    /api/advertisements/trending      Get trending advertisements
GET    /api/advertisements/category/{cat}  Get by category
GET    /api/advertisements/seller/{id}   Search by seller
```

### Media Management
```
POST   /api/advertisements/{id}/upload-images   Upload images
POST   /api/advertisements/{id}/upload-video    Upload video
DELETE /api/advertisements/{id}/images/{imgId}  Delete image
PUT    /api/advertisements/{id}/reorder-images  Reorder gallery
```

## Database Models

### Advertisement Entity
```
{
  id: UUID
  sellerId: UUID
  title: String
  description: Text
  category: String
  gemstoneType: String
  color: String
  weight: Double
  quality: String
  askingPrice: BigDecimal
  currency: String
  sellerName: String (denormalized)
  phoneNumber: String
  email: String
  location: String
  isCertified: Boolean
  certificateNumber: String
  negotiable: Boolean
  urgent: Boolean
  imageUrls: Array[String]
  videoUrl: String
  thumbnailUrl: String
  status: Enum [DRAFT, PENDING, APPROVED, REJECTED, ON_HOLD, SOLD, ARCHIVED]
  reviewedBy: UUID (admin)
  rejectionReason: String
  requestedChanges: String
  createdAt: Timestamp
  approvedAt: Timestamp
  expiresAt: Timestamp (default 90 days)
  viewCount: Integer
  inquiryCount: Integer
  updatedAt: Timestamp
}
```

### Advertisement Review Entity
```
{
  id: UUID
  advertisementId: UUID
  reviewedBy: UUID (admin)
  decision: Enum [APPROVED, REJECTED, ON_HOLD, REQUEST_CHANGES]
  reason: String
  comments: String
  completedAt: Timestamp
}
```

## Performance Metrics

### Admin Dashboard Metrics
- Pending review count
- Average review time
- Approval/Rejection ratio
- Top categories
- Seller performance
- Time to visibility

### Seller Metrics
- Advertisement approval rate
- Time to approval
- Views per advertisement
- Inquiry conversion rate
- Sales completion rate

## Best Practices for Sellers

### Creating Effective Advertisements

1. **Title**
   - Clear and descriptive
   - Include key specifications
   - Format: `[Type] [Weight] [Color] [Quality]`
   - Example: `Natural Ruby 2.5CT Deep Red Premium`

2. **Description**
   - Detailed gemstone specifications
   - Condition and authenticity
   - Certification info (if applicable)
   - Detailed provenance (if available)
   - Photography and viewing information

3. **Pricing**
   - Research comparable items
   - Consider market conditions
   - Factor in condition
   - Price competitively

4. **Photography**
   - At least 3-5 quality images
   - Different angles
   - Natural and bright lighting
   - Close-ups of clarity/inclusions
   - Size reference if possible

5. **Contact Info**
   - Respond quickly to inquiries
   - Be professional and courteous
   - Provide detailed product information
   - Offer secure payment/meeting options

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Advertisement rejected | Contact admin, understand reason, make corrections |
| Images not uploading | Check file size and format, try again |
| Can't edit pending list | Must wait for admin decision first |
| Seller not showing verification | Ensure seller profile is fully verified |
| Inquiry not received | Check spam folder, verify contact info |

## Related Documentation

- See [01-PROJECT-SETUP.md](./01-PROJECT-SETUP.md) for initial setup
- See [02-USER-REGISTRATION-VERIFICATION.md](./02-USER-REGISTRATION-VERIFICATION.md) for seller verification
- See [03-LISTING-BIDDING-SYSTEM.md](./03-LISTING-BIDDING-SYSTEM.md) for auction features
