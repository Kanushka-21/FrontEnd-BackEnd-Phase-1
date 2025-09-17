package com.gemnet.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO for gemstone price prediction request
 */
public class PricePredictionRequest {
    
    @NotNull(message = "Carat weight is required")
    @Positive(message = "Carat weight must be positive")
    private Double carat;
    
    @NotBlank(message = "Color is required")
    private String color;
    
    @NotBlank(message = "Cut is required")
    private String cut;
    
    @NotBlank(message = "Clarity is required")
    private String clarity;
    
    @NotBlank(message = "Species is required")
    private String species;
    
    // Dimensions
    private Double length;
    private Double width;
    private Double depth;
    
    // Certification status
    private Boolean isCertified;
    
    // Treatment type
    private String treatment;
    
    // Origin
    private String origin;
    
    // Shape
    private String shape;
    
    // Default constructor
    public PricePredictionRequest() {}
    
    // Constructor
    public PricePredictionRequest(Double carat, String color, String cut, String clarity, 
                                 String species, Boolean isCertified) {
        this.carat = carat;
        this.color = color;
        this.cut = cut;
        this.clarity = clarity;
        this.species = species;
        this.isCertified = isCertified;
    }
    
    // Getters and Setters
    public Double getCarat() {
        return carat;
    }
    
    public void setCarat(Double carat) {
        this.carat = carat;
    }
    
    public String getColor() {
        return color;
    }
    
    public void setColor(String color) {
        this.color = color;
    }
    
    public String getCut() {
        return cut;
    }
    
    public void setCut(String cut) {
        this.cut = cut;
    }
    
    public String getClarity() {
        return clarity;
    }
    
    public void setClarity(String clarity) {
        this.clarity = clarity;
    }
    
    public String getSpecies() {
        return species;
    }
    
    public void setSpecies(String species) {
        this.species = species;
    }
    
    public Double getLength() {
        return length;
    }
    
    public void setLength(Double length) {
        this.length = length;
    }
    
    public Double getWidth() {
        return width;
    }
    
    public void setWidth(Double width) {
        this.width = width;
    }
    
    public Double getDepth() {
        return depth;
    }
    
    public void setDepth(Double depth) {
        this.depth = depth;
    }
    
    public Boolean getIsCertified() {
        return isCertified;
    }
    
    public void setIsCertified(Boolean isCertified) {
        this.isCertified = isCertified;
    }
    
    public String getTreatment() {
        return treatment;
    }
    
    public void setTreatment(String treatment) {
        this.treatment = treatment;
    }
    
    public String getOrigin() {
        return origin;
    }
    
    public void setOrigin(String origin) {
        this.origin = origin;
    }
    
    public String getShape() {
        return shape;
    }
    
    public void setShape(String shape) {
        this.shape = shape;
    }
    
    @Override
    public String toString() {
        return "PricePredictionRequest{" +
                "carat=" + carat +
                ", color='" + color + '\'' +
                ", cut='" + cut + '\'' +
                ", clarity='" + clarity + '\'' +
                ", species='" + species + '\'' +
                ", isCertified=" + isCertified +
                '}';
    }
}
