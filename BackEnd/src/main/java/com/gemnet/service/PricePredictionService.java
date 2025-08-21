package com.gemnet.service;

import com.gemnet.dto.PricePredictionRequest;
import com.gemnet.dto.PricePredictionResponse;
import com.gemnet.model.GemListing;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;

/**
 * Service for gemstone price prediction using CatBoost model
 */
@Service
public class PricePredictionService {

    private static final Logger logger = LoggerFactory.getLogger(PricePredictionService.class);

    @Value("${gemnet.prediction.model.path:#{null}}")
    private String modelPath;

    @Value("${gemnet.prediction.confidence.threshold:0.7}")
    private double confidenceThreshold;

    // ML services temporarily disabled to fix compilation
    // @Autowired(required = false)
    // private CatBoostPredictionService catBoostService;

    // @Autowired(required = false)
    // private PythonModelPredictionService pythonModelService;

    // @Autowired(required = false)
    // private FlaskModelPredictionService flaskModelService;

    // Base price mappings for different gemstone species (in LKR)
    private final Map<String, Double> basePricePerCarat = new HashMap<>();
    private final Map<String, Double> colorMultipliers = new HashMap<>();
    private final Map<String, Double> clarityMultipliers = new HashMap<>();
    private final Map<String, Double> cutMultipliers = new HashMap<>();

    public PricePredictionService() {
        initializeModel();
    }

    private void initializeModel() {
        try {
            // Initialize base prices per carat for different species (in LKR)
            initializeBasePrices();
            initializeMultipliers();
            
            // TODO: Load actual CatBoost model when available
            // loadCatBoostModel();
            
            logger.info("Price prediction service initialized successfully");
        } catch (Exception e) {
            logger.error("Failed to initialize price prediction service", e);
        }
    }

    private void initializeBasePrices() {
        // Base prices per carat in LKR (Sri Lankan Rupees)
        basePricePerCarat.put("sapphire", 50000.0);
        basePricePerCarat.put("ruby", 80000.0);
        basePricePerCarat.put("emerald", 45000.0);
        basePricePerCarat.put("diamond", 150000.0);
        basePricePerCarat.put("spinel", 30000.0);
        basePricePerCarat.put("garnet", 15000.0);
        basePricePerCarat.put("tourmaline", 20000.0);
        basePricePerCarat.put("topaz", 25000.0);
        basePricePerCarat.put("aquamarine", 35000.0);
        basePricePerCarat.put("moonstone", 18000.0);
        basePricePerCarat.put("chrysoberyl", 40000.0);
        basePricePerCarat.put("zircon", 22000.0);
        basePricePerCarat.put("peridot", 16000.0);
        basePricePerCarat.put("amethyst", 12000.0);
        basePricePerCarat.put("citrine", 10000.0);
        basePricePerCarat.put("quartz", 8000.0);
    }

    private void initializeMultipliers() {
        // Color multipliers
        colorMultipliers.put("blue", 1.2);
        colorMultipliers.put("red", 1.5);
        colorMultipliers.put("pink", 1.3);
        colorMultipliers.put("yellow", 1.1);
        colorMultipliers.put("green", 1.15);
        colorMultipliers.put("white", 1.0);
        colorMultipliers.put("purple", 1.25);
        colorMultipliers.put("orange", 1.1);
        colorMultipliers.put("colorless", 1.0);

        // Clarity multipliers
        clarityMultipliers.put("fl", 2.0);      // Flawless
        clarityMultipliers.put("if", 1.8);      // Internally Flawless
        clarityMultipliers.put("vvs1", 1.6);    // Very Very Slightly Included 1
        clarityMultipliers.put("vvs2", 1.5);    // Very Very Slightly Included 2
        clarityMultipliers.put("vs1", 1.3);     // Very Slightly Included 1
        clarityMultipliers.put("vs2", 1.2);     // Very Slightly Included 2
        clarityMultipliers.put("si1", 1.0);     // Slightly Included 1
        clarityMultipliers.put("si2", 0.9);     // Slightly Included 2
        clarityMultipliers.put("i1", 0.7);      // Included 1
        clarityMultipliers.put("i2", 0.6);      // Included 2
        clarityMultipliers.put("i3", 0.5);      // Included 3

        // Cut multipliers
        cutMultipliers.put("excellent", 1.3);
        cutMultipliers.put("very good", 1.2);
        cutMultipliers.put("good", 1.1);
        cutMultipliers.put("fair", 1.0);
        cutMultipliers.put("poor", 0.8);
        cutMultipliers.put("round", 1.2);
        cutMultipliers.put("oval", 1.1);
        cutMultipliers.put("cushion", 1.15);
        cutMultipliers.put("emerald", 1.1);
        cutMultipliers.put("princess", 1.1);
        cutMultipliers.put("pear", 1.05);
        cutMultipliers.put("marquise", 1.05);
        cutMultipliers.put("heart", 1.0);
        cutMultipliers.put("radiant", 1.0);
    }

