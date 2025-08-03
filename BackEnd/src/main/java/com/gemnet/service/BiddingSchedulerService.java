package com.gemnet.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class BiddingSchedulerService {
    
    @Autowired
    private BiddingService biddingService;
    
    /**
     * Automatically process expired bids every 30 seconds
     * This ensures that when countdowns expire, the bidding completion happens automatically
     */
    @Scheduled(fixedRate = 30000) // Run every 30 seconds
    public void processExpiredBidsAutomatically() {
        try {
            System.out.println("🔄 [SCHEDULER] Running automatic expired bid processing...");
            
            var result = biddingService.processExpiredBids();
            
            if (result.isSuccess()) {
                @SuppressWarnings("unchecked")
                var data = (java.util.Map<String, Object>) result.getData();
                int processedCount = (Integer) data.get("processedCount");
                int completedCount = (Integer) data.get("completedCount");
                
                if (completedCount > 0) {
                    System.out.println("✅ [SCHEDULER] Completed " + completedCount + " expired bids out of " + processedCount + " processed");
                    
                    @SuppressWarnings("unchecked")
                    var completedListings = (java.util.List<String>) data.get("completedListings");
                    for (String listingId : completedListings) {
                        System.out.println("   📦 Completed bidding for listing: " + listingId);
                    }
                } else if (processedCount == 0) {
                    // Only log occasionally to avoid spam
                    if (System.currentTimeMillis() % 300000 < 30000) { // Every 5 minutes
                        System.out.println("ℹ️ [SCHEDULER] No expired bids found to process");
                    }
                }
            } else {
                System.err.println("❌ [SCHEDULER] Failed to process expired bids: " + result.getMessage());
            }
            
        } catch (Exception e) {
            System.err.println("❌ [SCHEDULER] Error in automatic bid processing: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * Log scheduler status every 5 minutes for monitoring
     */
    @Scheduled(fixedRate = 300000) // Run every 5 minutes
    public void logSchedulerStatus() {
        System.out.println("🕐 [SCHEDULER] Bidding scheduler is active - monitoring for expired bids");
    }
}
