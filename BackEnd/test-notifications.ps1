# Test script for notification endpoints
Write-Host "Testing GemNet Notification System" -ForegroundColor Green

# Test 1: Get notifications
Write-Host "`n1. Testing GET notifications..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:9092/api/bidding/notifications/123?page=0&size=5" -Method GET -ContentType "application/json"
    Write-Host "✅ GET notifications successful" -ForegroundColor Green
    Write-Host "Total notifications: $($response.data.totalElements)" -ForegroundColor Cyan
    Write-Host "Unread count: $($response.data.unreadCount)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ GET notifications failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Get unread count
Write-Host "`n2. Testing GET unread count..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:9092/api/bidding/notifications/123/unread-count" -Method GET -ContentType "application/json"
    Write-Host "✅ GET unread count successful" -ForegroundColor Green
    Write-Host "Unread count: $($response.data)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ GET unread count failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Mark all as read
Write-Host "`n3. Testing PUT mark all as read..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:9092/api/bidding/notifications/123/read-all" -Method PUT -ContentType "application/json"
    Write-Host "✅ PUT mark all as read successful" -ForegroundColor Green
    Write-Host "Message: $($response.message)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ PUT mark all as read failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}

# Test 4: Verify unread count after marking as read
Write-Host "`n4. Testing GET unread count after marking all as read..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:9092/api/bidding/notifications/123/unread-count" -Method GET -ContentType "application/json"
    Write-Host "✅ GET unread count after update successful" -ForegroundColor Green
    Write-Host "New unread count: $($response.data)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ GET unread count after update failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest completed!" -ForegroundColor Green