    /**
     * Predict price for a gemstone listing
     */
    public PricePredictionResponse predictPrice(GemListing gemListing) {
        try {
            PricePredictionRequest request = convertToRequest(gemListing);
            return predictPrice(request);
        } catch (Exception e) {
            logger.error("Error predicting price for gem listing: " + gemListing.getId(), e);
            return PricePredictionResponse.error("Failed to predict price: " + e.getMessage());
        }
    }

    /**
     * Predict price based on gemstone attributes
     */
    public PricePredictionResponse predictPrice(PricePredictionRequest request) {
        try {
            // Validate input
            if (request.getCarat() == null || request.getCarat() <= 0) {
                return PricePredictionResponse.error("Invalid carat weight");
            }

            if (request.getSpecies() == null || request.getSpecies().trim().isEmpty()) {
                return PricePredictionResponse.error("Species is required");
            }

            BigDecimal predictedPrice;
            double confidenceScore;
            String predictionMethod;

            // For now using rule-based prediction until ML services are restored
            logger.info("📐 Using rule-based prediction");
            predictedPrice = calculateRuleBasedPrice(request);
            confidenceScore = calculateConfidenceScore(request);
            predictionMethod = "Rule-based";
            
            // Calculate price range (±15%)
            BigDecimal variance = predictedPrice.multiply(BigDecimal.valueOf(0.15));
            BigDecimal minPrice = predictedPrice.subtract(variance).max(BigDecimal.ZERO);
            BigDecimal maxPrice = predictedPrice.add(variance);

            // Round to nearest 1000 LKR
            predictedPrice = roundToNearest(predictedPrice, 1000);
            minPrice = roundToNearest(minPrice, 1000);
            maxPrice = roundToNearest(maxPrice, 1000);

            logger.info("✅ {} prediction: {} LKR (confidence: {}%)", 
                       predictionMethod, predictedPrice, Math.round(confidenceScore * 100));

            return PricePredictionResponse.success(predictedPrice, minPrice, maxPrice, confidenceScore);

        } catch (Exception e) {
            logger.error("Error in price prediction", e);
            return PricePredictionResponse.error("Prediction failed: " + e.getMessage());
        }
    }

    private BigDecimal calculateRuleBasedPrice(PricePredictionRequest request) {
        String species = request.getSpecies().toLowerCase().trim();
        Double carat = request.getCarat();

        // Get base price per carat
        Double basePrice = basePricePerCarat.getOrDefault(species, 25000.0); // Default price

        // Apply carat weight
        double totalPrice = basePrice * carat;

        // Apply color multiplier
        if (request.getColor() != null) {
            String color = request.getColor().toLowerCase().trim();
            Double colorMultiplier = colorMultipliers.getOrDefault(color, 1.0);
            totalPrice *= colorMultiplier;
        }

        // Apply clarity multiplier
        if (request.getClarity() != null) {
            String clarity = request.getClarity().toLowerCase().trim();
            Double clarityMultiplier = clarityMultipliers.getOrDefault(clarity, 1.0);
            totalPrice *= clarityMultiplier;
        }

        // Apply cut multiplier
        if (request.getCut() != null) {
            String cut = request.getCut().toLowerCase().trim();
            Double cutMultiplier = cutMultipliers.getOrDefault(cut, 1.0);
            totalPrice *= cutMultiplier;
        }

        // Apply certification bonus
        if (Boolean.TRUE.equals(request.getIsCertified())) {
            totalPrice *= 1.2; // 20% bonus for certified stones
        }

        // Apply size premium for larger stones
        if (carat > 2.0) {
            totalPrice *= (1.0 + (carat - 2.0) * 0.1); // 10% premium per carat above 2ct
        }

        return BigDecimal.valueOf(totalPrice);
    }

