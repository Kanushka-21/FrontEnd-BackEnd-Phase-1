package com.gemnet;

import com.gemnet.config.TesseractConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.core.env.Environment;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;

import jakarta.annotation.PostConstruct;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.util.Enumeration;

@SpringBootApplication
public class GemNetApplication {
    
    @Autowired
    private TesseractConfig tesseractConfig;
    
    @Autowired
    private Environment environment;
    
    @Autowired
    private MongoTemplate mongoTemplate;
    
    @PostConstruct
    public void init() {
        // Setup environment for Tesseract before any services initialize
        tesseractConfig.setupEnvironment();
        
        // Log configuration details
        System.out.println("🚀 GemNet Application initialized with Tesseract configuration");
        System.out.println("📁 Tesseract Data Path: " + tesseractConfig.getDatapath());
        System.out.println("🌐 Language: " + tesseractConfig.getLanguage());
        System.out.println("⚙️ OCR Engine Mode: " + tesseractConfig.getOcrEngineMode());
        System.out.println("📄 Page Segmentation Mode: " + tesseractConfig.getPageSegMode());
        
        // Ensure database exists with required collections
        try {
            System.out.println("🗄️ Checking database initialization status...");
            ensureDatabaseInitialized();
        } catch (Exception e) {
            System.out.println("⚠️ Database initialization skipped: " + e.getMessage());
        }
        
        // Print network information to help diagnose connectivity issues
        try {
            System.out.println("\n🌐 Network Configuration:");
            String port = environment.getProperty("server.port", "9091");
            System.out.println("🔌 Server port: " + port);
            System.out.println("📡 Available API endpoints:");
            System.out.println("   - Local: http://localhost:" + port + "/api/auth/health");
            
            // Print all IP addresses for easier connection testing
            Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();
            while (interfaces.hasMoreElements()) {
                NetworkInterface networkInterface = interfaces.nextElement();
                if (networkInterface.isUp() && !networkInterface.isLoopback()) {
                    Enumeration<InetAddress> addresses = networkInterface.getInetAddresses();
                    while (addresses.hasMoreElements()) {
                        InetAddress addr = addresses.nextElement();
                        if (addr.getHostAddress().contains(".")) { // IPv4
                            System.out.println("   - Network: http://" + addr.getHostAddress() + ":" + port + "/api/auth/health");
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.out.println("⚠️ Error retrieving network information: " + e.getMessage());
        }
        
        // Test MongoDB connection with more detailed diagnostics
        try {
            System.out.println("\n📊 Testing MongoDB Connection:");
            
            // Try to get database name - this will throw an exception if connection fails
            String dbName = mongoTemplate.getDb().getName();
            
            // Simple test query to verify connection
            mongoTemplate.count(new Query(), "test");
            
            // Verify gem_listings collection existence
            boolean hasGemListings = false;
            try {
                mongoTemplate.getCollection("gem_listings").countDocuments();
                hasGemListings = true;
            } catch (Exception collectionEx) {
                // Collection might not exist yet
                System.out.println("⚠️ gem_listings collection not found - marketplace may not display items");
            }
            
            System.out.println("✅ MongoDB connection successful!");
            System.out.println("📦 Connected to database: " + dbName);
            
            if (hasGemListings) {
                System.out.println("✅ gem_listings collection is available for marketplace");
            } else {
                System.out.println("⚠️ gem_listings collection is not available - marketplace will be empty");
                System.out.println("   You may need to create this collection or import sample data");
            }
            
            System.out.println("🗄️ Database initialization completed successfully!");
        } catch (Exception e) {
            System.err.println("❌ MongoDB connection failed: " + e.getMessage());
            System.err.println("🔧 Please check MongoDB configuration and ensure MongoDB is running");
            System.err.println("   MongoDB should be running on localhost:27017");
            System.err.println("\n🛠️ Troubleshooting steps:");
            System.err.println("   1. Make sure MongoDB is installed and running");
            System.err.println("   2. Run 'mongod --port 27017' to start MongoDB server");
            System.err.println("   3. Check if port 27017 is accessible (not blocked by firewall)");
            System.err.println("   4. Check application.properties MongoDB configuration");
            System.err.println("   5. Restart the application after starting MongoDB");
        }
    }
    
    // Customize Tomcat for better connection handling
    @Bean
    public WebServerFactoryCustomizer<TomcatServletWebServerFactory> tomcatCustomizer() {
        return factory -> {
            factory.addConnectorCustomizers(connector -> {
                // Increase connection timeout to handle slow network requests
                connector.setProperty("connectionTimeout", "30000");
            });
        };
    }
    
    // MongoDB connection recovery service
    @Bean
    public MongoConnectionRecoveryService mongoConnectionRecoveryService() {
        return new MongoConnectionRecoveryService();
    }
    
    // Inner class to handle MongoDB connection recovery
    public class MongoConnectionRecoveryService {
        private boolean mongoDbConnected = false;
        
        @PostConstruct
        public void startConnectionRecovery() {
            // Start a background thread to check MongoDB connection periodically
            Thread recoveryThread = new Thread(() -> {
                while (!mongoDbConnected) {
                    try {
                        // Wait before attempting to reconnect
                        Thread.sleep(10000); // 10 seconds
                        
                        // Try to connect
                        String dbName = mongoTemplate.getDb().getName();
                        mongoTemplate.count(new Query(), "test");
                        
                        // If we get here, connection is successful
                        mongoDbConnected = true;
                        System.out.println("\n✅ MongoDB connection established successfully!");
                        System.out.println("📦 Connected to database: " + dbName);
                        System.out.println("🔄 Application services should now function correctly");
                        
                        // Initialize database if needed
                        ensureDatabaseInitialized();
                        
                        // Check for marketplace collection
                        try {
                            long count = mongoTemplate.count(new Query(), "gem_listings");
                            System.out.println("💎 Found " + count + " gemstone listings in database");
                        } catch (Exception e) {
                            System.out.println("⚠️ gem_listings collection not available: " + e.getMessage());
                        }
                    } catch (Exception e) {
                        System.out.println("⏳ Waiting for MongoDB connection... (next attempt in 10 seconds)");
                    }
                }
            });
            
            recoveryThread.setDaemon(true);
            recoveryThread.start();
            System.out.println("🔄 MongoDB connection recovery service started");
        }
    }
    
    /**
     * Ensure the database is initialized with required collections
     */
    private void ensureDatabaseInitialized() {
        try {
            // Check for users collection
            boolean hasUsers = mongoTemplate.collectionExists("users");
            if (!hasUsers) {
                System.out.println("🔧 Creating users collection...");
                mongoTemplate.createCollection("users");
                mongoTemplate.indexOps("users").ensureIndex(
                    new org.springframework.data.mongodb.core.index.Index("email", org.springframework.data.domain.Sort.Direction.ASC).unique()
                );
                
                // Insert a sample admin user
                System.out.println("👤 Adding sample admin user...");
                java.util.Map<String, Object> adminUser = new java.util.HashMap<>();
                adminUser.put("firstName", "Admin");
                adminUser.put("lastName", "User");
                adminUser.put("email", "admin@gemnet.com");
                adminUser.put("password", "$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a"); // password: admin123
                adminUser.put("phoneNumber", "+94771234567");
                adminUser.put("address", "Admin Address");
                adminUser.put("dateOfBirth", "1990-01-01");
                adminUser.put("nicNumber", "123456789V");
                adminUser.put("isVerified", true);
                adminUser.put("verificationStatus", "VERIFIED");
                adminUser.put("roles", java.util.Arrays.asList("ADMIN", "USER"));
                adminUser.put("isActive", true);
                adminUser.put("isLocked", false);
                adminUser.put("createdAt", new java.util.Date());
                adminUser.put("updatedAt", new java.util.Date());
                
                mongoTemplate.insert(adminUser, "users");
            }
            
            // Check for gem_listings collection
            boolean hasGemListings = mongoTemplate.collectionExists("gem_listings");
            if (!hasGemListings) {
                System.out.println("💎 Creating gem_listings collection...");
                mongoTemplate.createCollection("gem_listings");
                mongoTemplate.indexOps("gem_listings").ensureIndex(
                    new org.springframework.data.mongodb.core.index.Index("status", org.springframework.data.domain.Sort.Direction.ASC)
                );
                
                // Insert a sample gemstone listing
                System.out.println("💎 Adding sample gemstone listing...");
                java.util.Map<String, Object> seller = new java.util.HashMap<>();
                seller.put("id", "user123");
                seller.put("firstName", "John");
                seller.put("lastName", "Doe");
                seller.put("email", "john@example.com");
                
                java.util.Map<String, Object> gemListing = new java.util.HashMap<>();
                gemListing.put("title", "Blue Sapphire");
                gemListing.put("description", "Beautiful blue sapphire from Sri Lanka");
                gemListing.put("caratWeight", 2.5);
                gemListing.put("color", "Deep Blue");
                gemListing.put("clarity", "VS");
                gemListing.put("cut", "Oval");
                gemListing.put("origin", "Sri Lanka");
                gemListing.put("treatment", "Heat Treated");
                gemListing.put("certificateNumber", "GEM123456");
                gemListing.put("basePrice", 2000);
                gemListing.put("currentBid", 2000);
                gemListing.put("status", "APPROVED");
                gemListing.put("imageUrls", java.util.Collections.singletonList("IMG_1751571383560_0.jpg"));
                gemListing.put("certificateUrl", "certificate1.pdf");
                gemListing.put("dimensions", "8x6x4 mm");
                gemListing.put("seller", seller);
                gemListing.put("createdAt", new java.util.Date());
                gemListing.put("updatedAt", new java.util.Date());
                
                // Set expiration to 7 days from now
                java.util.Calendar cal = java.util.Calendar.getInstance();
                cal.add(java.util.Calendar.DAY_OF_MONTH, 7);
                gemListing.put("expiresAt", cal.getTime());
                
                mongoTemplate.insert(gemListing, "gem_listings");
            }
            
            System.out.println("✅ Database initialization completed successfully!");
        } catch (Exception e) {
            System.out.println("❌ Error during database initialization: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    public static void main(String[] args) {
        // Print startup banner
        System.out.println("🚀 Starting GemNet - Face Recognition Identity Verification System");
        System.out.println("📋 Checking system dependencies...");
        
        // Check if Tesseract is available
        try {
            ProcessBuilder pb = new ProcessBuilder("tesseract", "--version");
            Process process = pb.start();
            int exitCode = process.waitFor();
            
            if (exitCode == 0) {
                System.out.println("✅ Tesseract OCR is available on the system");
            } else {
                System.out.println("⚠️ Tesseract OCR may not be properly installed");
            }
        } catch (Exception e) {
            System.out.println("⚠️ Could not verify Tesseract installation: " + e.getMessage());
        }
          // Check if tessdata directory exists based on OS
        String osName = System.getProperty("os.name").toLowerCase();
        String tessDataPath;
        
        if (osName.contains("win")) {
            tessDataPath = "C:/Program Files/Tesseract-OCR/tessdata";
        } else if (osName.contains("mac")) {
            tessDataPath = "/opt/homebrew/share/tessdata";
        } else {
            tessDataPath = "/usr/share/tesseract-ocr/4.00/tessdata";
        }
        
        java.io.File tessDataDir = new java.io.File(tessDataPath);
        if (tessDataDir.exists() && tessDataDir.isDirectory()) {
            System.out.println("✅ Tesseract data directory found: " + tessDataPath);
            
            // Check for English language file
            java.io.File engFile = new java.io.File(tessDataPath, "eng.traineddata");
            if (engFile.exists()) {
                System.out.println("✅ English language file found: " + engFile.getAbsolutePath());
            } else {
                System.out.println("⚠️ English language file not found: " + engFile.getAbsolutePath());
            }
        } else {
            System.out.println("⚠️ Tesseract data directory not found: " + tessDataPath);
            System.out.println("   This is not critical - application will continue with fallback methods");
        }
        
        System.out.println("🎯 Starting Spring Boot application...");
        SpringApplication.run(GemNetApplication.class, args);
    }
}
