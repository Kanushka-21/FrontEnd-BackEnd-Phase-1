# Manual Database Solution for Purchase History

Since we're having backend compilation issues, here's a manual solution to create purchase history data directly in MongoDB:

## Option 1: MongoDB Compass (Recommended)

1. **Open MongoDB Compass**
2. **Connect to**: `mongodb://localhost:27017`
3. **Select Database**: `gemnet_db` (or the database name in your MongoDB)
4. **Navigate to**: `gem_listing` collection

### Step 1: Find an existing listing
```javascript
// Find an active listing
db.gem_listing.findOne({listingStatus: "active"})
```

### Step 2: Update it to be a sold item
Replace `LISTING_ID_HERE` with an actual listing ID from Step 1:

```javascript
db.gem_listing.updateOne(
  { "_id": "LISTING_ID_HERE" },
  { 
    $set: { 
      "listingStatus": "sold",
      "winningBidderId": "pasindu@gmail.com",
      "finalPrice": 75000,
      "biddingActive": false,
      "biddingCompletedAt": new Date()
    }
  }
)
```

### Step 3: Verify the update
```javascript
db.gem_listing.findOne({"winningBidderId": "pasindu@gmail.com"})
```

## Option 2: MongoDB Shell

1. **Open Command Prompt/Terminal**
2. **Connect to MongoDB**:
   ```bash
   mongo
   ```
3. **Use the database**:
   ```javascript
   use gemnet_db
   ```
4. **Execute the same commands as above**

## Option 3: Create a new sold listing

If you want to create a completely new sold listing:

```javascript
db.gem_listing.insertOne({
  "_id": new ObjectId(),
  "gemName": "Test Ruby Purchase",
  "variety": "Ruby",
  "weight": "2.5ct",
  "color": "Red",
  "clarity": "VS1",
  "cut": "Round",
  "startingPrice": 50000,
  "finalPrice": 75000,
  "listingStatus": "sold",
  "winningBidderId": "pasindu@gmail.com",
  "biddingActive": false,
  "biddingCompletedAt": new Date(),
  "userId": "seller123",
  "images": ["test-ruby.jpg"],
  "primaryImageUrl": "/uploads/gems/test-ruby.jpg",
  "createdAt": new Date(),
  "updatedAt": new Date()
})
```

## Testing the Result

After making these database changes, you can test:

1. **Test API (if backend is running)**:
   ```
   http://localhost:9092/api/bidding/purchase-history/pasindu@gmail.com
   ```

2. **Check Frontend**: 
   - Open the buyer dashboard
   - Go to Purchase History section
   - You should see the purchased item

## Quick Backend Restart

If you want to try restarting the backend:

1. **Kill any Java processes**:
   ```powershell
   Stop-Process -Name java -Force
   ```

2. **Try the simple run script**:
   ```powershell
   .\run-backend.ps1
   ```

3. **Or use IntelliJ IDEA**:
   - Open `GemNetApplication.java`
   - Click the green play button next to the `main` method

## Verification Steps

After creating the database entries:

1. **MongoDB Query**:
   ```javascript
   db.gem_listing.find({"winningBidderId": "pasindu@gmail.com"})
   ```

2. **Expected Result**: Should show the item(s) you marked as sold

3. **Frontend Check**: Purchase History section should show the items

This manual approach will immediately solve the "No purchases yet" issue in the buyer dashboard.
