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
    
    @Field("commissionRate")
    private Double commissionRate = 0.06; // Default 6% commission rate
    
    @Field("paymentStatus")
    private String paymentStatus; // "PENDING", "PAID", "COMMISSION_DEDUCTED"
    
    // No-show tracking fields
    @Field("buyerAttended")
    private Boolean buyerAttended; // null = not verified, true = attended, false = no-show
    
    @Field("sellerAttended")
    private Boolean sellerAttended; // null = not verified, true = attended, false = no-show
    
    @Field("adminVerified")
    private Boolean adminVerified = false; // Whether admin has verified attendance
    
    @Field("verifiedAt")
    private LocalDateTime verifiedAt; // When admin verified attendance
    
    @Field("verifiedBy")
    private String verifiedBy; // Admin ID who verified
    
    // Reason submission fields
    @Field("buyerReasonSubmission")
    private String buyerReasonSubmission; // Reason why buyer cannot attend
    
    @Field("sellerReasonSubmission")
    private String sellerReasonSubmission; // Reason why seller cannot attend
    
    @Field("buyerReasonSubmittedAt")
    private LocalDateTime buyerReasonSubmittedAt;
    
    @Field("sellerReasonSubmittedAt")
    private LocalDateTime sellerReasonSubmittedAt;
    
    @Field("buyerReasonAccepted")
    private Boolean buyerReasonAccepted; // Whether admin accepted buyer's reason
    
    @Field("sellerReasonAccepted")
    private Boolean sellerReasonAccepted; // Whether admin accepted seller's reason
    
    // Meeting ID generation for easier search
    @Field("meetingDisplayId")
    private String meetingDisplayId; // Human-readable meeting ID like "GEM-2025-001"
    
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
    
    public Double getCommissionRate() {
        return commissionRate;
    }
    
    public void setCommissionRate(Double commissionRate) {
        this.commissionRate = commissionRate;
        // Recalculate commission amount when rate changes
        if (this.finalPrice != null && commissionRate != null) {
            this.commissionAmount = this.finalPrice * commissionRate;
        }
    }
    
    public String getPaymentStatus() {
        return paymentStatus;
    }
    
    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }
    
    // No-show tracking getters and setters
    public Boolean getBuyerAttended() { return buyerAttended; }
    public void setBuyerAttended(Boolean buyerAttended) { this.buyerAttended = buyerAttended; }
    
    public Boolean getSellerAttended() { return sellerAttended; }
    public void setSellerAttended(Boolean sellerAttended) { this.sellerAttended = sellerAttended; }
    
    public Boolean getAdminVerified() { return adminVerified; }
    public void setAdminVerified(Boolean adminVerified) { this.adminVerified = adminVerified; }
    
    public LocalDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }
    
    public String getVerifiedBy() { return verifiedBy; }
    public void setVerifiedBy(String verifiedBy) { this.verifiedBy = verifiedBy; }
    
    public String getBuyerReasonSubmission() { return buyerReasonSubmission; }
    public void setBuyerReasonSubmission(String buyerReasonSubmission) { 
        this.buyerReasonSubmission = buyerReasonSubmission;
        if (buyerReasonSubmission != null) {
            this.buyerReasonSubmittedAt = LocalDateTime.now();
        }
    }
    
    public String getSellerReasonSubmission() { return sellerReasonSubmission; }
    public void setSellerReasonSubmission(String sellerReasonSubmission) { 
        this.sellerReasonSubmission = sellerReasonSubmission;
        if (sellerReasonSubmission != null) {
            this.sellerReasonSubmittedAt = LocalDateTime.now();
        }
    }
    
    public LocalDateTime getBuyerReasonSubmittedAt() { return buyerReasonSubmittedAt; }
    public void setBuyerReasonSubmittedAt(LocalDateTime buyerReasonSubmittedAt) { this.buyerReasonSubmittedAt = buyerReasonSubmittedAt; }
    
    public LocalDateTime getSellerReasonSubmittedAt() { return sellerReasonSubmittedAt; }
    public void setSellerReasonSubmittedAt(LocalDateTime sellerReasonSubmittedAt) { this.sellerReasonSubmittedAt = sellerReasonSubmittedAt; }
    
    public Boolean getBuyerReasonAccepted() { return buyerReasonAccepted; }
    public void setBuyerReasonAccepted(Boolean buyerReasonAccepted) { this.buyerReasonAccepted = buyerReasonAccepted; }
    
    public Boolean getSellerReasonAccepted() { return sellerReasonAccepted; }
    public void setSellerReasonAccepted(Boolean sellerReasonAccepted) { this.sellerReasonAccepted = sellerReasonAccepted; }
    
    public String getMeetingDisplayId() { return meetingDisplayId; }
    public void setMeetingDisplayId(String meetingDisplayId) { this.meetingDisplayId = meetingDisplayId; }
    
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
