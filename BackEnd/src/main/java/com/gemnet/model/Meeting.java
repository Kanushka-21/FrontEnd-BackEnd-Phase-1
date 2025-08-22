package com.gemnet.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "meetings")
public class Meeting {
    
    @Id
    private String id;
    
    @Field("buyerId")
    private String buyerId;
    
    @Field("sellerId")
    private String sellerId;
    
    @Field("purchaseId")
    private String purchaseId; // Link to the purchase/gem listing
    
    @Field("gemName")
    private String gemName;
    
    @Field("gemType")
    private String gemType;
    
    @Field("finalPrice")
    private Double finalPrice;
    
    @Field("proposedDateTime")
    private LocalDateTime proposedDateTime;
    
    @Field("confirmedDateTime")
    private LocalDateTime confirmedDateTime;
    
    @Field("location")
    private String location;
    
    @Field("meetingType")
    private String meetingType; // "PHYSICAL", "VIRTUAL", "PICKUP"
    
    @Field("status")
    private String status; // "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "RESCHEDULED"
    
    @Field("buyerNotes")
    private String buyerNotes;
    
    @Field("sellerNotes")
    private String sellerNotes;
    
    @Field("adminNotes")
    private String adminNotes;
    
    @Field("createdAt")
    private LocalDateTime createdAt;
    
    @Field("updatedAt")
    private LocalDateTime updatedAt;
    
    @Field("buyerEmail")
    private String buyerEmail;
    
    @Field("sellerEmail")
    private String sellerEmail;
    
    @Field("buyerPhone")
    private String buyerPhone;
    
    @Field("sellerPhone")
    private String sellerPhone;
    
    @Field("remindersSent")
    private List<LocalDateTime> remindersSent;
    
    @Field("commissionAmount")
    private Double commissionAmount;
    
    @Field("paymentStatus")
    private String paymentStatus; // "PENDING", "PAID", "COMMISSION_DEDUCTED"
    
    // Constructors
    public Meeting() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.status = "PENDING";
    }
    
    public Meeting(String buyerId, String sellerId, String purchaseId, String gemName, String gemType, Double finalPrice) {
        this();
        this.buyerId = buyerId;
        this.sellerId = sellerId;
        this.purchaseId = purchaseId;
        this.gemName = gemName;
        this.gemType = gemType;
        this.finalPrice = finalPrice;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getBuyerId() {
        return buyerId;
    }
    
    public void setBuyerId(String buyerId) {
        this.buyerId = buyerId;
    }
    
    public String getSellerId() {
        return sellerId;
    }
    
    public void setSellerId(String sellerId) {
        this.sellerId = sellerId;
    }
    
    public String getPurchaseId() {
        return purchaseId;
    }
    
    public void setPurchaseId(String purchaseId) {
        this.purchaseId = purchaseId;
    }
    
    public String getGemName() {
        return gemName;
    }
    
    public void setGemName(String gemName) {
        this.gemName = gemName;
    }
    
    public String getGemType() {
        return gemType;
    }
    
    public void setGemType(String gemType) {
        this.gemType = gemType;
    }
    
    public Double getFinalPrice() {
        return finalPrice;
    }
    
    public void setFinalPrice(Double finalPrice) {
        this.finalPrice = finalPrice;
    }
    
    public LocalDateTime getProposedDateTime() {
        return proposedDateTime;
    }
    
    public void setProposedDateTime(LocalDateTime proposedDateTime) {
        this.proposedDateTime = proposedDateTime;
    }
    
    public LocalDateTime getConfirmedDateTime() {
        return confirmedDateTime;
    }
    
    public void setConfirmedDateTime(LocalDateTime confirmedDateTime) {
        this.confirmedDateTime = confirmedDateTime;
    }
    
    public String getLocation() {
        return location;
    }
    
    public void setLocation(String location) {
        this.location = location;
    }
    
    public String getMeetingType() {
        return meetingType;
    }
    
    public void setMeetingType(String meetingType) {
        this.meetingType = meetingType;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
        this.updatedAt = LocalDateTime.now();
    }
    
    public String getBuyerNotes() {
        return buyerNotes;
    }
    
    public void setBuyerNotes(String buyerNotes) {
        this.buyerNotes = buyerNotes;
    }
    
    public String getSellerNotes() {
        return sellerNotes;
    }
    
    public void setSellerNotes(String sellerNotes) {
        this.sellerNotes = sellerNotes;
    }
    
    public String getAdminNotes() {
        return adminNotes;
    }
    
    public void setAdminNotes(String adminNotes) {
        this.adminNotes = adminNotes;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public String getBuyerEmail() {
        return buyerEmail;
    }
    
    public void setBuyerEmail(String buyerEmail) {
        this.buyerEmail = buyerEmail;
    }
    
    public String getSellerEmail() {
        return sellerEmail;
    }
    
    public void setSellerEmail(String sellerEmail) {
        this.sellerEmail = sellerEmail;
    }
    
    public String getBuyerPhone() {
        return buyerPhone;
    }
    
    public void setBuyerPhone(String buyerPhone) {
        this.buyerPhone = buyerPhone;
    }
    
    public String getSellerPhone() {
        return sellerPhone;
    }
    
    public void setSellerPhone(String sellerPhone) {
        this.sellerPhone = sellerPhone;
    }
    
    public List<LocalDateTime> getRemindersSent() {
        return remindersSent;
    }
    
    public void setRemindersSent(List<LocalDateTime> remindersSent) {
        this.remindersSent = remindersSent;
    }
    
    public Double getCommissionAmount() {
        return commissionAmount;
    }
    
    public void setCommissionAmount(Double commissionAmount) {
        this.commissionAmount = commissionAmount;
    }
    
    public String getPaymentStatus() {
        return paymentStatus;
    }
    
    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }
    
    @Override
    public String toString() {
        return "Meeting{" +
                "id='" + id + '\'' +
                ", buyerId='" + buyerId + '\'' +
                ", sellerId='" + sellerId + '\'' +
                ", purchaseId='" + purchaseId + '\'' +
                ", gemName='" + gemName + '\'' +
                ", status='" + status + '\'' +
                ", proposedDateTime=" + proposedDateTime +
                ", confirmedDateTime=" + confirmedDateTime +
                ", createdAt=" + createdAt +
                '}';
    }
}
