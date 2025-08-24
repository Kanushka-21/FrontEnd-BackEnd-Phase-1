package com.gemnet.repository;

import com.gemnet.model.Meeting;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MeetingRepository extends MongoRepository<Meeting, String> {
    
    // Find meetings by buyer ID
    List<Meeting> findByBuyerId(String buyerId);
    
    // Find meetings by seller ID
    List<Meeting> findBySellerId(String sellerId);
    
    // Find meetings by purchase ID
    Optional<Meeting> findByPurchaseId(String purchaseId);
    
    // Find meetings by status
    List<Meeting> findByStatus(String status);
    
    // Find meetings by buyer and status
    List<Meeting> findByBuyerIdAndStatus(String buyerId, String status);
    
    // Find meetings by seller and status
    List<Meeting> findBySellerIdAndStatus(String sellerId, String status);
    
    // Find meetings within a date range
    @Query("{'confirmedDateTime': {$gte: ?0, $lte: ?1}}")
    List<Meeting> findMeetingsInDateRange(LocalDateTime startDate, LocalDateTime endDate);
    
    // Find upcoming meetings (confirmed date after now)
    @Query("{'confirmedDateTime': {$gte: ?0}, 'status': {$in: ['CONFIRMED', 'PENDING']}}")
    List<Meeting> findUpcomingMeetings(LocalDateTime now);
    
    // Find meetings by buyer or seller ID
    @Query("{'$or': [{'buyerId': ?0}, {'sellerId': ?0}]}")
    List<Meeting> findMeetingsByUserId(String userId);
    
    // Find pending meetings for a specific user (buyer or seller)
    @Query("{'$or': [{'buyerId': ?0}, {'sellerId': ?0}], 'status': 'PENDING'}")
    List<Meeting> findPendingMeetingsByUserId(String userId);
    
    // Find meetings that need reminders (confirmed meetings approaching in next 24 hours)
    @Query("{'confirmedDateTime': {$gte: ?0, $lte: ?1}, 'status': 'CONFIRMED'}")
    List<Meeting> findMeetingsNeedingReminders(LocalDateTime startTime, LocalDateTime endTime);
    
    // Find all meetings for admin dashboard
    List<Meeting> findAllByOrderByCreatedAtDesc();
    
    // Count meetings by status
    long countByStatus(String status);
    
    // Find meetings by meeting type
    List<Meeting> findByMeetingType(String meetingType);
    
    // Find overdue meetings (past confirmed date but still pending/confirmed status)
    @Query("{'confirmedDateTime': {$lt: ?0}, 'status': {$in: ['CONFIRMED', 'PENDING']}}")
    List<Meeting> findOverdueMeetings(LocalDateTime now);
}
