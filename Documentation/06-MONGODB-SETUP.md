# 06 - MongoDB Setup & Configuration

## Database Selection

GemNet supports two MongoDB deployment options:

1. **MongoDB Atlas (Cloud)** - Recommended for production
2. **Local MongoDB** - For development and testing

## Option 1: MongoDB Atlas (Cloud Setup)

### Step 1: Create Account

1. Visit https://www.mongodb.com/atlas
2. Sign up with your email or GitHub account
3. Verify email address
4. Accept terms and continue

### Step 2: Create Organization & Project

1. Create organization: "GemNet"
2. Create project: "GemNet-Production"
3. Add team members (optional)

### Step 3: Create Cluster

1. Click "Create Deployment"
2. Choose "Clusters"
3. Select "Shared" (Free tier M0)
4. **Configuration:**
   - Cloud Provider: AWS
   - Region: ap-northeast-1 (closest to your location)
   - Cluster Name: `gemnet-cluster`
   - Click "Create Cluster"

**Wait:** Cluster creation takes 3-5 minutes

### Step 4: Database Access (Authentication)

1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"

**Setup User:**
```
Username: gemnet_admin
Password: [Generate strong password - save this!]
Built-in Role: Read and write to any database
Additional Roles: None needed
```

3. Click "Add User"

**Save Credentials:**
```
Username: gemnet_admin
Password: __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __
Backup Code: __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __
```

### Step 5: Network Access

1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"

**Options:**
- **Development**: Click "Allow Access from Anywhere" (simple, less secure)
- **Production**: Add specific IP addresses only

3. Click "Confirm"

### Step 6: Get Connection String

1. Go to "Clusters" and click "Connect"
2. Choose "Connect your application"
3. Select Driver: **Java** Version: **4.3 or later**
4. Copy connection string

**Connection String Format:**
```
mongodb+srv://gemnet_admin:<password>@gemnet-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

**Replace `<password>` with your actual password:**
```
mongodb+srv://gemnet_admin:YOUR_PASSWORD@gemnet-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### Step 7: Create Database

1. Click "Browse Collections"
2. Click "Create Database"
3. Database Name: `gemnet_db`
4. Collection Name: `users` (auto-create others)
5. Click "Create"

### Step 8: Update Application Configuration

**Frontend configuration** (`FrontEnd/.env`):
```bash
REACT_APP_API_URL=http://localhost:9091
```

**Backend configuration** (`BackEnd/src/main/resources/application.properties`):
```properties
# MongoDB Connection
spring.data.mongodb.uri=mongodb+srv://gemnet_admin:YOUR_PASSWORD@gemnet-cluster.xxxxx.mongodb.net/gemnet_db?retryWrites=true&w=majority
spring.data.mongodb.database=gemnet_db

# Connection Pool
spring.data.mongodb.pool.max-size=50
spring.data.mongodb.pool.min-size=10

# Server
server.port=9091
```

**Or create environment variable:**
```bash
export MONGODB_URI=mongodb+srv://gemnet_admin:YOUR_PASSWORD@gemnet-cluster.xxxxx.mongodb.net/gemnet_db?retryWrites=true&w=majority
```

## Option 2: Local MongoDB Setup

### Windows Installation

1. **Download MongoDB Community Server**
   - Visit: https://www.mongodb.com/try/download/community
   - Select Windows, msi
   - Download latest version

2. **Run Installer**
   - Double-click installer
   - Accept license agreement
   - Choose "Complete" installation
   - Default installation path: `C:\Program Files\MongoDB\Server\6.0\`
   - **Important**: Check "Install MongoDB as a Service"
   - Click "Install"

3. **Verify Installation**
   ```bash
   mongod --version
   mongo --version
   ```

4. **Start MongoDB Service**
   ```bash
   # In PowerShell (Admin)
   Get-Service MongoDB | Start-Service
   
   # Or via Services.msc
   # Find "MongoDB Server" and click "Start"
   ```

### Mac Installation

```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Stop MongoDB
brew services stop mongodb-community
```

### Linux Installation (Ubuntu)

```bash
# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod

# Enable at startup
sudo systemctl enable mongod

# Check status
sudo systemctl status mongod
```

### Verify Local MongoDB

```bash
# Connect to MongoDB
mongosh

# Should show:
# Current Mongosh Log ID: xxx
# Connecting to: mongodb://127.0.0.1:27017/...
# Type "help" for help...
```

### Configure Application for Local MongoDB

**application.properties:**
```properties
# MongoDB Connection (Local)
spring.data.mongodb.uri=mongodb://localhost:27017/gemnet_db
spring.data.mongodb.database=gemnet_db

# Server
server.port=9091
```

### Create Initial Database & Collections

```bash
# Connect to MongoDB
mongosh

# Create database (auto-created on first insert)
use gemnet_db

# Create collections
db.createCollection("users")
db.createCollection("listings")
db.createCollection("advertisements")
db.createCollection("bids")
db.createCollection("purchases")
db.createCollection("notifications")
db.createCollection("reviews")

# Verify collections
show collections
```

## Database Structure (Collections)

### Users Collection Schema
```javascript
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  email: String,
  password: String,  // Hashed
  phoneNumber: String,
  address: String,
  dateOfBirth: Date,
  nicNumber: String,
  userRole: String,  // BUYER, SELLER, ADMIN
  registrationStatus: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Listings Collection Schema
```javascript
{
  _id: ObjectId,
  sellerId: ObjectId,
  title: String,
  description: String,
  category: String,
  gemstoneDetails: {
    species: String,
    weight: Number,
    color: String,
    clarity: String
  },
  imageUrls: [String],
  startingPrice: Number,
  status: String,
  auctionStartTime: Date,
  auctionEndTime: Date,
  createdAt: Date
}
```

