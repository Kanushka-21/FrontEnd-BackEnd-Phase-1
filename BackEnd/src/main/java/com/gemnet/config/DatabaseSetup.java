package com.gemnet.config;

import com.gemnet.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSetup {

    @Autowired
    private MongoTemplate mongoTemplate;

    @EventListener(ApplicationReadyEvent.class)
    public void initializeDatabase() {
        try {
            System.out.println("🔄 Checking database connection and collections...");
            
            // Check if database is accessible
            mongoTemplate.getDb().runCommand(new org.bson.Document("ping", 1));
            System.out.println("✅ MongoDB connection successful");
            
            // Create User collection if it doesn't exist
            if (!mongoTemplate.collectionExists(User.class)) {
                mongoTemplate.createCollection(User.class);
                System.out.println("✅ Created User collection");
            } else {
                System.out.println("✅ User collection already exists");
            }
            
            // Count users for verification
            long userCount = mongoTemplate.getCollection(mongoTemplate.getCollectionName(User.class)).countDocuments();
            System.out.println("📊 Current user count: " + userCount);
            
            System.out.println("✅ Database initialization complete");
        } catch (Exception e) {
            System.err.println("❌ Error initializing database: " + e.getMessage());
            e.printStackTrace();
            // Don't throw exception - let application continue with reduced functionality
        }
    }
}
