package com.gemnet.repository;

import com.gemnet.model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {
    
    // Find all notifications for a user
    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);
    
    // Find notifications for a user with pagination
    Page<Notification> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);
    
    // Find unread notifications for a user
    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(String userId);
    
    // Find notifications by type for a user
    List<Notification> findByUserIdAndTypeOrderByCreatedAtDesc(String userId, String type);
    
    // Find notifications for a specific listing
    List<Notification> findByListingIdOrderByCreatedAtDesc(String listingId);
    
    // Find notifications for a specific bid
    List<Notification> findByBidIdOrderByCreatedAtDesc(String bidId);
    
    // Count unread notifications for a user
    long countByUserIdAndIsReadFalse(String userId);
    
    // Find recent notifications (last 24 hours)
    @Query("{ 'userId': ?0, 'createdAt': { $gte: ?1 } }")
    List<Notification> findRecentByUserId(String userId, LocalDateTime since);
    
    // Find notifications by type and read status
    List<Notification> findByUserIdAndTypeAndIsReadOrderByCreatedAtDesc(String userId, String type, boolean isRead);
    
    // Delete old read notifications (cleanup)
    void deleteByIsReadTrueAndCreatedAtBefore(LocalDateTime cutoffDate);
}
