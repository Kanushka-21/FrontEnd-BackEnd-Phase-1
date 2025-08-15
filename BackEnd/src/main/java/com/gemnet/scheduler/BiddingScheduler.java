package com.gemnet.scheduler;

import com.gemnet.service.BiddingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class BiddingScheduler {
    
    @Autowired
    private BiddingService biddingService;
    
    /**
     * Process expired bids every 30 seconds to ensure timely completion
     * This prevents countdown reset issues
     */
    @Scheduled(fixedRate = 30000) // Every 30 seconds
    public void processExpiredBids() {
        try {
            System.out.println("🔄 [SCHEDULER] Processing expired bids...");
            biddingService.processExpiredBids();
        } catch (Exception e) {
            System.err.println("❌ [SCHEDULER] Error processing expired bids: " + e.getMessage());
        }
    }
    
    /**
     * Fix sold items with active bidding every 2 minutes
     * This ensures data consistency
     */
    @Scheduled(fixedRate = 120000) // Every 2 minutes
    public void fixSoldItemsWithActiveBidding() {
        try {
            System.out.println("🔧 [SCHEDULER] Checking for sold items with active bidding...");
            biddingService.fixSoldItemsWithActiveBidding();
        } catch (Exception e) {
            System.err.println("❌ [SCHEDULER] Error fixing sold items: " + e.getMessage());
        }
    }
}
