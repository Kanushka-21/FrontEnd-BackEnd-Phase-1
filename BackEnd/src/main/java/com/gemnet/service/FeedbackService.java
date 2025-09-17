package com.gemnet.service;

import com.gemnet.model.Feedback;
import com.gemnet.model.User;
import com.gemnet.repository.FeedbackRepository;
import com.gemnet.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service for handling feedback operations
 * Manages user-to-user feedback system for dynamic testimonials
 */
@Service
public class FeedbackService {
    
    private static final Logger logger = LoggerFactory.getLogger(FeedbackService.class);
    
    @Autowired
    private FeedbackRepository feedbackRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Create new feedback
     */
    public Feedback createFeedback(String fromUserId, String toUserId, String name, 
                                 String title, String message, Integer rating, String transactionId) {
        try {
            // Validate users exist
            Optional<User> fromUser = userRepository.findById(fromUserId);
            Optional<User> toUser = userRepository.findById(toUserId);
            
            if (fromUser.isEmpty()) {
                throw new IllegalArgumentException("From user not found");
            }
            
            if (toUser.isEmpty()) {
                throw new IllegalArgumentException("To user not found");
            }
            
            // Determine roles based on user roles or transaction context
            String fromRole = determineUserRole(fromUser.get());
            String toRole = determineUserRole(toUser.get());
            
            // Check if feedback already exists between these users for this transaction
            if (transactionId != null && !transactionId.isEmpty()) {
                List<Feedback> existingFeedback = feedbackRepository.findByTransactionId(transactionId);
                boolean alreadyExists = existingFeedback.stream()
                    .anyMatch(f -> f.getFromUserId().equals(fromUserId) && f.getToUserId().equals(toUserId));
                
                if (alreadyExists) {
                    throw new IllegalArgumentException("Feedback already exists for this transaction");
                }
            }
            
            // Create new feedback
            Feedback feedback = new Feedback();
            feedback.setFromUserId(fromUserId);
            feedback.setToUserId(toUserId);
            feedback.setFromRole(fromRole);
            feedback.setToRole(toRole);
            feedback.setName(name);
            feedback.setTitle(title);
            feedback.setMessage(message);
            feedback.setRating(rating);
            feedback.setTransactionId(transactionId);
            feedback.setIsApproved(true); // Auto-approve for now, can add moderation later
            
            Feedback savedFeedback = feedbackRepository.save(feedback);
            
            logger.info("✅ Feedback created: {} → {} (Rating: {})", fromUserId, toUserId, rating);
            return savedFeedback;
            
        } catch (Exception e) {
            logger.error("❌ Error creating feedback: {}", e.getMessage());
            throw new RuntimeException("Failed to create feedback: " + e.getMessage());
        }
    }
    
    /**
     * Get feedbacks for homepage carousel
     */
    public List<Feedback> getFeedbacksForHomepage(int limit) {
        try {
            if (limit <= 0 || limit > 100) {
                limit = 20; // Default limit
            }
            
            Pageable pageable = PageRequest.of(0, limit);
            List<Feedback> feedbacks = feedbackRepository.findByIsApprovedTrueOrderByCreatedAtDesc(pageable);
            
            logger.info("📊 Retrieved {} feedbacks for homepage", feedbacks.size());
            return feedbacks;
            
        } catch (Exception e) {
            logger.error("❌ Error retrieving feedbacks for homepage: {}", e.getMessage());
            throw new RuntimeException("Failed to retrieve feedbacks: " + e.getMessage());
        }
    }
    
    /**
     * Get all feedbacks for a user (as recipient)
     */
    public List<Feedback> getFeedbacksForUser(String userId) {
        try {
            List<Feedback> feedbacks = feedbackRepository.findByToUserIdOrderByCreatedAtDesc(userId);
            logger.info("📊 Retrieved {} feedbacks for user {}", feedbacks.size(), userId);
            return feedbacks;
            
        } catch (Exception e) {
            logger.error("❌ Error retrieving feedbacks for user {}: {}", userId, e.getMessage());
            throw new RuntimeException("Failed to retrieve user feedbacks: " + e.getMessage());
        }
    }
    
    /**
     * Get feedbacks from a user (as sender)
     */
    public List<Feedback> getFeedbacksFromUser(String userId) {
        try {
            List<Feedback> feedbacks = feedbackRepository.findByFromUserIdOrderByCreatedAtDesc(userId);
            logger.info("📊 Retrieved {} feedbacks from user {}", feedbacks.size(), userId);
            return feedbacks;
            
        } catch (Exception e) {
            logger.error("❌ Error retrieving feedbacks from user {}: {}", userId, e.getMessage());
            throw new RuntimeException("Failed to retrieve user feedbacks: " + e.getMessage());
        }
    }
    
