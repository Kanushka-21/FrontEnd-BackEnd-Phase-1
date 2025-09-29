import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import CountdownTester from './CountdownTester';

interface CountdownTimerProps {
  listingId: string;
  initialRemainingSeconds?: number;
  biddingActive?: boolean;
  isExpired?: boolean;
  listingStatus?: 'APPROVED' | 'ACTIVE' | 'sold' | 'expired_no_bids' | string; // Add string for flexibility
  onCountdownComplete?: () => void;
  showIcon?: boolean;
  className?: string;
  showTester?: boolean; // New prop to show/hide testing tools
  biddingEndTime?: string; // Current end time for testing component
  onCountdownUpdate?: () => void; // New callback for when countdown is updated by testing
}

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// Function to process expired bids
const processExpiredBid = async (listingId: string) => {
  try {
    console.log(`🔄 Processing expired bid for listing: ${listingId}`);
    
    const response = await fetch('http://localhost:9092/api/bidding/process-expired', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Expired bids processed successfully:', result);
    } else {
      console.error('❌ Failed to process expired bids:', response.statusText);
    }
  } catch (error) {
    console.error('❌ Error processing expired bids:', error);
  }
};

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  listingId,
  initialRemainingSeconds = 0,
  biddingActive = false,
  isExpired = false,
  listingStatus,
  onCountdownComplete,
  showIcon = true,
  className = "",
  showTester = false,
  biddingEndTime,
  onCountdownUpdate
}) => {
  const [remainingSeconds, setRemainingSeconds] = useState(initialRemainingSeconds);
  const [countdown, setCountdown] = useState<CountdownTime>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isLocallyExpired, setIsLocallyExpired] = useState(false); // Track local expiration

  // Function to refresh countdown data
  const refreshCountdown = async () => {
    try {
      // CRITICAL: Don't refresh countdown for sold or expired items
      if (listingStatus === 'sold' || listingStatus === 'expired_no_bids') {
        console.log(`🛑 Skipping countdown refresh for ${listingStatus} item: ${listingId}`);
        return;
      }
      
      const response = await fetch(`http://localhost:9092/api/bidding/listing/${listingId}/countdown`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          // Only update countdown if the item is not sold
          if (data.data.listingStatus !== 'sold' && data.data.listingStatus !== 'expired_no_bids') {
            setRemainingSeconds(data.data.remainingTimeSeconds || 0);
            // Reset local expiration if we got new time from backend
            if ((data.data.remainingTimeSeconds || 0) > 0) {
              setIsLocallyExpired(false);
            }
            
            // Notify parent component that countdown was updated
            if (onCountdownUpdate) {
              onCountdownUpdate();
            }
          } else {
            console.log(`🛑 Backend says item ${listingId} is ${data.data.listingStatus} - not updating countdown`);
          }
        }
      }
    } catch (error) {
      console.error('Error refreshing countdown:', error);
    }
  };

  // Function to calculate countdown components
  const calculateCountdown = (totalSeconds: number): CountdownTime => {
    if (totalSeconds <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return { days, hours, minutes, seconds };
  };

  // Update countdown when remaining seconds change
  useEffect(() => {
    setCountdown(calculateCountdown(remainingSeconds));
  }, [remainingSeconds]);

  // Timer effect - FIXED: More robust timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    // FIXED: Start timer if we have remaining seconds, regardless of other conditions
    if (remainingSeconds > 0 && listingStatus !== 'sold' && listingStatus !== 'expired_no_bids') {
      console.log(`⏰ STARTING TIMER for listing ${listingId} with ${remainingSeconds} seconds remaining`);
      
      interval = setInterval(() => {
        setRemainingSeconds(prevSeconds => {
          const newSeconds = prevSeconds - 1;
          
          if (newSeconds <= 0) {
            console.log(`⏰ COUNTDOWN COMPLETE for listing ${listingId}`);
            // Set local expiration immediately for instant UI update
            setIsLocallyExpired(true);
            // Process expired bid when countdown completes
            processExpiredBid(listingId);
            if (onCountdownComplete) {
              onCountdownComplete();
            }
            return 0;
          }
          
          return newSeconds;
        });
      }, 1000);
    } else {
      console.log(`⏰ NOT STARTING TIMER for listing ${listingId} - remainingSeconds: ${remainingSeconds}, status: ${listingStatus}`);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [remainingSeconds, listingStatus, onCountdownComplete, listingId]);

  // Update initial values when props change
  useEffect(() => {
    console.log(`⏰ CountdownTimer props for listing ${listingId}:`, {
      initialRemainingSeconds,
      biddingActive,
      isExpired,
      listingStatus
    });
    setRemainingSeconds(initialRemainingSeconds);
    // Reset local expiration if we have new time
    if (initialRemainingSeconds > 0) {
      setIsLocallyExpired(false);
    }
    
    console.log(`⏰ FIXED: Timer will start if remainingSeconds > 0 for listing ${listingId} (status: ${listingStatus}, remainingSeconds: ${initialRemainingSeconds})`);
  }, [initialRemainingSeconds, biddingActive, isExpired, listingStatus, listingId]);

  // Format number with leading zero
  const formatNumber = (num: number): string => {
    return num.toString().padStart(2, '0');
  };

  // PRIORITY CHECK: If item is sold, show "Bidding Closed - SOLD" immediately
  // Handle various possible values for sold status
  console.log(`🔍 DEBUG: Checking listingStatus for ${listingId}: "${listingStatus}" (type: ${typeof listingStatus})`);
  
  // Check for SOLD status (string comparison to handle all cases)
  if (listingStatus === 'sold' || String(listingStatus).toLowerCase() === 'sold') {
    console.log(`🛑 SOLD ITEM DETECTED: ${listingId} - listingStatus: "${listingStatus}" - Showing SOLD badge`);
    return (
      <div className={`flex items-center gap-2 text-red-600 ${className}`}>
        {showIcon && <AlertCircle className="w-4 h-4" />}
        <div className="flex flex-col items-center">
          <span className="text-sm font-bold">Bidding Closed</span>
          <span className="text-xs font-semibold bg-red-100 text-red-800 px-2 py-0.5 rounded">SOLD</span>
        </div>
      </div>
    );
  }

  // Check for EXPIRED status
  if (listingStatus === 'expired_no_bids' || String(listingStatus).toLowerCase() === 'expired_no_bids') {
    console.log(`⏰ EXPIRED ITEM DETECTED: ${listingId} - listingStatus: "${listingStatus}" - Showing EXPIRED badge`);
    return (
      <div className={`flex items-center gap-2 text-gray-600 ${className}`}>
        {showIcon && <AlertCircle className="w-4 h-4" />}
        <div className="flex flex-col items-center">
          <span className="text-sm font-bold">Bidding Closed</span>
          <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">NO BIDS</span>
        </div>
      </div>
    );
  }

  // If bidding is not active and not expired, show "Waiting for first bid"
  if (!biddingActive && !isExpired && remainingSeconds <= 0 && 
      listingStatus !== 'sold' && listingStatus !== 'expired_no_bids') {
    return (
      <div className={`flex items-center gap-2 text-gray-500 ${className}`}>
        {showIcon && <Clock className="w-4 h-4" />}
        <span className="text-sm font-medium">Waiting for first bid</span>
      </div>
    );
  }

  // If expired or time has run out (including local expiration)
  if ((isExpired || isLocallyExpired || remainingSeconds <= 0) && listingStatus !== 'sold' && listingStatus !== 'expired_no_bids') {
    // For expired items, check if there's a winner to show SOLD badge
    return (
      <div className={`flex items-center gap-2 text-red-600 ${className}`}>
        {showIcon && <AlertCircle className="w-4 h-4" />}
        <div className="flex flex-col items-center">
          <span className="text-sm font-bold">Bidding Closed</span>
          <span className="text-xs font-semibold bg-red-100 text-red-800 px-2 py-0.5 rounded">SOLD</span>
        </div>
      </div>
    );
  }

  // Don't show countdown if locally expired
  if (isLocallyExpired || remainingSeconds <= 0) {
    return (
      <div className={`flex items-center gap-2 text-red-600 ${className}`}>
        {showIcon && <AlertCircle className="w-4 h-4" />}
        <div className="flex flex-col items-center">
          <span className="text-sm font-bold">Bidding Closed</span>
          <span className="text-xs font-semibold bg-red-100 text-red-800 px-2 py-0.5 rounded">EXPIRED</span>
        </div>
      </div>
    );
  }

  // Active countdown
  return (
    <div className="space-y-4">
      <div className={`flex items-center gap-2 ${className}`}>
        {showIcon && <Clock className="w-4 h-4 text-red-500" />}
        <div className="flex items-center gap-1">
          {countdown.days > 0 && (
            <>
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-red-600">{formatNumber(countdown.days)}</span>
                <span className="text-xs text-gray-500">days</span>
              </div>
              <span className="text-red-600 font-bold">:</span>
            </>
          )}
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-red-600">{formatNumber(countdown.hours)}</span>
            <span className="text-xs text-gray-500">hrs</span>
          </div>
          <span className="text-red-600 font-bold">:</span>
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-red-600">{formatNumber(countdown.minutes)}</span>
            <span className="text-xs text-gray-500">min</span>
          </div>
          <span className="text-red-600 font-bold">:</span>
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-red-600">{formatNumber(countdown.seconds)}</span>
            <span className="text-xs text-gray-500">sec</span>
          </div>
        </div>
      </div>
      
      {/* Testing Tools - Only show if enabled */}
      {showTester && (
        <CountdownTester 
          listingId={listingId}
          currentEndTime={biddingEndTime}
          onCountdownReduced={refreshCountdown}
        />
      )}
    </div>
  );
};

export default CountdownTimer;
