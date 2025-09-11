package com.gemnet.service;

import com.gemnet.model.GemListing;
import com.gemnet.repository.GemListingRepository;
import com.gemnet.dto.PricePredictionRequest;
import com.gemnet.dto.PricePredictionResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service to update marketplace gem listings with Sri Lankan market pricing
 */
@Service
public class GemListingPriceUpdateService {
    
    private static final Logger logger = LoggerFactory.getLogger(GemListingPriceUpdateService.class);
    
    @Autowired
    private GemListingRepository gemListingRepository;
    
    @Autowired
    private SriLankanMarketPriceService sriLankanMarketPriceService;
    
    @Autowired
    private PricePredictionService pricePredictionService;
    
    /**
     * Update all marketplace gem listings with Sri Lankan market pricing
     */
    public MarketplaceUpdateResult updateAllListingsWithSriLankanPricing() {
        logger.info("🇱🇰 Starting marketplace price update with Sri Lankan market data...");
        
        try {
            List<GemListing> activeListings = getActiveListings();
            logger.info("Found {} active marketplace listings to update", activeListings.size());
            
            int totalListings = activeListings.size();
            int updatedCount = 0;
            int highConfidenceCount = 0;
            int mediumConfidenceCount = 0;
            int lowConfidenceCount = 0;
            
            for (GemListing listing : activeListings) {
                try {
                    // Create prediction request from listing attributes
                    PricePredictionRequest request = createRequestFromListing(listing);
                    
                    // Get Sri Lankan market prediction
                    PricePredictionResponse sriLankanPrediction = 
                        sriLankanMarketPriceService.predictSriLankanPrice(request);
                    
                    // Update listing with new pricing if significant improvement
                    boolean wasUpdated = updateListingPricing(listing, sriLankanPrediction);
                    
                    if (wasUpdated) {
                        updatedCount++;
                        
                        // Track confidence levels
                        double accuracy = sriLankanPrediction.getAccuracyScore() != null ? 
                            sriLankanPrediction.getAccuracyScore() : 0.0;
                        
                        if (accuracy >= 0.8) {
                            highConfidenceCount++;
                        } else if (accuracy >= 0.6) {
                            mediumConfidenceCount++;
                        } else {
                            lowConfidenceCount++;
                        }
                    }
                    
                } catch (Exception e) {
                    logger.warn("Failed to update pricing for listing {}: {}", 
                               listing.getId(), e.getMessage());
                }
            }
            
            logger.info("✅ Marketplace price update completed:");
            logger.info("   Total listings processed: {}", totalListings);
            logger.info("   Successfully updated: {}", updatedCount);
            logger.info("   High confidence (80%+): {}", highConfidenceCount);
            logger.info("   Medium confidence (60-79%): {}", mediumConfidenceCount);
            logger.info("   Low confidence (<60%): {}", lowConfidenceCount);
            
            return new MarketplaceUpdateResult(
                totalListings, updatedCount, highConfidenceCount, 
                mediumConfidenceCount, lowConfidenceCount
            );
            
        } catch (Exception e) {
            logger.error("❌ Error during marketplace price update", e);
            return new MarketplaceUpdateResult(0, 0, 0, 0, 0);
        }
    }
    
    /**
     * Update a specific listing with Sri Lankan market pricing
     */
    public boolean updateSpecificListing(String listingId) {
        logger.info("🔄 Updating specific listing {} with Sri Lankan pricing", listingId);
        
        try {
            Optional<GemListing> listingOpt = gemListingRepository.findById(listingId);
            if (!listingOpt.isPresent()) {
                logger.warn("Listing not found: {}", listingId);
                return false;
            }
            
            GemListing listing = listingOpt.get();
            PricePredictionRequest request = createRequestFromListing(listing);
            PricePredictionResponse prediction = sriLankanMarketPriceService.predictSriLankanPrice(request);
            
            return updateListingPricing(listing, prediction);
            
        } catch (Exception e) {
            logger.error("Error updating listing {}: {}", listingId, e.getMessage());
            return false;
        }
    }
    
    /**
     * Get active listings for update
     */
    private List<GemListing> getActiveListings() {
        return gemListingRepository.findAll()
                .stream()
                .filter(listing -> listing.getIsActive() && 
                        ("APPROVED".equals(listing.getListingStatus()) || "ACTIVE".equals(listing.getListingStatus())))
                .collect(Collectors.toList());
    }
    
