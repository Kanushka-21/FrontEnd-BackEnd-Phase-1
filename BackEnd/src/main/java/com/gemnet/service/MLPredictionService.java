package com.gemnet.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gemnet.dto.PricePredictionRequest;
import com.gemnet.dto.PricePredictionResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;

/**
 * Service for integrating with external ML prediction APIs
 */
@Service
public class MLPredictionService {

    private static final Logger logger = LoggerFactory.getLogger(MLPredictionService.class);

    @Value("${gemnet.flask.api.url:http://localhost:5000}")
    private String flaskApiUrl;

    @Value("${gemnet.flask.api.timeout:10000}")
    private int apiTimeout;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public MLPredictionService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Predict price using Flask ML API
     */
    public PricePredictionResponse predictUsingFlaskAPI(PricePredictionRequest request) {
        try {
            logger.info("🤖 Attempting ML prediction via Flask API for {} {}ct", 
                       request.getSpecies(), request.getCarat());

            // Prepare ML model input data
            Map<String, Object> mlInput = prepareMlInput(request);
            
            // Make API call to Flask ML service
            String url = flaskApiUrl + "/predictAPI";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(mlInput, headers);
            
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                return parseMlResponse(response.getBody(), request);
            } else {
                logger.warn("⚠️ Flask API returned status: {}", response.getStatusCode());
                return PricePredictionResponse.error("ML API returned error status: " + response.getStatusCode());
            }
            
        } catch (Exception e) {
            logger.error("❌ Flask ML API prediction failed: {}", e.getMessage());
            return PricePredictionResponse.error("ML prediction failed: " + e.getMessage());
        }
    }

    /**
     * Check if ML service is available
     */
    public boolean isMlServiceAvailable() {
        try {
            String url = flaskApiUrl + "/health";
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            boolean available = response.getStatusCode() == HttpStatus.OK;
            logger.info("🔍 ML Service availability check: {}", available ? "✅ Available" : "❌ Unavailable");
            return available;
        } catch (Exception e) {
            logger.debug("🔍 ML Service not available: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Prepare input data for ML model based on the expected format
     */
    private Map<String, Object> prepareMlInput(PricePredictionRequest request) {
        Map<String, Object> mlInput = new HashMap<>();
        
        // Core attributes for ML model
        mlInput.put("carat", request.getCarat());
        
        // Calculate derived dimensions if not provided
        // For gemstones, we can estimate dimensions based on carat weight
        double estimatedLength = Math.pow(request.getCarat() * 0.2, 1.0/3.0) * 10; // Rough estimation
        double estimatedWidth = estimatedLength * 0.95;
        double estimatedHeight = estimatedLength * 0.60;
        
        mlInput.put("x", estimatedLength);
        mlInput.put("y", estimatedWidth); 
        mlInput.put("z", estimatedHeight);
        
        // Standard table and depth percentages for gemstones
        mlInput.put("table", 58.0); // Typical table percentage
        mlInput.put("depth", 61.5); // Typical depth percentage
        
        // Map gemstone attributes to ML model format
        mlInput.put("cut", mapCutForMl(request.getCut()));
        mlInput.put("color", mapColorForMl(request.getColor()));
        mlInput.put("clarity", mapClarityForMl(request.getClarity()));
        
        logger.info("📊 ML Input prepared: carat={}, cut={}, color={}, clarity={}", 
                   mlInput.get("carat"), mlInput.get("cut"), mlInput.get("color"), mlInput.get("clarity"));
        
        return mlInput;
    }

    /**
     * Map gemstone cut to ML model expected values
     */
    private String mapCutForMl(String cut) {
        if (cut == null) return "Good";
        
        String normalizedCut = cut.toLowerCase().trim();
        
        // Map to standard diamond cut grades expected by ML model
        if (normalizedCut.contains("excellent") || normalizedCut.contains("ideal")) {
            return "Ideal";
        } else if (normalizedCut.contains("very good") || normalizedCut.contains("premium")) {
            return "Premium";
        } else if (normalizedCut.contains("good")) {
            return "Good";
        } else if (normalizedCut.contains("fair")) {
            return "Fair";
        } else {
            return "Good"; // Default
        }
    }

    /**
     * Map gemstone color to ML model expected values
     */
    private String mapColorForMl(String color) {
        if (color == null) return "G";
        
        String normalizedColor = color.toLowerCase().trim();
        
        // Map gemstone colors to diamond color scale (D-Z)
        if (normalizedColor.contains("colorless") || normalizedColor.contains("white")) {
            return "D"; // Best colorless
        } else if (normalizedColor.contains("blue")) {
            return "F"; // Near colorless
        } else if (normalizedColor.contains("yellow") || normalizedColor.contains("champagne")) {
            return "J"; // Faint yellow
        } else if (normalizedColor.contains("pink") || normalizedColor.contains("red")) {
            return "E"; // Near colorless
        } else if (normalizedColor.contains("green")) {
            return "G"; // Near colorless
        } else if (normalizedColor.contains("purple") || normalizedColor.contains("violet")) {
            return "H"; // Near colorless
        } else {
            return "G"; // Default near colorless
        }
    }

    /**
     * Map gemstone clarity to ML model expected values
     */
    private String mapClarityForMl(String clarity) {
        if (clarity == null) return "VS2";
        
        String normalizedClarity = clarity.toLowerCase().replaceAll("\\s+", "");
        
        // Direct mapping to diamond clarity scale
        if (normalizedClarity.equals("fl")) return "FL";
        else if (normalizedClarity.equals("if")) return "IF";
        else if (normalizedClarity.equals("vvs1")) return "VVS1";
        else if (normalizedClarity.equals("vvs2")) return "VVS2";
        else if (normalizedClarity.equals("vs1")) return "VS1";
        else if (normalizedClarity.equals("vs2")) return "VS2";
        else if (normalizedClarity.equals("si1")) return "SI1";
        else if (normalizedClarity.equals("si2")) return "SI2";
        else if (normalizedClarity.contains("i1") || normalizedClarity.contains("p1")) return "SI2";
        else if (normalizedClarity.contains("i2") || normalizedClarity.contains("p2")) return "SI1";
        else return "VS2"; // Default
    }

    /**
     * Parse ML model response and create prediction response
     */
    private PricePredictionResponse parseMlResponse(String responseBody, PricePredictionRequest request) {
        try {
            JsonNode responseJson = objectMapper.readTree(responseBody);
            
            // Extract prediction value from response
            double mlPrediction;
            if (responseJson.has("prediction")) {
                mlPrediction = responseJson.get("prediction").asDouble();
            } else if (responseJson.has("price")) {
                mlPrediction = responseJson.get("price").asDouble();
            } else {
                // Try to parse if response is just a number
                mlPrediction = responseJson.asDouble();
            }
            
            // Convert USD to LKR (approximate rate: 1 USD = 320 LKR)
            double lkrPrice = mlPrediction * 320;
            
            BigDecimal predictedPrice = BigDecimal.valueOf(lkrPrice);
            
            // Calculate confidence based on data quality
            double confidence = calculateMlConfidence(request, predictedPrice);
            
            // Calculate price range (±10% for ML predictions)
            BigDecimal variance = predictedPrice.multiply(BigDecimal.valueOf(0.10));
            BigDecimal minPrice = predictedPrice.subtract(variance).max(BigDecimal.ZERO);
            BigDecimal maxPrice = predictedPrice.add(variance);
            
            // Round to nearest 1000 LKR
            predictedPrice = roundToNearest(predictedPrice, 1000);
            minPrice = roundToNearest(minPrice, 1000);
            maxPrice = roundToNearest(maxPrice, 1000);
            
            logger.info("✅ ML Prediction successful: {} LKR (confidence: {}%)", 
                       predictedPrice, Math.round(confidence * 100));
            
            PricePredictionResponse response = PricePredictionResponse.success(predictedPrice, minPrice, maxPrice, confidence);
            response.setPredictionMethod("Machine Learning (CatBoost)");
            response.setModelAccuracy(0.9794); // Actual model accuracy
            
            return response;
            
        } catch (Exception e) {
            logger.error("❌ Failed to parse ML response: {}", e.getMessage());
            return PricePredictionResponse.error("Failed to parse ML prediction response");
        }
    }

    /**
     * Calculate confidence score for ML predictions based on data quality
     */
    private double calculateMlConfidence(PricePredictionRequest request, BigDecimal predictedPrice) {
        double confidence = 0.85; // Base confidence for ML predictions
        
        // Adjust based on data completeness
        int availableFields = 0;
        if (request.getCarat() != null && request.getCarat() > 0) availableFields++;
        if (request.getColor() != null && !request.getColor().trim().isEmpty()) availableFields++;
        if (request.getCut() != null && !request.getCut().trim().isEmpty()) availableFields++;
        if (request.getClarity() != null && !request.getClarity().trim().isEmpty()) availableFields++;
        if (request.getSpecies() != null && !request.getSpecies().trim().isEmpty()) availableFields++;
        
        double completeness = (double) availableFields / 5.0;
        confidence = confidence * completeness;
        
        // Certification bonus
        if (Boolean.TRUE.equals(request.getIsCertified())) {
            confidence += 0.05;
        }
        
        // Size factor - ML works better for typical sizes
        if (request.getCarat() != null) {
            double carat = request.getCarat();
            if (carat >= 0.5 && carat <= 3.0) {
                confidence += 0.03; // Sweet spot for ML model
            }
        }
        
        return Math.min(0.98, Math.max(0.75, confidence));
    }

    private BigDecimal roundToNearest(BigDecimal value, int nearest) {
        return value.divide(BigDecimal.valueOf(nearest), 0, RoundingMode.HALF_UP)
                   .multiply(BigDecimal.valueOf(nearest));
    }
}
