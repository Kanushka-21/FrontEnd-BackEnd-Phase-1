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
            // ALWAYS include sold items by default to show complete marketplace
            boolean forceIncludeSold = true;
            System.out.println("🔍 MarketplaceService - Getting marketplace listings (forcibly including sold items for complete view)");
            System.out.println("📋 Filters - Search: " + search + ", Category: " + category + ", MinPrice: " + minPrice + ", MaxPrice: " + maxPrice + ", CertifiedOnly: " + certifiedOnly);
            
            Page<GemListing> listingsPage;
            
            // Get base listings (all approved/active including sold)
            listingsPage = gemListingRepository.findAllMarketplaceListings(pageable);
            
            // Apply filters in memory (more flexible for complex filtering)
            List<GemListing> filteredList = listingsPage.getContent().stream()
                .filter(listing -> {
                    // Search filter - check multiple fields
                    boolean searchMatch = true;
                    if (search != null && !search.trim().isEmpty()) {
                        String searchLower = search.toLowerCase();
                        searchMatch = listing.getGemName().toLowerCase().contains(searchLower) ||
                                    listing.getSpecies().toLowerCase().contains(searchLower) ||
                                    listing.getVariety().toLowerCase().contains(searchLower) ||
                                    listing.getColor().toLowerCase().contains(searchLower) ||
                                    (listing.getCategory() != null && listing.getCategory().toLowerCase().contains(searchLower));
                    }
                    
                    // Category filter - check multiple category-related fields
                    boolean categoryMatch = true;
                    if (category != null && !category.trim().isEmpty()) {
                        String[] categories = category.split(",");
                        categoryMatch = false; // Start with false, then OR the conditions
                        
                        for (String cat : categories) {
                            String catLower = cat.trim().toLowerCase();
                            if (listing.getSpecies().toLowerCase().contains(catLower) ||
                                listing.getVariety().toLowerCase().contains(catLower) ||
                                listing.getColor().toLowerCase().contains(catLower) ||
                                (listing.getCategory() != null && listing.getCategory().toLowerCase().contains(catLower))) {
                                categoryMatch = true;
                                break;
                            }
                        }
                    }
                    
                    // Price filters
                    boolean minPriceMatch = minPrice == null || listing.getPrice().doubleValue() >= minPrice;
                    boolean maxPriceMatch = maxPrice == null || listing.getPrice().doubleValue() <= maxPrice;
                    
                    // Certification filter
                    boolean certMatch = !certifiedOnly || listing.getIsCertified();
                    
                    boolean finalMatch = searchMatch && categoryMatch && minPriceMatch && maxPriceMatch && certMatch;
                    
                    if (!finalMatch) {
                        System.out.println("🚫 Filtered out: " + listing.getGemName() + " - Search:" + searchMatch + ", Cat:" + categoryMatch + ", MinP:" + minPriceMatch + ", MaxP:" + maxPriceMatch + ", Cert:" + certMatch);
                    }
                    
                    return finalMatch;
                })
                .toList();
            
            System.out.println("✅ Filtering results: " + listingsPage.getContent().size() + " → " + filteredList.size() + " listings after filters");
            
            // Prepare response data using filtered results
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("listings", filteredList);
            responseData.put("currentPage", listingsPage.getNumber());
            responseData.put("totalPages", listingsPage.getTotalPages());
            responseData.put("totalElements", (long) filteredList.size()); // Use filtered count
            responseData.put("pageSize", listingsPage.getSize());
            responseData.put("hasNext", listingsPage.hasNext());
            responseData.put("hasPrevious", listingsPage.hasPrevious());
            responseData.put("actualFilteredCount", filteredList.size()); // Add debug info
            responseData.put("originalTotalCount", listingsPage.getTotalElements()); // Add debug info
            
            System.out.println("✅ Retrieved " + filteredList.size() + 
                             " filtered marketplace listings out of " + listingsPage.getTotalElements() + " total");
            
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
