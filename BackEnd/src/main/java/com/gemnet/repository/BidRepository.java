package com.gemnet.repository;

import com.gemnet.model.Bid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface BidRepository extends MongoRepository<Bid, String> {
    
    // Find all bids for a specific listing
    List<Bid> findByListingIdOrderByBidTimeDesc(String listingId);
    
    // Find all bids for a specific listing with pagination
    Page<Bid> findByListingIdOrderByBidTimeDesc(String listingId, Pageable pageable);
    
    // Find bids by bidder
    List<Bid> findByBidderIdOrderByBidTimeDesc(String bidderId);
    
    // Find bids by seller
    List<Bid> findBySellerIdOrderByBidTimeDesc(String sellerId);
    
    // Find active bids for a listing
    List<Bid> findByListingIdAndStatusOrderByBidTimeDesc(String listingId, String status);
    
    // Find the highest bid for a listing
    @Query("{ 'listingId': ?0, 'status': 'ACTIVE' }")
    List<Bid> findActiveByListingIdOrderByBidAmountDesc(String listingId);
    
    // Find highest bid for a listing
    Optional<Bid> findTopByListingIdAndStatusOrderByBidAmountDesc(String listingId, String status);
    
    // Count total bids for a listing
    long countByListingId(String listingId);
    
    // Count active bids for a listing
    long countByListingIdAndStatus(String listingId, String status);
    
    // Find bids by status
    List<Bid> findByStatus(String status);
    
    // Find bids above a certain amount for a listing
    List<Bid> findByListingIdAndBidAmountGreaterThanOrderByBidAmountDesc(String listingId, BigDecimal amount);
    
    // Find user's bid for a specific listing
    Optional<Bid> findByListingIdAndBidderIdAndStatus(String listingId, String bidderId, String status);
    
    // Find all bids for a specific listing and bidder
    List<Bid> findByListingIdAndBidderIdOrderByBidTimeDesc(String listingId, String bidderId);
}
