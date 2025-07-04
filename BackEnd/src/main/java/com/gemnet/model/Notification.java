package com.gemnet.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;

@Document(collection = "notifications")
public class Notification {
    
    @Id
    private String id;
    
    @Indexed
    private String userId; // User who will receive the notification
    
    @Indexed
    private String listingId; // Related listing
    
    private String bidId; // Related bid (if applicable)
    
    private String type; // NEW_BID, BID_OUTBID, BID_ACCEPTED, BID_REJECTED
    private String title;
    private String message;
    
    private boolean isRead;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
    
    // Additional data for context
    private String triggerUserId; // User who triggered the notification
    private String triggerUserName;
    private String bidAmount;
    private String gemName;
    
    // Constructors
    public Notification() {}
    
    public Notification(String userId, String listingId, String bidId, String type, 
                       String title, String message, String triggerUserId, 
                       String triggerUserName, String bidAmount, String gemName) {
        this.userId = userId;
        this.listingId = listingId;
        this.bidId = bidId;
        this.type = type;
        this.title = title;
        this.message = message;
        this.triggerUserId = triggerUserId;
        this.triggerUserName = triggerUserName;
        this.bidAmount = bidAmount;
        this.gemName = gemName;
        this.isRead = false;
        this.createdAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public String getListingId() {
        return listingId;
    }
    
    public void setListingId(String listingId) {
        this.listingId = listingId;
    }
    
    public String getBidId() {
        return bidId;
    }
    
    public void setBidId(String bidId) {
        this.bidId = bidId;
    }
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public boolean isRead() {
        return isRead;
    }
    
    public void setRead(boolean read) {
        isRead = read;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getReadAt() {
        return readAt;
    }
    
    public void setReadAt(LocalDateTime readAt) {
        this.readAt = readAt;
    }
    
    public String getTriggerUserId() {
        return triggerUserId;
    }
    
    public void setTriggerUserId(String triggerUserId) {
        this.triggerUserId = triggerUserId;
    }
    
    public String getTriggerUserName() {
        return triggerUserName;
    }
    
    public void setTriggerUserName(String triggerUserName) {
        this.triggerUserName = triggerUserName;
    }
    
    public String getBidAmount() {
        return bidAmount;
    }
    
    public void setBidAmount(String bidAmount) {
        this.bidAmount = bidAmount;
    }
    
    public String getGemName() {
        return gemName;
    }
    
    public void setGemName(String gemName) {
        this.gemName = gemName;
    }
    
    public void markAsRead() {
        this.isRead = true;
        this.readAt = LocalDateTime.now();
    }
}
