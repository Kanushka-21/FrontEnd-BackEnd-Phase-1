package com.gemnet.service;

import com.gemnet.dto.PricePredictionRequest;
import com.gemnet.dto.PricePredictionResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SriLankanMarketPriceService {
    
    private static final Logger logger = LoggerFactory.getLogger(SriLankanMarketPriceService.class);
    
    private List<SriLankanGemData> gemDataset = new ArrayList<>();
    private Map<String, List<SriLankanGemData>> gemTypeIndex = new HashMap<>();
    private Map<String, List<SriLankanGemData>> locationIndex = new HashMap<>();
    private Map<String, List<SriLankanGemData>> qualityIndex = new HashMap<>();
    
    @PostConstruct
    public void loadSriLankanDataset() {
        try {
            try (InputStream inputStream = getClass().getResourceAsStream("/dataset/sri_lankan_gemstone_dataset_full.csv");
                 BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream))) {
                
                if (inputStream == null) {
                    logger.warn("Sri Lankan gemstone dataset file not found in resources");
                    return;
                }
                
                String line;
                boolean isFirstLine = true;
                
                while ((line = reader.readLine()) != null) {
                    if (isFirstLine) {
                        isFirstLine = false;
                        continue; // Skip header
                    }
                    
                    SriLankanGemData gemData = parseCsvLine(line);
                    if (gemData != null) {
                        gemDataset.add(gemData);
                        
                        // Build indices for faster lookup
                        gemTypeIndex.computeIfAbsent(gemData.getGemType().toLowerCase(), k -> new ArrayList<>()).add(gemData);
                        locationIndex.computeIfAbsent(gemData.getMiningLocation().toLowerCase(), k -> new ArrayList<>()).add(gemData);
                        qualityIndex.computeIfAbsent(gemData.getQualityGrade(), k -> new ArrayList<>()).add(gemData);
                    }
                }
                
                logger.info("Loaded {} Sri Lankan gemstone records", gemDataset.size());
                logger.info("Gem types available: {}", gemTypeIndex.keySet());
                logger.info("Mining locations: {}", locationIndex.keySet());
                
            }
        } catch (Exception e) {
            logger.error("Error loading Sri Lankan gemstone dataset", e);
        }
    }
    
    private SriLankanGemData parseCsvLine(String line) {
        try {
            String[] parts = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");
            if (parts.length < 21) return null;
            
            SriLankanGemData data = new SriLankanGemData();
            data.setGemType(parts[0].trim().replace("\"", ""));
            data.setSpecies(parts[1].trim().replace("\"", ""));
            data.setVariety(parts[2].trim().replace("\"", ""));
            data.setCarat(Double.parseDouble(parts[3].trim()));
            data.setColor(parts[4].trim().replace("\"", ""));
            data.setCut(parts[5].trim().replace("\"", ""));
            data.setClarity(parts[6].trim().replace("\"", ""));
            data.setShape(parts[7].trim().replace("\"", ""));
            data.setLength(Double.parseDouble(parts[8].trim()));
            data.setWidth(Double.parseDouble(parts[9].trim()));
            data.setDepth(Double.parseDouble(parts[10].trim()));
            data.setOrigin(parts[11].trim().replace("\"", ""));
            data.setTreatment(parts[12].trim().replace("\"", ""));
            data.setCertified("true".equalsIgnoreCase(parts[13].trim()));
            data.setCertificationLab(parts[14].trim().replace("\"", ""));
            data.setHeatTreatment("Yes".equalsIgnoreCase(parts[15].trim()));
            data.setMiningLocation(parts[16].trim().replace("\"", ""));
            data.setQualityGrade(parts[17].trim().replace("\"", ""));
            data.setRarityScore(Integer.parseInt(parts[18].trim()));
            data.setMarketType(parts[19].trim().replace("\"", ""));
            data.setPriceLkr(new BigDecimal(parts[20].trim()));
            data.setPriceUsd(new BigDecimal(parts[21].trim()));
            
            return data;
        } catch (Exception e) {
            logger.warn("Failed to parse CSV line: {}", line, e);
            return null;
        }
    }
    
    public PricePredictionResponse predictSriLankanPrice(PricePredictionRequest request) {
        logger.info("Predicting price for Sri Lankan market with request: {}", request);
        
        try {
            // Find similar gems in the Sri Lankan dataset
            List<SriLankanGemData> similarGems = findSimilarGems(request);
            
            if (similarGems.isEmpty()) {
                return createFallbackResponse(request);
            }
            
            // Calculate weighted price based on similarity
            PriceAnalysis analysis = calculateWeightedPrice(similarGems, request);
            
            // Adjust price range if seller's price is available
            BigDecimal finalMinPrice = analysis.getMinPrice();
            BigDecimal finalMaxPrice = analysis.getMaxPrice();
            
            if (request.getSellerPrice() != null && request.getSellerPrice() > 0) {
                BigDecimal sellerPrice = BigDecimal.valueOf(request.getSellerPrice());
                BigDecimal predictedPrice = analysis.getWeightedPrice();
                
                // Give 75% weight to seller's price and 25% to market prediction
                BigDecimal weightedPrice = sellerPrice.multiply(BigDecimal.valueOf(0.75))
                                                   .add(predictedPrice.multiply(BigDecimal.valueOf(0.25)));
                
                // Create a tight range with 7% variance for Sri Lankan market
                BigDecimal tighterVariance = weightedPrice.multiply(BigDecimal.valueOf(0.07));
                
                finalMinPrice = weightedPrice.subtract(tighterVariance).max(BigDecimal.ZERO);
                finalMaxPrice = weightedPrice.add(tighterVariance);
                
                // Ensure seller's price is within reasonable bounds
                finalMinPrice = finalMinPrice.min(sellerPrice.multiply(BigDecimal.valueOf(0.88)));
                finalMaxPrice = finalMaxPrice.max(sellerPrice.multiply(BigDecimal.valueOf(1.12)));
                
                logger.info("🎯 Sri Lankan seller-weighted range: Market: {} LKR, Seller: {} LKR, Final: {} - {} LKR", 
                           predictedPrice, sellerPrice, finalMinPrice, finalMaxPrice);
            }
            
            // Create enhanced response
            PricePredictionResponse response = new PricePredictionResponse();
            response.setPredictedPrice(analysis.getWeightedPrice());
            response.setMinPrice(finalMinPrice);
            response.setMaxPrice(finalMaxPrice);
            response.setConfidence(analysis.getConfidence());
            response.setMethodUsed("Sri Lankan Market Analysis");
            response.setDataPoints(similarGems.size());
            response.setMarketInsights(generateMarketInsights(similarGems, request));
            response.setAccuracyScore(calculateAccuracyScore(analysis, similarGems));
            
            logger.info("Sri Lankan price prediction completed: LKR {} (USD {})", 
                       analysis.getWeightedPrice(), 
                       analysis.getWeightedPrice().divide(BigDecimal.valueOf(300), RoundingMode.HALF_UP));
            
            return response;
            
        } catch (Exception e) {
            logger.error("Error in Sri Lankan price prediction", e);
            return createFallbackResponse(request);
        }
    }
    
    private List<SriLankanGemData> findSimilarGems(PricePredictionRequest request) {
        List<SriLankanGemData> candidates = new ArrayList<>();
        
        // Start with gem type match
        String gemType = mapSpeciesToGemType(request.getSpecies());
        List<SriLankanGemData> typeMatches = gemTypeIndex.getOrDefault(gemType.toLowerCase(), new ArrayList<>());
        
        if (typeMatches.isEmpty()) {
            // Fallback to all gems if no type match
            candidates.addAll(gemDataset);
        } else {
            candidates.addAll(typeMatches);
        }
        
        // Filter and score by similarity
        return candidates.stream()
                .filter(gem -> isReasonableMatch(gem, request))
                .sorted((a, b) -> Double.compare(calculateSimilarityScore(b, request), 
                                               calculateSimilarityScore(a, request)))
                .limit(20) // Top 20 most similar
                .collect(Collectors.toList());
    }
    
    private String mapSpeciesToGemType(String species) {
        if (species == null) return "sapphire";
        
        species = species.toLowerCase();
        if (species.contains("corundum")) return "sapphire";
        if (species.contains("beryl")) return "emerald";
        if (species.contains("spinel")) return "spinel";
        if (species.contains("garnet")) return "garnet";
        if (species.contains("tourmaline")) return "tourmaline";
        if (species.contains("quartz")) return "quartz";
        
        return "sapphire"; // Default fallback
    }
    
    private boolean isReasonableMatch(SriLankanGemData gem, PricePredictionRequest request) {
        // Carat weight should be within reasonable range
        double caratDiff = Math.abs(gem.getCarat() - request.getCarat()) / request.getCarat();
        if (caratDiff > 0.8) return false; // More than 80% difference
        
        // Color should have some similarity
        if (request.getColor() != null && gem.getColor() != null) {
            String reqColor = request.getColor().toLowerCase();
            String gemColor = gem.getColor().toLowerCase();
            if (!reqColor.contains(gemColor.split(" ")[0]) && 
                !gemColor.contains(reqColor.split(" ")[0])) {
                // Allow if it's a general match (e.g., "blue" matches "royal blue")
                if (!hasColorSimilarity(reqColor, gemColor)) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    private boolean hasColorSimilarity(String color1, String color2) {
        String[] color1Words = color1.split(" ");
        String[] color2Words = color2.split(" ");
        
        for (String word1 : color1Words) {
            for (String word2 : color2Words) {
                if (word1.equals(word2) || 
                    word1.startsWith(word2) || 
                    word2.startsWith(word1)) {
                    return true;
                }
            }
        }
        return false;
    }
    
    private double calculateSimilarityScore(SriLankanGemData gem, PricePredictionRequest request) {
        double score = 0.0;
        double totalWeight = 0.0;
        
        // Carat weight similarity (30% weight)
        double caratScore = 1.0 - Math.min(1.0, Math.abs(gem.getCarat() - request.getCarat()) / request.getCarat());
        score += caratScore * 30;
        totalWeight += 30;
        
        // Color similarity (25% weight)
        if (request.getColor() != null && gem.getColor() != null) {
            double colorScore = calculateColorSimilarity(gem.getColor(), request.getColor());
            score += colorScore * 25;
            totalWeight += 25;
        }
        
        // Cut similarity (20% weight)
        if (request.getCut() != null && gem.getCut() != null) {
            double cutScore = request.getCut().equalsIgnoreCase(gem.getCut()) ? 1.0 : 0.5;
            score += cutScore * 20;
            totalWeight += 20;
        }
        
        // Clarity similarity (15% weight)
        if (request.getClarity() != null && gem.getClarity() != null) {
            double clarityScore = calculateClaritySimilarity(gem.getClarity(), request.getClarity());
            score += clarityScore * 15;
            totalWeight += 15;
        }
        
        // Treatment similarity (10% weight)
        if (request.getTreatment() != null && gem.getTreatment() != null) {
            double treatmentScore = request.getTreatment().equalsIgnoreCase(gem.getTreatment()) ? 1.0 : 0.3;
            score += treatmentScore * 10;
            totalWeight += 10;
        }
        
        return totalWeight > 0 ? score / totalWeight : 0.0;
    }
    
    private double calculateColorSimilarity(String gemColor, String requestColor) {
        if (gemColor.equalsIgnoreCase(requestColor)) return 1.0;
        if (hasColorSimilarity(gemColor.toLowerCase(), requestColor.toLowerCase())) return 0.8;
        return 0.2;
    }
    
    private double calculateClaritySimilarity(String gemClarity, String requestClarity) {
        // Define clarity hierarchy
        Map<String, Integer> clarityRank = new HashMap<>();
        clarityRank.put("fl", 10);
        clarityRank.put("if", 9);
        clarityRank.put("vvs1", 8);
        clarityRank.put("vvs", 7);
        clarityRank.put("vs1", 6);
        clarityRank.put("vs", 5);
        clarityRank.put("si1", 4);
        clarityRank.put("si", 3);
        clarityRank.put("eye-clean", 3);
        clarityRank.put("i1", 2);
        clarityRank.put("i2", 1);
        clarityRank.put("i3", 0);
        
        int gemRank = clarityRank.getOrDefault(gemClarity.toLowerCase(), 5);
        int reqRank = clarityRank.getOrDefault(requestClarity.toLowerCase(), 5);
        
        int diff = Math.abs(gemRank - reqRank);
        return Math.max(0.0, 1.0 - (diff * 0.15));
    }
    
    private PriceAnalysis calculateWeightedPrice(List<SriLankanGemData> similarGems, PricePredictionRequest request) {
        if (similarGems.isEmpty()) {
            return new PriceAnalysis(BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, 0.0);
        }
        
        BigDecimal totalWeightedPrice = BigDecimal.ZERO;
        double totalWeight = 0.0;
        BigDecimal minPrice = null;
        BigDecimal maxPrice = null;
        
        for (SriLankanGemData gem : similarGems) {
            double similarity = calculateSimilarityScore(gem, request);
            double weight = Math.pow(similarity, 2); // Square to emphasize better matches
            
            BigDecimal price = gem.getPriceLkr();
            totalWeightedPrice = totalWeightedPrice.add(price.multiply(BigDecimal.valueOf(weight)));
            totalWeight += weight;
            
            if (minPrice == null || price.compareTo(minPrice) < 0) minPrice = price;
            if (maxPrice == null || price.compareTo(maxPrice) > 0) maxPrice = price;
        }
        
        BigDecimal weightedPrice = totalWeight > 0 ? 
            totalWeightedPrice.divide(BigDecimal.valueOf(totalWeight), RoundingMode.HALF_UP) : BigDecimal.ZERO;
        
        double confidence = calculateConfidence(similarGems, request);
        
        return new PriceAnalysis(weightedPrice, minPrice, maxPrice, confidence);
    }
    
    private double calculateConfidence(List<SriLankanGemData> similarGems, PricePredictionRequest request) {
        if (similarGems.isEmpty()) return 0.0;
        
        double baseConfidence = 0.75; // Start with 75% for Sri Lankan market data
        
        // Boost confidence based on number of similar gems
        int count = similarGems.size();
        if (count >= 10) baseConfidence += 0.15;
        else if (count >= 5) baseConfidence += 0.10;
        else if (count >= 3) baseConfidence += 0.05;
        
        // Boost confidence for exact matches
        long exactMatches = similarGems.stream()
                .mapToLong(gem -> {
                    int matches = 0;
                    if (request.getColor() != null && request.getColor().equalsIgnoreCase(gem.getColor())) matches++;
                    if (request.getCut() != null && request.getCut().equalsIgnoreCase(gem.getCut())) matches++;
                    if (request.getClarity() != null && request.getClarity().equalsIgnoreCase(gem.getClarity())) matches++;
                    return matches;
                })
                .sum();
        
        baseConfidence += Math.min(0.1, exactMatches * 0.02);
        
        return Math.min(0.95, baseConfidence); // Cap at 95%
    }
    
    private double calculateAccuracyScore(PriceAnalysis analysis, List<SriLankanGemData> similarGems) {
        // Calculate accuracy based on price variance and data quality
        if (similarGems.isEmpty()) return 0.5;
        
        BigDecimal priceRange = analysis.getMaxPrice().subtract(analysis.getMinPrice());
        BigDecimal avgPrice = analysis.getWeightedPrice();
        
        // Lower variance = higher accuracy
        double variance = avgPrice.compareTo(BigDecimal.ZERO) > 0 ? 
            priceRange.divide(avgPrice, 4, RoundingMode.HALF_UP).doubleValue() : 1.0;
        
        double accuracyScore = Math.max(0.6, Math.min(0.95, 1.0 - (variance * 0.3)));
        
        // Boost for certified gems
        long certifiedCount = similarGems.stream().mapToLong(gem -> gem.isCertified() ? 1 : 0).sum();
        if (certifiedCount > similarGems.size() * 0.7) {
            accuracyScore += 0.05;
        }
        
        return Math.min(0.95, accuracyScore);
    }
    
    private String generateMarketInsights(List<SriLankanGemData> similarGems, PricePredictionRequest request) {
        if (similarGems.isEmpty()) {
            return "Limited market data available for this gemstone specification.";
        }
        
        StringBuilder insights = new StringBuilder();
        
        // Mining location insights
        Map<String, Long> locationCounts = similarGems.stream()
                .collect(Collectors.groupingBy(SriLankanGemData::getMiningLocation, Collectors.counting()));
        
        String topLocation = locationCounts.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("Various locations");
        
        insights.append(String.format("Most similar gems from %s region. ", topLocation));
        
        // Quality distribution
        Map<String, Long> qualityCounts = similarGems.stream()
                .collect(Collectors.groupingBy(SriLankanGemData::getQualityGrade, Collectors.counting()));
        
        String topQuality = qualityCounts.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("Mixed quality");
        
        insights.append(String.format("Predominantly %s grade quality. ", topQuality));
        
        // Treatment insights
        long unheatedCount = similarGems.stream().mapToLong(gem -> !gem.isHeatTreatment() ? 1 : 0).sum();
        if (unheatedCount > similarGems.size() * 0.3) {
            insights.append("Significant unheated gemstone premium applied. ");
        }
        
        // Market type insights
        Map<String, Long> marketCounts = similarGems.stream()
                .collect(Collectors.groupingBy(SriLankanGemData::getMarketType, Collectors.counting()));
        
        String primaryMarket = marketCounts.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("Mixed markets");
        
        insights.append(String.format("Pricing based on %s market data.", primaryMarket));
        
        return insights.toString();
    }
    
    private PricePredictionResponse createFallbackResponse(PricePredictionRequest request) {
        PricePredictionResponse response = new PricePredictionResponse();
        response.setPredictedPrice(BigDecimal.valueOf(50000)); // Default LKR price
        response.setMinPrice(BigDecimal.valueOf(25000));
        response.setMaxPrice(BigDecimal.valueOf(100000));
        response.setConfidence(0.3);
        response.setMethodUsed("Sri Lankan Market Fallback");
        response.setDataPoints(0);
        response.setMarketInsights("Limited Sri Lankan market data available for this specification.");
        response.setAccuracyScore(0.4);
        
        return response;
    }
    
    // Inner classes for data structures
    private static class PriceAnalysis {
        private final BigDecimal weightedPrice;
        private final BigDecimal minPrice;
        private final BigDecimal maxPrice;
        private final double confidence;
        
        public PriceAnalysis(BigDecimal weightedPrice, BigDecimal minPrice, BigDecimal maxPrice, double confidence) {
            this.weightedPrice = weightedPrice;
            this.minPrice = minPrice;
            this.maxPrice = maxPrice;
            this.confidence = confidence;
        }
        
        // Getters
        public BigDecimal getWeightedPrice() { return weightedPrice; }
        public BigDecimal getMinPrice() { return minPrice; }
        public BigDecimal getMaxPrice() { return maxPrice; }
        public double getConfidence() { return confidence; }
    }
}
