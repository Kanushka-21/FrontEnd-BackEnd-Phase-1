package com.gemnet.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.IndexDefinition;
import org.springframework.data.mongodb.core.index.IndexOperations;
import org.springframework.data.mongodb.core.index.IndexResolver;
import org.springframework.data.mongodb.core.index.MongoPersistentEntityIndexResolver;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoMappingContext;
import org.springframework.stereotype.Component;

import com.gemnet.model.User;

@Component
public class MongoDbInitializer implements CommandLineRunner {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private MongoMappingContext mongoMappingContext;

    @Override
    public void run(String... args) {
        System.out.println("👉 Initializing MongoDB collections and indexes...");
        
        try {
            // Create User collection if it doesn't exist
            if (!mongoTemplate.collectionExists(User.class)) {
                System.out.println("📦 Creating User collection...");
                mongoTemplate.createCollection(User.class);
            }
            
            // Ensure indexes are created
            System.out.println("🔍 Ensuring MongoDB indexes are created...");
            IndexResolver resolver = new MongoPersistentEntityIndexResolver(mongoMappingContext);
            
            IndexOperations indexOps = mongoTemplate.indexOps(User.class);
            resolver.resolveIndexFor(User.class).forEach(indexOps::ensureIndex);
            
            System.out.println("✅ MongoDB initialization complete!");
        } catch (Exception e) {
            System.err.println("❌ Error initializing MongoDB: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
