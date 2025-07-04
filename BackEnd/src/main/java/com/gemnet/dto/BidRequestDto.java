package com.gemnet.dto;

import java.math.BigDecimal;

public class BidRequestDto {
    private String listingId;
    private String bidderId;
    private String bidderName;
    private String bidderEmail;
    private BigDecimal bidAmount;
    private String currency;
    private String message;
    
    // Constructors
    public BidRequestDto() {}
    
    public BidRequestDto(String listingId, String bidderId, String bidderName, 
                        String bidderEmail, BigDecimal bidAmount, String currency, String message) {
        this.listingId = listingId;
        this.bidderId = bidderId;
        this.bidderName = bidderName;
        this.bidderEmail = bidderEmail;
        this.bidAmount = bidAmount;
        this.currency = currency;
        this.message = message;
    }
    
    // Getters and Setters
    public String getListingId() {
        return listingId;
    }
    
    public void setListingId(String listingId) {
        this.listingId = listingId;
    }
    
    public String getBidderId() {
        return bidderId;
    }
    
    public void setBidderId(String bidderId) {
        this.bidderId = bidderId;
    }
    
    public String getBidderName() {
        return bidderName;
    }
    
    public void setBidderName(String bidderName) {
        this.bidderName = bidderName;
    }
    
    public String getBidderEmail() {
        return bidderEmail;
    }
    
    public void setBidderEmail(String bidderEmail) {
        this.bidderEmail = bidderEmail;
    }
    
    public BigDecimal getBidAmount() {
        return bidAmount;
    }
    
    public void setBidAmount(BigDecimal bidAmount) {
        this.bidAmount = bidAmount;
    }
    
    public String getCurrency() {
        return currency;
    }
    
    public void setCurrency(String currency) {
        this.currency = currency;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    @Override
    public String toString() {
        return "BidRequestDto{" +
                "listingId='" + listingId + '\'' +
                ", bidderId='" + bidderId + '\'' +
                ", bidderName='" + bidderName + '\'' +
                ", bidderEmail='" + bidderEmail + '\'' +
                ", bidAmount=" + bidAmount +
                ", currency='" + currency + '\'' +
                ", message='" + message + '\'' +
                '}';
    }
}
