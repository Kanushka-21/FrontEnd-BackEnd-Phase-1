import React, { useState } from 'react';
import { Clock, TestTube, ArrowDown } from 'lucide-react';

interface CountdownTesterProps {
  listingId: string;
  currentEndTime?: string;
  onCountdownReduced?: () => void;
}

const CountdownTester: React.FC<CountdownTesterProps> = ({ 
  listingId, 
  currentEndTime, 
  onCountdownReduced 
}) => {
  const [reduceByMinutes, setReduceByMinutes] = useState<number>(60); // Default 1 hour
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleReduceCountdown = async () => {
    if (!reduceByMinutes || reduceByMinutes <= 0) {
      setMessage('Please enter a valid number of minutes');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch(
        `http://localhost:9092/api/bidding/testing/reduce-countdown/${listingId}?reduceByMinutes=${reduceByMinutes}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        const result = data.data;
        setMessage(
          `✅ Countdown reduced by ${result.reducedByMinutes} minutes! ` +
          `Remaining time: ${result.remainingDays}d ${result.remainingHours}h ${result.remainingMinutes}m ${result.remainingSeconds}s`
        );
        
        // Call the callback to refresh the countdown display
        if (onCountdownReduced) {
          onCountdownReduced();
        }
      } else {
        setMessage(`❌ Failed: ${data.message}`);
      }
    } catch (error) {
      console.error('Error reducing countdown:', error);
      setMessage('❌ Error: Failed to reduce countdown');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick preset buttons
  const presetOptions = [
    { label: '30 seconds', minutes: 0.5 },
    { label: '5 minutes', minutes: 5 },
    { label: '1 hour', minutes: 60 },
    { label: '6 hours', minutes: 360 },
    { label: '1 day', minutes: 1440 },
    { label: '3 days', minutes: 4320 }
  ];

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
      <div 
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <TestTube className="w-5 h-5 text-yellow-600" />
        <h3 className="font-semibold text-yellow-800">Testing Tools</h3>
        <ArrowDown className={`w-4 h-4 text-yellow-600 transition-transform ${
          isExpanded ? 'rotate-180' : ''
        }`} />
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          <div className="bg-white rounded-lg p-4 border border-yellow-200">
            <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Reduce Countdown for Testing
            </h4>
            
            <div className="space-y-3">
              {/* Current end time display */}
              {currentEndTime && (
                <div className="text-sm text-gray-600">
                  <strong>Current End Time:</strong> {new Date(currentEndTime).toLocaleString()}
                </div>
              )}

              {/* Quick preset buttons */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick Presets:
                </label>
                <div className="flex flex-wrap gap-2">
                  {presetOptions.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => setReduceByMinutes(preset.minutes)}
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Or enter custom minutes:
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={reduceByMinutes}
                  onChange={(e) => setReduceByMinutes(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter minutes to reduce"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter 0.5 for 30 seconds, 5 for 5 minutes, 60 for 1 hour, etc.
                </p>
              </div>

              {/* Action button */}
              <button
                onClick={handleReduceCountdown}
                disabled={isLoading || !reduceByMinutes || reduceByMinutes <= 0}
                className={`w-full px-4 py-2 rounded-md font-medium transition-colors ${
                  isLoading || !reduceByMinutes || reduceByMinutes <= 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Reducing Countdown...
                  </span>
                ) : (
                  `Reduce Countdown by ${reduceByMinutes} minute${reduceByMinutes !== 1 ? 's' : ''}`
                )}
              </button>

              {/* Status message */}
              {message && (
                <div className={`text-sm p-2 rounded-md ${
                  message.startsWith('✅') 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {message}
                </div>
              )}
            </div>
          </div>

          {/* Warning notice */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-xs text-orange-700">
              <strong>⚠️ Testing Feature:</strong> This tool is for testing the bid completion workflow. 
              It reduces the countdown time to help you test what happens when bidding expires and 
              winners are determined.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CountdownTester;