    /**
     * Calculate average rating for a user
     */
    public double getAverageRating(String userId) {
        try {
            List<Feedback> feedbacks = feedbackRepository.findRatingsByToUserId(userId);
            
            if (feedbacks.isEmpty()) {
                return 0.0;
            }
            
            double average = feedbacks.stream()
                .mapToInt(Feedback::getRating)
                .average()
                .orElse(0.0);
                
            logger.info("📊 Average rating for user {}: {}", userId, average);
            return Math.round(average * 100.0) / 100.0; // Round to 2 decimal places
            
        } catch (Exception e) {
            logger.error("❌ Error calculating average rating for user {}: {}", userId, e.getMessage());
            return 0.0;
        }
    }
    
    /**
     * Get feedback statistics for a user
     */
    public FeedbackStats getFeedbackStats(String userId) {
        try {
            long totalReceived = feedbackRepository.countByToUserId(userId);
            long totalGiven = feedbackRepository.countByFromUserId(userId);
            double averageRating = getAverageRating(userId);
            
            // Get rating distribution
            List<Feedback> userFeedbacks = feedbackRepository.findByToUserIdOrderByCreatedAtDesc(userId);
            int[] ratingCounts = new int[6]; // Index 0 unused, 1-5 for ratings
            
            for (Feedback feedback : userFeedbacks) {
                if (feedback.getRating() >= 1 && feedback.getRating() <= 5) {
                    ratingCounts[feedback.getRating()]++;
                }
            }
            
            return new FeedbackStats(totalReceived, totalGiven, averageRating, ratingCounts);
            
        } catch (Exception e) {
            logger.error("❌ Error getting feedback stats for user {}: {}", userId, e.getMessage());
            return new FeedbackStats(0, 0, 0.0, new int[6]);
        }
    }
    
    /**
     * Check if user can leave feedback for another user
     */
    public boolean canLeaveFeedback(String fromUserId, String toUserId) {
        try {
            // Users cannot leave feedback for themselves
            if (fromUserId.equals(toUserId)) {
                return false;
            }
            
            // Check if both users exist
            boolean fromUserExists = userRepository.existsById(fromUserId);
            boolean toUserExists = userRepository.existsById(toUserId);
            
            if (!fromUserExists || !toUserExists) {
                return false;
            }
            
            // For now, allow multiple feedbacks between users
            // In production, you might want to limit this based on transactions
            return true;
            
        } catch (Exception e) {
            logger.error("❌ Error checking feedback eligibility: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * Get users that the current user can leave feedback for
     */
    public List<User> getEligibleFeedbackRecipients(String currentUserId) {
        try {
            // For now, return all active users except the current user
            // In production, this might be based on transaction history
            List<User> allUsers = userRepository.findAll();
            
            List<User> eligibleUsers = allUsers.stream()
                .filter(user -> !user.getId().equals(currentUserId))
                .filter(User::getIsActive)
                .filter(User::getIsVerified)
                .toList();
                
            logger.info("📊 Found {} eligible feedback recipients for user {}", eligibleUsers.size(), currentUserId);
            return eligibleUsers;
            
        } catch (Exception e) {
            logger.error("❌ Error getting eligible feedback recipients: {}", e.getMessage());
            return List.of();
        }
    }
    
    /**
     * Determine user role based on user data
     */
    private String determineUserRole(User user) {
        // Check if user has seller-related data (gemstone listings)
        // For now, we'll use a simple heuristic based on roles
        if (user.getRoles() != null && user.getRoles().contains("SELLER")) {
            return "SELLER";
        } else if (user.getRoles() != null && user.getRoles().contains("BUYER")) {
            return "BUYER";
        } else {
            // Default to USER for general users
            return "USER";
        }
    }
    
    /**
     * Inner class for feedback statistics
     */
    public static class FeedbackStats {
        private final long totalReceived;
        private final long totalGiven;
        private final double averageRating;
        private final int[] ratingDistribution;
        
        public FeedbackStats(long totalReceived, long totalGiven, double averageRating, int[] ratingDistribution) {
            this.totalReceived = totalReceived;
            this.totalGiven = totalGiven;
            this.averageRating = averageRating;
            this.ratingDistribution = ratingDistribution;
        }
        
        // Getters
        public long getTotalReceived() { return totalReceived; }
        public long getTotalGiven() { return totalGiven; }
        public double getAverageRating() { return averageRating; }
        public int[] getRatingDistribution() { return ratingDistribution; }
    }
}