package com.gemnet.service;

import java.math.BigDecimal;

/**
 * Data model for Sri Lankan gemstone dataset
 */
public class SriLankanGemData {
    
    private String gemType;
    private String species;
    private String variety;
    private Double carat;
    private String color;
    private String cut;
    private String clarity;
    private String shape;
    private Double length;
    private Double width;
    private Double depth;
    private String origin;
    private String treatment;
    private boolean certified;
    private String certificationLab;
    private boolean heatTreatment;
    private String miningLocation;
    private String qualityGrade;
    private Integer rarityScore;
    private String marketType;
    private BigDecimal priceLkr;
    private BigDecimal priceUsd;
    private String saleDate;
    private String sellerType;
    private String notes;
    
    // Default constructor
    public SriLankanGemData() {}
    
    // Getters and Setters
    public String getGemType() {
        return gemType;
    }
    
    public void setGemType(String gemType) {
        this.gemType = gemType;
    }
    
    public String getSpecies() {
        return species;
    }
    
    public void setSpecies(String species) {
        this.species = species;
    }
    
    public String getVariety() {
        return variety;
    }
    
    public void setVariety(String variety) {
        this.variety = variety;
    }
    
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
    
    public String getShape() {
        return shape;
    }
    
    public void setShape(String shape) {
        this.shape = shape;
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
    
    public String getOrigin() {
        return origin;
    }
    
    public void setOrigin(String origin) {
        this.origin = origin;
    }
    
    public String getTreatment() {
        return treatment;
    }
    
    public void setTreatment(String treatment) {
        this.treatment = treatment;
    }
    
    public boolean isCertified() {
        return certified;
    }
    
    public void setCertified(boolean certified) {
        this.certified = certified;
    }
    
    public String getCertificationLab() {
        return certificationLab;
    }
    
    public void setCertificationLab(String certificationLab) {
        this.certificationLab = certificationLab;
    }
    
    public boolean isHeatTreatment() {
        return heatTreatment;
    }
    
    public void setHeatTreatment(boolean heatTreatment) {
        this.heatTreatment = heatTreatment;
    }
    
    public String getMiningLocation() {
        return miningLocation;
    }
    
    public void setMiningLocation(String miningLocation) {
        this.miningLocation = miningLocation;
    }
    
    public String getQualityGrade() {
        return qualityGrade;
    }
    
    public void setQualityGrade(String qualityGrade) {
        this.qualityGrade = qualityGrade;
    }
    
    public Integer getRarityScore() {
        return rarityScore;
    }
    
    public void setRarityScore(Integer rarityScore) {
        this.rarityScore = rarityScore;
    }
    
    public String getMarketType() {
        return marketType;
    }
    
    public void setMarketType(String marketType) {
        this.marketType = marketType;
    }
    
    public BigDecimal getPriceLkr() {
        return priceLkr;
    }
    
    public void setPriceLkr(BigDecimal priceLkr) {
        this.priceLkr = priceLkr;
    }
    
    public BigDecimal getPriceUsd() {
        return priceUsd;
    }
    
    public void setPriceUsd(BigDecimal priceUsd) {
        this.priceUsd = priceUsd;
    }
    
    public String getSaleDate() {
        return saleDate;
    }
    
    public void setSaleDate(String saleDate) {
        this.saleDate = saleDate;
    }
    
    public String getSellerType() {
        return sellerType;
    }
    
    public void setSellerType(String sellerType) {
        this.sellerType = sellerType;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    @Override
    public String toString() {
        return "SriLankanGemData{" +
                "gemType='" + gemType + '\'' +
                ", variety='" + variety + '\'' +
                ", carat=" + carat +
                ", color='" + color + '\'' +
                ", priceLkr=" + priceLkr +
                ", miningLocation='" + miningLocation + '\'' +
                '}';
    }
}
