package com.gemnet.service;

import com.gemnet.dto.ApiResponse;
import com.gemnet.model.GemListing;
import com.gemnet.repository.GemListingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Service for admin operations
 */
@Service
public class AdminService {

    @Autowired
    private GemListingRepository gemListingRepository;

    /**
     * Get pending gemstone listings for admin approval
     */
    public ApiResponse<Map<String, Object>> getPendingListings(Pageable pageable) {
        try {
            System.out.println("🔍 AdminService - Getting pending listings");
            
            // Fetch pending listings from database
            Page<GemListing> pendingListingsPage = gemListingRepository.findPendingApprovalListings(pageable);
            
            // Prepare response data
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("listings", pendingListingsPage.getContent());
            responseData.put("currentPage", pendingListingsPage.getNumber());
            responseData.put("totalPages", pendingListingsPage.getTotalPages());
            responseData.put("totalElements", pendingListingsPage.getTotalElements());
            responseData.put("pageSize", pendingListingsPage.getSize());
            responseData.put("hasNext", pendingListingsPage.hasNext());
            responseData.put("hasPrevious", pendingListingsPage.hasPrevious());
            
            System.out.println("✅ Retrieved " + pendingListingsPage.getNumberOfElements() + 
                             " pending listings out of " + pendingListingsPage.getTotalElements() + " total");
            
            return ApiResponse.success("Pending listings retrieved successfully", responseData);
            
        } catch (Exception e) {
            System.err.println("❌ AdminService - Error getting pending listings: " + e.getMessage());
            e.printStackTrace();
            return ApiResponse.error("Failed to retrieve pending listings: " + e.getMessage());
        }
    }

    /**
     * Update listing status (approve or reject)
     */
    public ApiResponse<Map<String, Object>> updateListingStatus(String listingId, String newStatus, String adminComment) {
        try {
            System.out.println("📝 AdminService - Updating listing status");
            System.out.println("🆔 Listing ID: " + listingId);
            System.out.println("📊 New Status: " + newStatus);
            
            // Find the listing
            Optional<GemListing> optionalListing = gemListingRepository.findById(listingId);
            
            if (!optionalListing.isPresent()) {
                System.err.println("❌ Listing not found with ID: " + listingId);
                return ApiResponse.error("Listing not found with ID: " + listingId);
            }
            
            GemListing listing = optionalListing.get();
            
            // Check if listing is in PENDING status
            if (!"PENDING".equals(listing.getListingStatus())) {
                System.err.println("❌ Listing is not in PENDING status. Current status: " + listing.getListingStatus());
                return ApiResponse.error("Only pending listings can be approved or rejected. Current status: " + listing.getListingStatus());
            }
            
            // Update the listing status
            String oldStatus = listing.getListingStatus();
            listing.setListingStatus(newStatus);
            listing.setUpdatedAt(LocalDateTime.now());
            
            // Save updated listing
            GemListing updatedListing = gemListingRepository.save(listing);
            
            // Prepare response data
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("listingId", listingId);
            responseData.put("oldStatus", oldStatus);
            responseData.put("newStatus", newStatus);
            responseData.put("updatedAt", updatedListing.getUpdatedAt());
            responseData.put("gemName", updatedListing.getGemName());
            responseData.put("seller", updatedListing.getUserName());
            
            if (adminComment != null && !adminComment.trim().isEmpty()) {
                responseData.put("adminComment", adminComment);
            }
            
            System.out.println("✅ Listing status updated successfully from " + oldStatus + " to " + newStatus);
            
            String successMessage = "APPROVED".equals(newStatus) ? 
                "Listing approved successfully" : "Listing rejected successfully";
            
            return ApiResponse.success(successMessage, responseData);
            
        } catch (Exception e) {
            System.err.println("❌ AdminService - Error updating listing status: " + e.getMessage());
            e.printStackTrace();
            return ApiResponse.error("Failed to update listing status: " + e.getMessage());
        }
    }

    /**
     * Get admin dashboard statistics
     */
    public ApiResponse<Map<String, Object>> getDashboardStats() {
        try {
            System.out.println("📊 AdminService - Getting dashboard statistics");
            
            // Count listings by status
            long pendingListings = gemListingRepository.countByListingStatus("PENDING");
            long approvedListings = gemListingRepository.countByListingStatus("APPROVED");
            long rejectedListings = gemListingRepository.countByListingStatus("REJECTED");
            long activeListings = gemListingRepository.countByListingStatus("ACTIVE");
            long soldListings = gemListingRepository.countByListingStatus("SOLD");
            
            // Total listings
            long totalListings = gemListingRepository.count();
            
            // Prepare response data
            Map<String, Object> stats = new HashMap<>();
            stats.put("pendingListings", pendingListings);
            stats.put("approvedListings", approvedListings);
            stats.put("rejectedListings", rejectedListings);
            stats.put("activeListings", activeListings);
            stats.put("soldListings", soldListings);
            stats.put("totalListings", totalListings);
            
            // Calculate percentages
            if (totalListings > 0) {
                stats.put("pendingPercentage", Math.round((pendingListings * 100.0) / totalListings));
                stats.put("approvedPercentage", Math.round((approvedListings * 100.0) / totalListings));
                stats.put("rejectedPercentage", Math.round((rejectedListings * 100.0) / totalListings));
            } else {
                stats.put("pendingPercentage", 0);
                stats.put("approvedPercentage", 0);
                stats.put("rejectedPercentage", 0);
            }
            
            System.out.println("✅ Dashboard stats retrieved: " + 
                             "Pending=" + pendingListings + 
                             ", Approved=" + approvedListings + 
                             ", Rejected=" + rejectedListings);
            
            return ApiResponse.success("Dashboard statistics retrieved successfully", stats);
            
        } catch (Exception e) {
            System.err.println("❌ AdminService - Error getting dashboard stats: " + e.getMessage());
            e.printStackTrace();
            return ApiResponse.error("Failed to retrieve dashboard statistics: " + e.getMessage());
        }
    }

    /**
     * Get listing details by ID
     */
    public ApiResponse<GemListing> getListingDetails(String listingId) {
        try {
            System.out.println("🔍 AdminService - Getting listing details for ID: " + listingId);
            
            Optional<GemListing> optionalListing = gemListingRepository.findById(listingId);
            
            if (!optionalListing.isPresent()) {
                System.err.println("❌ Listing not found with ID: " + listingId);
                return ApiResponse.error("Listing not found with ID: " + listingId);
            }
            
            GemListing listing = optionalListing.get();
            
            System.out.println("✅ Listing details retrieved: " + listing.getGemName() + 
                             " by " + listing.getUserName());
            
            return ApiResponse.success("Listing details retrieved successfully", listing);
            
        } catch (Exception e) {
            System.err.println("❌ AdminService - Error getting listing details: " + e.getMessage());
            e.printStackTrace();
            return ApiResponse.error("Failed to retrieve listing details: " + e.getMessage());
        }
    }
}
