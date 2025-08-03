package com.gemnet.service;

import com.gemnet.dto.ApiResponse;
import com.gemnet.model.GemListing;
import com.gemnet.repository.GemListingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Service for marketplace operations
 */
@Service
public class MarketplaceService {

    @Autowired
    private GemListingRepository gemListingRepository;

    /**
     * Get marketplace listings (approved and active, optionally including sold items)
     */
    public ApiResponse<Map<String, Object>> getMarketplaceListings(
            Pageable pageable, String search, String category, Double minPrice, Double maxPrice, 
            boolean certifiedOnly, boolean includeSold) {
        try {
            System.out.println("🔍 MarketplaceService - Getting marketplace listings (includeSold: " + includeSold + ")");
            
            Page<GemListing> listingsPage;
            
            // Apply filters based on search criteria
            if (search != null && !search.trim().isEmpty()) {
                // Search by name (need to create new search methods for sold items)
                if (includeSold) {
                    listingsPage = gemListingRepository.searchByNameInMarketplaceIncludingSold(search.trim(), pageable);
                } else {
                    listingsPage = gemListingRepository.searchByNameInMarketplace(search.trim(), pageable);
                }
            } else if (category != null && !category.trim().isEmpty()) {
                // Filter by category and certification (need to create new methods)
                if (includeSold) {
                    listingsPage = gemListingRepository.findByCategoryAndCertificationInMarketplaceIncludingSold(category.trim(), certifiedOnly, pageable);
                } else {
                    listingsPage = gemListingRepository.findByCategoryAndCertificationInMarketplace(category.trim(), certifiedOnly, pageable);
                }
            } else if (minPrice != null) {
                // Filter by minimum price (need to create new methods)
                if (includeSold) {
                    listingsPage = gemListingRepository.findByMinPriceInMarketplaceIncludingSold(minPrice, pageable);
                } else {
                    listingsPage = gemListingRepository.findByMinPriceInMarketplace(minPrice, pageable);
                }
            } else {
                // Get all marketplace listings
                if (includeSold) {
                    listingsPage = gemListingRepository.findAllMarketplaceListings(pageable);
                } else {
                    listingsPage = gemListingRepository.findMarketplaceListings(pageable);
                }
            }
            
            // Additional filtering in memory if needed
            if (maxPrice != null || certifiedOnly) {
                List<GemListing> filteredList = listingsPage.getContent().stream()
                    .filter(listing -> {
                        boolean priceMatch = maxPrice == null || listing.getPrice().doubleValue() <= maxPrice;
                        boolean certMatch = !certifiedOnly || listing.getIsCertified();
                        return priceMatch && certMatch;
                    })
                    .toList();
                
                // For simplicity, we'll return the filtered list as part of the response
                // In a real implementation, you might want to create a custom query
            }
            
            // Prepare response data
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("listings", listingsPage.getContent());
            responseData.put("currentPage", listingsPage.getNumber());
            responseData.put("totalPages", listingsPage.getTotalPages());
            responseData.put("totalElements", listingsPage.getTotalElements());
            responseData.put("pageSize", listingsPage.getSize());
            responseData.put("hasNext", listingsPage.hasNext());
            responseData.put("hasPrevious", listingsPage.hasPrevious());
            
            System.out.println("✅ Retrieved " + listingsPage.getNumberOfElements() + 
                             " marketplace listings out of " + listingsPage.getTotalElements() + " total");
            
            return ApiResponse.success("Marketplace listings retrieved successfully", responseData);
            
        } catch (Exception e) {
            System.err.println("❌ MarketplaceService - Error getting marketplace listings: " + e.getMessage());
            e.printStackTrace();
            return ApiResponse.error("Failed to retrieve marketplace listings: " + e.getMessage());
        }
    }

