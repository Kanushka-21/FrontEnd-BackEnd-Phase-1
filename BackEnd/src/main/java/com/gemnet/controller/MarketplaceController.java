package com.gemnet.controller;

import com.gemnet.dto.ApiResponse;
import com.gemnet.model.GemListing;
import com.gemnet.model.GemImage;
import com.gemnet.repository.GemListingRepository;
import com.gemnet.service.MarketplaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.ArrayList;

/**
 * Controller for marketplace operations
 */
@RestController
@RequestMapping("/api/marketplace")
@Tag(name = "Marketplace", description = "Marketplace and gemstone listing APIs")
@CrossOrigin(origins = "*")
public class MarketplaceController {

    @Autowired
    private MarketplaceService marketplaceService;
    
    @Autowired
    private GemListingRepository gemListingRepository;

    /**
     * Get all approved gemstone listings for marketplace
     */
    @GetMapping("/listings")
    @Operation(summary = "Get marketplace listings", 
               description = "Retrieve all approved and active gemstone listings for marketplace")
    @CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET})
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMarketplaceListings(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "12") int size,
            @RequestParam(value = "sortBy", defaultValue = "createdAt") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "desc") String sortDir,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "minPrice", required = false) Double minPrice,
            @RequestParam(value = "maxPrice", required = false) Double maxPrice,
            @RequestParam(value = "certifiedOnly", defaultValue = "false") boolean certifiedOnly,
            @RequestParam(value = "includeSold", defaultValue = "true") boolean includeSold) {
        
        System.out.println("🛒 Marketplace - Getting listings request received");
        System.out.println("📄 Page: " + page + ", Size: " + size);
        System.out.println("🔍 Search: " + search + ", Category: " + category);
        System.out.println("💰 Price range: " + minPrice + " - " + maxPrice);
        System.out.println("🛍️ Include sold items: " + includeSold);
        
        try {
            // Create pageable object with sorting
            Sort.Direction direction = "desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
            
            // Get marketplace listings from service
            ApiResponse<Map<String, Object>> serviceResponse = marketplaceService.getMarketplaceListings(
                pageable, search, category, minPrice, maxPrice, certifiedOnly, includeSold);
            
            if (serviceResponse.isSuccess()) {
                System.out.println("✅ Successfully retrieved marketplace listings");
                return ResponseEntity.ok(serviceResponse);
            } else {
                System.err.println("❌ Service error: " + serviceResponse.getMessage());
                return ResponseEntity.status(500).body(serviceResponse);
            }
            
        } catch (Exception e) {
            System.err.println("❌ Get marketplace listings error: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to retrieve marketplace listings: " + e.getMessage()));
        }
    }

    /**
     * Get gemstone listing details by ID
     */
    @GetMapping("/listings/{listingId}")
    @Operation(summary = "Get listing details", 
               description = "Get detailed information about a specific gemstone listing")
    @CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET})
    public ResponseEntity<ApiResponse<Object>> getListingDetails(
            @PathVariable String listingId) {
        
        System.out.println("🔍 Marketplace - Get listing details request received");
        System.out.println("🆔 Listing ID: " + listingId);
        
        try {
            // First, let's check if the listing exists at all (for debugging)
            Optional<GemListing> rawListing = gemListingRepository.findById(listingId);
            if (!rawListing.isPresent()) {
                System.err.println("❌ Listing not found in database with ID: " + listingId);
                return ResponseEntity.status(404)
                    .body(ApiResponse.error("Listing not found with ID: " + listingId));
            }
            
            GemListing listing = rawListing.get();
            System.out.println("📋 Found listing: " + listing.getGemName());
            System.out.println("📋 Listing status: " + listing.getListingStatus());
            System.out.println("📋 Is active: " + listing.getIsActive());
            System.out.println("📋 Images count: " + (listing.getImages() != null ? listing.getImages().size() : 0));
            
            // DEBUG: Detailed video inspection
            if (listing.getImages() != null && !listing.getImages().isEmpty()) {
                System.out.println("🎬 Detailed images inspection:");
                for (int i = 0; i < listing.getImages().size(); i++) {
                    GemImage img = listing.getImages().get(i);
                    System.out.println("🎬 Image " + i + ":");
                    System.out.println("  - Media Type: " + img.getMediaType());
                    System.out.println("  - Image URL: " + img.getImageUrl());
                    System.out.println("  - Video URL: " + img.getVideoUrl());
                    System.out.println("  - Video Format: " + img.getVideoFormat());
                    System.out.println("  - Is Video: " + img.isVideo());
                }
            } else {
                System.out.println("❌ No images found in listing");
            }
            
            // ENHANCEMENT: Enhance listing with explicit video data for frontend compatibility
            System.out.println("🔧 ENHANCEMENT: Adding explicit video support to response");
            
            // Extract videos from GemImage objects
            List<String> videoUrls = new ArrayList<>();
            if (listing.getImages() != null) {
                for (GemImage img : listing.getImages()) {
                    if (img.isVideo() && img.getVideoUrl() != null && !img.getVideoUrl().isEmpty()) {
                        videoUrls.add(img.getVideoUrl());
                        System.out.println("🎬 Found video: " + img.getVideoUrl());
                    }
                }
            }
            
            System.out.println("🎬 Total videos found: " + videoUrls.size());
            
            // Get listing details from service
            ApiResponse<GemListing> serviceResponse = marketplaceService.getListingDetails(listingId);
            
            if (serviceResponse.isSuccess()) {
                GemListing responseListing = serviceResponse.getData();
                
                // CRITICAL FIX: Add video URLs directly to the listing object for frontend access
                // We'll create a custom field that the frontend can easily access
                if (!videoUrls.isEmpty()) {
                    System.out.println("🔧 CRITICAL FIX: Adding " + videoUrls.size() + " videos to listing response");
                    
                    // Create a map with enhanced data
                    Map<String, Object> enhancedResponse = new HashMap<>();
                    enhancedResponse.put("gemstone", responseListing);
                    enhancedResponse.put("videos", videoUrls);
                    enhancedResponse.put("hasVideos", true);
                    enhancedResponse.put("videoCount", videoUrls.size());
                    
                    return ResponseEntity.ok(ApiResponse.success("Listing details with videos", enhancedResponse));
                }
                
                System.out.println("✅ Successfully retrieved listing details (no videos)");
                return ResponseEntity.ok(ApiResponse.success(serviceResponse.getMessage(), (Object) serviceResponse.getData()));
            } else {
                System.err.println("❌ Service error: " + serviceResponse.getMessage());
                
                // For debugging, let's return the raw listing even if service validation fails
                System.out.println("🔧 DEBUG: Returning raw listing for debugging purposes");
                
                // Still add video enhancement to debug response
                if (!videoUrls.isEmpty()) {
                    Map<String, Object> debugResponse = new HashMap<>();
                    debugResponse.put("gemstone", listing);
                    debugResponse.put("videos", videoUrls);
                    debugResponse.put("hasVideos", true);
                    debugResponse.put("videoCount", videoUrls.size());
                    debugResponse.put("debugMode", true);
                    
                    return ResponseEntity.ok(ApiResponse.success("Raw listing data with videos (debug mode)", debugResponse));
                }
                
                return ResponseEntity.ok(ApiResponse.success("Raw listing data (debug mode)", listing));
            }
            
        } catch (Exception e) {
            System.err.println("❌ Get listing details error: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to retrieve listing details: " + e.getMessage()));
        }
    }

    /**
     * Search gemstones by name
     */
    @GetMapping("/search")
    @Operation(summary = "Search gemstones", 
               description = "Search gemstones by name, variety, or category")
    @CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET})
    public ResponseEntity<ApiResponse<List<GemListing>>> searchGemstones(
            @RequestParam("q") String query,
            @RequestParam(value = "limit", defaultValue = "10") int limit) {
        
        System.out.println("🔍 Marketplace - Search request received");
        System.out.println("📝 Query: " + query + ", Limit: " + limit);
        
        try {
            // Search gemstones from service
            ApiResponse<List<GemListing>> serviceResponse = marketplaceService.searchGemstones(query, limit);
            
            if (serviceResponse.isSuccess()) {
                System.out.println("✅ Successfully retrieved search results");
                return ResponseEntity.ok(serviceResponse);
            } else {
                System.err.println("❌ Service error: " + serviceResponse.getMessage());
                return ResponseEntity.status(500).body(serviceResponse);
            }
            
        } catch (Exception e) {
            System.err.println("❌ Search gemstones error: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to search gemstones: " + e.getMessage()));
        }
    }

    /**
     * DEBUG: Get raw listing data for inspection
     */
    @GetMapping("/listings/{listingId}/debug")
    @Operation(summary = "Debug listing data", 
               description = "Get raw listing data for debugging purposes")
    @CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET})
    public ResponseEntity<ApiResponse<Map<String, Object>>> debugListingData(
            @PathVariable String listingId) {
        
        System.out.println("🔧 DEBUG - Raw listing data request for ID: " + listingId);
        
        try {
            Optional<GemListing> optionalListing = gemListingRepository.findById(listingId);
            
            if (!optionalListing.isPresent()) {
                return ResponseEntity.status(404)
                    .body(ApiResponse.error("Listing not found"));
            }
            
            GemListing listing = optionalListing.get();
            
            Map<String, Object> debugData = new HashMap<>();
            debugData.put("id", listing.getId());
            debugData.put("gemName", listing.getGemName());
            debugData.put("listingStatus", listing.getListingStatus());
            debugData.put("isActive", listing.getIsActive());
            debugData.put("totalImages", listing.getImages() != null ? listing.getImages().size() : 0);
            
            // Detailed images inspection
            if (listing.getImages() != null) {
                List<Map<String, Object>> imagesDebug = new ArrayList<>();
                for (int i = 0; i < listing.getImages().size(); i++) {
                    GemImage img = listing.getImages().get(i);
                    Map<String, Object> imgData = new HashMap<>();
                    imgData.put("index", i);
                    imgData.put("mediaType", img.getMediaType());
                    imgData.put("imageUrl", img.getImageUrl());
                    imgData.put("videoUrl", img.getVideoUrl());
                    imgData.put("videoFormat", img.getVideoFormat());
                    imgData.put("isVideo", img.isVideo());
                    imgData.put("hasVideoUrl", img.getVideoUrl() != null && !img.getVideoUrl().isEmpty());
                    imagesDebug.add(imgData);
                }
                debugData.put("imagesDetails", imagesDebug);
            }
            
            return ResponseEntity.ok(ApiResponse.success("Debug data retrieved", debugData));
            
        } catch (Exception e) {
            System.err.println("❌ Debug listing error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Debug failed: " + e.getMessage()));
        }
    }
    @GetMapping("/stats")
    @Operation(summary = "Get marketplace statistics", 
               description = "Get statistics about marketplace listings")
    @CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET})
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMarketplaceStats() {
        
        System.out.println("📊 Marketplace - Stats request received");
        
        try {
            // Get statistics from service
            ApiResponse<Map<String, Object>> serviceResponse = marketplaceService.getMarketplaceStats();
            
            if (serviceResponse.isSuccess()) {
                System.out.println("✅ Successfully retrieved marketplace stats");
                return ResponseEntity.ok(serviceResponse);
            } else {
                System.err.println("❌ Service error: " + serviceResponse.getMessage());
                return ResponseEntity.status(500).body(serviceResponse);
            }
            
        } catch (Exception e) {
            System.err.println("❌ Get marketplace stats error: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to retrieve marketplace stats: " + e.getMessage()));
        }
    }
}
