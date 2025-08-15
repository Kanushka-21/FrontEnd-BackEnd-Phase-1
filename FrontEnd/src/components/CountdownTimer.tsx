import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import CountdownTester from './CountdownTester';

interface CountdownTimerProps {
  listingId: string;
  initialRemainingSeconds?: number;
  biddingActive?: boolean;
  isExpired?: boolean;
  listingStatus?: 'APPROVED' | 'ACTIVE' | 'sold' | 'expired_no_bids'; // Add expired_no_bids status
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
  const [isActive, setIsActive] = useState(false); // Initialize as false, will be set based on status checks
  const [countdown, setCountdown] = useState<CountdownTime>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Function to refresh countdown data
  const refreshCountdown = async () => {
    try {
      const response = await fetch(`http://localhost:9092/api/bidding/listing/${listingId}/countdown`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setRemainingSeconds(data.data.remainingTimeSeconds || 0);
          // Only set active if status is not sold/expired and bidding is actually active
          const shouldBeActive = data.data.biddingActive && 
                                 !data.data.isExpired && 
                                 listingStatus !== 'sold' && 
                                 listingStatus !== 'expired_no_bids';
          setIsActive(shouldBeActive);
          
          // Notify parent component that countdown was updated
          if (onCountdownUpdate) {
            onCountdownUpdate();
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

  // Timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isActive && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds(prevSeconds => {
          const newSeconds = prevSeconds - 1;
          
          if (newSeconds <= 0) {
            setIsActive(false);
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
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, remainingSeconds, onCountdownComplete, listingId]);

  // Update initial values when props change
  useEffect(() => {
    console.log(`⏰ CountdownTimer props for listing ${listingId}:`, {
      initialRemainingSeconds,
      biddingActive,
      isExpired,
      listingStatus // Add this to see the actual value
    });
    setRemainingSeconds(initialRemainingSeconds);
    
    // Only set active if status allows it - NEVER for sold or expired items
    const shouldBeActive = biddingActive && 
                          !isExpired && 
                          listingStatus !== 'sold' && 
                          listingStatus !== 'expired_no_bids';
    setIsActive(shouldBeActive);
    
    console.log(`⏰ Setting isActive to: ${shouldBeActive} for listing ${listingId}`);
  }, [initialRemainingSeconds, biddingActive, isExpired, listingStatus, listingId]);

  // Format number with leading zero
  const formatNumber = (num: number): string => {
    return num.toString().padStart(2, '0');
  };

  // PRIORITY CHECK: If item is sold, show "Bidding Closed - SOLD" immediately
  // Handle various possible values for sold status
  console.log(`🔍 DEBUG: Checking listingStatus for ${listingId}: "${listingStatus}" (type: ${typeof listingStatus})`);
  
  const isSold = listingStatus === 'sold';
  const isExpiredNoBids = listingStatus === 'expired_no_bids';
  
  // TEMPORARY DEBUG: Always show sold status for testing
  if (isSold || (listingStatus as string) === 'sold') {
    console.log(`🛑 SOLD ITEM DETECTED: ${listingId} - listingStatus: "${listingStatus}" - Showing closed status`);
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

  // Handle expired items with no bids
  if (isExpiredNoBids || (listingStatus as string) === 'expired_no_bids') {
    console.log(`⏰ EXPIRED ITEM DETECTED: ${listingId} - listingStatus: "${listingStatus}" - Showing closed status`);
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
  if (!biddingActive && !isExpired && (listingStatus as string) !== 'sold') {
    return (
      <div className={`flex items-center gap-2 text-gray-500 ${className}`}>
        {showIcon && <Clock className="w-4 h-4" />}
        <span className="text-sm font-medium">Waiting for first bid</span>
      </div>
    );
  }

  // If expired
  if (isExpired || (!isActive && remainingSeconds <= 0)) {
    return (
      <div className={`flex items-center gap-2 text-red-600 ${className}`}>
        {showIcon && <AlertCircle className="w-4 h-4" />}
        <span className="text-sm font-bold">Bidding Closed</span>
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