    /**
     * Create prediction request from gem listing attributes
     */
    private PricePredictionRequest createRequestFromListing(GemListing listing) {
        PricePredictionRequest request = new PricePredictionRequest();
        
        // Map basic attributes
        request.setCarat(parseCaratFromWeight(listing.getWeight()));
        request.setSpecies(mapVarietyToSpecies(listing.getVariety()));
        request.setColor(listing.getColor());
        request.setCut(listing.getCut());
        request.setClarity(listing.getClarity());
        request.setShape(listing.getShape());
        request.setOrigin("Sri Lanka"); // Assume Sri Lankan origin for local marketplace
        
        // Map treatment info
        request.setTreatment(mapTreatmentInfo(listing));
        
        // Certification status
        request.setIsCertified(listing.getIsCertified() != null ? listing.getIsCertified() : false);
        
        // Parse measurements if available
        if (listing.getMeasurements() != null && !listing.getMeasurements().isEmpty()) {
            parseMeasurements(listing.getMeasurements(), request);
        }
        
        return request;
    }
    
    /**
     * Parse carat from weight string
     */
    private Double parseCaratFromWeight(String weight) {
        if (weight == null) return 1.0;
        try {
            // Extract numeric value from weight string
            String numericPart = weight.replaceAll("[^0-9.]", "");
            return Double.parseDouble(numericPart);
        } catch (Exception e) {
            return 1.0; // Default to 1 carat
        }
    }
    
    /**
     * Map variety to species for Sri Lankan dataset
     */
    private String mapVarietyToSpecies(String variety) {
        if (variety == null) return "Corundum";
        
        String var = variety.toLowerCase();
        if (var.contains("sapphire") || var.contains("ruby") || var.contains("corundum")) {
            return "Corundum";
        }
        if (var.contains("spinel")) {
            return "Spinel";
        }
        if (var.contains("emerald") || var.contains("beryl")) {
            return "Beryl";
        }
        if (var.contains("garnet")) {
            return "Garnet";
        }
        if (var.contains("tourmaline")) {
            return "Tourmaline";
        }
        if (var.contains("quartz")) {
            return "Quartz";
        }
        
        return "Corundum"; // Default to most common
    }
    
    /**
     * Map treatment information
     */
    private String mapTreatmentInfo(GemListing listing) {
        String treatment = listing.getTreatment();
        if (treatment == null) return "Natural";
        
        treatment = treatment.toLowerCase();
        if (treatment.contains("heat") || treatment.contains("heated")) {
            return "Heated";
        }
        if (treatment.contains("natural") || treatment.contains("unheated") || treatment.contains("untreated")) {
            return "Natural";
        }
        
        return "Natural"; // Default assumption
    }
    
    /**
     * Parse measurements string into individual dimensions
     */
    private void parseMeasurements(String measurements, PricePredictionRequest request) {
        try {
            // Expected format: "length x width x depth" or "length x width"
            String[] parts = measurements.split("x|×|X");
            if (parts.length >= 2) {
                request.setLength(Double.parseDouble(parts[0].trim()));
                request.setWidth(Double.parseDouble(parts[1].trim()));
                if (parts.length >= 3) {
                    request.setDepth(Double.parseDouble(parts[2].trim()));
                }
            }
        } catch (Exception e) {
            logger.debug("Could not parse measurements: {}", measurements);
        }
    }
    
