# 02 - User Registration & Verification System

## System Overview

The User Registration & Verification System implements a comprehensive multi-step authentication process that ensures user authenticity through advanced biometric verification, document validation, and admin approval workflows.

### Key Features
- **Multi-step registration process** with 4 distinct phases
- **Biometric face verification** using advanced recognition algorithms
- **NIC document verification** with OCR and validation
- **Admin approval workflow** with comprehensive review dashboard
- **Role-based access control** (Buyer, Seller, Admin)
- **Real-time verification status tracking**

## Registration Flow

```
Step 1: Personal Information
    ↓
Step 2: Face Verification
    ↓
Step 3: NIC Document Verification
    ↓
Step 4: Admin Approval
    ↓
Account Activated
```

## Step-by-Step Process

### Step 1: Personal Information Collection

**User provides:**
- First Name & Last Name
- Email Address
- Strong Password (8+ chars, mixed case, numbers, symbols)
- Phone Number (Sri Lankan format)
- Residential Address
- Date of Birth (automatic age verification ≥18)
- NIC Number (10 or 12 digit Sri Lankan format)
- User Role Selection (Buyer or Seller)

**Validations Applied:**
- Email format & domain verification
- Sri Lankan NIC format validation
- Age verification (18+)
- Password strength enforcement
- Phone number format validation

### Step 2: Face Verification

**Process:**
1. User captures face using webcam
2. High-quality image capture with quality checks
3. Multiple attempts allowed if image quality is poor
4. Server-side face recognition analysis
5. Biometric verification using advanced algorithms

**Requirements:**
- Good lighting conditions
- Front-facing camera with clear view
- No obstructed face (glasses allowed but must be clear)
- Natural facial expression

**Success Criteria:**
- Face detected in image
- Face quality meets standards
- No spoofing detected (real live face)

### Step 3: NIC Document Verification

**Process:**
1. Upload NIC front side image
2. Upload NIC back side image
3. OCR (Optical Character Recognition) processing
4. Automatic field extraction and validation
5. Document authenticity verification

**Extracted Data from OCR:**
- Full Name
- NIC Number
- Date of Birth
- Issued Date
- Expiry Date (if applicable)
- Issuing Authority

**Validations:**
- NIC number format and check digit
- Matches personal information (Name, DOB)
- Document not expired
- Image quality sufficient for OCR
- No alterations or tampering detected

### Step 4: Admin Approval

**Admin Dashboard Interface:**
- View pending user registrations
- Review all verification data
- View face verification images
- View NIC document images
- View extracted NIC information
- Approve or reject with optional comments

**Admin Actions:**
1. **Approve**: User account activated, can proceed with login
2. **Reject**: User receives notification with reason, can re-apply after 30 days
3. **Request Clarification**: Ask user for updated documents

**Review Criteria:**
- Face Quality Assessment
- NIC Document Quality Assessment
- Information Consistency
- No suspicious patterns
- Role-appropriate verification

## API Endpoints

### Registration
```
POST /api/auth/register
Body: {
  firstName, lastName, email, password,
  phoneNumber, address, dateOfBirth,
  nicNumber, userRole
}
Response: { userId, token, registrationToken }
```

### Face Verification
```
POST /api/verification/face/upload
Body: multipart/form-data with face image
Response: { success, faceVerificationId, confidence }
```

### NIC Verification
```
POST /api/verification/nic/upload
Body: multipart/form-data with NIC images
Response: { success, extractedData, ocrConfidence }
```

### Get Registration Status
```
GET /api/verification/status/{userId}
Response: {
  step, status,
  personalInfo: { verified, data },
  faceVerification: { verified, confidence },
  nicVerification: { verified, extractedData },
  adminApproval: { status, reviewer, comment, timestamp }
}
```

## Database Models

### User Entity
```
{
  id: UUID
  firstName: String
  lastName: String
  email: String (unique)
  password: String (hashed)
  phoneNumber: String
  address: String
  dateOfBirth: Date
  nicNumber: String (unique)
  userRole: Enum [BUYER, SELLER, ADMIN]
  registrationStatus: Enum [PENDING, VERIFIED, APPROVED, REJECTED]
  createdAt: Timestamp
  updatedAt: Timestamp
  approvedBy: UUID (admin user)
  approvalComment: String
}
```

