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
import org.springframework.http.MediaType;
import org.springframework.core.io.Resource;
import org.springframework.core.io.FileSystemResource;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

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
            profileData.put("role", user.getUserRole()); // Add alias for consistency
            profileData.put("isVerified", user.getIsVerified());
            profileData.put("verificationStatus", user.getVerificationStatus());
            profileData.put("isFaceVerified", user.getIsFaceVerified());
            profileData.put("isNicVerified", user.getIsNicVerified());
            profileData.put("isActive", user.getIsActive());
            profileData.put("isLocked", user.getIsLocked() != null ? user.getIsLocked() : false);
            profileData.put("createdAt", user.getCreatedAt());
            profileData.put("updatedAt", user.getUpdatedAt());
            profileData.put("joinDate", user.getCreatedAt());
            profileData.put("lastActive", user.getUpdatedAt());
            
            // Image paths
            profileData.put("faceImagePath", user.getFaceImagePath());
            profileData.put("nicImagePath", user.getNicImagePath());
            profileData.put("extractedNicImagePath", user.getExtractedNicImagePath());
            
            // Image URLs for direct access (environment-independent)
            String baseUrl = "http://localhost:9092";
            if (user.getFaceImagePath() != null && !user.getFaceImagePath().isEmpty()) {
                profileData.put("faceImageUrl", baseUrl + "/api/users/image/face/" + user.getId());
                // Also provide static URL as fallback
                profileData.put("faceImageStaticUrl", convertToStaticUrl(user.getFaceImagePath()));
            }
            if (user.getNicImagePath() != null && !user.getNicImagePath().isEmpty()) {
                profileData.put("nicImageUrl", baseUrl + "/api/users/image/nic/" + user.getId());
                profileData.put("nicImageStaticUrl", convertToStaticUrl(user.getNicImagePath()));
            }
            if (user.getExtractedNicImagePath() != null && !user.getExtractedNicImagePath().isEmpty()) {
                profileData.put("extractedNicImageUrl", baseUrl + "/api/users/image/extracted/" + user.getId());
                profileData.put("extractedNicImageStaticUrl", convertToStaticUrl(user.getExtractedNicImagePath()));
            }
            // Note: profilePicture field doesn't exist in User model, so we'll skip it for now
            
            // Display name
            String displayName = "";
            if (user.getFirstName() != null && user.getLastName() != null) {
                displayName = user.getFirstName() + " " + user.getLastName();
            } else if (user.getFirstName() != null) {
                displayName = user.getFirstName();
            } else if (user.getLastName() != null) {
                displayName = user.getLastName();
            }
            profileData.put("name", displayName);

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

    @GetMapping("/image/{imageType}/{userId}")
    @Operation(summary = "Get user image", description = "Serve user face or NIC image")
    public ResponseEntity<Resource> getUserImage(
            @PathVariable String imageType, 
            @PathVariable String userId) {
        try {
            System.out.println("🖼️ Fetching " + imageType + " image for user: " + userId);
            
            Optional<User> userOpt = userService.findById(userId);
            if (!userOpt.isPresent()) {
                System.err.println("❌ User not found: " + userId);
                return ResponseEntity.notFound().build();
            }

            User user = userOpt.get();
            String imagePath = null;
            
            // Get the appropriate image path based on type
            switch (imageType.toLowerCase()) {
                case "face":
                    imagePath = user.getFaceImagePath();
                    break;
                case "nic":
                    imagePath = user.getNicImagePath();
                    break;
                case "extracted":
                    imagePath = user.getExtractedNicImagePath();
                    break;
                default:
                    System.err.println("❌ Invalid image type: " + imageType);
                    return ResponseEntity.badRequest().build();
            }
            
            if (imagePath == null || imagePath.isEmpty()) {
                System.err.println("❌ No " + imageType + " image path found for user: " + userId);
                return ResponseEntity.notFound().build();
            }
            
            // Convert absolute path to relative path from project root
            Path fullPath = Paths.get(imagePath);
            File imageFile = fullPath.toFile();
            
            if (!imageFile.exists()) {
                System.err.println("❌ Image file not found: " + imagePath);
                return ResponseEntity.notFound().build();
            }
            
            Resource resource = new FileSystemResource(imageFile);
            
            // Determine content type based on file extension
            String contentType = "application/octet-stream";
            try {
                contentType = Files.probeContentType(fullPath);
                if (contentType == null) {
                    String fileName = imageFile.getName().toLowerCase();
                    if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
                        contentType = "image/jpeg";
                    } else if (fileName.endsWith(".png")) {
                        contentType = "image/png";
                    } else if (fileName.endsWith(".webp")) {
                        contentType = "image/webp";
                    }
                }
            } catch (Exception e) {
                System.err.println("⚠️ Could not determine content type: " + e.getMessage());
            }
            
            System.out.println("✅ Serving " + imageType + " image for user: " + userId);
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(resource);
                    
        } catch (Exception e) {
            System.err.println("❌ Error serving image: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Convert absolute path to static URL path
     */
    private String convertToStaticUrl(String absolutePath) {
        if (absolutePath == null || absolutePath.isEmpty()) {
            return null;
        }
        
        try {
            // Extract the relative part from the absolute path
            // Example: C:/path/to/uploads/face-images/filename.jpg -> /uploads/face-images/filename.jpg
            String uploadsMarker = "uploads";
            int uploadsIndex = absolutePath.lastIndexOf(uploadsMarker);
            
            if (uploadsIndex != -1) {
                // Get everything from "uploads" onwards
                String relativePath = absolutePath.substring(uploadsIndex);
                // Convert Windows path separators to forward slashes
                relativePath = relativePath.replace("\\\\", "/");
                // Ensure it starts with /
                if (!relativePath.startsWith("/")) {
                    relativePath = "/" + relativePath;
                }
                return "http://localhost:9092" + relativePath;
            }
            
            return null;
        } catch (Exception e) {
            System.err.println("⚠️ Error converting path to static URL: " + e.getMessage());
            return null;
        }
    }
}
