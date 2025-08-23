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
import org.springframework.scheduling.annotation.EnableScheduling;

import jakarta.annotation.PostConstruct;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.util.Enumeration;

@SpringBootApplication
@EnableScheduling
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
                
                // Insert sample gemstone listings with countdown timer fields
                System.out.println("💎 Adding sample gemstone listings with countdown fields...");
                
                // Sample Listing 1: No bidding started yet
                java.util.Map<String, Object> seller1 = new java.util.HashMap<>();
                seller1.put("id", "user123");
                seller1.put("firstName", "John");
                seller1.put("lastName", "Doe");
                seller1.put("email", "john@example.com");
                
                java.util.Map<String, Object> gemListing1 = new java.util.HashMap<>();
                gemListing1.put("title", "Blue Sapphire");
                gemListing1.put("description", "Beautiful blue sapphire from Sri Lanka");
                gemListing1.put("caratWeight", 2.5);
                gemListing1.put("color", "Deep Blue");
                gemListing1.put("clarity", "VS");
                gemListing1.put("cut", "Oval");
                gemListing1.put("origin", "Sri Lanka");
                gemListing1.put("treatment", "Heat Treated");
                gemListing1.put("certificateNumber", "GEM123456");
                gemListing1.put("basePrice", 2000);
                gemListing1.put("currentBid", 2000);
                gemListing1.put("status", "APPROVED");
                gemListing1.put("imageUrls", java.util.Collections.singletonList("IMG_1751571383560_0.jpg"));
                gemListing1.put("certificateUrl", "certificate1.pdf");
                gemListing1.put("dimensions", "8x6x4 mm");
                gemListing1.put("seller", seller1);
                gemListing1.put("createdAt", new java.util.Date());
                gemListing1.put("updatedAt", new java.util.Date());
                
                // Countdown fields - No bidding started
                gemListing1.put("biddingStartTime", null);
                gemListing1.put("biddingEndTime", null);
                gemListing1.put("biddingActive", false);
                
                // Set expiration to 7 days from now (different from bidding countdown)
                java.util.Calendar cal1 = java.util.Calendar.getInstance();
                cal1.add(java.util.Calendar.DAY_OF_MONTH, 7);
                gemListing1.put("expiresAt", cal1.getTime());
                
                mongoTemplate.insert(gemListing1, "gem_listings");
                
                // Sample Listing 2: Active bidding with countdown
                java.util.Map<String, Object> seller2 = new java.util.HashMap<>();
                seller2.put("id", "user456");
                seller2.put("firstName", "Jane");
                seller2.put("lastName", "Smith");
                seller2.put("email", "jane@example.com");
                
                java.util.Map<String, Object> gemListing2 = new java.util.HashMap<>();
                gemListing2.put("title", "Ruby Red Star");
                gemListing2.put("description", "Stunning ruby with excellent color saturation");
                gemListing2.put("caratWeight", 3.2);
                gemListing2.put("color", "Pigeon Blood Red");
                gemListing2.put("clarity", "VS1");
                gemListing2.put("cut", "Round");
                gemListing2.put("origin", "Myanmar");
                gemListing2.put("treatment", "Heat Treated");
                gemListing2.put("certificateNumber", "GEM789012");
                gemListing2.put("basePrice", 5000);
                gemListing2.put("currentBid", 6500);
                gemListing2.put("status", "APPROVED");
                gemListing2.put("imageUrls", java.util.Collections.singletonList("ruby_sample.jpg"));
                gemListing2.put("certificateUrl", "certificate2.pdf");
                gemListing2.put("dimensions", "9x7x5 mm");
                gemListing2.put("seller", seller2);
                gemListing2.put("createdAt", new java.util.Date());
                gemListing2.put("updatedAt", new java.util.Date());
                
                // Countdown fields - Active bidding (started 2 days ago, 2 days remaining)
                java.util.Calendar bidStart = java.util.Calendar.getInstance();
                bidStart.add(java.util.Calendar.DAY_OF_MONTH, -2); // Started 2 days ago
                java.util.Calendar bidEnd = java.util.Calendar.getInstance();
                bidEnd.add(java.util.Calendar.DAY_OF_MONTH, 2); // Ends in 2 days
                
                gemListing2.put("biddingStartTime", bidStart.getTime());
                gemListing2.put("biddingEndTime", bidEnd.getTime());
                gemListing2.put("biddingActive", true);
                
                // Set expiration to 7 days from now
                java.util.Calendar cal2 = java.util.Calendar.getInstance();
                cal2.add(java.util.Calendar.DAY_OF_MONTH, 7);
                gemListing2.put("expiresAt", cal2.getTime());
                
                mongoTemplate.insert(gemListing2, "gem_listings");
                
                // Sample Listing 3: Bidding countdown expired
                java.util.Map<String, Object> seller3 = new java.util.HashMap<>();
                seller3.put("id", "user789");
                seller3.put("firstName", "Michael");
                seller3.put("lastName", "Johnson");
                seller3.put("email", "michael@example.com");
                
                java.util.Map<String, Object> gemListing3 = new java.util.HashMap<>();
                gemListing3.put("title", "Emerald Green Beauty");
                gemListing3.put("description", "Natural emerald with excellent transparency");
                gemListing3.put("caratWeight", 1.8);
                gemListing3.put("color", "Vivid Green");
                gemListing3.put("clarity", "VVS2");
                gemListing3.put("cut", "Emerald Cut");
                gemListing3.put("origin", "Colombia");
                gemListing3.put("treatment", "Minor Oil");
                gemListing3.put("certificateNumber", "GEM345678");
                gemListing3.put("basePrice", 3500);
                gemListing3.put("currentBid", 4200);
                gemListing3.put("status", "APPROVED");
                gemListing3.put("imageUrls", java.util.Collections.singletonList("emerald_sample.jpg"));
                gemListing3.put("certificateUrl", "certificate3.pdf");
                gemListing3.put("dimensions", "7x5x4 mm");
                gemListing3.put("seller", seller3);
                gemListing3.put("createdAt", new java.util.Date());
                gemListing3.put("updatedAt", new java.util.Date());
                
                // Countdown fields - Bidding expired (started 5 days ago, ended 1 day ago)
                java.util.Calendar bidStart3 = java.util.Calendar.getInstance();
                bidStart3.add(java.util.Calendar.DAY_OF_MONTH, -5); // Started 5 days ago
                java.util.Calendar bidEnd3 = java.util.Calendar.getInstance();
                bidEnd3.add(java.util.Calendar.DAY_OF_MONTH, -1); // Ended 1 day ago
                
                gemListing3.put("biddingStartTime", bidStart3.getTime());
                gemListing3.put("biddingEndTime", bidEnd3.getTime());
                gemListing3.put("biddingActive", false); // Set to false since bidding has ended
                
                // Set expiration to 7 days from now
                java.util.Calendar cal3 = java.util.Calendar.getInstance();
                cal3.add(java.util.Calendar.DAY_OF_MONTH, 7);
                gemListing3.put("expiresAt", cal3.getTime());
                
                mongoTemplate.insert(gemListing3, "gem_listings");
            }
            
            // Check for meetings collection
            boolean hasMeetings = mongoTemplate.collectionExists("meetings");
            if (!hasMeetings) {
                System.out.println("🤝 Creating meetings collection...");
                mongoTemplate.createCollection("meetings");
                
                // Create indexes for the meetings collection
                mongoTemplate.indexOps("meetings").ensureIndex(
                    new org.springframework.data.mongodb.core.index.Index("buyerId", org.springframework.data.domain.Sort.Direction.ASC)
                );
                mongoTemplate.indexOps("meetings").ensureIndex(
                    new org.springframework.data.mongodb.core.index.Index("sellerId", org.springframework.data.domain.Sort.Direction.ASC)
                );
                mongoTemplate.indexOps("meetings").ensureIndex(
                    new org.springframework.data.mongodb.core.index.Index("status", org.springframework.data.domain.Sort.Direction.ASC)
                );
                mongoTemplate.indexOps("meetings").ensureIndex(
                    new org.springframework.data.mongodb.core.index.Index("proposedDateTime", org.springframework.data.domain.Sort.Direction.ASC)
                );
                mongoTemplate.indexOps("meetings").ensureIndex(
                    new org.springframework.data.mongodb.core.index.Index("purchaseId", org.springframework.data.domain.Sort.Direction.ASC).unique()
                );
                
                System.out.println("🤝 Meetings collection created with indexes!");
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
