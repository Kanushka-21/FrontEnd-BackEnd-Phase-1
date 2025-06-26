# GemNet Connectivity Troubleshooting Guide

This guide helps diagnose and fix network connectivity issues in the GemNet face verification system.

## Quick Start

1. **Run the full diagnostic tool**:
   ```
   run-full-diagnostic.bat
   ```
   This will check all system dependencies and offer options to start the server or test components.

2. **Check MongoDB connection**:
   ```
   check-mongodb.ps1
   ```
   Verifies if MongoDB is properly configured and running.

3. **Test API connectivity**:
   ```
   test-connection.bat
   ```
   Tests if the backend API endpoints are responding.

4. **Test the complete verification flow**:
   Open `face-verification-test.html` in your browser to test the full registration and verification process.

## Common Issues and Solutions

### 1. "Continue to Face Verification" Button Not Working

**Symptoms**:
- Network errors appear in browser console
- Registration completes but face verification doesn't start
- Browser shows CORS errors

**Solutions**:
- Check if the backend server is running on port 9091
- Verify MongoDB is running and accessible
- Make sure CORS is properly configured
- Try using a different browser

**Verification**:
1. Open browser developer tools (F12)
2. Go to Network tab
3. Click the "Continue to Face Verification" button
4. Check for failed network requests and their status codes

### 2. MongoDB Connection Errors

**Symptoms**:
- Server fails to start with MongoDB connection errors
- Registration fails with database connection errors
- 503 Service Unavailable responses

**Solutions**:
- Start or restart MongoDB service
- Run `init-mongodb.bat` to initialize the database
- Check MongoDB configuration in application.properties
- Verify MongoDB is listening on port 27017

**Commands**:
```powershell
# Start MongoDB service
Start-Service MongoDB

# Check if MongoDB is running
Get-Service MongoDB

# Check if port 27017 is open
Test-NetConnection -ComputerName localhost -Port 27017
```

### 3. Tesseract OCR Configuration Issues

**Symptoms**:
- NIC verification fails with OCR errors
- Server logs show Tesseract path issues
- "No such file or directory" errors for tessdata

**Solutions**:
- Install Tesseract OCR from: https://github.com/UB-Mannheim/tesseract/wiki
- Install to the default location: C:\Program Files\Tesseract-OCR
- Ensure the tessdata directory exists
- Update the path in application.properties if needed

**Verification**:
```
tesseract --version
```

### 4. CORS Configuration Issues

**Symptoms**:
- Browser console shows CORS policy errors
- Requests fail with "Access-Control-Allow-Origin" errors
- OPTIONS requests are being rejected

**Solutions**:
- The server's CORS configuration has been updated to be more permissive
- If still having issues, check if a proxy or firewall is blocking requests
- If using a different frontend server, make sure it's properly configured
- For development, try a CORS-disabling browser extension temporarily

**Testing**:
```
curl -X OPTIONS http://localhost:9091/api/auth/register -H "Origin: http://example.com" -v
```

### 5. Network or Firewall Issues

**Symptoms**:
- Connection timeout errors
- Server is running but not accessible
- Some requests work while others fail

**Solutions**:
- Check Windows Firewall settings
- Try connecting from the same machine (localhost)
- Verify no antivirus or security software is blocking connections
- Test with multiple browsers and devices

### 6. File Upload Issues

**Symptoms**:
- Face or NIC verification fails with file upload errors
- "Unsupported Media Type" errors
- Form data not being processed correctly

**Solutions**:
- Ensure the Content-Type header is correct (multipart/form-data)
- Check file size limits in application.properties
- Verify upload directory permissions
- Ensure the correct file parameter names are used (faceImage, nicImage)

## Advanced Diagnostics

### HTTP Request/Response Logging

The application now includes detailed HTTP request/response logging. Look for lines starting with:
- 📥 REQUEST - For incoming requests
- 📤 RESPONSE - For outgoing responses

### Testing with API Clients

You can use tools like Postman or cURL to test the API directly:

**Register a user**:
```
curl -X POST http://localhost:9091/api/auth/register 
-H "Content-Type: application/json" 
-d "{\"firstName\":\"John\",\"lastName\":\"Doe\",\"email\":\"john@example.com\",\"password\":\"password123\",\"phoneNumber\":\"+94771234567\",\"address\":\"123 Main St\",\"dateOfBirth\":\"1990-01-01\",\"nicNumber\":\"901234567V\"}"
```

**Health check**:
```
curl http://localhost:9091/api/auth/health
```

### MongoDB Database Check

Connect to MongoDB and verify the collections:

```
mongosh localhost:27017/gemnet_db --eval "db.getCollectionNames()"
```

Check for existing users:

```
mongosh localhost:27017/gemnet_db --eval "db.users.find().limit(5).toArray()"
```

## Restart Procedures

If all else fails, try this full restart procedure:

1. Stop the GemNet backend server
2. Restart MongoDB:
   ```
   Restart-Service MongoDB
   ```
3. Run the MongoDB initializer:
   ```
   .\init-mongodb.bat
   ```
4. Start the GemNet backend server
5. Test connectivity:
   ```
   .\test-connection.bat
   ```