### Verification Records
```
{
  id: UUID
  userId: UUID
  faceImagePath: String
  faceVerificationScore: Float (0-100)
  faceVerificationStatus: Enum [PENDING, APPROVED, REJECTED]
  nicFrontImagePath: String
  nicBackImagePath: String
  nicOcrData: JSON
  nicVerificationStatus: Enum [PENDING, APPROVED, REJECTED]
  adminApprovalStatus: Enum [PENDING, APPROVED, REJECTED]
  adminComment: String
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

## Security Features

### Password Security
- Password hashing using BCrypt
- Minimum length: 8 characters
- Must contain: uppercase, lowercase, numbers, special characters
- Password reset functionality with email verification

### Face Biometric
- Real-time liveness detection (no static images allowed)
- Face spoofing detection
- High-resolution image storage (encrypted)
- Biometric data deletion after verification (optional GDPR compliance)

### Document Security
- OCR confidence threshold enforcement
- Document authenticity verification
- Manual review for edge cases
- Encrypted storage of sensitive documents

### Account Security
- Rate limiting on registration attempts
- CAPTCHA on registration form
- Email verification before activation
- Admin audit trail for all approvals/rejections

## Frontend Components

Key React components (located in `FrontEnd/src/components/`):

1. **RegistrationWizard.tsx** - Main registration container
2. **PersonalInfoStep.tsx** - Step 1 form
3. **FaceVerificationStep.tsx** - Step 2 camera capture
4. **NICVerificationStep.tsx** - Step 3 document upload
5. **ReviewStep.tsx** - Step 4 confirmation
6. **AdminVerificationDashboard.tsx** - Admin review interface

## Backend Services

Key services (located in `BackEnd/src/main/java/com/gemnet/service/`):

1. **UserRegistrationService.java** - Registration logic
2. **FaceVerificationService.java** - Face recognition
3. **NICVerificationService.java** - OCR processing
4. **AdminApprovalService.java** - Approval workflow

## Testing the System

### Manual Testing Steps

1. **Navigation:**
   - Go to frontend: http://localhost:3000
   - Click "Register" or "Sign Up"

2. **Fill Personal Info:**
   - Use test data
   - Valid email format
   - Strong password: `Test@1234`
   - Valid NIC: `123456789V` or `123456789012`

3. **Face Verification:**
   - Allow camera access
   - Capture clear face image
   - Good lighting conditions

4. **NIC Upload:**
   - Upload test images (even placeholder images work in test mode)
   - Both front and back sides

5. **Admin Approval:**
   - Log in as Admin
   - Go to Admin Dashboard
   - Review pending registrations
   - Approve/Reject users

## Error Handling

### Common Registration Errors

| Error | Cause | Solution |
|-------|-------|----------|
| Email already exists | Duplicate registration | Use different email |
| Invalid NIC format | Wrong format | Sri Lankan NIC format required |
| Face not detected | Poor lighting/angle | Recapture in better conditions |
| OCR failed | Poor document quality | Recapture clearer images |
| Admin rejection | Verification failed | Review admin comment, resubmit |

## Status Codes

```
PENDING - Awaiting user action or admin review
APPROVED - Successfully verified
REJECTED - Failed verification, user must reapply
EXPIRED - Verification attempt expired (usually 30 days)
IN_REVIEW - Admin currently reviewing
```

## Performance Considerations

- Face recognition processing: ~2-5 seconds
- OCR processing: ~3-10 seconds (depends on image quality)
- Database queries optimized with indexes on email, NIC
- File uploads limited to 10MB per image
- Batch processing for admin reviews

## Future Enhancements

1. **Biometric Fingerprint** - Add fingerprint verification
2. **Video Verification** - Replace static images with video verification
3. **Blockchain** - Store verification hashes on blockchain
4. **Multi-language Support** - Support for Sinhala and Tamil
5. **Email Notifications** - Automated email updates to users
6. **SMS Verification** - Phone number verification via SMS

## Troubleshooting

### Face Verification Not Working
- Ensure camera permissions allowed
- Check lighting conditions
- Try different angles
- Verify browser camera support

### NIC OCR Failing
- Ensure images are clear and well-lit
- Both sides must be clearly visible
- No glare or reflection on documents
- Full NIC visible in frame

### Admin Can't See Pending Users
- Check user registration completed all steps
- Verify admin role assigned to user
- Check database for verification records

## Related Documentation

- See [01-PROJECT-SETUP.md](./01-PROJECT-SETUP.md) for initial setup
- See [04-ADVERTISEMENT-MANAGEMENT.md](./04-ADVERTISEMENT-MANAGEMENT.md) for seller features
- See [07-TESTING-STRATEGY.md](./07-TESTING-STRATEGY.md) for testing approach
