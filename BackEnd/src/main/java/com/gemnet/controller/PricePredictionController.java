package com.gemnet.controller;

import com.gemnet.dto.PricePredictionRequest;
import com.gemnet.dto.PricePredictionResponse;
import com.gemnet.service.PricePredictionService;
import com.gemnet.service.GemListingService;
import com.gemnet.service.SriLankanMarketPriceService;
import com.gemnet.model.GemListing;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

/**
 * REST Controller for gemstone price prediction
 */
@RestController
@RequestMapping("/api/predictions")
@CrossOrigin(origins = "*")
public class PricePredictionController {

    private static final Logger logger = LoggerFactory.getLogger(PricePredictionController.class);

    @Autowired
    private PricePredictionService pricePredictionService;

    @Autowired
    private GemListingService gemListingService;
    
    @Autowired
    private SriLankanMarketPriceService sriLankanMarketPriceService;

    /**
     * Predict price based on gemstone attributes
     */
    @PostMapping("/predict")
    public ResponseEntity<PricePredictionResponse> predictPrice(@Valid @RequestBody PricePredictionRequest request) {
        try {
            logger.info("Received price prediction request for: {} {}", request.getSpecies(), request.getCarat());
            
            PricePredictionResponse response = pricePredictionService.predictPrice(request);
            
            if ("ERROR".equals(response.getStatus())) {
                logger.error("Price prediction failed: {}", response.getMessage());
                return ResponseEntity.badRequest().body(response);
            }
            
            logger.info("Price prediction successful: {} LKR (range: {} - {})", 
                       response.getPredictedPrice(), response.getMinPrice(), response.getMaxPrice());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error in price prediction endpoint", e);
            PricePredictionResponse errorResponse = PricePredictionResponse.error("Internal server error: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Predict price for an existing gem listing
     */
    @GetMapping("/predict/{listingId}")
    public ResponseEntity<PricePredictionResponse> predictPriceForListing(@PathVariable String listingId) {
        try {
            logger.info("Received price prediction request for listing: {}", listingId);
            
            // Get the gem listing
            GemListing gemListing = gemListingService.getById(listingId);
            if (gemListing == null) {
                PricePredictionResponse errorResponse = PricePredictionResponse.error("Gem listing not found");
                return ResponseEntity.notFound().build();
            }
            
            // Predict price
            PricePredictionResponse response = pricePredictionService.predictPrice(gemListing);
            
            if ("ERROR".equals(response.getStatus())) {
                logger.error("Price prediction failed for listing {}: {}", listingId, response.getMessage());
                return ResponseEntity.badRequest().body(response);
            }
            
            logger.info("Price prediction successful for listing {}: {} LKR (range: {} - {})", 
                       listingId, response.getPredictedPrice(), response.getMinPrice(), response.getMaxPrice());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error in price prediction for listing: " + listingId, e);
            PricePredictionResponse errorResponse = PricePredictionResponse.error("Internal server error: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Get price prediction for multiple listings (bulk operation)
     */
    @PostMapping("/predict/bulk")
    public ResponseEntity<?> predictPricesForListings(@RequestBody java.util.List<String> listingIds) {
        try {
            logger.info("Received bulk price prediction request for {} listings", listingIds.size());
            
            java.util.Map<String, PricePredictionResponse> predictions = new java.util.HashMap<>();
            
            for (String listingId : listingIds) {
                try {
                    GemListing gemListing = gemListingService.getById(listingId);
                    if (gemListing != null) {
                        PricePredictionResponse response = pricePredictionService.predictPrice(gemListing);
                        predictions.put(listingId, response);
                    } else {
                        predictions.put(listingId, PricePredictionResponse.error("Listing not found"));
                    }
                } catch (Exception e) {
                    logger.error("Error predicting price for listing: " + listingId, e);
                    predictions.put(listingId, PricePredictionResponse.error("Prediction failed"));
                }
            }
            
            return ResponseEntity.ok(predictions);
            
        } catch (Exception e) {
            logger.error("Error in bulk price prediction", e);
            return ResponseEntity.internalServerError().body("Bulk prediction failed: " + e.getMessage());
        }
    }

    /**
     * Get accuracy analysis by comparing predicted prices with actual listing prices
     */
    @GetMapping("/accuracy-analysis")
    public ResponseEntity<?> getAccuracyAnalysis() {
        try {
            logger.info("Received request for price prediction accuracy analysis");
            
            // Get all gem listings (not just active ones for testing)
            java.util.List<GemListing> allListings = gemListingService.getAllListings();
            logger.info("Found {} total listings for accuracy analysis", allListings.size());
            
            // Filter for listings with pricing data
            java.util.List<GemListing> validListings = allListings.stream()
                .filter(listing -> listing.getPrice() != null && listing.getWeight() != null)
                .collect(java.util.stream.Collectors.toList());
            logger.info("Found {} listings with valid pricing data", validListings.size());
            
            java.util.List<java.util.Map<String, Object>> accuracyResults = new java.util.ArrayList<>();
            
            for (GemListing listing : validListings) {
                try {
                    // Get prediction for this listing
                    PricePredictionResponse prediction = pricePredictionService.predictPrice(listing);
                    
                    if (!"ERROR".equals(prediction.getStatus())) {
                        // Calculate accuracy percentage
                        double actualPrice = listing.getPrice().doubleValue();
                        double predictedPrice = prediction.getPredictedPrice().doubleValue();
                        double minPrice = prediction.getMinPrice().doubleValue();
                        double maxPrice = prediction.getMaxPrice().doubleValue();
                        
                        // Calculate accuracy based on how close predicted price is to actual price
                        double accuracyPercentage = calculateAccuracyPercentage(actualPrice, predictedPrice, minPrice, maxPrice);
                        
                        // Create result object
                        java.util.Map<String, Object> result = new java.util.HashMap<>();
                        result.put("listingId", listing.getId());
                        result.put("gemName", listing.getGemName());
                        result.put("species", listing.getSpecies());
                        result.put("weight", listing.getWeight());
                        result.put("color", listing.getColor());
                        result.put("actualPrice", actualPrice);
                        result.put("predictedPrice", predictedPrice);
                        result.put("priceRange", minPrice + " - " + maxPrice + " LKR");
                        result.put("accuracyPercentage", Math.round(accuracyPercentage * 100) / 100.0);
                        result.put("modelConfidence", Math.round(prediction.getConfidenceScore() * 100));
                        result.put("isCertified", listing.getIsCertified());
                        result.put("currency", listing.getCurrency());
                        
                        // Add accuracy grade
                        String accuracyGrade = getAccuracyGrade(accuracyPercentage);
                        result.put("accuracyGrade", accuracyGrade);
                        
                        accuracyResults.add(result);
                        
                        logger.info("Accuracy for {}: {}% (Actual: {} LKR, Predicted: {} LKR)", 
                                   listing.getGemName(), 
                                   Math.round(accuracyPercentage * 100) / 100.0, 
                                   actualPrice, 
                                   predictedPrice);
                    }
                    
                } catch (Exception e) {
                    logger.error("Error calculating accuracy for listing {}: {}", listing.getId(), e.getMessage());
                }
            }
            
            // Calculate overall statistics
            java.util.Map<String, Object> statistics = calculateOverallStatistics(accuracyResults);
            
            // Create response
            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("totalListings", accuracyResults.size());
            response.put("accuracyResults", accuracyResults);
            response.put("overallStatistics", statistics);
            response.put("status", "SUCCESS");
            response.put("message", "Accuracy analysis completed successfully");
            
            logger.info("Accuracy analysis completed for {} listings", accuracyResults.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error in accuracy analysis", e);
            java.util.Map<String, String> errorResponse = new java.util.HashMap<>();
            errorResponse.put("status", "ERROR");
            errorResponse.put("message", "Accuracy analysis failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    /**
     * Calculate accuracy percentage based on how close predicted price is to actual price
     */
    private double calculateAccuracyPercentage(double actualPrice, double predictedPrice, double minPrice, double maxPrice) {
        // Validate inputs to prevent NaN
        if (actualPrice <= 0 || predictedPrice <= 0 || minPrice < 0 || maxPrice <= 0) {
            return 0.0; // Invalid input, return 0% accuracy
        }
        
        // Method 1: Check if actual price falls within predicted range
        boolean withinRange = actualPrice >= minPrice && actualPrice <= maxPrice;
        
        if (withinRange) {
            // If within range, calculate how close predicted price is to actual price
            double difference = Math.abs(actualPrice - predictedPrice);
            double relativeError = difference / actualPrice;
            return Math.max(0, 100 - (relativeError * 100));
        } else {
            // If outside range, calculate distance from nearest range boundary
            double distanceFromRange;
            if (actualPrice < minPrice) {
                distanceFromRange = minPrice - actualPrice;
            } else {
                distanceFromRange = actualPrice - maxPrice;
            }
            
            double relativeDistance = distanceFromRange / actualPrice;
            double accuracy = Math.max(0, 100 - (relativeDistance * 100));
            
            // Cap accuracy at 60% if outside predicted range
            return Math.min(accuracy, 60.0);
        }
    }
    
    /**
     * Get accuracy grade based on percentage
     */
    private String getAccuracyGrade(double accuracyPercentage) {
        if (accuracyPercentage >= 90) return "Excellent";
        if (accuracyPercentage >= 80) return "Very Good";
        if (accuracyPercentage >= 70) return "Good";
        if (accuracyPercentage >= 60) return "Fair";
        if (accuracyPercentage >= 40) return "Poor";
        return "Very Poor";
    }
    
    /**
     * Calculate overall statistics for accuracy results
     */
    private java.util.Map<String, Object> calculateOverallStatistics(java.util.List<java.util.Map<String, Object>> results) {
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        
        if (results.isEmpty()) {
            stats.put("averageAccuracy", 0.0);
            stats.put("highAccuracyCount", 0);
            stats.put("mediumAccuracyCount", 0);
            stats.put("lowAccuracyCount", 0);
            stats.put("highAccuracyPercentage", 0);
            stats.put("mediumAccuracyPercentage", 0);
            stats.put("lowAccuracyPercentage", 0);
            return stats;
        }
        
        double totalAccuracy = 0;
        int highAccuracy = 0; // >= 70%
        int mediumAccuracy = 0; // 40-69%
        int lowAccuracy = 0; // < 40%
        
        for (java.util.Map<String, Object> result : results) {
            Object accuracyObj = result.get("accuracyPercentage");
            if (accuracyObj != null && accuracyObj instanceof Double) {
                double accuracy = (Double) accuracyObj;
                
                // Validate accuracy value
                if (!Double.isNaN(accuracy) && Double.isFinite(accuracy)) {
                    totalAccuracy += accuracy;
                    
                    if (accuracy >= 70) {
                        highAccuracy++;
                    } else if (accuracy >= 40) {
                        mediumAccuracy++;
                    } else {
                        lowAccuracy++;
                    }
                }
            }
        }
        
        stats.put("averageAccuracy", Math.round((totalAccuracy / results.size()) * 100) / 100.0);
        stats.put("highAccuracyCount", highAccuracy);
        stats.put("mediumAccuracyCount", mediumAccuracy);
        stats.put("lowAccuracyCount", lowAccuracy);
        stats.put("highAccuracyPercentage", Math.round(((double) highAccuracy / results.size()) * 100));
        stats.put("mediumAccuracyPercentage", Math.round(((double) mediumAccuracy / results.size()) * 100));
        stats.put("lowAccuracyPercentage", Math.round(((double) lowAccuracy / results.size()) * 100));
        
        return stats;
    }

    /**
     * Health check endpoint for price prediction service
     */
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Price prediction service is running");
    }
    
    /**
     * Test endpoint for Sri Lankan market pricing
     */
    @PostMapping("/sri-lankan-test")
    public ResponseEntity<PricePredictionResponse> testSriLankanPricing(@Valid @RequestBody PricePredictionRequest request) {
        logger.info("🇱🇰 Testing Sri Lankan market pricing for: {}", request);
        
        try {
            // Force Sri Lankan market-enhanced prediction
            PricePredictionResponse response = pricePredictionService.predictPrice(request);
            
            logger.info("✅ Sri Lankan market test completed: {} LKR", response.getPredictedPrice());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("❌ Sri Lankan market pricing test failed", e);
            PricePredictionResponse errorResponse = PricePredictionResponse.error("Sri Lankan pricing test failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}