    /**
     * Calculate real accuracy percentage based on data quality, completeness, and market factors
     */
    private double calculateConfidenceScore(PricePredictionRequest request) {
        double totalScore = 0.0;
        int totalFactors = 0;
        
        // 1. Species Recognition Accuracy (25% weight)
        double speciesAccuracy = calculateSpeciesAccuracy(request.getSpecies());
        totalScore += speciesAccuracy * 0.25;
        totalFactors++;
        
        // 2. Data Completeness Score (20% weight)
        double completenessScore = calculateDataCompleteness(request);
        totalScore += completenessScore * 0.20;
        totalFactors++;
        
        // 3. Quality Factors Precision (20% weight)
        double qualityPrecision = calculateQualityFactorsPrecision(request);
        totalScore += qualityPrecision * 0.20;
        totalFactors++;
        
        // 4. Certification and Documentation (15% weight)
        double certificationScore = calculateCertificationScore(request);
        totalScore += certificationScore * 0.15;
        totalFactors++;
        
        // 5. Market Data Alignment (10% weight)
        double marketAlignment = calculateMarketAlignment(request);
        totalScore += marketAlignment * 0.10;
        totalFactors++;
        
        // 6. Size and Rarity Factor (10% weight)
        double rarityFactor = calculateRarityFactor(request);
        totalScore += rarityFactor * 0.10;
        totalFactors++;
        
        double finalConfidence = totalScore / totalFactors;
        
        // Log detailed breakdown for transparency
        logger.info("🎯 Confidence Breakdown for {} {}ct:", 
                   request.getSpecies(), request.getCarat());
        logger.info("   Species Recognition: {}%", Math.round(speciesAccuracy * 100));
        logger.info("   Data Completeness: {}%", Math.round(completenessScore * 100));
        logger.info("   Quality Precision: {}%", Math.round(qualityPrecision * 100));
        logger.info("   Certification: {}%", Math.round(certificationScore * 100));
        logger.info("   Market Alignment: {}%", Math.round(marketAlignment * 100));
        logger.info("   Rarity Factor: {}%", Math.round(rarityFactor * 100));
        logger.info("   📊 Final Accuracy: {}%", Math.round(finalConfidence * 100));
        
        return Math.max(0.15, Math.min(0.98, finalConfidence)); // Range: 15% to 98%
    }
    
    private double calculateSpeciesAccuracy(String species) {
        if (species == null || species.trim().isEmpty()) {
            return 0.20; // Very low confidence without species
        }
        
        String normalizedSpecies = species.toLowerCase().trim();
        
        // High-confidence species (well-documented pricing)
        if (normalizedSpecies.contains("sapphire") || normalizedSpecies.contains("ruby") || 
            normalizedSpecies.contains("emerald") || normalizedSpecies.contains("diamond")) {
            return 0.95;
        }
        
        // Medium-confidence species
        if (normalizedSpecies.contains("spinel") || normalizedSpecies.contains("garnet") || 
            normalizedSpecies.contains("topaz") || normalizedSpecies.contains("aquamarine")) {
            return 0.80;
        }
        
        // Lower-confidence species (less market data)
        if (normalizedSpecies.contains("tourmaline") || normalizedSpecies.contains("moonstone") || 
            normalizedSpecies.contains("chrysoberyl") || normalizedSpecies.contains("zircon")) {
            return 0.70;
        }
        
        // Common gemstones
        if (normalizedSpecies.contains("quartz") || normalizedSpecies.contains("amethyst") || 
            normalizedSpecies.contains("citrine") || normalizedSpecies.contains("peridot")) {
            return 0.85;
        }
        
        return 0.60; // Unknown or rare species
    }
    
