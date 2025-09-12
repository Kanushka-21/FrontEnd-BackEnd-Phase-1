package com.gemnet.controller;

import com.gemnet.model.GemListing;
import com.gemnet.model.Bid;
import com.gemnet.model.Meeting;
import com.gemnet.model.Advertisement;
import com.gemnet.model.Feedback;
import com.gemnet.repository.GemListingRepository;
import com.gemnet.repository.BidRepository;
import com.gemnet.repository.MeetingRepository;
import com.gemnet.repository.AdvertisementRepository;
import com.gemnet.repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user-stats")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class UserStatsController {

    @Autowired
    private GemListingRepository gemListingRepository;

    @Autowired
    private BidRepository bidRepository;

    @Autowired
    private MeetingRepository meetingRepository;

    @Autowired
    private AdvertisementRepository advertisementRepository;

    @Autowired
    private FeedbackRepository feedbackRepository;

    @GetMapping("/seller/{userId}")
    public ResponseEntity<Map<String, Object>> getSellerStats(@PathVariable String userId) {
        try {
            System.out.println("📊 Fetching comprehensive seller statistics for user: " + userId);

            Map<String, Object> stats = new HashMap<>();

            // 1. Get ALL seller's listings to analyze comprehensively
            List<GemListing> allSellerListings = gemListingRepository.findByUserId(userId);
            System.out.println("📦 Total listings by seller: " + allSellerListings.size());

            // 2. Calculate Active Listings - listings that are live and available for bidding/viewing
            // Include APPROVED, ACTIVE, and bidding-enabled listings
            int activeListingsCount = 0;
            int totalViews = 0;
            BigDecimal totalListingValue = BigDecimal.ZERO;

            for (GemListing listing : allSellerListings) {
                // Count as active if approved, active, or available for bidding
                if (listing.getIsActive() && 
                    ("APPROVED".equals(listing.getListingStatus()) || 
                     "ACTIVE".equals(listing.getListingStatus()) ||
                     (listing.getBiddingActive() != null && listing.getBiddingActive()))) {
                    activeListingsCount++;
                    
                    // Add to total listing value
                    if (listing.getPrice() != null) {
                        totalListingValue = totalListingValue.add(listing.getPrice());
                    }
                }
                
                // Sum up total views across all listings
                if (listing.getViews() != null) {
                    totalViews += listing.getViews();
                }
            }
            System.out.println("📈 Active listings count: " + activeListingsCount);
            System.out.println("👁️ Total views across all listings: " + totalViews);

            // 3. Get ALL bids on ALL seller's listings (not just active ones)
            int totalBids = 0;
            BigDecimal highestBidReceived = BigDecimal.ZERO;
            String highestBidListingName = "";

            for (GemListing listing : allSellerListings) {
                List<Bid> listingBids = bidRepository.findByListingIdOrderByBidTimeDesc(listing.getId());
                totalBids += listingBids.size();
                
                // Track highest bid received
                for (Bid bid : listingBids) {
                    if (bid.getBidAmount() != null && bid.getBidAmount().compareTo(highestBidReceived) > 0) {
                        highestBidReceived = bid.getBidAmount();
                        highestBidListingName = listing.getGemName();
                    }
                }
            }
            System.out.println("💰 Total bids received: " + totalBids);
            System.out.println("🏆 Highest bid received: " + highestBidReceived + " on " + highestBidListingName);

            // 4. Calculate comprehensive revenue from all completed transactions
            List<GemListing> completedSales = gemListingRepository.findByUserIdAndListingStatus(userId, "SOLD");
            List<GemListing> soldListings = gemListingRepository.findByUserIdAndListingStatus(userId, "sold"); // lowercase variant
            
            // Combine both status variations
            completedSales.addAll(soldListings);
            
            BigDecimal totalRevenue = BigDecimal.ZERO;
            int completedSalesCount = 0;
            
            for (GemListing sale : completedSales) {
                completedSalesCount++;
                // Use final price if available, otherwise fall back to listing price
                if (sale.getFinalPrice() != null) {
                    totalRevenue = totalRevenue.add(sale.getFinalPrice());
                } else if (sale.getPrice() != null) {
                    totalRevenue = totalRevenue.add(sale.getPrice());
                }
            }
            System.out.println("💵 Total revenue from " + completedSalesCount + " sales: " + totalRevenue);

            // 5. Get upcoming meetings count - more comprehensive search
            List<Meeting> upcomingMeetings = meetingRepository.findBySellerIdAndStatus(userId, "CONFIRMED");
            List<Meeting> scheduledMeetings = meetingRepository.findBySellerIdAndStatus(userId, "SCHEDULED");
            List<Meeting> pendingMeetings = meetingRepository.findBySellerIdAndStatus(userId, "PENDING");
            
            // Count all future meetings regardless of exact status
            long upcomingMeetingsCount = 0;
            LocalDateTime now = LocalDateTime.now();
            
            upcomingMeetingsCount += upcomingMeetings.stream()
                .filter(meeting -> meeting.getConfirmedDateTime() != null && 
                                  meeting.getConfirmedDateTime().isAfter(now))
                .count();
                
            upcomingMeetingsCount += scheduledMeetings.stream()
                .filter(meeting -> (meeting.getConfirmedDateTime() != null && 
                                   meeting.getConfirmedDateTime().isAfter(now)) ||
                                  (meeting.getProposedDateTime() != null && 
                                   meeting.getProposedDateTime().isAfter(now)))
                .count();
                
            upcomingMeetingsCount += pendingMeetings.stream()
                .filter(meeting -> (meeting.getConfirmedDateTime() != null && 
                                   meeting.getConfirmedDateTime().isAfter(now)) ||
                                  (meeting.getProposedDateTime() != null && 
                                   meeting.getProposedDateTime().isAfter(now)))
                .count();
                
            System.out.println("📅 Upcoming meetings count: " + upcomingMeetingsCount);

            // 6. Calculate additional seller insights
            int pendingListings = 0;
            int rejectedListings = 0;
            int biddingActiveListings = 0;
            
            for (GemListing listing : allSellerListings) {
                if ("PENDING".equals(listing.getListingStatus())) {
                    pendingListings++;
                }
                if ("REJECTED".equals(listing.getListingStatus())) {
                    rejectedListings++;
                }
                if (listing.getBiddingActive() != null && listing.getBiddingActive()) {
                    biddingActiveListings++;
                }
            }

            // 7. Calculate Advertisement statistics
            List<Advertisement> allSellerAds = advertisementRepository.findByUserId(userId);
            int totalAdvertisements = allSellerAds.size();
            int approvedAdvertisements = 0;
            int pendingAdvertisements = 0;
            int rejectedAdvertisements = 0;
            
            for (Advertisement ad : allSellerAds) {
                if ("approved".equals(ad.getApproved()) || "APPROVED".equals(ad.getApproved())) {
                    approvedAdvertisements++;
                } else if ("pending".equals(ad.getApproved()) || "PENDING".equals(ad.getApproved())) {
                    pendingAdvertisements++;
                } else if ("rejected".equals(ad.getApproved()) || "REJECTED".equals(ad.getApproved())) {
                    rejectedAdvertisements++;
                }
            }
            System.out.println("📢 Advertisement stats - Total: " + totalAdvertisements + 
                             ", Approved: " + approvedAdvertisements + 
                             ", Pending: " + pendingAdvertisements + 
                             ", Rejected: " + rejectedAdvertisements);

            // 8. Calculate Feedback statistics (seller as recipient)
            List<Feedback> receivedFeedbacks = feedbackRepository.findByToUserIdOrderByCreatedAtDesc(userId);
            List<Feedback> sentFeedbacks = feedbackRepository.findByFromUserIdOrderByCreatedAtDesc(userId);
            
            int totalReceivedFeedbacks = receivedFeedbacks.size();
            int totalSentFeedbacks = sentFeedbacks.size();
            double averageRatingReceived = 0.0;
            
            if (totalReceivedFeedbacks > 0) {
                double totalRating = receivedFeedbacks.stream()
                    .filter(feedback -> feedback.getRating() != null)
                    .mapToInt(Feedback::getRating)
                    .sum();
                averageRatingReceived = totalRating / totalReceivedFeedbacks;
            }
            
            System.out.println("⭐ Feedback stats - Received: " + totalReceivedFeedbacks + 
                             ", Sent: " + totalSentFeedbacks + 
                             ", Average Rating: " + averageRatingReceived);

            // 9. Build comprehensive response
            stats.put("activeListings", activeListingsCount);
            stats.put("totalBids", totalBids);
            stats.put("totalRevenue", totalRevenue.doubleValue());
            stats.put("upcomingMeetings", (int) upcomingMeetingsCount);
            stats.put("completedSales", completedSalesCount);
            stats.put("averageRating", averageRatingReceived);
            
            // Additional comprehensive stats
            stats.put("totalListings", allSellerListings.size());
            stats.put("totalViews", totalViews);
            stats.put("totalListingValue", totalListingValue.doubleValue());
            stats.put("pendingListings", pendingListings);
            stats.put("rejectedListings", rejectedListings);
            stats.put("biddingActiveListings", biddingActiveListings);
            stats.put("highestBidReceived", highestBidReceived.doubleValue());
            stats.put("highestBidListingName", highestBidListingName);
            
            // Advertisement statistics
            stats.put("totalAdvertisements", totalAdvertisements);
            stats.put("approvedAdvertisements", approvedAdvertisements);
            stats.put("pendingAdvertisements", pendingAdvertisements);
            stats.put("rejectedAdvertisements", rejectedAdvertisements);
            
            // Feedback statistics
            stats.put("totalReceivedFeedbacks", totalReceivedFeedbacks);
            stats.put("totalSentFeedbacks", totalSentFeedbacks);
            stats.put("feedbackAverageRating", averageRatingReceived);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Comprehensive seller statistics retrieved successfully");
            response.put("data", stats);

            System.out.println("✅ Comprehensive seller stats calculated:");
            System.out.println("   📦 Total Listings: " + allSellerListings.size());
            System.out.println("   📈 Active Listings: " + activeListingsCount);
            System.out.println("   💰 Total Bids: " + totalBids);
            System.out.println("   💵 Revenue: " + totalRevenue);
            System.out.println("   📅 Upcoming Meetings: " + upcomingMeetingsCount);
            System.out.println("   👁️ Total Views: " + totalViews);
            System.out.println("   📢 Total Advertisements: " + totalAdvertisements);
            System.out.println("   ⭐ Average Rating: " + averageRatingReceived);
            System.out.println("   📝 Received Feedbacks: " + totalReceivedFeedbacks);
            
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ Error fetching comprehensive seller stats: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(createErrorResponse("Internal server error: " + e.getMessage()));
        }
    }

    @GetMapping("/buyer/{userId}")
    public ResponseEntity<Map<String, Object>> getBuyerStats(@PathVariable String userId) {
        try {
            System.out.println("📊 Fetching comprehensive buyer statistics for user: " + userId);

            Map<String, Object> stats = new HashMap<>();

            // 1. Get ALL bids placed by buyer
            List<Bid> buyerBids = bidRepository.findByBidderIdOrderByBidTimeDesc(userId);
            int totalBidsPlaced = buyerBids.size();
            System.out.println("💰 Total bids placed: " + totalBidsPlaced);

            // 2. Analyze bid status distribution
            long activeBids = 0;
            long wonBids = 0;
            long rejectedBids = 0;
            BigDecimal totalBidAmount = BigDecimal.ZERO;
            BigDecimal highestBid = BigDecimal.ZERO;
            
            for (Bid bid : buyerBids) {
                if (bid.getBidAmount() != null) {
                    totalBidAmount = totalBidAmount.add(bid.getBidAmount());
                    if (bid.getBidAmount().compareTo(highestBid) > 0) {
                        highestBid = bid.getBidAmount();
                    }
                }
                
                if ("ACTIVE".equals(bid.getStatus())) {
                    activeBids++;
                } else if ("WON".equals(bid.getStatus()) || "ACCEPTED".equals(bid.getStatus())) {
                    wonBids++;
                } else if ("REJECTED".equals(bid.getStatus()) || "LOST".equals(bid.getStatus())) {
                    rejectedBids++;
                }
            }
            
            System.out.println("📈 Active bids: " + activeBids);
            System.out.println("🏆 Won bids: " + wonBids);
            System.out.println("❌ Lost/Rejected bids: " + rejectedBids);

            // 3. Get purchased items (won auctions)
            List<GemListing> wonAuctions = gemListingRepository.findByWinningBidderId(userId);
            int totalPurchases = wonAuctions.size();
            System.out.println("🛒 Total purchases: " + totalPurchases);

            // 4. Calculate comprehensive spending
            BigDecimal totalSpent = BigDecimal.ZERO;
            BigDecimal averagePurchasePrice = BigDecimal.ZERO;
            BigDecimal highestPurchase = BigDecimal.ZERO;
            String mostExpensiveGem = "";
            
            for (GemListing purchase : wonAuctions) {
                BigDecimal purchasePrice = null;
                if (purchase.getFinalPrice() != null) {
                    purchasePrice = purchase.getFinalPrice();
                } else if (purchase.getPrice() != null) {
                    purchasePrice = purchase.getPrice();
                }
                
                if (purchasePrice != null) {
                    totalSpent = totalSpent.add(purchasePrice);
                    if (purchasePrice.compareTo(highestPurchase) > 0) {
                        highestPurchase = purchasePrice;
                        mostExpensiveGem = purchase.getGemName();
                    }
                }
            }
            
            if (totalPurchases > 0) {
                averagePurchasePrice = totalSpent.divide(BigDecimal.valueOf(totalPurchases), 2, BigDecimal.ROUND_HALF_UP);
            }
            
            System.out.println("💵 Total spent: " + totalSpent);
            System.out.println("📊 Average purchase price: " + averagePurchasePrice);

            // 5. Get comprehensive meetings data
            List<Meeting> upcomingBuyerMeetings = meetingRepository.findByBuyerIdAndStatus(userId, "CONFIRMED");
            List<Meeting> scheduledBuyerMeetings = meetingRepository.findByBuyerIdAndStatus(userId, "SCHEDULED");
            List<Meeting> pendingBuyerMeetings = meetingRepository.findByBuyerIdAndStatus(userId, "PENDING");
            
            long upcomingMeetingsCount = 0;
            LocalDateTime now = LocalDateTime.now();
            
            upcomingMeetingsCount += upcomingBuyerMeetings.stream()
                .filter(meeting -> meeting.getConfirmedDateTime() != null && 
                                  meeting.getConfirmedDateTime().isAfter(now))
                .count();
                
            upcomingMeetingsCount += scheduledBuyerMeetings.stream()
                .filter(meeting -> (meeting.getConfirmedDateTime() != null && 
                                   meeting.getConfirmedDateTime().isAfter(now)) ||
                                  (meeting.getProposedDateTime() != null && 
                                   meeting.getProposedDateTime().isAfter(now)))
                .count();
                
            upcomingMeetingsCount += pendingBuyerMeetings.stream()
                .filter(meeting -> (meeting.getConfirmedDateTime() != null && 
                                   meeting.getConfirmedDateTime().isAfter(now)) ||
                                  (meeting.getProposedDateTime() != null && 
                                   meeting.getProposedDateTime().isAfter(now)))
                .count();
                
            System.out.println("📅 Upcoming buyer meetings: " + upcomingMeetingsCount);

            // 6. Calculate buyer engagement metrics
            List<GemListing> allListings = gemListingRepository.findAll();
            int watchlistedItems = 0; // This would need a watchlist feature
            int recentlyViewedItems = 0; // This would need view tracking per user

            // 7. Calculate buyer advertisement statistics (if buyers can also create ads)
            List<Advertisement> buyerAds = advertisementRepository.findByUserId(userId);
            int totalBuyerAdvertisements = buyerAds.size();
            int approvedBuyerAds = 0;
            
            for (Advertisement ad : buyerAds) {
                if ("approved".equals(ad.getApproved()) || "APPROVED".equals(ad.getApproved())) {
                    approvedBuyerAds++;
                }
            }

            // 8. Calculate buyer feedback statistics
            List<Feedback> buyerReceivedFeedbacks = feedbackRepository.findByToUserIdOrderByCreatedAtDesc(userId);
            List<Feedback> buyerSentFeedbacks = feedbackRepository.findByFromUserIdOrderByCreatedAtDesc(userId);
            
            int totalBuyerReceivedFeedbacks = buyerReceivedFeedbacks.size();
            int totalBuyerSentFeedbacks = buyerSentFeedbacks.size();
            double buyerAverageRating = 0.0;
            
            if (totalBuyerReceivedFeedbacks > 0) {
                double totalRating = buyerReceivedFeedbacks.stream()
                    .filter(feedback -> feedback.getRating() != null)
                    .mapToInt(Feedback::getRating)
                    .sum();
                buyerAverageRating = totalRating / totalBuyerReceivedFeedbacks;
            }
            
            System.out.println("📢 Buyer advertisement stats - Total: " + totalBuyerAdvertisements + ", Approved: " + approvedBuyerAds);
            System.out.println("⭐ Buyer feedback stats - Received: " + totalBuyerReceivedFeedbacks + 
                             ", Sent: " + totalBuyerSentFeedbacks + 
                             ", Average Rating: " + buyerAverageRating);

            // 9. Build comprehensive response
            stats.put("totalBidsPlaced", totalBidsPlaced);
            stats.put("activeBids", (int) activeBids);
            stats.put("totalPurchases", totalPurchases);
            stats.put("totalSpent", totalSpent.doubleValue());
            stats.put("upcomingMeetings", (int) upcomingMeetingsCount);
            stats.put("savedSearches", 0); // Placeholder for future saved searches feature
            
            // Additional comprehensive stats
            stats.put("wonBids", (int) wonBids);
            stats.put("rejectedBids", (int) rejectedBids);
            stats.put("totalBidAmount", totalBidAmount.doubleValue());
            stats.put("highestBid", highestBid.doubleValue());
            stats.put("averagePurchasePrice", averagePurchasePrice.doubleValue());
            stats.put("highestPurchase", highestPurchase.doubleValue());
            stats.put("mostExpensiveGem", mostExpensiveGem);
            stats.put("watchlistedItems", watchlistedItems);
            stats.put("recentlyViewedItems", recentlyViewedItems);
            
            // Buyer advertisement statistics
            stats.put("totalBuyerAdvertisements", totalBuyerAdvertisements);
            stats.put("approvedBuyerAdvertisements", approvedBuyerAds);
            
            // Buyer feedback statistics  
            stats.put("totalReceivedFeedbacks", totalBuyerReceivedFeedbacks);
            stats.put("totalSentFeedbacks", totalBuyerSentFeedbacks);
            stats.put("averageRating", buyerAverageRating);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Comprehensive buyer statistics retrieved successfully");
            response.put("data", stats);

            System.out.println("✅ Comprehensive buyer stats calculated:");
            System.out.println("   💰 Total Bids Placed: " + totalBidsPlaced);
            System.out.println("   📈 Active Bids: " + activeBids);
            System.out.println("   🛒 Total Purchases: " + totalPurchases);
            System.out.println("   💵 Total Spent: " + totalSpent);
            System.out.println("   📅 Upcoming Meetings: " + upcomingMeetingsCount);
            System.out.println("   🏆 Won Bids: " + wonBids);
            System.out.println("   📢 Total Advertisements: " + totalBuyerAdvertisements);
            System.out.println("   ⭐ Average Rating: " + buyerAverageRating);
            System.out.println("   📝 Received Feedbacks: " + totalBuyerReceivedFeedbacks);
            
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ Error fetching comprehensive buyer stats: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(createErrorResponse("Internal server error: " + e.getMessage()));
        }
    }

    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        return response;
    }
}