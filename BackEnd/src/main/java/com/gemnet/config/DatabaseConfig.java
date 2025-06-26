package com.gemnet.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.IndexOperations;
import org.springframework.data.mongodb.core.index.IndexResolver;
import org.springframework.data.mongodb.core.index.MongoPersistentEntityIndexResolver;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoMappingContext;

import com.gemnet.model.User;

@Configuration
public class DatabaseConfig implements ApplicationListener<ApplicationReadyEvent> {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private MongoMappingContext mongoMappingContext;

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        try {
            System.out.println("🔌 Checking MongoDB connection...");
            // Ping MongoDB to check connection
            mongoTemplate.getDb().runCommand(new org.bson.Document("ping", 1));
            System.out.println("✅ MongoDB connection verified successfully!");

            // Make sure the User collection exists
            if (!mongoTemplate.collectionExists(User.class)) {
                System.out.println("📦 Creating User collection...");
                mongoTemplate.createCollection(User.class);
            }            // Create indexes for all Document entities
            IndexResolver resolver = new MongoPersistentEntityIndexResolver(mongoMappingContext);
            for (Class<?> clazz : mongoMappingContext.getPersistentEntities()
                    .stream().filter(entity -> entity.isAnnotationPresent(Document.class))
                    .map(entity -> entity.getType()).toList()) {
                
                IndexOperations indexOps = mongoTemplate.indexOps(clazz);
                resolver.resolveIndexFor(clazz).forEach(indexOps::ensureIndex);
            }
            
            System.out.println("✅ Database initialization completed successfully!");
        } catch (Exception e) {
            System.err.println("❌ MongoDB connection failed: " + e.getMessage());
            e.printStackTrace();
            // Continue with reduced functionality - the app will still start but some features may not work
        }
    }
}