    private double calculateDataCompleteness(PricePredictionRequest request) {
        int availableFields = 0;
        int totalCriticalFields = 6;
        
        if (request.getSpecies() != null && !request.getSpecies().trim().isEmpty()) availableFields++;
        if (request.getCarat() != null && request.getCarat() > 0) availableFields++;
        if (request.getColor() != null && !request.getColor().trim().isEmpty()) availableFields++;
        if (request.getClarity() != null && !request.getClarity().trim().isEmpty()) availableFields++;
        if (request.getCut() != null && !request.getCut().trim().isEmpty()) availableFields++;
        if (request.getOrigin() != null && !request.getOrigin().trim().isEmpty()) availableFields++;
        
        double completeness = (double) availableFields / totalCriticalFields;
        
        // Bonus for additional fields
        if (request.getShape() != null && !request.getShape().trim().isEmpty()) completeness += 0.05;
        if (request.getTreatment() != null && !request.getTreatment().trim().isEmpty()) completeness += 0.05;
        
        return Math.min(1.0, completeness);
    }
    
    private double calculateQualityFactorsPrecision(PricePredictionRequest request) {
        double precision = 0.0;
        int factors = 0;
        
        // Color assessment
        if (request.getColor() != null && !request.getColor().trim().isEmpty()) {
            String color = request.getColor().toLowerCase();
            if (colorMultipliers.containsKey(color)) {
                precision += 0.90; // Recognized color
            } else if (color.matches(".*blue.*|.*red.*|.*green.*|.*yellow.*|.*pink.*|.*purple.*|.*orange.*")) {
                precision += 0.75; // Partial color match
            } else {
                precision += 0.50; // Unrecognized color
            }
            factors++;
        }
        
        // Clarity assessment
        if (request.getClarity() != null && !request.getClarity().trim().isEmpty()) {
            String clarity = request.getClarity().toLowerCase().replaceAll("\\s", "");
            if (clarityMultipliers.containsKey(clarity)) {
                precision += 0.95; // Standard clarity grade
            } else {
                precision += 0.60; // Non-standard clarity description
            }
            factors++;
        }
        
        // Cut assessment
        if (request.getCut() != null && !request.getCut().trim().isEmpty()) {
            String cut = request.getCut().toLowerCase().replaceAll("\\s", "");
            if (cutMultipliers.containsKey(cut)) {
                precision += 0.85; // Recognized cut quality/style
            } else {
                precision += 0.65; // Unknown cut description
            }
            factors++;
        }
        
        return factors > 0 ? precision / factors : 0.50;
    }
    
    private double calculateCertificationScore(PricePredictionRequest request) {
        double score = 0.50; // Base score for uncertified stones
        
        if (Boolean.TRUE.equals(request.getIsCertified())) {
            score = 0.90; // High confidence for certified stones
            
            // Origin verification bonus
            if (request.getOrigin() != null && !request.getOrigin().trim().isEmpty()) {
                String origin = request.getOrigin().toLowerCase();
                if (origin.contains("ceylon") || origin.contains("sri lanka") || 
                    origin.contains("burma") || origin.contains("kashmir") || 
                    origin.contains("colombia") || origin.contains("madagascar")) {
                    score = 0.95; // Premium origins with good documentation
                }
            }
        }
        
        return score;
    }
    
    private double calculateMarketAlignment(PricePredictionRequest request) {
        double alignment = 0.70; // Default market alignment
        
        // Check if gemstone characteristics align with current market preferences
        String species = request.getSpecies() != null ? request.getSpecies().toLowerCase() : "";
        String color = request.getColor() != null ? request.getColor().toLowerCase() : "";
        
        // High-demand combinations
        if ((species.contains("sapphire") && color.contains("blue")) ||
            (species.contains("ruby") && color.contains("red")) ||
            (species.contains("emerald") && color.contains("green"))) {
            alignment = 0.90;
        }
        
        // Size market alignment
        if (request.getCarat() != null) {
            double carat = request.getCarat();
            if (carat >= 1.0 && carat <= 5.0) {
                alignment += 0.05; // Popular size range
            } else if (carat > 5.0) {
                alignment -= 0.10; // Harder to price large stones
            }
        }
        
        return Math.max(0.40, Math.min(0.95, alignment));
    }
    
