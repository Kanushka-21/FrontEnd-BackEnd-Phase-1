import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';

interface CountdownTimerProps {
  listingId: string;
  initialRemainingSeconds?: number;
  biddingActive?: boolean;
  isExpired?: boolean;
  onCountdownComplete?: () => void;
  showIcon?: boolean;
  className?: string;
}

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  listingId,
  initialRemainingSeconds = 0,
  biddingActive = false,
  isExpired = false,
  onCountdownComplete,
  showIcon = true,
  className = ""
}) => {
  const [remainingSeconds, setRemainingSeconds] = useState(initialRemainingSeconds);
  const [isActive, setIsActive] = useState(biddingActive && !isExpired);
  const [countdown, setCountdown] = useState<CountdownTime>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

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
    let interval: NodeJS.Timeout | null = null;

    if (isActive && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds(prevSeconds => {
          const newSeconds = prevSeconds - 1;
          
          if (newSeconds <= 0) {
            setIsActive(false);
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
  }, [isActive, remainingSeconds, onCountdownComplete]);

  // Update initial values when props change
  useEffect(() => {
    console.log(`⏰ CountdownTimer props for listing ${listingId}:`, {
      initialRemainingSeconds,
      biddingActive,
      isExpired
    });
    setRemainingSeconds(initialRemainingSeconds);
    setIsActive(biddingActive && !isExpired);
  }, [initialRemainingSeconds, biddingActive, isExpired, listingId]);

  // Format number with leading zero
  const formatNumber = (num: number): string => {
    return num.toString().padStart(2, '0');
  };

  // If bidding is not active and not expired, show "Waiting for first bid"
  if (!biddingActive && !isExpired) {
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
  );
};

export default CountdownTimer;
