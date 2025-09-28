# MongoDB Atlas Setup Guide for GemNet

## Step 1: Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/atlas
2. Sign up with your email or GitHub account
3. Choose the "Free Tier" (M0 Sandbox)

## Step 2: Create a Cluster

1. Click "Create a New Cluster"
2. Choose "Shared" (Free tier)
3. Select your preferred region (closest to your location)
4. Cluster Name: `gemnet-cluster`
5. Click "Create Cluster" (takes 3-5 minutes)

## Step 3: Setup Database Access

1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. Authentication Method: "Password"
4. Username: `gemnet_admin`
5. Password: `GemNet2025!` (or generate a secure password)
6. Built-in Role: "Read and write to any database"
7. Click "Add User"

## Step 4: Setup Network Access

1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. Click "Confirm"

## Step 5: Get Connection String

1. Go to "Clusters" in left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Driver: "Java" Version: "4.3 or later"
5. Copy the connection string - it will look like:
   ```
   mongodb+srv://gemnet_admin:<password>@gemnet-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 6: Update Connection String

Replace `<password>` with your actual password:
```
mongodb+srv://gemnet_admin:GemNet2025!@gemnet-cluster.xxxxx.mongodb.net/gemnet_db?retryWrites=true&w=majority
```

## Step 7: Test Connection

Use this connection string in your application properties to test the connection.

## Data Migration Steps

Once Atlas is set up, you can migrate your existing local data:

### Method 1: Using MongoDB Compass (Recommended)
1. Download MongoDB Compass: https://www.mongodb.com/products/compass
2. Connect to your local MongoDB: `mongodb://localhost:27017`
3. Connect to Atlas: `mongodb+srv://gemnet_admin:password@cluster...`
4. Copy collections from local to Atlas

### Method 2: Using mongodump/mongorestore
```bash
# Export from local
mongodump --host localhost:27017 --db gemnet_db --out ./backup

# Import to Atlas
mongorestore --uri "mongodb+srv://gemnet_admin:password@cluster.../gemnet_db" ./backup/gemnet_db
```

## Security Notes

- Never commit the actual Atlas connection string to Git
- Use environment variables for passwords in production
- Consider IP whitelisting for production deployment