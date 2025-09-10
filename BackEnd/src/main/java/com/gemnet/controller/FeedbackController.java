package com.gemnet.controller;

import com.gemnet.model.Feedback;
import com.gemnet.model.User;
import com.gemnet.service.FeedbackService;
import com.gemnet.service.UserService;
import com.gemnet.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * REST Controller for feedback operations
 * Handles user-to-user feedback for dynamic testimonials
 */
@RestController
@RequestMapping("/api/feedbacks")
@CrossOrigin(origins = "*")
public class FeedbackController {
    
    private static final Logger logger = LoggerFactory.getLogger(FeedbackController.class);
    
    @Autowired
    private FeedbackService feedbackService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    /**
     * Create new feedback
     * POST /api/feedbacks
     */
    @PostMapping
    public ResponseEntity<?> createFeedback(@Valid @RequestBody FeedbackRequest request, HttpServletRequest httpRequest) {
        try {
            // Extract user from JWT token
            String token = extractTokenFromRequest(httpRequest);
            if (token == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("Authentication required"));
            }
            
            String userEmail = jwtTokenProvider.getIdentifierFromToken(token);
            if (userEmail == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("Invalid authentication token"));
            }
            
            // Find user by email to get user ID
            Optional<User> currentUserOpt = userService.findByEmail(userEmail);
            if (currentUserOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("User not found"));
            }
            
            String currentUserId = currentUserOpt.get().getId();
            
            // Validate request
            if (request.getToUserId() == null || request.getToUserId().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(createErrorResponse("Recipient user ID is required"));
            }
            
            if (currentUserId.equals(request.getToUserId())) {
                return ResponseEntity.badRequest()
                    .body(createErrorResponse("Cannot leave feedback for yourself"));
            }
            
            // Check if user can leave feedback
            if (!feedbackService.canLeaveFeedback(currentUserId, request.getToUserId())) {
                return ResponseEntity.badRequest()
                    .body(createErrorResponse("You are not eligible to leave feedback for this user"));
            }
            
            // Create feedback
            Feedback feedback = feedbackService.createFeedback(
                currentUserId,
                request.getToUserId(),
                request.getName(),
                request.getTitle(),
                request.getMessage(),
                request.getRating(),
                request.getTransactionId()
            );
            
            // Prepare response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Feedback submitted successfully");
            response.put("feedbackId", feedback.getId());
            response.put("feedback", createFeedbackResponse(feedback));
            
            logger.info("✅ Feedback created successfully: {}", feedback.getId());
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            logger.error("❌ Invalid feedback request: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            logger.error("❌ Error creating feedback: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Failed to create feedback"));
        }
    }
    
    /**
     * Get feedbacks for homepage carousel
     * GET /api/feedbacks?limit=20
     */
    @GetMapping
    public ResponseEntity<?> getFeedbacks(@RequestParam(defaultValue = "20") int limit) {
        try {
            if (limit < 1 || limit > 100) {
                limit = 20; // Default to 20 if invalid
            }
            
            List<Feedback> feedbacks = feedbackService.getFeedbacksForHomepage(limit);
            
            // Convert to response format
            List<Map<String, Object>> feedbackResponses = feedbacks.stream()
                .map(this::createFeedbackResponse)
                .toList();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", feedbackResponses);
            response.put("count", feedbackResponses.size());
            
            logger.info("✅ Retrieved {} feedbacks for homepage", feedbackResponses.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("❌ Error retrieving feedbacks: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Failed to retrieve feedbacks"));
        }
    }
    
    /**
     * Get feedbacks for a specific user
     * GET /api/feedbacks/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getFeedbacksForUser(@PathVariable String userId) {
        try {
            List<Feedback> feedbacks = feedbackService.getFeedbacksForUser(userId);
            
            List<Map<String, Object>> feedbackResponses = feedbacks.stream()
                .map(this::createFeedbackResponse)
                .toList();
            
            // Get feedback stats
            FeedbackService.FeedbackStats stats = feedbackService.getFeedbackStats(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", feedbackResponses);
            response.put("stats", Map.of(
                "totalReceived", stats.getTotalReceived(),
                "totalGiven", stats.getTotalGiven(),
                "averageRating", stats.getAverageRating(),
                "ratingDistribution", stats.getRatingDistribution()
            ));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("❌ Error retrieving user feedbacks: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Failed to retrieve user feedbacks"));
        }
    }
    
    /**
     * Get eligible users for feedback
     * GET /api/feedbacks/recipients
     */
    @GetMapping("/recipients")
    public ResponseEntity<?> getEligibleRecipients(HttpServletRequest httpRequest) {
        try {
            // Extract user from JWT token
            String token = extractTokenFromRequest(httpRequest);
            if (token == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("Authentication required"));
            }
            
            String userEmail = jwtTokenProvider.getIdentifierFromToken(token);
            if (userEmail == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("Invalid authentication token"));
            }
            
            // Find user by email to get user ID
            Optional<User> currentUserOpt = userService.findByEmail(userEmail);
            if (currentUserOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("User not found"));
            }
            
            String currentUserId = currentUserOpt.get().getId();
            
            List<User> eligibleUsers = feedbackService.getEligibleFeedbackRecipients(currentUserId);
            
            List<Map<String, Object>> userResponses = eligibleUsers.stream()
                .map(user -> {
                    Map<String, Object> userMap = new HashMap<>();
                    userMap.put("id", user.getId());
                    userMap.put("name", user.getFirstName() + " " + user.getLastName());
                    userMap.put("email", user.getEmail());
                    userMap.put("role", determineDisplayRole(user));
                    return userMap;
                })
                .toList();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", userResponses);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("❌ Error retrieving eligible recipients: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Failed to retrieve eligible recipients"));
        }
    }
    
    /**
     * Get current user info for feedback form
     * GET /api/feedbacks/user-info
     */
    @GetMapping("/user-info")
    public ResponseEntity<?> getCurrentUserInfo(HttpServletRequest httpRequest) {
        try {
            // Extract user from JWT token
            String token = extractTokenFromRequest(httpRequest);
            if (token == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("Authentication required"));
            }
            
            String userEmail = jwtTokenProvider.getIdentifierFromToken(token);
            if (userEmail == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("Invalid authentication token"));
            }
            
            // Find user by email to get user ID
            Optional<User> currentUserOpt = userService.findByEmail(userEmail);
            if (currentUserOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("User not found"));
            }
            
            String currentUserId = currentUserOpt.get().getId();
            
            Optional<User> userOpt = userService.findById(currentUserId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse("User not found"));
            }
            
            User user = userOpt.get();
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", user.getId());
            userInfo.put("name", user.getFirstName() + " " + user.getLastName());
            userInfo.put("title", determineDisplayRole(user));
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", userInfo);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("❌ Error retrieving user info: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Failed to retrieve user information"));
        }
    }
    
    // Helper methods
    
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
    
    private Map<String, Object> createFeedbackResponse(Feedback feedback) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", feedback.getId());
        response.put("name", feedback.getName());
        response.put("title", feedback.getTitle());
        response.put("message", feedback.getMessage());
        response.put("rating", feedback.getRating());
        response.put("created_at", feedback.getCreatedAt().toString());
        response.put("from_role", feedback.getFromRole());
        response.put("to_role", feedback.getToRole());
        return response;
    }
    
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> error = new HashMap<>();
        error.put("success", false);
        error.put("message", message);
        return error;
    }
    
    private String determineDisplayRole(User user) {
        if (user.getRoles() != null) {
            if (user.getRoles().contains("SELLER")) {
                return "Gemstone Dealer";
            } else if (user.getRoles().contains("BUYER")) {
                return "Gemstone Collector";
            } else if (user.getRoles().contains("ADMIN")) {
                return "Platform Administrator";
            }
        }
        return "GemNet Member";
    }
    
    // DTO Classes
    
    public static class FeedbackRequest {
        @NotNull(message = "Recipient user ID is required")
        private String toUserId;
        
        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
        private String name;
        
        @NotBlank(message = "Title is required")
        @Size(min = 2, max = 100, message = "Title must be between 2 and 100 characters")
        private String title;
        
        @NotBlank(message = "Message is required")
        @Size(min = 10, max = 1000, message = "Message must be between 10 and 1000 characters")
        private String message;
        
        @NotNull(message = "Rating is required")
        @Min(value = 1, message = "Rating must be at least 1")
        @Max(value = 5, message = "Rating must not exceed 5")
        private Integer rating;
        
        private String transactionId; // Optional
        
        // Getters and Setters
        public String getToUserId() { return toUserId; }
        public void setToUserId(String toUserId) { this.toUserId = toUserId; }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        
        public Integer getRating() { return rating; }
        public void setRating(Integer rating) { this.rating = rating; }
        
        public String getTransactionId() { return transactionId; }
        public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
    }
}