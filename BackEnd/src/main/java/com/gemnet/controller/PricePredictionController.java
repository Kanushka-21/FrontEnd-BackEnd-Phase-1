package com.gemnet.controller;

import com.gemnet.dto.PricePredictionRequest;
import com.gemnet.dto.PricePredictionResponse;
import com.gemnet.service.PricePredictionService;
import com.gemnet.service.GemListingService;
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
     * Health check endpoint for price prediction service
     */
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Price prediction service is running");
    }
}