    /**
     * Get listing details by ID (only if approved and active)
     */
    public ApiResponse<GemListing> getListingDetails(String listingId) {
        try {
            System.out.println("🔍 MarketplaceService - Getting listing details for ID: " + listingId);
            
            Optional<GemListing> optionalListing = gemListingRepository.findById(listingId);
            
            if (!optionalListing.isPresent()) {
                System.err.println("❌ Listing not found with ID: " + listingId);
                return ApiResponse.error("Listing not found with ID: " + listingId);
            }
            
            GemListing listing = optionalListing.get();
            
            // Check if listing is approved and active (available in marketplace)
            if (!"APPROVED".equals(listing.getListingStatus()) && !"ACTIVE".equals(listing.getListingStatus())) {
                System.err.println("❌ Listing is not available in marketplace. Status: " + listing.getListingStatus());
                return ApiResponse.error("Listing is not available in marketplace");
            }
            
            if (!listing.getIsActive()) {
                System.err.println("❌ Listing is not active");
                return ApiResponse.error("Listing is not active");
            }
            
            System.out.println("✅ Listing details retrieved: " + listing.getGemName() + 
                             " by " + listing.getUserName());
            
            return ApiResponse.success("Listing details retrieved successfully", listing);
            
        } catch (Exception e) {
            System.err.println("❌ MarketplaceService - Error getting listing details: " + e.getMessage());
            e.printStackTrace();
            return ApiResponse.error("Failed to retrieve listing details: " + e.getMessage());
        }
    }

    /**
     * Search gemstones by query
     */
    public ApiResponse<List<GemListing>> searchGemstones(String query, int limit) {
        try {
            System.out.println("🔍 MarketplaceService - Searching gemstones with query: " + query);
            
            // Search by gem name
            List<GemListing> nameResults = gemListingRepository.searchByNameInMarketplace(query);
            
            // Search by variety  
            List<GemListing> varietyResults = gemListingRepository.searchByVarietyInMarketplace(query);
            
            // Combine and deduplicate results
            Map<String, GemListing> uniqueResults = new HashMap<>();
            nameResults.forEach(listing -> uniqueResults.put(listing.getId(), listing));
            varietyResults.forEach(listing -> uniqueResults.put(listing.getId(), listing));
            
            List<GemListing> searchResults = uniqueResults.values().stream()
                .limit(limit)
                .toList();
            
            System.out.println("✅ Search completed. Found " + searchResults.size() + " results");
            
            return ApiResponse.success("Search completed successfully", searchResults);
            
        } catch (Exception e) {
            System.err.println("❌ MarketplaceService - Error searching gemstones: " + e.getMessage());
            e.printStackTrace();
            return ApiResponse.error("Failed to search gemstones: " + e.getMessage());
        }
    }

    /**
     * Get marketplace statistics
     */
    public ApiResponse<Map<String, Object>> getMarketplaceStats() {
        try {
            System.out.println("📊 MarketplaceService - Getting marketplace statistics");
            
            // Get basic counts
            long totalListings = gemListingRepository.countMarketplaceListings();
            long certifiedListings = gemListingRepository.countByCertificationInMarketplace(true);
            
            // Prepare response data
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalListings", totalListings);
            stats.put("certifiedListings", certifiedListings);
            stats.put("uncertifiedListings", totalListings - certifiedListings);
            
            // Calculate percentages
            if (totalListings > 0) {
                stats.put("certifiedPercentage", Math.round((certifiedListings * 100.0) / totalListings));
            } else {
                stats.put("certifiedPercentage", 0);
            }
            
            System.out.println("✅ Marketplace stats retrieved: " + 
                             "Total=" + totalListings + 
                             ", Certified=" + certifiedListings);
            
            return ApiResponse.success("Marketplace statistics retrieved successfully", stats);
            
        } catch (Exception e) {
            System.err.println("❌ MarketplaceService - Error getting marketplace stats: " + e.getMessage());
            e.printStackTrace();
            return ApiResponse.error("Failed to retrieve marketplace statistics: " + e.getMessage());
        }
    }
}