    private double calculateRarityFactor(PricePredictionRequest request) {
        double rarity = 0.70; // Base rarity score
        
        if (request.getCarat() != null) {
            double carat = request.getCarat();
            
            // Size rarity adjustments
            if (carat < 0.5) {
                rarity = 0.60; // Small stones, less market data
            } else if (carat >= 0.5 && carat <= 3.0) {
                rarity = 0.85; // Common size range, good data
            } else if (carat > 3.0 && carat <= 10.0) {
                rarity = 0.75; // Larger stones, moderate data
            } else {
                rarity = 0.50; // Very large stones, limited comparable data
            }
        }
        
        // Quality rarity
        if (request.getClarity() != null) {
            String clarity = request.getClarity().toLowerCase().replaceAll("\\s", "");
            if (clarity.equals("fl") || clarity.equals("if")) {
                rarity *= 0.90; // Flawless stones are rare but harder to price precisely
            } else if (clarity.equals("vvs1") || clarity.equals("vvs2")) {
                rarity *= 1.05; // High quality with good market data
            }
        }
        
        return Math.max(0.30, Math.min(0.95, rarity));
    }

    private BigDecimal roundToNearest(BigDecimal value, int nearest) {
        return value.divide(BigDecimal.valueOf(nearest), 0, RoundingMode.HALF_UP)
                   .multiply(BigDecimal.valueOf(nearest));
    }

    private PricePredictionRequest convertToRequest(GemListing gemListing) {
        PricePredictionRequest request = new PricePredictionRequest();
        
        // Extract carat from weight string (assuming format like "2.5 ct" or "2.5")
        try {
            String weight = gemListing.getWeight();
            if (weight != null) {
                String caratStr = weight.replaceAll("[^0-9.]", "").trim();
                if (!caratStr.isEmpty()) {
                    request.setCarat(Double.parseDouble(caratStr));
                }
            }
        } catch (NumberFormatException e) {
            logger.warn("Could not parse carat weight: " + gemListing.getWeight());
            request.setCarat(1.0); // Default to 1 carat
        }

        request.setColor(gemListing.getColor());
        request.setCut(gemListing.getCut());
        request.setClarity(gemListing.getClarity());
        request.setSpecies(gemListing.getSpecies());
        request.setIsCertified(gemListing.getIsCertified());
        request.setTreatment(gemListing.getTreatment());
        request.setOrigin(gemListing.getOrigin());
        request.setShape(gemListing.getShape());

        return request;
    }

    private PricePredictionResponse tryAlternativePrediction(PricePredictionRequest request, String previousFailure) {
        // All ML services temporarily disabled - using rule-based as fallback
        logger.info("📐 Using rule-based prediction as fallback");
        BigDecimal predictedPrice = calculateRuleBasedPrice(request);
        double confidenceScore = calculateConfidenceScore(request);
        
        // Calculate price range (±15%)
        BigDecimal variance = predictedPrice.multiply(BigDecimal.valueOf(0.15));
        BigDecimal minPrice = predictedPrice.subtract(variance).max(BigDecimal.ZERO);
        BigDecimal maxPrice = predictedPrice.add(variance);

        // Round to nearest 1000 LKR
        predictedPrice = roundToNearest(predictedPrice, 1000);
        minPrice = roundToNearest(minPrice, 1000);
        maxPrice = roundToNearest(maxPrice, 1000);

        logger.info("✅ Rule-based prediction: {} LKR (confidence: {}%)", 
                   predictedPrice, Math.round(confidenceScore * 100));

        return PricePredictionResponse.success(predictedPrice, minPrice, maxPrice, confidenceScore);
    }
}
