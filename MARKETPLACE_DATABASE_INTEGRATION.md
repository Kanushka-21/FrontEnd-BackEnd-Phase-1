# GemNet Marketplace Database Integration Guide

## Overview
The marketplace page has been updated to fetch real approved gemstone listings from the `gemnet_db.gem_listings` collection in MongoDB instead of showing mock data.

## Changes Made

### Frontend (MarketplacePage.tsx)
- ✅ Removed all mock/sample data fallback logic
- ✅ Updated to fetch only real approved listings from database
- ✅ Enhanced error messages to show database connection instructions
- ✅ Added specific messaging about database source
- ✅ Improved user feedback for empty database results

### Backend Repository (GemListingRepository.java)
- ✅ Added missing marketplace-specific query methods:
  - `searchByNameInMarketplace()`
  - `searchByVarietyInMarketplace()`
  - `findByCategoryAndCertificationInMarketplace()`
  - `findByMinPriceInMarketplace()`
  - `countMarketplaceListings()`
  - `countByCertificationInMarketplace()`

## How to Test

### 1. Start MongoDB
```bash
# Start MongoDB on default port 27017
mongod --port 27017
```

### 2. Add Sample Approved Listings to Database
```javascript
// Connect to MongoDB
use gemnet_db

// Insert sample approved listings
db.gem_listings.insertMany([
  {
    gemName: "Ceylon Blue Sapphire",
    price: 125000,
    weight: 3.5,
    color: "Blue",
    species: "Corundum",
    variety: "Sapphire",
    shape: "Oval",
    cut: "Brilliant",
    clarity: "VS1",
    measurements: "8.5x6.2x4.1",
    transparency: "transparent",
    treatment: "Heat treated",
    isCertified: true,
    certifyingAuthority: "GIA",
    certificateNumber: "GIA-2023-001",
    issueDate: "2023-06-15",
    listingStatus: "APPROVED",
    isActive: true,
    userName: "seller1",
    primaryImageUrl: "https://images.unsplash.com/photo-1615654771169-65fde4070ade?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    refractiveIndex: "1.762-1.770",
    specificGravity: "4.0",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    gemName: "Pink Padparadscha Sapphire",
    price: 280000,
    weight: 2.8,
    color: "Pink",
    species: "Corundum",
    variety: "Padparadscha",
    shape: "Cushion",
    cut: "Modified Brilliant",
    clarity: "VVS2",
    measurements: "7.8x6.9x3.8",
    transparency: "transparent",
    treatment: null,
    isCertified: true,
    certifyingAuthority: "SSEF",
    certificateNumber: "SSEF-2023-002",
    issueDate: "2023-06-20",
    listingStatus: "APPROVED",
    isActive: true,
    userName: "seller2",
    primaryImageUrl: "https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    refractiveIndex: "1.762-1.770",
    specificGravity: "4.0",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    gemName: "Yellow Sapphire",
    price: 95000,
    weight: 4.2,
    color: "Yellow",
    species: "Corundum",
    variety: "Sapphire",
    shape: "Round",
    cut: "Brilliant",
    clarity: "SI1",
    measurements: "9.1x9.1x5.2",
    transparency: "transparent",
    treatment: "Heat treated",
    isCertified: false,
    certifyingAuthority: null,
    certificateNumber: null,
    issueDate: null,
    listingStatus: "APPROVED",
    isActive: true,
    userName: "seller3",
    primaryImageUrl: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    refractiveIndex: null,
    specificGravity: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }
])

// Verify the data was inserted
db.gem_listings.find({listingStatus: "APPROVED", isActive: true}).count()
```

### 3. Start Backend Server
```bash
# In BackEnd directory
# Option 1: Using batch file (if Maven/JAR available)
start-windows.bat

# Option 2: Using IDE
# Open the project in IntelliJ IDEA or Eclipse and run GemNetApplication.java

# Option 3: Manual compilation (if Maven installed)
mvn spring-boot:run
```

### 4. Start Frontend
```bash
# In FrontEnd directory
npm install
npm run dev
```

### 5. Test the Marketplace
1. Navigate to `http://localhost:5173/marketplace`
2. You should see real approved listings from the database
3. If backend is not running, you'll see a clear error message with instructions
4. If database is empty, you'll see a message about no approved listings

## Database Query Structure

The marketplace fetches listings using this MongoDB query:
```javascript
{
  "listingStatus": {"$in": ["APPROVED", "ACTIVE"]},
  "isActive": true
}
```

## API Endpoints

- **GET** `/api/marketplace/listings` - Get paginated approved listings
- **GET** `/api/marketplace/listings/{id}` - Get specific listing details
- **GET** `/api/marketplace/search` - Search approved listings
- **GET** `/api/marketplace/stats` - Get marketplace statistics

## What Changed

### Before
- Marketplace always showed mock data as fallback
- Users couldn't see real database content
- No clear indication of data source

### After
- Marketplace only shows real approved listings from `gemnet_db.gem_listings`
- Clear error messages when backend/database unavailable
- No mock data fallback
- Database query information shown to users
- Proper integration with MongoDB collection

## Next Steps

1. Start the backend server (requires Maven or IDE)
2. Ensure MongoDB is running with sample data
3. Test the marketplace page
4. Add more approved listings to see pagination and filtering work
5. Verify all marketplace features work with real data

## Troubleshooting

### Backend Not Starting
- Ensure Java 21+ is installed
- Install Maven or use an IDE to run the application
- Check MongoDB connection in application properties

### No Listings Showing
- Verify MongoDB is running on localhost:27017
- Check that gem_listings collection has documents with `listingStatus: "APPROVED"` and `isActive: true`
- Verify backend is running on localhost:9092

### Frontend Connection Issues
- Confirm backend API is accessible at http://localhost:9092
- Check browser network tab for API call errors
- Verify CORS settings in backend controller