    /**
     * Update listing pricing with Sri Lankan market prediction
     */
    private boolean updateListingPricing(GemListing listing, PricePredictionResponse prediction) {
        try {
            // Only update if we have good confidence and data
            if (prediction.getAccuracyScore() == null || prediction.getAccuracyScore() < 0.5) {
                logger.debug("Skipping low-confidence prediction for listing {}", listing.getId());
                return false;
            }
            
            // Store original price for comparison
            BigDecimal originalPrice = listing.getPrice();
            BigDecimal newPrice = prediction.getPredictedPrice();
            
            // Apply reasonable bounds (don't change price by more than 200%)
            if (originalPrice != null && newPrice != null) {
                BigDecimal ratio = newPrice.divide(originalPrice, 2, BigDecimal.ROUND_HALF_UP);
                if (ratio.compareTo(BigDecimal.valueOf(3.0)) > 0 || 
                    ratio.compareTo(BigDecimal.valueOf(0.3)) < 0) {
                    logger.debug("Price change too dramatic for listing {}, skipping", listing.getId());
                    return false;
                }
            }
            
            // Update pricing and metadata
            listing.setPrice(newPrice);
            listing.setPricingMethod(prediction.getMethodUsed());
            listing.setPricingConfidence(prediction.getAccuracyScore());
            listing.setMarketInsights(prediction.getMarketInsights());
            listing.setDataPointsUsed(prediction.getDataPoints());
            listing.setLastPriceUpdate(LocalDateTime.now());
            
            // Add market analysis to description
            updateDescriptionWithMarketAnalysis(listing, prediction);
            
            // Save updated listing
            gemListingRepository.save(listing);
            
            logger.info("✅ Updated listing {}: {} → {} LKR ({}% confidence)", 
                       listing.getId(),
                       originalPrice != null ? originalPrice : "N/A",
                       newPrice,
                       Math.round(prediction.getAccuracyScore() * 100));
            
            return true;
            
        } catch (Exception e) {
            logger.error("Error updating listing pricing: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * Add market analysis information to listing description
     */
    private void updateDescriptionWithMarketAnalysis(GemListing listing, PricePredictionResponse prediction) {
        String significanceInfo = String.format(
            "\n\n📊 Sri Lankan Market Analysis: %.1f%% accuracy using %d comparable gemstones. %s",
            (prediction.getAccuracyScore() * 100),
            prediction.getDataPoints() != null ? prediction.getDataPoints() : 0,
            prediction.getMarketInsights() != null ? prediction.getMarketInsights() : ""
        );
        
        String currentDescription = listing.getDescription() != null ? listing.getDescription() : "";
        if (!currentDescription.contains("Sri Lankan Market Analysis:")) {
            listing.setDescription(currentDescription + significanceInfo);
        }
    }
    
    /**
     * Get marketplace statistics after Sri Lankan price integration
     */
    public MarketplaceStats getMarketplaceStats() {
        try {
            List<GemListing> activeListings = gemListingRepository.findByIsActive(true);
            
            int totalActiveListings = activeListings.size();
            int sriLankanPriced = 0;
            int highConfidence = 0;
            int mediumConfidence = 0;
            int lowConfidence = 0;
            
            for (GemListing listing : activeListings) {
                if (listing.getPricingConfidence() != null) {
                    sriLankanPriced++;
                    double confidence = listing.getPricingConfidence();
                    if (confidence >= 0.8) highConfidence++;
                    else if (confidence >= 0.6) mediumConfidence++;
                    else lowConfidence++;
                }
            }
            
            double coveragePercentage = totalActiveListings > 0 ? 
                ((double) sriLankanPriced / totalActiveListings) * 100 : 0;
            
            return new MarketplaceStats(
                totalActiveListings, sriLankanPriced, coveragePercentage,
                highConfidence, mediumConfidence, lowConfidence
            );
            
        } catch (Exception e) {
            logger.error("Error calculating marketplace stats", e);
            return new MarketplaceStats(0, 0, 0.0, 0, 0, 0);
        }
    }
    
    /**
     * Update result container class
     */
    public static class MarketplaceUpdateResult {
        private final int totalListings;
        private final int updatedListings;
        private final int highConfidencePredictions;
        private final int mediumConfidencePredictions;
        private final int lowConfidencePredictions;
        
        public MarketplaceUpdateResult(int totalListings, int updatedListings,
                                     int highConfidencePredictions, int mediumConfidencePredictions,
                                     int lowConfidencePredictions) {
            this.totalListings = totalListings;
            this.updatedListings = updatedListings;
            this.highConfidencePredictions = highConfidencePredictions;
            this.mediumConfidencePredictions = mediumConfidencePredictions;
            this.lowConfidencePredictions = lowConfidencePredictions;
        }
        
        // Getters
        public int getTotalListings() { return totalListings; }
        public int getUpdatedListings() { return updatedListings; }
        public int getHighConfidencePredictions() { return highConfidencePredictions; }
        public int getMediumConfidencePredictions() { return mediumConfidencePredictions; }
        public int getLowConfidencePredictions() { return lowConfidencePredictions; }
        
        public double getUpdatePercentage() {
            return totalListings > 0 ? (double) updatedListings / totalListings * 100 : 0;
        }
    }
    
    /**
     * Statistics container class
     */
    public static class MarketplaceStats {
        private final int totalActiveListings;
        private final int listingsWithSriLankanPricing;
        private final double coveragePercentage;
        private final int highConfidenceListings;
        private final int mediumConfidenceListings;
        private final int lowConfidenceListings;
        
        public MarketplaceStats(int totalActiveListings, int listingsWithSriLankanPricing,
                               double coveragePercentage, int highConfidenceListings,
                               int mediumConfidenceListings, int lowConfidenceListings) {
            this.totalActiveListings = totalActiveListings;
            this.listingsWithSriLankanPricing = listingsWithSriLankanPricing;
            this.coveragePercentage = coveragePercentage;
            this.highConfidenceListings = highConfidenceListings;
            this.mediumConfidenceListings = mediumConfidenceListings;
            this.lowConfidenceListings = lowConfidenceListings;
        }
        
        // Getters
        public int getTotalActiveListings() { return totalActiveListings; }
        public int getListingsWithSriLankanPricing() { return listingsWithSriLankanPricing; }
        public double getCoveragePercentage() { return coveragePercentage; }
        public int getHighConfidenceListings() { return highConfidenceListings; }
        public int getMediumConfidenceListings() { return mediumConfidenceListings; }
        public int getLowConfidenceListings() { return lowConfidenceListings; }
    }
}
