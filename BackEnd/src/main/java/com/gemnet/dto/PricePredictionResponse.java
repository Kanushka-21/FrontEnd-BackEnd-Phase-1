package com.gemnet.dto;

import java.math.BigDecimal;

/**
 * DTO for gemstone price prediction response
 */
public class PricePredictionResponse {
    
    private BigDecimal predictedPrice;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private String currency;
    private Double confidenceScore;
    private String status;
    private String message;
    
    // Default constructor
    public PricePredictionResponse() {
        this.currency = "LKR";
        this.status = "SUCCESS";
    }
    
    // Constructor for successful prediction
    public PricePredictionResponse(BigDecimal predictedPrice, BigDecimal minPrice, 
                                 BigDecimal maxPrice, Double confidenceScore) {
        this();
        this.predictedPrice = predictedPrice;
        this.minPrice = minPrice;
        this.maxPrice = maxPrice;
        this.confidenceScore = confidenceScore;
    }
    
    // Constructor for error response
    public PricePredictionResponse(String status, String message) {
        this();
        this.status = status;
        this.message = message;
    }
    
    // Static factory methods
    public static PricePredictionResponse success(BigDecimal predictedPrice, 
                                                BigDecimal minPrice, 
                                                BigDecimal maxPrice, 
                                                Double confidenceScore) {
        return new PricePredictionResponse(predictedPrice, minPrice, maxPrice, confidenceScore);
    }
    
    public static PricePredictionResponse error(String message) {
        return new PricePredictionResponse("ERROR", message);
    }
    
    // Getters and Setters
    public BigDecimal getPredictedPrice() {
        return predictedPrice;
    }
    
    public void setPredictedPrice(BigDecimal predictedPrice) {
        this.predictedPrice = predictedPrice;
    }
    
    public BigDecimal getMinPrice() {
        return minPrice;
    }
    
    public void setMinPrice(BigDecimal minPrice) {
        this.minPrice = minPrice;
    }
    
    public BigDecimal getMaxPrice() {
        return maxPrice;
    }
    
    public void setMaxPrice(BigDecimal maxPrice) {
        this.maxPrice = maxPrice;
    }
    
    public String getCurrency() {
        return currency;
    }
    
    public void setCurrency(String currency) {
        this.currency = currency;
    }
    
    public Double getConfidenceScore() {
        return confidenceScore;
    }
    
    public void setConfidenceScore(Double confidenceScore) {
        this.confidenceScore = confidenceScore;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    @Override
    public String toString() {
        return "PricePredictionResponse{" +
                "predictedPrice=" + predictedPrice +
                ", minPrice=" + minPrice +
                ", maxPrice=" + maxPrice +
                ", currency='" + currency + '\'' +
                ", confidenceScore=" + confidenceScore +
                ", status='" + status + '\'' +
                '}';
    }
}
