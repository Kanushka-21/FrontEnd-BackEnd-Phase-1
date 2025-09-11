package com.gemnet.repository;

import com.gemnet.model.Feedback;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository interface for Feedback operations
 * Handles user-to-user feedback storage and retrieval
 */
@Repository
public interface FeedbackRepository extends MongoRepository<Feedback, String> {
    
    /**
     * Find the most recent feedbacks for homepage carousel
     * Only approved feedbacks are returned
     */
    @Query("{ 'isApproved': true }")
    List<Feedback> findTop20ByIsApprovedTrueOrderByCreatedAtDesc();
    
    /**
     * Find feedbacks with custom limit
     */
    @Query("{ 'isApproved': true }")
    List<Feedback> findByIsApprovedTrueOrderByCreatedAtDesc(Pageable pageable);
    
    /**
     * Find all feedbacks for a specific user (as recipient)
     */
    List<Feedback> findByToUserIdOrderByCreatedAtDesc(String toUserId);
    
    /**
     * Find all feedbacks from a specific user (as sender)
     */
    List<Feedback> findByFromUserIdOrderByCreatedAtDesc(String fromUserId);
    
    /**
     * Find feedback between two specific users
     */
    List<Feedback> findByFromUserIdAndToUserIdOrderByCreatedAtDesc(String fromUserId, String toUserId);
    
    /**
     * Check if user has already left feedback for another user
     */
    boolean existsByFromUserIdAndToUserId(String fromUserId, String toUserId);
    
    /**
     * Find feedbacks by rating range
     */
    List<Feedback> findByRatingGreaterThanEqualAndIsApprovedTrueOrderByCreatedAtDesc(Integer minRating);
    
    /**
     * Count total feedbacks for a user (as recipient)
     */
    long countByToUserId(String toUserId);
    
    /**
     * Count total feedbacks from a user (as sender)
     */
    long countByFromUserId(String fromUserId);
    
    /**
     * Calculate average rating for a user
     */
    @Query(value = "{ 'toUserId': ?0, 'isApproved': true }", 
           fields = "{ 'rating': 1 }")
    List<Feedback> findRatingsByToUserId(String toUserId);
    
    /**
     * Find recent feedbacks (last 30 days)
     */
    @Query("{ 'createdAt': { $gte: ?0 }, 'isApproved': true }")
    List<Feedback> findRecentFeedbacks(LocalDateTime since);
    
    /**
     * Find feedbacks for admin review (unapproved)
     */
    @Query("{ 'isApproved': { $ne: true } }")
    List<Feedback> findPendingApproval();
    
    /**
     * Find feedbacks by transaction ID
     */
    List<Feedback> findByTransactionId(String transactionId);
}