### Advertisements Collection Schema
```javascript
{
  _id: ObjectId,
  sellerId: ObjectId,
  title: String,
  description: String,
  askingPrice: Number,
  imageUrls: [String],
  status: String,
  createdAt: Date,
  approvedAt: Date
}
```

## Initial Data Setup

### Migrate Data Script

**BackEnd/init_script.js:**
```javascript
// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ nicNumber: 1 }, { unique: true });
db.listings.createIndex({ sellerId: 1 });
db.listings.createIndex({ status: 1 });
db.listings.createIndex({ auctionEndTime: 1 });
db.advertisements.createIndex({ sellerId: 1 });
db.advertisements.createIndex({ status: 1 });
db.bids.createIndex({ listingId: 1 });
db.bids.createIndex({ bidderId: 1 });
db.purchases.createIndex({ winnerId: 1 });

// Insert test admin user
db.users.insertOne({
  firstName: "Admin",
  lastName: "User",
  email: "admin@gemnet.local",
  password: "$2a$10$...", // Hashed password
  userRole: "ADMIN",
  registrationStatus: "APPROVED",
  createdAt: new Date()
});
```

**Run migration:**
```bash
cd BackEnd
mongosh < init_script.js
```

## Backup & Restore

### Backup Commands

**MongoDB Atlas:**
```bash
# Automatic backups are enabled
# Download backup from Atlas Dashboard → Backup → Download
```

**Local MongoDB:**
```bash
# Create backup
mongodump --db gemnet_db --out ./backup

# Verify backup
ls -la backup/gemnet_db/
```

### Restore Commands

**MongoDB Atlas:**
```bash
# Restore from downloaded backup
mongorestore --uri="mongodb+srv://gemnet_admin:password@cluster.mongodb.net" ./backup
```

**Local MongoDB:**
```bash
# Restore from backup
mongorestore --db gemnet_db ./backup/gemnet_db
```

## Database Optimization

### Create Indexes

```javascript
// Performance indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ nicNumber: 1 }, { unique: true });
db.listings.createIndex({ sellerId: 1 });
db.listings.createIndex({ status: 1 });
db.listings.createIndex({ createdAt: -1 });
db.advertisements.createIndex({ sellerId: 1 });
db.advertisements.createIndex({ status: 1 });
db.advertisements.createIndex({ createdAt: -1 });
db.bids.createIndex({ listingId: 1, bidTime: -1 });
db.purchases.createIndex({ winnerId: 1 });

// Text search indexes
db.listings.createIndex({ title: "text", description: "text" });
db.advertisements.createIndex({ title: "text", description: "text" });
```

### Query Performance

```bash
# Analyze query performance
db.listings.find({ status: "ACTIVE" }).explain("executionStats")

# Find missing indexes
db.listings.find({ sellerId: ObjectId(...) }).explain("executionStats")
```

## Connection Troubleshooting

### Connection Failed Errors

**Error: "connect ECONNREFUSED"**
```
Solution:
1. Ensure MongoDB is running: mongosh
2. Check connection string
3. Verify credentials if using Atlas
4. Check network access rules (Atlas)
```

**Error: "authentication failed"**
```
Solution:
1. Verify username and password
2. Check if user has correct permissions
3. Ensure password is URL-encoded if special characters
4. Verify database name in connection string
```

**Error: "network timeout"**
```
Solution:
1. Check internet connection
2. Verify firewall rules (Atlas)
3. Check IP whitelist (Atlas)
4. Increase connection timeout
```

### Test Connection

**From Backend:**
```java
// In application logs, should see:
// MongoDB connection opened
// Mongodb is running on: localhost:27017
```

**From Command Line:**
```bash
mongosh "mongodb://localhost:27017/gemnet_db"

# or for Atlas
mongosh "mongodb+srv://gemnet_admin:password@cluster.mongodb.net/gemnet_db"
```

## Monitoring & Maintenance

### MongoDB Atlas Monitoring

1. Go to "Monitoring" dashboard
2. Check metrics:
   - Operations per second
   - Network I/O
   - Memory usage
   - Connections

### Local MongoDB Monitoring

```bash
# Connect to MongoDB
mongosh

# Check status
db.serverStatus()

# Check collection sizes
db.listings.stats()

# Check database size
db.stats()
```

## Security Best Practices

### Credential Management

1. **Never hardcode passwords** - Use environment variables

```bash
# Set environment variable
export MONGODB_URI=mongodb+srv://gemnet_admin:password@cluster.mongodb.net/gemnet_db
```

2. **Use strong passwords**
   - Minimum 12 characters
   - Mix uppercase, lowercase, numbers, special characters
   - Example: `G@mN3t_Admin_2024`

3. **Rotate passwords regularly**
   - Every 90 days in production
   - Change if compromised

### Network Security

1. **IP Whitelist (Atlas)**
   - Add specific IP addresses
   - Use VPN IP if remote
   - Use 0.0.0.0/0 only for development

2. **Use SSL/TLS**
   - Enabled by default in Atlas
   - Enable in local MongoDB for production

3. **Firewall Rules**
   - Only open port 27017 to application server
   - Restrict access by IP

### Data Encryption

```properties
# Enable encryption at rest
storage.encryption.enable: true

# Enable encryption in transit
security.clusterAuthMode: x509
```

## Related Documentation

- See [01-PROJECT-SETUP.md](./01-PROJECT-SETUP.md) for quick start
- See [05-DEPLOYMENT-GUIDE.md](./05-DEPLOYMENT-GUIDE.md) for production deployment
- See [07-TESTING-STRATEGY.md](./07-TESTING-STRATEGY.md) for testing with database
