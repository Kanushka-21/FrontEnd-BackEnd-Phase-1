import React, { useEffect, useState } from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, Loader2, Brain } from 'lucide-react';

interface PredictionResult {
  predictedPrice: number;
  minPrice: number;
  maxPrice: number;
  confidence: number;
  currency: string;
}

interface AIPricePredictionProps {
  gemData: {
    weight: string | number;
    color: string;
    cut?: string;
    clarity?: string;
    species?: string;
    isCertified?: boolean;
    shape?: string;
    treatment?: string;
  };
  showDetails?: boolean;
  className?: string;
}

const AIPricePrediction: React.FC<AIPricePredictionProps> = ({
  gemData,
  showDetails = true,
  className = ''
}) => {
  console.log('🎯 AIPricePrediction component initialized with gemData:', gemData);
  
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('🎯 AIPricePrediction state - loading:', loading, 'prediction:', prediction, 'error:', error);

  // Call backend AI price prediction API
  const fetchPrediction = async (data: typeof gemData): Promise<PredictionResult> => {
    console.log('🔍 Raw gemData received:', data);
    
    let carat = 1.0;
    try {
      // More robust weight parsing
      if (data.weight) {
        if (typeof data.weight === 'string') {
          // Extract numeric value from string like "2.5 ct" or "2.5"
          const match = data.weight.match(/(\d+\.?\d*)/);
          if (match) {
            carat = parseFloat(match[1]);
          }
        } else if (typeof data.weight === 'number') {
          carat = data.weight;
        }
      }
    } catch (e) {
      console.warn('⚠️ Weight parsing error:', e);
      carat = 1.0;
    }
    
    const species = (data.species || 'sapphire').toLowerCase().trim();
    const color = (data.color || 'blue').toLowerCase().trim();
    const clarity = (data.clarity || 'SI1').toLowerCase().replace(/\s/g, '_');
    const cut = (data.cut || 'Good').toLowerCase().replace(/\s/g, '_');
    
    const requestBody = {
      species: species,
      color: color,
      clarity: clarity,
      cut: cut,
      carat: carat,
      isCertified: data.isCertified || false,
      origin: 'ceylon', // Default origin
      treatment: data.treatment || 'Heat Treatment',
      shape: data.shape || 'Round'
    };

    try {
      console.log('🤖 Making AI price prediction request:', requestBody);
      console.log('🌐 API URL:', 'http://localhost:9092/api/predictions/predict');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch('http://localhost:9092/api/predictions/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log('📡 AI prediction response status:', response.status);
      console.log('📡 AI prediction response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ AI prediction API error:', errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ AI prediction result:', result);
      
      // Validate response structure
      if (!result || typeof result.predictedPrice !== 'number') {
        console.error('❌ Invalid API response structure:', result);
        throw new Error('Invalid API response structure');
      }
      
      return {
        predictedPrice: result.predictedPrice,
        minPrice: result.minPrice,
        maxPrice: result.maxPrice,
        confidence: result.confidence,
        currency: result.currency || 'LKR'
      };
    } catch (error) {
      console.error('🚨 AI price prediction API error:', error);
      console.error('🚨 Error type:', error.constructor.name);
      console.error('🚨 Error message:', error.message);
      if (error.name === 'AbortError') {
        console.error('🚨 Request timed out after 10 seconds');
      }
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        console.error('🚨 Network error: Cannot connect to backend server');
      }
      
      // Fallback to local calculation if API fails
      console.log('🔄 Falling back to local pricing calculation');
      return fallbackCalculation(data);
    }
  };

  // Fallback calculation if API is unavailable
  const fallbackCalculation = (data: typeof gemData): PredictionResult => {
    let carat = 1.0;
    try {
      if (data.weight) {
        if (typeof data.weight === 'string') {
          const match = data.weight.match(/(\d+\.?\d*)/);
          if (match) {
            carat = parseFloat(match[1]);
          }
        } else if (typeof data.weight === 'number') {
          carat = data.weight;
        }
      }
    } catch (e) {
      carat = 1.0;
    }

    const species = data.species?.toLowerCase() || data.color?.toLowerCase() || 'sapphire';
    
    // Simplified base prices per carat in LKR
    const basePrices: { [key: string]: number } = {
      'sapphire': 50000,
      'ruby': 80000,
      'emerald': 45000,
      'diamond': 150000,
      'spinel': 30000,
      'garnet': 15000,
      'blue': 50000,
      'red': 80000,
      'green': 45000,
      'yellow': 25000,
      'pink': 60000,
    };

    let basePrice = 25000;
    for (const [key, price] of Object.entries(basePrices)) {
      if (species.includes(key) || data.color?.toLowerCase().includes(key)) {
        basePrice = price;
        break;
      }
    }

    let totalPrice = basePrice * carat;
    if (data.isCertified) totalPrice *= 1.2;
    if (carat > 2.0) totalPrice *= (1.0 + (carat - 2.0) * 0.1);

    const variance = totalPrice * 0.15;
    const roundPrice = (price: number) => Math.round(price / 1000) * 1000;

    return {
      predictedPrice: roundPrice(totalPrice),
      minPrice: roundPrice(totalPrice - variance),
      maxPrice: roundPrice(totalPrice + variance),
      confidence: 0.75,
      currency: 'LKR'
    };
  };

  useEffect(() => {
    console.log('🎯 AIPricePrediction useEffect triggered with gemData:', gemData);
    
    const generatePrediction = async () => {
      console.log('🎯 generatePrediction function started');
      setLoading(true);
      setError(null);

      try {
        console.log('🎯 About to call fetchPrediction with gemData:', gemData);
        const result = await fetchPrediction(gemData);
        console.log('🎯 fetchPrediction returned result:', result);
        setPrediction(result);
        
        // Check if we used the fallback calculation
        if (result.confidence === 0.75 && 
            (result.predictedPrice % 1000 === 0)) { // Fallback rounds to nearest 1000
          console.log('⚠️ Using fallback pricing calculation (API not available)');
          setError('API unavailable - using fallback model');
        }
      } catch (err) {
        console.error('🎯 Prediction error in generatePrediction:', err);
        setError('Price prediction unavailable');
      } finally {
        console.log('🎯 generatePrediction finally block - setting loading to false');
        setLoading(false);
      }
    };

    console.log('🎯 About to call generatePrediction');
    generatePrediction();
  }, [gemData]);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

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
      <div className={`flex items-center space-x-2 bg-blue-50 rounded-lg p-3 border border-blue-200 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
        <span className="text-sm text-blue-700">AI analyzing gemstone...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center space-x-2 text-orange-600 bg-orange-50 rounded-lg p-3 border border-orange-200 ${className}`}>
        <AlertTriangle className="h-4 w-4" />
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  if (!prediction) {
    return null;
  }

  return (
    <div className={`bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200 ${className}`}>
      <div className="flex items-center space-x-2 mb-3">
        <Brain className="h-5 w-5 text-indigo-600" />
        <h3 className="text-sm font-semibold text-indigo-800">AI Price Prediction</h3>
        <div className="ml-auto">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            {error ? 'Fallback Model' : 'ML Powered'}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-3 flex items-center space-x-2 text-orange-600 bg-orange-50 rounded-md p-2 border border-orange-200">
          <AlertTriangle className="h-3 w-3" />
          <span className="text-xs">{error}</span>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <span className="text-xs text-gray-600">Estimated Value</span>
          <p className="text-xl font-bold text-indigo-700">
            {formatPrice(prediction.predictedPrice)}
          </p>
        </div>

        <div>
          <span className="text-xs text-gray-600">Price Range</span>
          <p className="text-sm font-medium text-gray-700">
            {formatPrice(prediction.minPrice)} - {formatPrice(prediction.maxPrice)}
          </p>
        </div>

        {showDetails && (
          <div className="pt-2 border-t border-indigo-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Model Confidence</span>
              <div className="flex items-center space-x-1">
                {getConfidenceIcon(prediction.confidence)}
                <span className={`text-xs font-medium ${getConfidenceColor(prediction.confidence)}`}>
                  {Math.round(prediction.confidence * 100)}%
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white bg-opacity-60 rounded-md p-2 text-xs text-gray-600">
          <div className="flex items-center space-x-1">
            <TrendingUp className="h-3 w-3" />
            <span>Based on market analysis • Quality factors • Historical data</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPricePrediction;
