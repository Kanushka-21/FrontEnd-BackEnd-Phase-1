import React, { useEffect, useState } from 'react';
import { PricePredictionService, PricePredictionResponse } from '@/services/pricePredictionService';
import { TrendingUp, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

interface PricePredictionDisplayProps {
  listingId?: string;
  gemData?: any;
  showDetails?: boolean;
  className?: string;
}

const PricePredictionDisplay: React.FC<PricePredictionDisplayProps> = ({
  listingId,
  gemData,
  showDetails = false,
  className = ''
}) => {
  const [prediction, setPrediction] = useState<PricePredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrediction = async () => {
      if (!listingId && !gemData) return;

      setLoading(true);
      setError(null);

      try {
        let result: PricePredictionResponse;

        if (listingId) {
          result = await PricePredictionService.predictPriceForListing(listingId);
        } else if (gemData) {
          const request = PricePredictionService.gemListingToPredictionRequest(gemData);
          result = await PricePredictionService.predictPrice(request);
        } else {
          throw new Error('No data provided for prediction');
        }

        if (result.status === 'ERROR') {
          setError(result.message || 'Prediction failed');
        } else {
          setPrediction(result);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch price prediction');
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, [listingId, gemData]);

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (confidence >= 0.6) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <AlertTriangle className="h-4 w-4 text-red-600" />;
  };

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
        <span className="text-sm text-gray-600">Calculating estimated price...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center space-x-2 text-red-600 ${className}`}>
        <AlertTriangle className="h-4 w-4" />
        <span className="text-sm">Price prediction unavailable</span>
      </div>
    );
  }

  if (!prediction) {
    return null;
  }

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200 ${className}`}>
      <div className="flex items-center space-x-2 mb-2">
        <TrendingUp className="h-5 w-5 text-blue-600" />
        <h3 className="text-sm font-semibold text-gray-800">AI Price Prediction</h3>
      </div>

      <div className="space-y-2">
        <div>
          <span className="text-xs text-gray-600">Estimated Price</span>
          <p className="text-lg font-bold text-blue-700">
            {PricePredictionService.formatPrice(prediction.predictedPrice, prediction.currency)}
          </p>
        </div>

        <div>
          <span className="text-xs text-gray-600">Price Range</span>
          <p className="text-sm text-gray-700">
            {PricePredictionService.formatPriceRange(
              prediction.minPrice,
              prediction.maxPrice,
              prediction.currency
            )}
          </p>
        </div>

        {showDetails && (
          <div className="pt-2 border-t border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Confidence</span>
              <div className="flex items-center space-x-1">
                {getConfidenceIcon(prediction.confidenceScore)}
                <span className={`text-xs font-medium ${getConfidenceColor(prediction.confidenceScore)}`}>
                  {Math.round(prediction.confidenceScore * 100)}%
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 mt-2">
          <p>💡 Powered by machine learning analysis of market data</p>
        </div>
      </div>
    </div>
  );
};

export default PricePredictionDisplay;
