# GemNet MongoDB Connectivity Test
Write-Host "🔌 Testing MongoDB Connectivity" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if MongoDB is running
try {
    $mongoCheck = Test-NetConnection -ComputerName localhost -Port 27017 -WarningAction SilentlyContinue
    if ($mongoCheck.TcpTestSucceeded) {
        Write-Host "✅ MongoDB is running on port 27017" -ForegroundColor Green
    } else {
        Write-Host "❌ MongoDB is not running on port 27017" -ForegroundColor Red
        Write-Host "Please start MongoDB service using: Start-Service MongoDB" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Could not check MongoDB connection: $_" -ForegroundColor Red
    exit 1
}

# Display MongoDB service status
Write-Host "`nChecking MongoDB service status:" -ForegroundColor Cyan
try {
    $service = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
    if ($service) {
        Write-Host "Status: $($service.Status)" -ForegroundColor $(if ($service.Status -eq "Running") { "Green" } else { "Red" })
        Write-Host "Start Type: $($service.StartType)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ MongoDB service not found" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error getting MongoDB service status: $_" -ForegroundColor Red
}

# Check MongoDB data directory
Write-Host "`nChecking MongoDB data directory:" -ForegroundColor Cyan
$possibleDataPaths = @(
    "C:\Program Files\MongoDB\Server\data\db",
    "C:\data\db",
    "C:\mongodb\data\db"
)

foreach ($path in $possibleDataPaths) {
    if (Test-Path $path) {
        Write-Host "✅ Found MongoDB data directory: $path" -ForegroundColor Green
    } else {
        Write-Host "❓ MongoDB data directory not found at: $path" -ForegroundColor Yellow
    }
}

# Attempt to restart MongoDB service
Write-Host "`nWould you like to restart the MongoDB service? (y/n)" -ForegroundColor Yellow
$answer = Read-Host
if ($answer.ToLower() -eq "y") {
    try {
        Restart-Service -Name "MongoDB" -Force
        Start-Sleep -Seconds 5
        $service = Get-Service -Name "MongoDB"
        if ($service.Status -eq "Running") {
            Write-Host "✅ MongoDB service restarted successfully" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to restart MongoDB service" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Error restarting MongoDB service: $_" -ForegroundColor Red
    }
}

Write-Host "`nCompleted MongoDB diagnostic tests" -ForegroundColor Cyan
Write-Host "Press any key to exit..." -ForegroundColor Cyan
[void][System.Console]::ReadKey($true)
