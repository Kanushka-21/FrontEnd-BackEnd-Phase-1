package com.gemnet.controller;

import com.gemnet.dto.ApiResponse;
import com.gemnet.dto.UserProfileUpdateRequest;
import com.gemnet.model.User;
import com.gemnet.model.Meeting;
import com.gemnet.service.UserService;
import org.springframework.data.mongodb.core.MongoTemplate;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@Tag(name = "User Management", description = "User profile management APIs")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private MongoTemplate mongoTemplate;

    @GetMapping("/profile/{userId}")
    @Operation(summary = "Get user profile", description = "Fetch user profile information by user ID")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserProfile(@PathVariable String userId) {
        try {
            System.out.println("👤 Fetching profile for user: " + userId);
            
            Optional<User> userOpt = userService.findById(userId);
            if (!userOpt.isPresent()) {
                System.err.println("❌ User not found: " + userId);
                return ResponseEntity.ok(ApiResponse.error("User not found"));
            }

            User user = userOpt.get();
            Map<String, Object> profileData = new HashMap<>();
            
            // Basic profile information
            profileData.put("userId", user.getId());
            profileData.put("firstName", user.getFirstName());
            profileData.put("lastName", user.getLastName());
            profileData.put("email", user.getEmail());
            profileData.put("phoneNumber", user.getPhoneNumber());
            profileData.put("address", user.getAddress());
            profileData.put("dateOfBirth", user.getDateOfBirth());
            profileData.put("nicNumber", user.getNicNumber());
            profileData.put("bio", user.getBio());
            
            // Account information
            profileData.put("userRole", user.getUserRole());
            profileData.put("isVerified", user.getIsVerified());
            profileData.put("verificationStatus", user.getVerificationStatus());
            profileData.put("isFaceVerified", user.getIsFaceVerified());
            profileData.put("isNicVerified", user.getIsNicVerified());
            profileData.put("isActive", user.getIsActive());
            profileData.put("createdAt", user.getCreatedAt());
            profileData.put("updatedAt", user.getUpdatedAt());

            System.out.println("✅ Profile fetched successfully for user: " + userId);
            return ResponseEntity.ok(ApiResponse.success("Profile fetched successfully", profileData));

        } catch (Exception e) {
            System.err.println("❌ Error fetching profile for user " + userId + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(ApiResponse.error("Failed to fetch user profile: " + e.getMessage()));
        }
    }

    @PutMapping("/profile/{userId}")
    @Operation(summary = "Update user profile", description = "Update user profile information")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateUserProfile(
            @PathVariable String userId,
            @Valid @RequestBody UserProfileUpdateRequest request) {
        try {
            System.out.println("✏️ Updating profile for user: " + userId);
            
            Optional<User> userOpt = userService.findById(userId);
            if (!userOpt.isPresent()) {
                System.err.println("❌ User not found: " + userId);
                return ResponseEntity.ok(ApiResponse.error("User not found"));
            }

            User user = userOpt.get();
            
            // Update profile fields if provided
            if (request.getFirstName() != null && !request.getFirstName().isEmpty()) {
                user.setFirstName(request.getFirstName());
            }
            if (request.getLastName() != null && !request.getLastName().isEmpty()) {
                user.setLastName(request.getLastName());
            }
            if (request.getPhoneNumber() != null && !request.getPhoneNumber().isEmpty()) {
                user.setPhoneNumber(request.getPhoneNumber());
            }
            if (request.getAddress() != null && !request.getAddress().isEmpty()) {
                user.setAddress(request.getAddress());
            }
            if (request.getBio() != null && !request.getBio().isEmpty()) {
                user.setBio(request.getBio());
            }
            
            // Save updated user
            User updatedUser = userService.save(user);
            
            // Prepare response data
            Map<String, Object> profileData = new HashMap<>();
            profileData.put("userId", updatedUser.getId());
            profileData.put("firstName", updatedUser.getFirstName());
            profileData.put("lastName", updatedUser.getLastName());
            profileData.put("email", updatedUser.getEmail());
            profileData.put("phoneNumber", updatedUser.getPhoneNumber());
            profileData.put("address", updatedUser.getAddress());
            profileData.put("dateOfBirth", updatedUser.getDateOfBirth());
            profileData.put("nicNumber", updatedUser.getNicNumber());
            profileData.put("bio", updatedUser.getBio());
            profileData.put("userRole", updatedUser.getUserRole());
            profileData.put("isVerified", updatedUser.getIsVerified());
            profileData.put("verificationStatus", updatedUser.getVerificationStatus());
            profileData.put("updatedAt", updatedUser.getUpdatedAt());

            System.out.println("✅ Profile updated successfully for user: " + userId);
            return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", profileData));

        } catch (Exception e) {
            System.err.println("❌ Error updating profile for user " + userId + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(ApiResponse.error("Failed to update user profile: " + e.getMessage()));
        }
    }

    @GetMapping("/profile/current")
    @Operation(summary = "Get current user profile", description = "Fetch current authenticated user's profile")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCurrentUserProfile() {
        try {
            // This would typically extract user ID from JWT token
            // For now, we'll use a placeholder implementation
            System.out.println("👤 Fetching current user profile from token");
            
            // TODO: Extract user ID from JWT token in security context
            String currentUserId = extractUserIdFromToken();
            
            if (currentUserId == null) {
                return ResponseEntity.ok(ApiResponse.error("User not authenticated"));
            }
            
            return getUserProfile(currentUserId);

        } catch (Exception e) {
            System.err.println("❌ Error fetching current user profile: " + e.getMessage());
            return ResponseEntity.ok(ApiResponse.error("Failed to fetch current user profile: " + e.getMessage()));
        }
    }

    // Helper method to extract user ID from JWT token
    private String extractUserIdFromToken() {
        // TODO: Implement JWT token extraction logic
        // This is a placeholder implementation
        return null;
    }

    // Meeting endpoints - temporary addition for testing
    @PostMapping("/meetings")
    @Operation(summary = "Create meeting", description = "Create a new meeting request")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createMeeting(@RequestBody Map<String, Object> meetingData) {
        try {
            System.out.println("📅 Creating meeting: " + meetingData);
            
            // Create meeting document
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
            
            return ResponseEntity.ok(ApiResponse.success("Meeting created successfully", meeting));
        } catch (Exception e) {
            System.err.println("❌ Error creating meeting: " + e.getMessage());
            return ResponseEntity.ok(ApiResponse.error("Error creating meeting: " + e.getMessage()));
        }
    }

    @GetMapping("/meetings/user/{userId}")
    @Operation(summary = "Get user meetings", description = "Get all meetings for a user")
    public ResponseEntity<ApiResponse<java.util.List<Map>>> getUserMeetings(@PathVariable String userId) {
        try {
            System.out.println("📅 Fetching meetings for user: " + userId);
            
            // Query meetings for the user
            org.springframework.data.mongodb.core.query.Query query = 
                org.springframework.data.mongodb.core.query.Query.query(
                    org.springframework.data.mongodb.core.query.Criteria.where("buyerId").is(userId)
                        .orOperator(org.springframework.data.mongodb.core.query.Criteria.where("sellerId").is(userId))
                );
            
            java.util.List<Map> meetings = mongoTemplate.find(query, Map.class, "meetings");
            
            return ResponseEntity.ok(ApiResponse.success("Meetings retrieved successfully", meetings));
        } catch (Exception e) {
            System.err.println("❌ Error fetching meetings: " + e.getMessage());
            return ResponseEntity.ok(ApiResponse.error("Error fetching meetings: " + e.getMessage()));
        }
    }

    @PutMapping("/meetings/{meetingId}/confirm")
    @Operation(summary = "Confirm meeting", description = "Confirm a meeting request")
    public ResponseEntity<ApiResponse<Map<String, Object>>> confirmMeeting(@PathVariable String meetingId) {
        try {
            System.out.println("✅ Confirming meeting: " + meetingId);
            
            // Update meeting status
            org.springframework.data.mongodb.core.query.Query query = 
                org.springframework.data.mongodb.core.query.Query.query(
                    org.springframework.data.mongodb.core.query.Criteria.where("id").is(meetingId)
                );
            
            org.springframework.data.mongodb.core.query.Update update = 
                new org.springframework.data.mongodb.core.query.Update()
                    .set("status", "CONFIRMED")
                    .set("updatedAt", System.currentTimeMillis());
            
            mongoTemplate.updateFirst(query, update, "meetings");
            
            Map<String, Object> result = new HashMap<>();
            result.put("meetingId", meetingId);
            result.put("status", "CONFIRMED");
            
            return ResponseEntity.ok(ApiResponse.success("Meeting confirmed successfully", result));
        } catch (Exception e) {
            System.err.println("❌ Error confirming meeting: " + e.getMessage());
            return ResponseEntity.ok(ApiResponse.error("Error confirming meeting: " + e.getMessage()));
        }
    }
}
