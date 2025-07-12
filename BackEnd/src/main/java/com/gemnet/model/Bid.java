package com.gemnet.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Document(collection = "bids")
public class Bid {
    
    @Id
    private String id;
    
    @Indexed
    private String listingId;
    
    @Indexed
    private String bidderId;
    
    private String bidderName;
    private String bidderEmail;
    
    @Indexed
    private String sellerId;
    
    private BigDecimal bidAmount;
    private String currency;
    
    private LocalDateTime bidTime;
    private String status; // ACTIVE, OUTBID, WITHDRAWN, ACCEPTED, REJECTED
    
    private String message; // Optional message from bidder
    
    // Constructors
    public Bid() {}
    
    public Bid(String listingId, String bidderId, String bidderName, String bidderEmail, 
               String sellerId, BigDecimal bidAmount, String currency, String message) {
        this.listingId = listingId;
        this.bidderId = bidderId;
        this.bidderName = bidderName;
        this.bidderEmail = bidderEmail;
        this.sellerId = sellerId;
        this.bidAmount = bidAmount;
        this.currency = currency;
        this.message = message;
        this.bidTime = LocalDateTime.now();
        this.status = "ACTIVE";
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
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
    
    public String getSellerId() {
        return sellerId;
    }
    
    public void setSellerId(String sellerId) {
        this.sellerId = sellerId;
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
    
    public LocalDateTime getBidTime() {
        return bidTime;
    }
    
    public void setBidTime(LocalDateTime bidTime) {
        this.bidTime = bidTime;
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
        return "Bid{" +
                "id='" + id + '\'' +
                ", listingId='" + listingId + '\'' +
                ", bidderId='" + bidderId + '\'' +
                ", bidderName='" + bidderName + '\'' +
                ", sellerId='" + sellerId + '\'' +
                ", bidAmount=" + bidAmount +
                ", currency='" + currency + '\'' +
                ", bidTime=" + bidTime +
                ", status='" + status + '\'' +
                '}';
    }
}
