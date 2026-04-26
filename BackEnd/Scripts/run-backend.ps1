# GemNet Backend Runner
Write-Host "🚀 Starting GemNet Backend Application" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

# Check for Java
try {
    $javaVersion = java -version 2>&1
    Write-Host "✅ Java is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Java is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Java JDK 17 or higher" -ForegroundColor Yellow
    exit 1
}

# Check MongoDB connection
try {
    Write-Host "Testing MongoDB connection..." -ForegroundColor Yellow
    # Simple check to see if MongoDB is running on default port
    $mongoCheck = Test-NetConnection -ComputerName localhost -Port 27017 -WarningAction SilentlyContinue
    if ($mongoCheck.TcpTestSucceeded) {
        Write-Host "✅ MongoDB is running on port 27017" -ForegroundColor Green
    } else {
        Write-Host "❌ MongoDB is not running on port 27017" -ForegroundColor Red
        Write-Host "Please start MongoDB before running this application" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Could not check MongoDB connection" -ForegroundColor Red
    Write-Host "Assuming MongoDB is running and continuing..." -ForegroundColor Yellow
}

# Change to jar directory
$jarPath = ".\target\gemnet-backend-0.0.1-SNAPSHOT.jar"

if (Test-Path -Path $jarPath) {
    Write-Host "✅ Found application JAR file" -ForegroundColor Green
    Write-Host "Starting application from JAR..." -ForegroundColor Yellow
    java -jar $jarPath
} else {
    Write-Host "❌ JAR file not found: $jarPath" -ForegroundColor Red
    Write-Host "Attempting to build the application with Maven..." -ForegroundColor Yellow
    
    # Try to run with Maven directly
    try {
        mvn clean package
        if (Test-Path -Path $jarPath) {
            Write-Host "✅ Successfully built application" -ForegroundColor Green
            Write-Host "Starting application from JAR..." -ForegroundColor Yellow
            java -jar $jarPath
        } else {
            Write-Host "❌ Failed to build application JAR" -ForegroundColor Red
            Write-Host "Please run this application from IntelliJ IDEA" -ForegroundColor Yellow
            Write-Host "1. Open GemNetApplication.java" -ForegroundColor Cyan
            Write-Host "2. Click the green ▶️ button next to the main method" -ForegroundColor Cyan
        }
    } catch {
        Write-Host "❌ Maven is not installed or not in PATH" -ForegroundColor Red
        Write-Host "Please run this application from IntelliJ IDEA" -ForegroundColor Yellow
        Write-Host "1. Open GemNetApplication.java" -ForegroundColor Cyan
        Write-Host "2. Click the green ▶️ button next to the main method" -ForegroundColor Cyan
    }
}

Write-Host ""
Write-Host "The application should now be running on: http://localhost:9091" -ForegroundColor Green
Write-Host "API Documentation: http://localhost:9091/swagger-ui.html" -ForegroundColor Green
Write-Host ""