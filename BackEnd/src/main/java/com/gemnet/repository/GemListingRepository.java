package com.gemnet.repository;

import com.gemnet.model.GemListing;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface GemListingRepository extends MongoRepository<GemListing, String> {
    
    // Find listings by user ID
    List<GemListing> findByUserId(String userId);
    
    // Find listings by user ID and status
    List<GemListing> findByUserIdAndListingStatus(String userId, String listingStatus);
    
    // Find listings by user ID and active status
    List<GemListing> findByUserIdAndIsActive(String userId, Boolean isActive);
    
    // Find listings by status
    List<GemListing> findByListingStatus(String listingStatus);
    
    // Find active listings
    List<GemListing> findByIsActive(Boolean isActive);
    
    // Find certified/non-certified listings
    List<GemListing> findByIsCertified(Boolean isCertified);
    
    // Find listings by category
    List<GemListing> findByCategory(String category);
    
    // Find listings by variety
    List<GemListing> findByVariety(String variety);
    
    // Find listings by species
    List<GemListing> findBySpecies(String species);
    
    // Find listings by treatment
    List<GemListing> findByTreatment(String treatment);
    
    // Find listings by color
    List<GemListing> findByColor(String color);
    
    // Find listings by price range
    List<GemListing> findByPriceBetween(BigDecimal minPrice, BigDecimal maxPrice);
    
    // Find listings by CSL memo number
    Optional<GemListing> findByCslMemoNo(String cslMemoNo);
    
    // Find listings by certificate number
    Optional<GemListing> findByCertificateNumber(String certificateNumber);
    
    // Find pending approval listings
    @Query("{'listingStatus': 'PENDING', 'isActive': true}")
    List<GemListing> findPendingApprovalListings();
    
    // Find approved and active listings
    @Query("{'listingStatus': 'APPROVED', 'isActive': true}")
    List<GemListing> findApprovedActiveListings();
    
    // Find active marketplace listings (approved and active)
    @Query("{'listingStatus': {$in: ['APPROVED', 'ACTIVE']}, 'isActive': true}")
    List<GemListing> findMarketplaceListings();
    
    // Find seller's active listings
    @Query("{'userId': ?0, 'isActive': true, 'listingStatus': {$ne: 'SOLD'}}")
    List<GemListing> findSellerActiveListings(String userId);
    
    // Find listings by multiple criteria
    @Query("{'category': ?0, 'isCertified': ?1, 'isActive': true, 'listingStatus': {$in: ['APPROVED', 'ACTIVE']}}")
    List<GemListing> findByCategoryAndCertificationStatus(String category, Boolean isCertified);
    
    // Search listings by gem name (case-insensitive)
    @Query("{'gemName': {$regex: ?0, $options: 'i'}, 'isActive': true, 'listingStatus': {$in: ['APPROVED', 'ACTIVE']}}")
    List<GemListing> searchByGemName(String gemName);
    
    // Search listings by variety (case-insensitive)
    @Query("{'variety': {$regex: ?0, $options: 'i'}, 'isActive': true, 'listingStatus': {$in: ['APPROVED', 'ACTIVE']}}")
    List<GemListing> searchByVariety(String variety);
    
    // Count listings by user
    long countByUserId(String userId);
    
    // Count listings by status
    long countByListingStatus(String listingStatus);
    
    // Count active listings by user
    long countByUserIdAndIsActive(String userId, Boolean isActive);
    
    // Find recent listings (ordered by creation date)
    @Query(value = "{'isActive': true, 'listingStatus': {$in: ['APPROVED', 'ACTIVE']}}", 
           sort = "{'createdAt': -1}")
    List<GemListing> findRecentListings();
    
    // Find popular listings (ordered by views)
    @Query(value = "{'isActive': true, 'listingStatus': {$in: ['APPROVED', 'ACTIVE']}}", 
           sort = "{'views': -1}")
    List<GemListing> findPopularListings();
    
    // Find featured listings (high price, good views)
    @Query(value = "{'isActive': true, 'listingStatus': {$in: ['APPROVED', 'ACTIVE']}, 'price': {$gte: ?0}}", 
           sort = "{'views': -1, 'price': -1}")
    List<GemListing> findFeaturedListings(BigDecimal minPrice);
    
    // Advanced search with multiple filters
    @Query("{ $and: [ " +
           "  {'isActive': true}, " +
           "  {'listingStatus': {$in: ['APPROVED', 'ACTIVE']}}, " +
           "  { $or: [ " +
           "    {'category': {$regex: ?0, $options: 'i'}}, " +
           "    {'variety': {$regex: ?0, $options: 'i'}}, " +
           "    {'gemName': {$regex: ?0, $options: 'i'}} " +
           "  ]}, " +
           "  {'price': {$gte: ?1, $lte: ?2}}, " +
           "  {'isCertified': ?3} " +
           "]}")
    List<GemListing> advancedSearch(String searchTerm, BigDecimal minPrice, BigDecimal maxPrice, Boolean isCertified);
    
    // Check if CSL memo number exists
    boolean existsByCslMemoNo(String cslMemoNo);
    
    // Check if certificate number exists
    boolean existsByCertificateNumber(String certificateNumber);
    
    // Find listings by user role and status
    @Query("{'userRole': ?0, 'listingStatus': ?1, 'isActive': true}")
    List<GemListing> findByUserRoleAndStatus(String userRole, String listingStatus);
    
    // ===== PAGEABLE VERSIONS FOR API ENDPOINTS =====
    
    // Find all listings with pagination
    Page<GemListing> findAll(Pageable pageable);
    
    // Find listings by user ID with pagination
    Page<GemListing> findByUserId(String userId, Pageable pageable);
    
    // Find listings by user ID and status with pagination
    Page<GemListing> findByUserIdAndListingStatus(String userId, String listingStatus, Pageable pageable);
    
    // Find listings by user ID and certification status with pagination
    Page<GemListing> findByUserIdAndIsCertified(String userId, Boolean isCertified, Pageable pageable);
    
    // Find listings by user ID, status and certification with pagination
    Page<GemListing> findByUserIdAndListingStatusAndIsCertified(String userId, String listingStatus, Boolean isCertified, Pageable pageable);
    
    // Find listings by status with pagination
    Page<GemListing> findByListingStatus(String listingStatus, Pageable pageable);
    
    // Find listings by certification status with pagination
    Page<GemListing> findByIsCertified(Boolean isCertified, Pageable pageable);
    
    // Find listings by status and certification with pagination
    Page<GemListing> findByListingStatusAndIsCertified(String listingStatus, Boolean isCertified, Pageable pageable);
    
    // Find listings by category with pagination
    Page<GemListing> findByCategory(String category, Pageable pageable);
    
    // Find marketplace listings with pagination
    @Query("{'listingStatus': {$in: ['APPROVED', 'ACTIVE']}, 'isActive': true}")
    Page<GemListing> findMarketplaceListings(Pageable pageable);
    
    // Find pending approval listings with pagination
    @Query("{'listingStatus': 'PENDING', 'isActive': true}")
    Page<GemListing> findPendingApprovalListings(Pageable pageable);
    
    // Find seller's active listings with pagination
    @Query("{'userId': ?0, 'isActive': true, 'listingStatus': {$ne: 'SOLD'}}")
    Page<GemListing> findSellerActiveListings(String userId, Pageable pageable);
    
    // ===== MARKETPLACE-SPECIFIC SEARCH METHODS =====
    
    // Search marketplace listings by name with pagination
    @Query("{'gemName': {$regex: ?0, $options: 'i'}, 'listingStatus': {$in: ['APPROVED', 'ACTIVE']}, 'isActive': true}")
    Page<GemListing> searchByNameInMarketplace(String gemName, Pageable pageable);
    
    // Search marketplace listings by name (without pagination) 
    @Query("{'gemName': {$regex: ?0, $options: 'i'}, 'listingStatus': {$in: ['APPROVED', 'ACTIVE']}, 'isActive': true}")
    List<GemListing> searchByNameInMarketplace(String gemName);
    
    // Search marketplace listings by variety (without pagination)
    @Query("{'variety': {$regex: ?0, $options: 'i'}, 'listingStatus': {$in: ['APPROVED', 'ACTIVE']}, 'isActive': true}")
    List<GemListing> searchByVarietyInMarketplace(String variety);
    
    // Find by category and certification in marketplace
    @Query("{'category': ?0, 'isCertified': ?1, 'listingStatus': {$in: ['APPROVED', 'ACTIVE']}, 'isActive': true}")
    Page<GemListing> findByCategoryAndCertificationInMarketplace(String category, Boolean isCertified, Pageable pageable);
    
    // Find by minimum price in marketplace
    @Query("{'price': {$gte: ?0}, 'listingStatus': {$in: ['APPROVED', 'ACTIVE']}, 'isActive': true}")
    Page<GemListing> findByMinPriceInMarketplace(Double minPrice, Pageable pageable);
    
    // Count marketplace listings
    @Query(value = "{'listingStatus': {$in: ['APPROVED', 'ACTIVE']}, 'isActive': true}", count = true)
    long countMarketplaceListings();
    
    // Count certified listings in marketplace
    @Query(value = "{'listingStatus': {$in: ['APPROVED', 'ACTIVE']}, 'isActive': true, 'isCertified': ?0}", count = true)
    long countByCertificationInMarketplace(Boolean isCertified);
}

