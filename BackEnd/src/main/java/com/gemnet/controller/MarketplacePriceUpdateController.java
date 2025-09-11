package com.gemnet.controller;

import com.gemnet.service.GemListingPriceUpdateService;
import com.gemnet.service.GemListingPriceUpdateService.MarketplaceStats;
import com.gemnet.service.GemListingPriceUpdateService.MarketplaceUpdateResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller for Sri Lankan marketplace price updates
 */
@RestController
@RequestMapping("/api/marketplace")
@CrossOrigin(origins = "*")
public class MarketplacePriceUpdateController {
    
    private static final Logger logger = LoggerFactory.getLogger(MarketplacePriceUpdateController.class);
    
    @Autowired
    private GemListingPriceUpdateService priceUpdateService;
    
    /**
     * Update all marketplace listings with Sri Lankan market pricing
     */
    @PostMapping("/update-prices")
    public ResponseEntity<Map<String, Object>> updateMarketplacePrices() {
        logger.info("🇱🇰 Received request to update marketplace prices with Sri Lankan data");
        
        try {
            // Trigger the price update process
            MarketplaceUpdateResult result = priceUpdateService.updateAllListingsWithSriLankanPricing();
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Marketplace prices updated with Sri Lankan market data");
            response.put("statistics", Map.of(
                "totalListings", result.getTotalListings(),
                "updatedWithSriLankanData", result.getUpdatedListings(),
                "updatePercentage", Math.round(result.getUpdatePercentage() * 100) / 100.0,
                "highConfidencePredictions", result.getHighConfidencePredictions(),
                "mediumConfidencePredictions", result.getMediumConfidencePredictions(),
                "lowConfidencePredictions", result.getLowConfidencePredictions()
            ));
            
            logger.info("✅ Marketplace price update completed successfully");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("❌ Error updating marketplace prices", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", "Failed to update marketplace prices: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Update a specific listing with Sri Lankan market pricing
     */
    @PostMapping("/update-listing/{listingId}")
    public ResponseEntity<Map<String, Object>> updateSpecificListing(@PathVariable String listingId) {
        logger.info("🔄 Updating specific listing {} with Sri Lankan pricing", listingId);
        
        try {
            boolean success = priceUpdateService.updateSpecificListing(listingId);
            
            Map<String, Object> response = new HashMap<>();
            if (success) {
                response.put("status", "success");
                response.put("message", "Listing updated with Sri Lankan market data");
                response.put("listingId", listingId);
            } else {
                response.put("status", "warning");
                response.put("message", "Listing could not be updated (may be low confidence or not found)");
                response.put("listingId", listingId);
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("❌ Error updating listing {}", listingId, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", "Failed to update listing: " + e.getMessage());
            errorResponse.put("listingId", listingId);
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Get marketplace statistics showing Sri Lankan data integration
     */
    @GetMapping("/sri-lankan-stats")
    public ResponseEntity<Map<String, Object>> getMarketplaceStats() {
        try {
            MarketplaceStats stats = priceUpdateService.getMarketplaceStats();
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("statistics", Map.of(
                "totalActiveListings", stats.getTotalActiveListings(),
                "listingsWithSriLankanPricing", stats.getListingsWithSriLankanPricing(),
                "coveragePercentage", Math.round(stats.getCoveragePercentage() * 100) / 100.0,
                "confidenceLevels", Map.of(
                    "high", stats.getHighConfidenceListings(),
                    "medium", stats.getMediumConfidenceListings(),
                    "low", stats.getLowConfidenceListings()
                )
            ));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("❌ Error getting marketplace stats", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", "Failed to get marketplace statistics: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "healthy");
        response.put("service", "Sri Lankan Marketplace Price Update");
        
        return ResponseEntity.ok(response);
    }
}
