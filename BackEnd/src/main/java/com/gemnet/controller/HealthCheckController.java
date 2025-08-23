package com.gemnet.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.gemnet.model.Meeting;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
@Tag(name = "Health Check", description = "System health check APIs")
@CrossOrigin(origins = "*")
public class HealthCheckController {

    @Autowired
    private MongoTemplate mongoTemplate;

    @GetMapping("/health/mongodb")
    @Operation(summary = "MongoDB health check", description = "Check MongoDB connection and status")
    public ResponseEntity<Map<String, Object>> checkMongoDBHealth() {
        Map<String, Object> response = new HashMap<>();
        response.put("service", "MongoDB Connection");
        
        try {
            // Run a simple command to check if MongoDB is responding
            Map<String, Object> result = mongoTemplate.getDb().runCommand(new org.bson.Document("ping", 1));
            
            if (result.get("ok").equals(1.0)) {
                response.put("status", "Connected");
                response.put("database", mongoTemplate.getDb().getName());
                response.put("timestamp", System.currentTimeMillis());
                
                // Get collection count to verify access
                response.put("collections", mongoTemplate.getCollectionNames().size());
                return ResponseEntity.ok(response);
            } else {
                response.put("status", "Failed");
                response.put("error", "MongoDB ping command returned unexpected result");
                return ResponseEntity.status(500).body(response);
            }
        } catch (Exception e) {
            response.put("status", "Failed");
            response.put("error", e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/meetings")
    @Operation(summary = "Create meeting", description = "Create a new meeting in MongoDB")
    public ResponseEntity<Map<String, Object>> createMeeting(@RequestBody Map<String, Object> meetingData) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            System.out.println("📅 Creating meeting: " + meetingData);
            
            // Create a simple meeting document
            Map<String, Object> meeting = new HashMap<>();
            meeting.put("buyerId", meetingData.get("buyerId"));
            meeting.put("sellerId", meetingData.get("sellerId"));
            meeting.put("purchaseId", meetingData.get("purchaseId"));
            meeting.put("gemId", meetingData.get("gemId"));
            meeting.put("proposedDateTime", meetingData.get("proposedDateTime"));
            meeting.put("location", meetingData.get("location"));
            meeting.put("meetingType", meetingData.get("meetingType"));
            meeting.put("status", "PENDING");
            meeting.put("notes", meetingData.get("notes"));
            meeting.put("createdAt", System.currentTimeMillis());
            meeting.put("updatedAt", System.currentTimeMillis());
            
            // Save to MongoDB
            mongoTemplate.save(meeting, "meetings");
            
            response.put("success", true);
            response.put("message", "Meeting created successfully");
            response.put("meeting", meeting);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error creating meeting: " + e.getMessage());
            e.printStackTrace();
            
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/meetings/user/{userId}")
    @Operation(summary = "Get user meetings", description = "Get all meetings for a user")
    public ResponseEntity<Map<String, Object>> getUserMeetings(@PathVariable String userId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            System.out.println("📅 Getting meetings for user: " + userId);
            
            // Query meetings for the user
            org.springframework.data.mongodb.core.query.Query query = 
                org.springframework.data.mongodb.core.query.Query.query(
                    org.springframework.data.mongodb.core.query.Criteria.where("buyerId").is(userId)
                        .orOperator(org.springframework.data.mongodb.core.query.Criteria.where("sellerId").is(userId))
                );
            
            java.util.List<Map> meetings = mongoTemplate.find(query, Map.class, "meetings");
            
            response.put("success", true);
            response.put("message", "Meetings retrieved successfully");
            response.put("meetings", meetings);
            response.put("count", meetings.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error getting meetings: " + e.getMessage());
            e.printStackTrace();
            
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}
